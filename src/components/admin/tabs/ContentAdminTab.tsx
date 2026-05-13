import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Wand2, CheckCircle, XCircle, AlertTriangle, FileText, Globe, MapPin, Tag, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface SeoPage {
  id: string;
  slug: string;
  page_type: string;
  title: string | null;
  h1: string | null;
  content: string | null;
  word_count: number | null;
  is_optimized: boolean | null;
}

const PAGE_TYPES = [
  { value: '__all__', label: 'All Types' },
  { value: 'static', label: 'Static Pages' },
  { value: 'region', label: 'Regions' },
  { value: 'city', label: 'Cities' },
  { value: 'category', label: 'Categories' },
  { value: 'city_category', label: 'Service Locations' },
];

const CONTENT_STATUS = [
  { value: '__all__', label: 'All Status' },
  { value: 'no_content', label: 'No Content (<400 words)' },
  { value: 'thin_content', label: 'Thin Content (400-799 words)' },
  { value: 'has_content', label: 'Has Content (800-1299 words)' },
  { value: 'optimized', label: 'Optimized (1300+ words)' },
];

function getContentStatusLabel(wordCount: number | null): { label: string; color: string; icon: any } {
  if (!wordCount || wordCount < 400) {
    return { label: 'No Content', color: 'bg-red-100 text-red-800', icon: XCircle };
  }
  if (wordCount < 800) {
    return { label: 'Thin Content', color: 'bg-amber-100 text-amber-800', icon: AlertTriangle };
  }
  if (wordCount < 1300) {
    return { label: 'Has Content', color: 'bg-green-100 text-green-800', icon: CheckCircle };
  }
  return { label: 'Optimized', color: 'bg-teal-100 text-teal-800', icon: CheckCircle };
}

function getPageTypeIcon(type: string) {
  switch (type) {
    case 'static': return FileText;
    case 'region': return Globe;
    case 'city': return MapPin;
    case 'category': return Tag;
    case 'city_category': return MapPin;
    default: return FileText;
  }
}

export default function ContentAdminTab() {
  const [search, setSearch] = useState('');
  const [pageTypeFilter, setPageTypeFilter] = useState('__all__');
  const [contentStatusFilter, setContentStatusFilter] = useState('__all__');
  const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set());
  const [generationType, setGenerationType] = useState('rewrite');
  const [targetWords, setTargetWords] = useState('1300');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, status: '' });

  // Generate content mutation
  const generateContent = async () => {
    if (selectedPages.size === 0) {
      toast.error('Please select pages to generate content for');
      return;
    }

    setIsGenerating(true);
    const pagesToGenerate = Array.from(selectedPages);
    setProgress({ current: 0, total: pagesToGenerate.length, status: 'Starting...' });
    
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < pagesToGenerate.length; i++) {
      const pageSlug = pagesToGenerate[i];
      setProgress({ 
        current: i + 1, 
        total: pagesToGenerate.length, 
        status: `Generating content for: ${pageSlug}` 
      });

      try {
        console.log(`Calling edge function for ${pageSlug}...`);
        
        // Get current user session for auth
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          throw new Error('Session error: ' + sessionError.message);
        }
        
        if (!session?.access_token) {
          throw new Error('No session - please login again');
        }
        
        console.log('Session found, calling function...');
        
        const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
        
        const response = await fetch(`${SUPABASE_URL}/functions/v1/content-generation-studio`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            action: 'generate_content',
            slug: pageSlug,
            config: {
              word_count: parseInt(targetWords),
              rewrite_entire: generationType === 'rewrite',
            }
          })
        });
        
        const data = await response.json();
        console.log(`Response for ${pageSlug}:`, { status: response.status, data });
        
        if (!response.ok) {
          throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        console.log(`Generated for ${pageSlug}:`, data);
        
        // Verify the content was actually saved
        const { data: verifyData } = await supabase
          .from('seo_pages')
          .select('content, word_count')
          .eq('slug', pageSlug)
          .single();
        
        console.log(`Verified for ${pageSlug}:`, verifyData);
        
        if (!verifyData?.content) {
          throw new Error('Content was not saved to database');
        }
        
        if (data?.error) {
          toast.error(`Error: ${data.error}`);
          throw new Error(data.error);
        }
        successCount++;
      } catch (err: any) {
        console.error(`Error generating content for ${pageSlug}:`, err);
        errorCount++;
        errors.push(`${pageSlug}: ${err.message || 'Unknown error'}`);
      }
    }

    setIsGenerating(false);
    setProgress({ current: 0, total: 0, status: '' });
    
    if (successCount > 0) {
      toast.success(`Successfully generated content for ${successCount} pages`);
      setSelectedPages(new Set());
      refetch(); // Refresh the page list
    }
    if (errorCount > 0) {
      toast.error(`Failed: ${errors.join(', ')}`);
      console.log('Generation errors:', errors);
    }
  };

  // Fetch pages from Supabase
  const { data: dbPages, isLoading, refetch } = useQuery({
    queryKey: ['seo-pages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seo_pages')
        .select('id, slug, page_type, title, h1, content, word_count, is_optimized')
        .order('page_type')
        .order('slug');
      if (error) throw error;
      return data as SeoPage[];
    },
  });

  // All pages from database
  const allPages = useMemo(() => dbPages || [], [dbPages]);

  // Filter pages
  const filteredPages = useMemo(() => {
    return allPages.filter(page => {
      if (search && !page.slug.toLowerCase().includes(search.toLowerCase()) && 
          !page.title?.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (pageTypeFilter !== '__all__' && page.page_type !== pageTypeFilter) {
        return false;
      }
      const wordCount = page.word_count || 0;
      if (contentStatusFilter === 'no_content' && wordCount >= 400) return false;
      if (contentStatusFilter === 'thin_content' && (wordCount < 400 || wordCount >= 800)) return false;
      if (contentStatusFilter === 'has_content' && wordCount < 800) return false;
      if (contentStatusFilter === 'optimized' && wordCount < 1300) return false;
      return true;
    });
  }, [allPages, search, pageTypeFilter, contentStatusFilter]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: allPages.length,
      noContent: allPages.filter(p => (p.word_count || 0) < 400).length,
      thinContent: allPages.filter(p => (p.word_count || 0) >= 400 && (p.word_count || 0) < 800).length,
      hasContent: allPages.filter(p => (p.word_count || 0) >= 800 && (p.word_count || 0) < 1300).length,
      optimized: allPages.filter(p => (p.word_count || 0) >= 1300).length,
    };
  }, [allPages]);

  const togglePage = (slug: string) => {
    const newSelected = new Set(selectedPages);
    if (newSelected.has(slug)) {
      newSelected.delete(slug);
    } else {
      newSelected.add(slug);
    }
    setSelectedPages(newSelected);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Wand2 className="h-6 w-6 text-primary" />
            Content Admin
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage and generate content for all pages. Showing {filteredPages.length} of {stats.total} pages.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Pages</div>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-red-600">{stats.noContent}</div>
            <div className="text-sm text-muted-foreground">No Content</div>
          </CardContent>
        </Card>
        <Card className="border-amber-200">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-amber-600">{stats.thinContent}</div>
            <div className="text-sm text-muted-foreground">Thin Content</div>
          </CardContent>
        </Card>
        <Card className="border-green-200">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{stats.hasContent}</div>
            <div className="text-sm text-muted-foreground">Has Content</div>
          </CardContent>
        </Card>
        <Card className="border-teal-200">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-teal-600">{stats.optimized}</div>
            <div className="text-sm text-muted-foreground">Optimized</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Selection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading pages...</span>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Label>Search</Label>
              <Input 
                placeholder="Search pages..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-[180px]">
              <Label>Page Type</Label>
              <Select value={pageTypeFilter} onValueChange={setPageTypeFilter}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAGE_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-[200px]">
              <Label>Content Status</Label>
              <Select value={contentStatusFilter} onValueChange={setContentStatusFilter}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CONTENT_STATUS.map(status => (
                    <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-4 pt-2">
            <Button variant="outline" size="sm" onClick={() => setSelectedPages(new Set(filteredPages.map(p => p.slug)))}>
              Select All ({filteredPages.length})
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSelectedPages(new Set())}>
              Clear Selection
            </Button>
            <Badge variant="secondary">{selectedPages.size} selected</Badge>
          </div>
          </>
          )}
        </CardContent>
      </Card>

      {/* Pages Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Select</TableHead>
                <TableHead>Page</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Words</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No pages found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPages.slice(0, 100).map((page) => {
                  const status = getContentStatusLabel(page.word_count || 0);
                  const Icon = status.icon;
                  const PageIcon = getPageTypeIcon(page.page_type);
                  
                  return (
                    <TableRow key={page.slug}>
                      <TableCell>
                        <Checkbox
                          checked={selectedPages.has(page.slug)}
                          onCheckedChange={() => togglePage(page.slug)}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-sm">{page.slug}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="flex items-center gap-1 w-fit">
                          <PageIcon className="h-3 w-3" />
                          {page.page_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{page.title}</TableCell>
                      <TableCell>{page.word_count?.toLocaleString() || 0}</TableCell>
                      <TableCell>
                        <Badge className={`${status.color} flex items-center gap-1 w-fit`}>
                          <Icon className="h-3 w-3" />
                          {status.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          {filteredPages.length > 100 && (
            <div className="p-4 text-center text-muted-foreground border-t">
              Showing first 100 of {filteredPages.length} pages.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generation Controls */}
      {selectedPages.size > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Content Generation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="w-[200px]">
                <Label>Generation Type</Label>
                <Select value={generationType} onValueChange={setGenerationType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rewrite">Rewrite Entire Page</SelectItem>
                    <SelectItem value="h1">Generate H1</SelectItem>
                    <SelectItem value="intro">Generate Intro</SelectItem>
                    <SelectItem value="sections">Generate Sections</SelectItem>
                    <SelectItem value="internal">Generate Internal Links</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-[200px]">
                <Label>Target Words</Label>
                <Select value={targetWords} onValueChange={setTargetWords}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="800">800 words (Minimum)</SelectItem>
                    <SelectItem value="1000">1000 words</SelectItem>
                    <SelectItem value="1300">1300 words (Recommended)</SelectItem>
                    <SelectItem value="1500">1500 words</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={generateContent} disabled={isGenerating}>
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4 mr-2" />
                )}
                Generate Content ({selectedPages.size} pages)
              </Button>
            </div>

            {/* Progress Bar */}
            {isGenerating && progress.total > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{progress.status}</span>
                  <span className="font-medium">{progress.current} / {progress.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-teal-600 h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
