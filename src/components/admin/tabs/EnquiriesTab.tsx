import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabaseAdmin } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Search, Phone, Mail, MessageSquare, 
  AlertTriangle, CheckCircle, Clock, Users, Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface FosteringEnquiry {
  id: string;
  agency_id: string | null;
  enquirer_name: string;
  enquirer_email: string | null;
  enquirer_phone: string | null;
  source: string | null;
  interest_type: string | null;
  child_age_group: string | null;
  child_gender: string | null;
  message: string | null;
  status: string;
  created_at: string;
}

export default function EnquiriesTab() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: enquiries, isLoading } = useQuery({
    queryKey: ['admin-enquiries-list', search, statusFilter],
    queryFn: async () => {
      let query = supabaseAdmin
        .from('fostering_enquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter) query = query.eq('status', statusFilter);
      if (search) query = query.or(`enquirer_name.ilike.%${search}%,enquirer_email.ilike.%${search}%,enquirer_phone.ilike.%${search}%`);

      const { data } = await query.limit(100);
      return (data || []) as FosteringEnquiry[];
    },
  });

  const newCount = enquiries?.filter(e => e.status === 'new').length || 0;
  const totalCount = enquiries?.length || 0;

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabaseAdmin
        .from('fostering_enquiries')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
      toast.success(`Enquiry marked as ${status}`);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Fostering Enquiries</h2>
          <p className="text-muted-foreground">Lead management for fostering enquiries</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-50">
            <Users className="h-3 w-3 mr-1" />{totalCount} Total
          </Badge>
          {newCount > 0 && (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
              <AlertTriangle className="h-3 w-3 mr-1" />{newCount} New
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search enquiries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">All Status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="converted">Converted</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Interest</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading enquiries...</TableCell></TableRow>
            ) : enquiries?.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No enquiries found</TableCell></TableRow>
            ) : (
              enquiries?.map((enq) => (
                <TableRow key={enq.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {enq.enquirer_name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {enq.enquirer_phone && (
                        <a href={`tel:${enq.enquirer_phone}`} className="text-muted-foreground hover:text-foreground"><Phone className="h-4 w-4" /></a>
                      )}
                      {enq.enquirer_email && (
                        <a href={`mailto:${enq.enquirer_email}`} className="text-muted-foreground hover:text-foreground"><Mail className="h-4 w-4" /></a>
                      )}
                      <span className="text-xs text-muted-foreground">{enq.enquirer_phone || enq.enquirer_email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {enq.interest_type && <Badge variant="outline" className="mr-1">{enq.interest_type}</Badge>}
                      {enq.child_age_group && <span className="text-xs text-muted-foreground">Age: {enq.child_age_group}</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      enq.status === 'new' ? 'bg-amber-100 text-amber-800' :
                      enq.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                      enq.status === 'qualified' ? 'bg-purple-100 text-purple-800' :
                      enq.status === 'converted' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {enq.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(enq.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <select
                      value={enq.status}
                      onChange={(e) => updateStatus(enq.id, e.target.value)}
                      className="h-8 text-xs rounded border border-input bg-background px-2"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="qualified">Qualified</option>
                      <option value="converted">Converted</option>
                      <option value="closed">Closed</option>
                    </select>
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
