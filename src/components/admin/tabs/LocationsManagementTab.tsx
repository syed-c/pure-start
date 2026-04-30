import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MapPin, Search, Loader2, Globe } from 'lucide-react';

export default function LocationsTab() {
  const [search, setSearch] = useState('');
  
  const { data: cities, isLoading } = useQuery({
    queryKey: ['admin-cities', search],
    queryFn: async () => {
      let query = supabase
        .from('cities')
        .select('id, name, slug, is_active, state:states(name, slug)')
        .order('name');
      
      if (search) {
        query = query.ilike('name', `%${search}%`);
      }
      
      const { data } = await query;
      return data || [];
    }
  });

  const { data: states } = useQuery({
    queryKey: ['admin-states'],
    queryFn: async () => {
      const { data } = await supabase
        .from('states')
        .select('id, name, slug, is_active')
        .eq('is_active', true)
        .order('display_order');
      return data || [];
    }
  });

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
          <h2 className="text-2xl font-bold">Locations</h2>
          <p className="text-muted-foreground">Manage cities and regions in the UK</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search locations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 w-64"
          />
        </div>
      </div>

      {/* States/Regions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Regions ({states?.length || 0})
        </h3>
        <div className="flex flex-wrap gap-2">
          {states?.map((state) => (
            <Badge key={state.id} variant="outline" className="px-3 py-1">
              {state.name}
            </Badge>
          ))}
        </div>
      </Card>

      {/* Cities */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>City Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cities?.map((city) => (
              <TableRow key={city.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {city.name}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{city.slug}</TableCell>
                <TableCell>{city.state?.name || 'N/A'}</TableCell>
                <TableCell>
                  <Badge variant={city.is_active ? 'default' : 'secondary'}>
                    {city.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {cities?.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No cities found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}