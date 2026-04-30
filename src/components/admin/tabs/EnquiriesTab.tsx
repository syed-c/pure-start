import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabaseAdmin } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Search, 
  Phone, 
  Mail, 
  Building2, 
  MessageSquare, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Globe,
  MapPin,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';

interface AgencyEnquiry {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  state: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  is_verified: boolean;
  is_featured: boolean;
  is_claimed: boolean;
  created_at: string;
}

export default function EnquiriesTab() {
  const [search, setSearch] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const { data: agencies, isLoading } = useQuery({
    queryKey: ['admin-agencies-enquiries', filterCity, filterStatus],
    queryFn: async () => {
      let query = supabaseAdmin
        .from('agencies')
        .select('id, name, slug, city, state, phone, email, website, is_verified, is_featured, is_claimed, created_at')
        .order('created_at', { ascending: false });

      if (filterCity) query = query.ilike('city', `%${filterCity}%`);
      if (search) query = query.or(`name.ilike.%${search}%,city.ilike.%${search}%`);

      const { data } = await query;
      return (data || []) as AgencyEnquiry[];
    },
  });

  const { data: cities } = useQuery({
    queryKey: ['admin-cities-list'],
    queryFn: async () => {
      const { data } = await supabaseAdmin.from('cities').select('name').order('name').limit(50);
      return data?.map(c => c.name) || [];
    },
  });

  const verifiedCount = agencies?.filter(a => a.is_verified).length || 0;
  const featuredCount = agencies?.filter(a => a.is_featured).length || 0;
  const totalCount = agencies?.length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Agency Enquiries</h2>
          <p className="text-muted-foreground">Manage fostering agency registrations and enquiries</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-50">
            <Building2 className="h-3 w-3 mr-1" />
            {totalCount} Agencies
          </Badge>
          <Badge variant="outline" className="bg-green-50">
            <CheckCircle className="h-3 w-3 mr-1" />
            {verifiedCount} Verified
          </Badge>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search agencies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <select
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">All Cities</option>
            {cities?.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">All Status</option>
          <option value="verified">Verified</option>
          <option value="unverified">Unverified</option>
          <option value="featured">Featured</option>
        </select>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Agency Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Listed</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Loading agencies...
                </TableCell>
              </TableRow>
            ) : agencies?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No agencies found
                </TableCell>
              </TableRow>
            ) : (
              agencies?.map((agency) => (
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
                      {agency.city}, {agency.state}
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
                      {agency.website && (
                        <a href={agency.website} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                          <Globe className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {agency.is_verified && (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      {agency.is_featured && (
                        <Badge className="bg-amber-100 text-amber-800">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {agency.created_at ? format(new Date(agency.created_at), 'MMM d, yyyy') : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}