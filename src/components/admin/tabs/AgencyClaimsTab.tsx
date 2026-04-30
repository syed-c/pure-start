import { useQuery } from '@tanstack/react-query';
import { supabaseAdmin } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, CheckCircle, Clock, Building2, MapPin, Mail, Phone, Loader2 } from 'lucide-react';

interface AgencyClaim {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  state: string | null;
  phone: string | null;
  email: string | null;
  is_claimed: boolean;
  is_verified: boolean;
  is_featured: boolean;
  created_at: string;
}

export default function AgencyClaimsTab() {
  const { data: agencies, isLoading } = useQuery({
    queryKey: ['admin-agencies-claims'],
    queryFn: async () => {
      const { data } = await supabaseAdmin
        .from('agencies')
        .select('id, name, slug, city, state, phone, email, is_claimed, is_verified, is_featured, created_at')
        .order('created_at', { ascending: false })
        .limit(100);
      return (data || []) as AgencyClaim[];
    }
  });

  const claimedCount = agencies?.filter(a => a.is_claimed).length || 0;
  const verifiedCount = agencies?.filter(a => a.is_verified).length || 0;
  const featuredCount = agencies?.filter(a => a.is_featured).length || 0;
  const totalCount = agencies?.length || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Agency Claims</h2>
          <p className="text-muted-foreground">Manage agency ownership and verification claims</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            <Building2 className="h-3 w-3 mr-1" />
            {totalCount} Total
          </Badge>
          <Badge variant="outline" className="bg-blue-50">
            <Shield className="h-3 w-3 mr-1" />
            {claimedCount} Claimed
          </Badge>
          <Badge variant="outline" className="bg-green-50">
            <CheckCircle className="h-3 w-3 mr-1" />
            {verifiedCount} Verified
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold">{totalCount}</div>
          <div className="text-sm text-muted-foreground">Total Agencies</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-blue-600">{claimedCount}</div>
          <div className="text-sm text-muted-foreground">Claimed Profiles</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-green-600">{verifiedCount}</div>
          <div className="text-sm text-muted-foreground">Verified Agencies</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-amber-600">{featuredCount}</div>
          <div className="text-sm text-muted-foreground">Featured Listings</div>
        </Card>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Agency</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Claim Status</TableHead>
              <TableHead>Verification</TableHead>
              <TableHead>Featured</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agencies?.map((agency) => (
              <TableRow key={agency.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    {agency.name}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    {agency.city || 'N/A'}, {agency.state}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {agency.phone && (
                      <a href={`tel:${agency.phone}`} className="text-muted-foreground hover:text-foreground">
                        <Phone className="h-4 w-4" />
                      </a>
                    )}
                    {agency.email && (
                      <a href={`mailto:${agency.email}`} className="text-muted-foreground hover:text-foreground">
                        <Mail className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {agency.is_claimed ? (
                    <Badge className="bg-blue-100 text-blue-800">
                      <Shield className="h-3 w-3 mr-1" />
                      Claimed
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <Clock className="h-3 w-3 mr-1" />
                      Unclaimed
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {agency.is_verified ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Pending</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {agency.is_featured ? (
                    <Badge className="bg-amber-100 text-amber-800">Featured</Badge>
                  ) : (
                    <Badge variant="outline">Standard</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {agencies?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No agencies found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}