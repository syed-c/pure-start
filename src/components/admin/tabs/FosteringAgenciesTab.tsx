import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseAdmin } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Building2, Search, Shield, MapPin, Loader2, Heart, Home, Star, Globe, Edit, X } from 'lucide-react';
import { toast } from 'sonner';

export default function AgenciesTab() {
  const [search, setSearch] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>({});
  const queryClient = useQueryClient();

  const { data: agencies, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-agencies', search],
    enabled: true,
    staleTime: 0,
    refetchOnMount: true,
    queryFn: async () => {
      console.log('Fetching agencies with fostering data...');
      try {
        let query = supabaseAdmin
          .from('agencies')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);
        
        if (search) {
          query = query.ilike('name', `%${search}%`);
        }
        
        const result = await query;
        
        console.log('Result:', result);
        
        if (result.error) {
          console.error('Error:', result.error);
          return [];
        }
        
        console.log('Data count:', result.data?.length);
        
        const agenciesWithStats = await Promise.all(
          (result.data || []).map(async (agency) => {
            const [carersCount, enquiriesCount] = await Promise.all([
              supabaseAdmin
                .from('foster_carer_profiles')
                .select('id', { count: 'exact', head: true })
                .eq('organisation_id', agency.id)
                .eq('status', 'active'),
              supabaseAdmin
                .from('enquiries')
                .select('id', { count: 'exact', head: true })
                .eq('agency_id', agency.id),
            ]);
            return {
              ...agency,
              fosterCarersCount: carersCount.count || 0,
              totalEnquiries: enquiriesCount.count || 0,
            };
          })
        );
        
        return agenciesWithStats as any[] || [];
      } catch (err) {
        console.error('Exception:', err);
        return [];
      }
    }
  });

  const updateAgency = useMutation({
    mutationFn: async (data: { id: string; updates: any }) => {
      const { error } = await supabaseAdmin
        .from('agencies')
        .update(data.updates)
        .eq('id', data.id);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Agency updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-agencies'] });
      setEditDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(`Failed to update: ${error.message}`);
    }
  });

  const handleEditClick = (agency: any) => {
    setSelectedAgency(agency);
    setEditForm({
      name: agency.name || '',
      phone: agency.phone || '',
      email: agency.email || '',
      website: agency.website || '',
      address: agency.address || '',
      city: agency.city || '',
      state: agency.state || '',
      is_featured: agency.is_featured || false,
      is_verified: agency.is_verified || false,
      seo_visible: agency.seo_visible !== false,
      ofsted_rating: agency.ofsted_rating || '',
      ofsted_urn: agency.ofsted_urn || '',
    });
    setEditDialogOpen(true);
  };

  const handleSave = () => {
    if (!selectedAgency) return;
    updateAgency.mutate({
      id: selectedAgency.id,
      updates: editForm
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const debugInfo = `Loading: ${isLoading}, Data: ${agencies?.length || 0} agencies`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Fostering Agencies</h2>
          <p className="text-muted-foreground">Manage all fostering agencies in the platform</p>
          <p className="text-xs text-red-500 mt-1">{debugInfo}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search agencies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button variant="outline" onClick={() => refetch()}>
            Refresh
          </Button>
        </div>
      </div>

      {agencies?.length === 0 && (
        <Card className="p-8 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No agencies found</p>
          <p className="text-xs text-muted-foreground mt-2">Check console for details</p>
        </Card>
      )}

      {agencies && agencies.length > 0 && (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agency</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Ofsted</TableHead>
                <TableHead>Foster Carers</TableHead>
                <TableHead>Enquiries</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agencies.map((agency: any) => (
                <TableRow key={agency.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      <div>
                        <div className="font-semibold">{agency.name}</div>
                        {agency.ofsted_urn && (
                          <div className="text-xs text-muted-foreground">URN: {agency.ofsted_urn}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      {agency.city || 'N/A'}, {agency.state}
                    </div>
                  </TableCell>
                  <TableCell>
                    {agency.ofsted_rating ? (
                      <Badge variant="outline" className={
                        agency.ofsted_rating === 'Outstanding' ? 'bg-green-100 text-green-800 border-green-200' :
                        agency.ofsted_rating === 'Good' ? 'bg-teal-100 text-teal-800 border-teal-200' :
                        'bg-amber-100 text-amber-800 border-amber-200'
                      }>
                        {agency.ofsted_rating}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">Not rated</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3 text-teal" />
                      <span className="font-medium">{agency.fosterCarersCount || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Globe className="h-3 w-3 text-gold" />
                      <span className="font-medium">{agency.totalEnquiries || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {agency.rating ? (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-gold fill-gold" />
                        <span>{agency.rating.toFixed(1)}</span>
                        <span className="text-muted-foreground text-sm">({agency.review_count})</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">No reviews</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {agency.is_verified ? (
                        <Badge variant="default" className="bg-green-600">
                          <Shield className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      ) : agency.claim_status === 'claimed' ? (
                        <Badge variant="secondary">Claimed</Badge>
                      ) : (
                        <Badge variant="outline">Unclaimed</Badge>
                      )}
                      {agency.is_featured && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700">Featured</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => window.open(`/agency/${agency.slug}`, '_blank')}
                      >
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditClick(agency)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Agency: {selectedAgency?.name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Agency Name</Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={editForm.website}
                onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={editForm.city}
                  onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="state">State/County</Label>
                <Input
                  id="state"
                  value={editForm.state}
                  onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="ofsted_rating">Ofsted Rating</Label>
                <Input
                  id="ofsted_rating"
                  value={editForm.ofsted_rating}
                  onChange={(e) => setEditForm({ ...editForm, ofsted_rating: e.target.value })}
                  placeholder="Outstanding, Good, Requires Improvement"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ofsted_urn">Ofsted URN</Label>
                <Input
                  id="ofsted_urn"
                  value={editForm.ofsted_urn}
                  onChange={(e) => setEditForm({ ...editForm, ofsted_urn: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center gap-4 pt-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="is_featured"
                  checked={editForm.is_featured}
                  onCheckedChange={(checked) => setEditForm({ ...editForm, is_featured: checked })}
                />
                <Label htmlFor="is_featured">Featured</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="is_verified"
                  checked={editForm.is_verified}
                  onCheckedChange={(checked) => setEditForm({ ...editForm, is_verified: checked })}
                />
                <Label htmlFor="is_verified">Verified</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="seo_visible"
                  checked={editForm.seo_visible}
                  onCheckedChange={(checked) => setEditForm({ ...editForm, seo_visible: checked })}
                />
                <Label htmlFor="seo_visible">SEO Visible</Label>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={updateAgency.isPending}>
                {updateAgency.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}