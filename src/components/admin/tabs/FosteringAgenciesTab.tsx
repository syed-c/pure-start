import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseAdmin } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Building2, Search, Shield, MapPin, Loader2, 
  Edit, X, Check, MoreHorizontal, ChevronLeft, 
  ChevronRight, Trash2, Archive 
} from 'lucide-react';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 20;

export default function AgenciesTab() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedAgencies, setSelectedAgencies] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  // Fetch agencies with aggregated stats using efficient query
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-agencies', search, page],
    enabled: true,
    staleTime: 30000,
    queryFn: async () => {
      const offset = (page - 1) * ITEMS_PER_PAGE;
      
      let query = supabaseAdmin
        .from('agencies')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + ITEMS_PER_PAGE - 1);
      
      if (search) {
        query = query.ilike('name', `%${search}%`);
      }
      
      const result = await query;
      
      if (result.error) {
        console.error('Error:', result.error);
        return { agencies: [], total: 0 };
      }
      
      return { 
        agencies: result.data || [], 
        total: result.count || 0 
      };
    }
  });

  const totalPages = Math.ceil((data?.total || 0) / ITEMS_PER_PAGE);

  const handleSelectAll = (checked: boolean) => {
    if (checked && data?.agencies) {
      setSelectedAgencies(new Set(data.agencies.map(a => a.id)));
    } else {
      setSelectedAgencies(new Set());
    }
  };

  const handleSelectOne = (agencyId: string, checked: boolean) => {
    const newSelected = new Set<string>(selectedAgencies);
    if (checked) {
      newSelected.add(agencyId);
    } else {
      newSelected.delete(agencyId);
    }
    setSelectedAgencies(newSelected);
  };

  const handleBulkStatusUpdate = useMutation({
    mutationFn: async (status: string) => {
      if (selectedAgencies.size === 0) return;
      
      const agencyIds = Array.from(selectedAgencies);
      const { error } = await supabaseAdmin
        .from('agencies')
        .update({ status, updated_at: new Date().toISOString() })
        .in('id', agencyIds);
      
      if (error) throw error;
      return agencyIds.length;
    },
    onSuccess: (count) => {
      toast.success(`Updated ${count} agencies`);
      setSelectedAgencies(new Set());
      queryClient.invalidateQueries({ queryKey: ['admin-agencies'] });
    },
    onError: (err) => {
      toast.error('Failed to update agencies');
      console.error(err);
    }
  });

  const handleDelete = useMutation({
    mutationFn: async (agencyId: string) => {
      const { error } = await supabaseAdmin
        .from('agencies')
        .delete()
        .eq('id', agencyId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Agency deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-agencies'] });
    },
    onError: () => {
      toast.error('Failed to delete agency');
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const { agencies = [], total = 0 } = data || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Fostering Agencies</h2>
          <p className="text-muted-foreground">
            {total} agencies in database
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search agencies..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedAgencies.size > 0 && (
        <Card className="border-primary">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">
                {selectedAgencies.size} selected
              </span>
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleBulkStatusUpdate.mutate('active')}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Activate
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleBulkStatusUpdate.mutate('suspended')}
                >
                  <Archive className="h-4 w-4 mr-1" />
                  Suspend
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => handleBulkStatusUpdate.mutate('deleted')}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Agencies Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    agencies.length > 0 && 
                    selectedAgencies.size === agencies.length
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ofsted Rating</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agencies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No agencies found
                </TableCell>
              </TableRow>
            ) : (
              agencies.map((agency: any) => (
                <TableRow key={agency.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedAgencies.has(agency.id)}
                      onCheckedChange={(checked) => 
                        handleSelectOne(agency.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{agency.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {agency.phone || 'No phone'}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{agency.city || 'Not set'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        agency.status === 'active' ? 'default' : 
                        agency.status === 'suspended' ? 'destructive' : 'secondary'
                      }
                    >
                      {agency.status || 'pending'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {agency.ofsted_rating ? (
                      <Badge variant="outline">
                        {agency.ofsted_rating}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete.mutate(agency.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {((page - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(page * ITEMS_PER_PAGE, total)} of {total}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {page} of {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}