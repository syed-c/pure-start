import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Download, 
  Loader2, 
  MapPin, 
  Star, 
  Phone, 
  Globe, 
  Image,
  Clock,
  CheckCircle,
  AlertTriangle,
  Building2,
  Sparkles,
  RefreshCw,
  Eye,
  Trash2,
  ExternalLink,
  Mail,
  Navigation
} from 'lucide-react';
import { toast } from 'sonner';

interface PlaceResult {
  place_id: string;
  name: string;
  address: string;
  rating?: number;
  reviews_count?: number;
  lat?: number;
  lng?: number;
  phone?: string;
  website?: string;
  google_maps_url?: string;
  photo_url?: string;
  opening_hours?: string;
  types?: string[];
  business_status?: string;
  already_imported: boolean;
  existing_id?: string;
  existing_status?: string;
  confidence?: 'high' | 'medium' | 'low';
  has_photos?: boolean;
  photo_count?: number;
  import_status?: 'pending' | 'importing' | 'imported' | 'duplicate' | 'error';
}

interface ImportJob {
  id: string;
  job_type: string;
  status: string;
  total_results_found: number;
  total_imported: number;
  total_duplicates: number;
  total_failed: number;
  started_at: string;
  completed_at: string;
  created_at: string;
}

const IMPORT_TYPES = [
  { value: 'new', label: 'New Agency Import', description: 'Import new agencies only', icon: '➕' },
  { value: 'update', label: 'Update Existing', description: 'Update agencies that already exist', icon: '🔄' },
  { value: 'sync', label: 'Sync All', description: 'Import new and update existing', icon: '🔃' },
  { value: 'photos', label: 'Import Missing Photos', description: 'Only import missing photos', icon: '📷' },
  { value: 'hours', label: 'Import Business Hours', description: 'Only import/update opening hours', icon: '🕐' },
  { value: 'reviews', label: 'Import Reviews', description: 'Only import Google reviews', icon: '⭐' },
];

const FOSTERING_CATEGORIES = [
  { value: 'fostering agency', label: 'Fostering Agency', icon: '🏠' },
  { value: 'foster care agency', label: 'Foster Care Agency', icon: '🏡' },
  { value: 'independent fostering agency', label: 'Independent Fostering Agency', icon: '📋' },
  { value: "children's home", label: "Children's Home", icon: '🏫' },
  { value: 'fostering service', label: 'Fostering Service', icon: '🤝' },
  { value: 'therapeutic fostering', label: 'Therapeutic Fostering', icon: '💚' },
  { value: 'respite care', label: 'Respite Care', icon: '⏰' },
  { value: 'adoption agency', label: 'Adoption Agency', icon: '❤️' },
  { value: 'social services', label: 'Social Services', icon: '🏛️' },
  { value: "children's services", label: "Children's Services", icon: '👶' },
];

export default function GooglePlacesImportTab() {
  const queryClient = useQueryClient();
  
  // State selection
  const { data: states } = useQuery({
    queryKey: ['states-all'],
    queryFn: async () => {
      const { data } = await supabase.from('states').select('*').order('name');
      return data || [];
    },
  });
  
  const [selectedStateId, setSelectedStateId] = useState<string>('');
  const [selectedCityIds, setSelectedCityIds] = useState<string[]>([]);
  const [category, setCategory] = useState<string>('fostering agency');
  const [importType, setImportType] = useState<string>('new');
  const [activeTab, setActiveTab] = useState<string>('search');
  const [currentCityIndex, setCurrentCityIndex] = useState<number>(0);
  const [processedCities, setProcessedCities] = useState<string[]>([]);
  
  // Track searched place_ids to avoid duplicates in same session
  const [searchedPlaceIds, setSearchedPlaceIds] = useState<Set<string>>(new Set());
  
  // Fetch cities for selected state
  const { data: cities } = useQuery({
    queryKey: ['cities-by-state', selectedStateId],
    queryFn: async () => {
      if (!selectedStateId) return [];
      const { data } = await supabase
        .from('cities')
        .select('*')
        .eq('state_id', selectedStateId)
        .order('name');
      return data || [];
    },
    enabled: !!selectedStateId,
  });

  const toggleCity = (cityId: string) => {
    setSelectedCityIds(prev => 
      prev.includes(cityId) 
        ? prev.filter(id => id !== cityId)
        : [...prev, cityId]
    );
  };

  const selectAllCities = () => {
    if (cities) {
      setSelectedCityIds(cities.map(c => c.id));
    }
  };

  const clearAllCities = () => {
    setSelectedCityIds([]);
    setProcessedCities([]);
    setCurrentCityIndex(0);
  };

  const selectedCities = cities?.filter(c => selectedCityIds.includes(c.id)) || [];

  // Fetch import jobs history
  const { data: importJobs } = useQuery({
    queryKey: ['import-jobs'],
    queryFn: async () => {
      const { data } = await supabase
        .from('import_jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      return data || [];
    },
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [maxPages, setMaxPages] = useState<number>(3);
  
  const [isSearching, setIsSearching] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [searchProgress, setSearchProgress] = useState<string>('');
  
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [selectedPlaces, setSelectedPlaces] = useState<Set<string>>(new Set());
  const [importLog, setImportLog] = useState<string[]>([]);
  
  const selectedState = states?.find(s => s.id === selectedStateId);

  // Fetch existing agencies to check for duplicates
  const { data: existingAgencies } = useQuery({
    queryKey: ['existing-agencies-place-ids'],
    queryFn: async () => {
      const { data } = await supabase
        .from('agencies')
        .select('place_id, name, city, is_verified')
        .not('place_id', 'is', null);
      return data || [];
    },
  });

  const existingPlaceIds = useMemo(() => {
    return new Set((existingAgencies || []).map(a => a.place_id).filter(Boolean));
  }, [existingAgencies]);

  // Clear results and start fresh
  const clearResults = () => {
    setResults([]);
    setProcessedCities([]);
    setSelectedPlaces(new Set());
    setSearchedPlaceIds(new Set());
    setCurrentCityIndex(0);
    setImportLog([]);
  };
  const resultsWithImportStatus = useMemo(() => {
    return results.map(r => ({
      ...r,
      already_imported: r.already_imported || existingPlaceIds.has(r.place_id),
    }));
  }, [results, existingPlaceIds]);

  const newCount = resultsWithImportStatus.filter(r => !r.already_imported).length;
  const importedCount = resultsWithImportStatus.filter(r => r.already_imported).length;
  const highConfidenceCount = resultsWithImportStatus.filter(r => r.confidence === 'high').length;
  const mediumConfidenceCount = resultsWithImportStatus.filter(r => r.confidence === 'medium').length;
  const lowConfidenceCount = resultsWithImportStatus.filter(r => r.confidence === 'low').length;

  const searchGooglePlaces = async () => {
    if (!selectedState && selectedCityIds.length === 0) {
      toast.error('Please select a state or at least one city');
      return;
    }

    setIsSearching(true);
    setResults([]);
    setProcessedCities([]);
    setCurrentCityIndex(0);
    setSearchedPlaceIds(new Set()); // Refresh searched place_ids for new search
    setSearchProgress('Starting search...');
    
    let allResults: PlaceResult[] = [];
    const citiesToSearch = selectedCityIds.length > 0 ? selectedCityIds : (cities?.map(c => c.id) || []);
    
    // Deduplicate place_ids across all results
    const seenPlaceIds = new Set<string>();
    
    try {
      for (let i = 0; i < citiesToSearch.length; i++) {
        const cityId = citiesToSearch[i];
        const city = cities?.find(c => c.id === cityId);
        if (!city) continue;
        
        setCurrentCityIndex(i + 1);
        setSearchProgress(`Searching ${city.name} (${i + 1}/${citiesToSearch.length})...`);
        
        try {
          const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gmb-import`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY}`,
            },
            body: JSON.stringify({
              action: 'search',
              category,
              city: city.name,
              state: selectedState?.abbreviation || 'ENG',
              maxPages,
            }),
          });

          const data = await response.json();
          
          if (data.success && data.results) {
            // Filter out duplicates based on place_id
            const uniqueResults = data.results.filter((r: PlaceResult) => {
              if (seenPlaceIds.has(r.place_id)) {
                return false;
              }
              seenPlaceIds.add(r.place_id);
              return true;
            }).map((r: PlaceResult) => ({
              ...r,
              city: city.name,
            }));
            
            allResults = [...allResults, ...uniqueResults];
            setProcessedCities(prev => [...prev, city.name]);
            setSearchedPlaceIds(new Set(seenPlaceIds)); // Track for next cities
            setResults([...allResults]);
            setSearchProgress(`Found ${allResults.length} agencies from ${processedCities.length + 1} cities`);
          }
        } catch (cityError) {
          console.error(`Error searching ${city.name}:`, cityError);
          setSearchProgress(`Error in ${city.name}, continuing...`);
        }
      }
      
      setSearchProgress(`Complete! Found ${allResults.length} foster care agencies from ${citiesToSearch.length} cities`);
      toast.success(`Found ${allResults.length} foster care agencies from ${citiesToSearch.length} cities`);
    } catch (error: any) {
      console.error('Search error:', error);
      toast.error(error.message || 'Failed to search Google Places');
      setSearchProgress('Error occurred');
    } finally {
      setIsSearching(false);
    }
  };

  const importSelectedPlaces = async () => {
    if (selectedPlaces.size === 0) {
      toast.error('Please select at least one place to import');
      return;
    }

    setIsImporting(true);
    setImportLog([]);
    
    const placeIdsToImport = Array.from(selectedPlaces);
    let imported = 0;
    let errors = 0;
    let skipped = 0;

    try {
      // Batch import all at once
      setImportLog(prev => [...prev, `Starting import of ${placeIdsToImport.length} agencies...`]);
      setSearchProgress('Importing...');
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gmb-import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          action: 'import',
          placeIds: placeIdsToImport,
          city: selectedState?.name,
          state: selectedState?.abbreviation,
          importType,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        imported = data.imported || 0;
        skipped = data.skipped?.length || 0;
        errors = data.errors || 0;
        
        setImportLog(prev => [...prev, `✓ Imported: ${imported} agencies`]);
        if (skipped > 0) setImportLog(prev => [...prev, `- Skipped: ${skipped} (duplicates)`]);
        if (errors > 0) setImportLog(prev => [...prev, `✗ Errors: ${errors}`]);
        
        // Show detailed results
        if (data.imported_agencies?.length > 0) {
          data.imported_agencies.forEach((agency: any) => {
            setImportLog(prev => [...prev, `  ✓ ${agency.name} (${agency.city}) - Photos: ${agency.photos_stored}, Hours: ${agency.hours_stored}, Reviews: ${agency.reviews_stored}`]);
          });
        }
        
        if (data.error_messages?.length > 0) {
          data.error_messages.forEach((err: string) => {
            setImportLog(prev => [...prev, `  ✗ ${err}`]);
          });
        }
        
        toast.success(`Import complete: ${imported} imported, ${skipped} skipped, ${errors} errors`);
      } else {
        throw new Error(data.error || 'Import failed');
      }
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['existing-agencies-place-ids'] });
      queryClient.invalidateQueries({ queryKey: ['import-jobs'] });
      
      // Clear selection after successful import
      setSelectedPlaces(new Set());
      
      // Re-search to update import status
      await searchGooglePlaces();
      
    } catch (error: any) {
      console.error('Import error:', error);
      toast.error(error.message || 'Import failed');
      setImportLog(prev => [...prev, `✗ Import failed: ${error.message}`]);
    } finally {
      setIsImporting(false);
      setSearchProgress('');
    }
  };

  const toggleSelectAll = () => {
    if (selectedPlaces.size === resultsWithImportStatus.filter(r => !r.already_imported).length) {
      setSelectedPlaces(new Set());
    } else {
      const newPlaces = new Set(
        resultsWithImportStatus
          .filter(r => !r.already_imported)
          .map(r => r.place_id)
      );
      setSelectedPlaces(newPlaces);
    }
  };

  const togglePlace = (placeId: string) => {
    const newSelected = new Set(selectedPlaces);
    if (newSelected.has(placeId)) {
      newSelected.delete(placeId);
    } else {
      newSelected.add(placeId);
    }
    setSelectedPlaces(newSelected);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Google Places Import</h2>
          <p className="text-muted-foreground text-sm">Import foster care agencies from Google</p>
        </div>
        <Badge variant="outline" className="bg-teal/10 text-teal border-teal/20">
          <Building2 className="h-3 w-3 mr-1" />
          Foster Care
        </Badge>
      </div>

      {/* Search Configuration */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="h-5 w-5" />
            Search Setup
          </CardTitle>
          <CardDescription className="text-sm">
            Select cities to search for foster care agencies
          </CardDescription>
        </CardHeader>
<CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <div className="space-y-2">
              <Label>State / Region</Label>
              <Select value={selectedStateId} onValueChange={(v) => { setSelectedStateId(v); setSelectedCityIds([]); setProcessedCities([]); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {states?.map(state => (
                    <SelectItem key={state.id} value={state.id}>
                      {state.name} ({state.abbreviation})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 lg:col-span-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <Label>Cities ({selectedCityIds.length} selected)</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={selectAllCities} disabled={!cities?.length}>
                    All
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearAllCities}>
                    Clear
                  </Button>
                </div>
              </div>
<ScrollArea className="h-24 md:h-32 border rounded-lg p-2">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {cities?.map(city => (
                    <div key={city.id} className="flex items-center gap-2">
                      <Checkbox 
                        id={city.id}
                        checked={selectedCityIds.includes(city.id)}
                        onCheckedChange={() => toggleCity(city.id)}
                      />
                      <label htmlFor={city.id} className="text-sm cursor-pointer">
                        {city.name}
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {FOSTERING_CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <span className="mr-2">{cat.icon}</span>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>City (Optional)</Label>
              <Input 
                placeholder="Specific city search" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Max Pages ({maxPages * 20} results)</Label>
              <Select value={maxPages.toString()} onValueChange={(v) => setMaxPages(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 page (20 results)</SelectItem>
                  <SelectItem value="2">2 pages (40 results)</SelectItem>
                  <SelectItem value="3">3 pages (60 results)</SelectItem>
                  <SelectItem value="5">5 pages (100 results)</SelectItem>
                  <SelectItem value="10">10 pages (200 results)</SelectItem>
                  <SelectItem value="20">20 pages (400 results)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Import Type</Label>
              <Select value={importType} onValueChange={setImportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {IMPORT_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <span className="mr-2">{type.icon}</span>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <Button 
              onClick={searchGooglePlaces} 
              disabled={isSearching || !selectedStateId}
              className="bg-primary"
            >
              {isSearching ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search Google Places
                </>
              )}
            </Button>
            
            {isSearching && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{searchProgress}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {resultsWithImportStatus.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Search Results</CardTitle>
              <CardDescription>
                Found {resultsWithImportStatus.length} places from {processedCities.length} cities • {newCount} new • {importedCount} already imported
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearResults}
                disabled={results.length === 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={searchGooglePlaces}
                disabled={isSearching}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isSearching ? 'animate-spin' : ''}`} />
                {isSearching ? 'Searching...' : 'Search More'}
              </Button>
              <Button
                onClick={importSelectedPlaces}
                disabled={selectedPlaces.size === 0 || isImporting}
                className="bg-teal hover:bg-teal/90"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Import Selected ({selectedPlaces.size})
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Results as Cards - Mobile Friendly */}
            <div className="block lg:hidden space-y-3">
              {resultsWithImportStatus.slice(0, 50).map((place) => (
                <div 
                  key={place.place_id} 
                  className={`p-3 rounded-lg border ${
                    place.already_imported ? 'bg-muted/30 border-border' : 'bg-card border-border'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedPlaces.has(place.place_id)}
                      onCheckedChange={() => togglePlace(place.place_id)}
                      disabled={place.already_imported && importType !== 'update' && importType !== 'sync'}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {place.photo_url ? (
                          <img 
                            src={place.photo_url} 
                            alt={place.name}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-primary" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{place.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{(place as any).city}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs">
                        {place.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-gold fill-gold" />
                            <span>{place.rating.toFixed(1)}</span>
                          </div>
                        )}
                        {place.already_imported ? (
                          <span className="text-green-600 font-medium">Imported</span>
                        ) : (
                          <span className="text-blue-600">New</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Results as Table - Desktop */}
            <div className="hidden lg:block rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedPlaces.size === resultsWithImportStatus.filter(r => !r.already_imported).length && resultsWithImportStatus.filter(r => !r.already_imported).length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Agency</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Data Available</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resultsWithImportStatus.slice(0, 50).map((place) => (
                    <TableRow key={place.place_id} className={place.already_imported ? 'bg-muted/30' : ''}>
                      <TableCell>
                        <Checkbox
                          checked={selectedPlaces.has(place.place_id)}
                          onCheckedChange={() => togglePlace(place.place_id)}
                          disabled={place.already_imported && importType !== 'update' && importType !== 'sync'}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {place.photo_url ? (
                            <img 
                              src={place.photo_url} 
                              alt={place.name}
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-primary" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{place.name}</p>
                            <p className="text-xs text-muted-foreground">{place.types?.slice(0, 2).join(', ')}</p>
                          </div>
</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3 text-teal" />
                            {(place as any).city || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {place.address?.split(',').slice(0, 2).join(',') || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {place.rating ? (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-gold fill-gold" />
                            <span className="font-medium">{place.rating.toFixed(1)}</span>
                            <span className="text-xs text-muted-foreground">({place.reviews_count})</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-xs">
                          {place.has_photos && (
                            <Badge variant="outline" className="text-[10px] bg-blue-50">
                              <Image className="h-2 w-2 mr-1" />
                              {place.photo_count}
                            </Badge>
                          )}
                          {place.opening_hours && (
                            <Badge variant="outline" className="text-[10px] bg-green-50">
                              <Clock className="h-2 w-2 mr-1" />
                              Hours
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {place.confidence && (
                          <Badge variant={
                            place.confidence === 'high' ? 'default' :
                            place.confidence === 'medium' ? 'secondary' : 'destructive'
                          } className={`text-[10px] ${
                            place.confidence === 'high' ? 'bg-green-100 text-green-700' :
                            place.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {place.confidence.charAt(0).toUpperCase() + place.confidence.slice(1)}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {place.already_imported ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Imported
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            New
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {place.website && (
                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                              <a href={place.website} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {resultsWithImportStatus.length > 50 && (
              <p className="text-sm text-muted-foreground mt-2 text-center">
                Showing first 50 of {resultsWithImportStatus.length} results
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Import Log */}
      {(importLog.length > 0 || isImporting) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Import Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48 w-full rounded-md border p-4">
              <div className="space-y-1">
                {importLog.map((log, index) => (
                  <p key={index} className="text-sm font-mono">
                    {log.startsWith('✓') ? (
                      <span className="text-green-600">{log}</span>
                    ) : log.startsWith('✗') ? (
                      <span className="text-red-600">{log}</span>
                    ) : (
                      <span className="text-muted-foreground">{log}</span>
                    )}
                  </p>
                ))}
                {isImporting && (
                  <p className="text-sm text-muted-foreground animate-pulse">
                    Processing...
                  </p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Stats - Existing Agencies */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Agencies</p>
                <p className="text-3xl font-bold">{existingAgencies?.length || 0}</p>
              </div>
              <Building2 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal/5 to-teal/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Verified</p>
                <p className="text-3xl font-bold">
                  {existingAgencies?.filter(a => a.is_verified).length || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-teal" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gold/5 to-gold/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Search</p>
                <p className="text-3xl font-bold">{newCount}</p>
              </div>
              <Sparkles className="h-8 w-8 text-gold" />
            </div>
          </CardContent>
        </Card>

        {/* Confidence Stats */}
        {results.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-green-50">
              <CardContent className="pt-4">
                <p className="text-sm text-green-700">High Confidence</p>
                <p className="text-2xl font-bold text-green-800">{highConfidenceCount}</p>
              </CardContent>
            </Card>
            <Card className="bg-yellow-50">
              <CardContent className="pt-4">
                <p className="text-sm text-yellow-700">Medium Confidence</p>
                <p className="text-2xl font-bold text-yellow-800">{mediumConfidenceCount}</p>
              </CardContent>
            </Card>
            <Card className="bg-red-50">
              <CardContent className="pt-4">
                <p className="text-sm text-red-700">Low Confidence</p>
                <p className="text-2xl font-bold text-red-800">{lowConfidenceCount}</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Help Text */}
      <Alert>
        <Sparkles className="h-4 w-4" />
        <AlertTitle>How it works</AlertTitle>
        <AlertDescription>
          This tool searches Google Places for foster care agencies and imports them into your platform. 
          It extracts name, address, phone, website, rating, photos, and opening hours. 
          Duplicates are automatically detected and skipped.
        </AlertDescription>
      </Alert>
    </div>
  );
}