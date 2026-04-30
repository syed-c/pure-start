import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabaseAdmin } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Building2, Search, Shield, MapPin, Loader2, Heart, Home, Star, Globe } from 'lucide-react';

export default function AgenciesTab() {
  const [search, setSearch] = useState('');
  
  const { data: agencies, isLoading, error } = useQuery({
    queryKey: ['admin-agencies', search],
    enabled: true,
    staleTime: 0,
    refetchOnMount: true,
    queryFn: async () => {
      console.log('Fetching agencies with fostering data...');
      try {
        const result = await supabaseAdmin
          .from('agencies')
          .select('*')
          .limit(100);
        
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
                    {agency.average_rating ? (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-gold fill-gold" />
                        <span>{agency.average_rating.toFixed(1)}</span>
                        <span className="text-muted-foreground text-sm">({agency.total_reviews})</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">No reviews</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {agency.verification_status === 'verified' ? (
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
                      <Button variant="outline" size="sm">
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
    </div>
  );
}