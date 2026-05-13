/**
 * Agency Enquiry Manager
 * Replaces the fostering enquiry manager with proper fostering enquiry handling
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Search, Phone, Mail, Calendar, Loader2, MessageSquare, Filter } from 'lucide-react';

interface Enquiry {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  message: string | null;
  status: string;
  source: string | null;
  created_at: string;
  agency_id: string | null;
}

export default function EnquiryManagerTab() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);

  const { data: enquiries, isLoading } = useQuery({
    queryKey: ['agency-enquiries', user?.id],
    queryFn: async () => {
      // Get agency ID for current user
      const { data: agency } = await supabase
        .from('agencies')
        .select('id')
        .eq('claimed_by', user?.id)
        .single();

      if (!agency) return [];

      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('agency_id', agency.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Enquiry[];
    },
    enabled: !!user?.id,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('leads').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agency-enquiries'] });
      toast.success('Status updated');
    },
  });

  const filtered = enquiries?.filter((e) => {
    const matchesSearch =
      !search ||
      e.name?.toLowerCase().includes(search.toLowerCase()) ||
      e.email?.toLowerCase().includes(search.toLowerCase()) ||
      e.phone?.includes(search);
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusColors: Record<string, string> = {
    new: 'bg-blue-500',
    contacted: 'bg-yellow-500',
    in_progress: 'bg-purple-500',
    converted: 'bg-green-500',
    closed: 'bg-gray-500',
  };

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
          <h2 className="text-2xl font-bold">Enquiries</h2>
          <p className="text-muted-foreground">Manage enquiries from prospective foster carers</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: enquiries?.length || 0, color: 'text-foreground' },
          { label: 'New', value: enquiries?.filter((e) => e.status === 'new').length || 0, color: 'text-blue-500' },
          { label: 'In Progress', value: enquiries?.filter((e) => e.status === 'in_progress').length || 0, color: 'text-purple-500' },
          { label: 'Converted', value: enquiries?.filter((e) => e.status === 'converted').length || 0, color: 'text-green-500' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search enquiries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="all">All Statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="in_progress">In Progress</option>
          <option value="converted">Converted</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered?.map((enquiry) => (
              <TableRow key={enquiry.id}>
                <TableCell className="font-medium">{enquiry.name || 'Unknown'}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1 text-sm">
                    {enquiry.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {enquiry.email}
                      </span>
                    )}
                    {enquiry.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {enquiry.phone}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={statusColors[enquiry.status] || 'bg-gray-500'}>
                    {enquiry.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{enquiry.source || 'Direct'}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {enquiry.created_at ? new Date(enquiry.created_at).toLocaleDateString() : '-'}
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" onClick={() => setSelectedEnquiry(enquiry)}>
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {(!filtered || filtered.length === 0) && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No enquiries found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedEnquiry} onOpenChange={() => setSelectedEnquiry(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Enquiry Details</DialogTitle>
          </DialogHeader>
          {selectedEnquiry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedEnquiry.name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={statusColors[selectedEnquiry.status] || 'bg-gray-500'}>
                    {selectedEnquiry.status}
                  </Badge>
                </div>
              </div>
              {selectedEnquiry.email && (
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p>{selectedEnquiry.email}</p>
                </div>
              )}
              {selectedEnquiry.phone && (
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p>{selectedEnquiry.phone}</p>
                </div>
              )}
              {selectedEnquiry.message && (
                <div>
                  <p className="text-sm text-muted-foreground">Message</p>
                  <p className="text-sm bg-muted p-3 rounded-md">{selectedEnquiry.message}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Update Status</p>
                <div className="flex gap-2">
                  {['new', 'contacted', 'in_progress', 'converted', 'closed'].map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant={selectedEnquiry.status === status ? 'default' : 'outline'}
                      onClick={() => updateStatus.mutate({ id: selectedEnquiry.id, status })}
                      disabled={updateStatus.isPending}
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
