import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { 
  Users, Search, Phone, Mail, Heart, Plus, Eye, Loader2, 
  Calendar, Shield, Award, FileText, Clock, CheckCircle, AlertCircle,
  MoreHorizontal, UserPlus, Home, Car
} from 'lucide-react';
import { cn } from '@/lib/utils';

type FosterCarerStatus = 'pending' | 'approved' | 'active' | 'suspended' | 'deregistered';

interface FosterCarer {
  id: string;
  user_id: string | null;
  organisation_id: string | null;
  first_name: string | null;
  last_name: string | null;
  date_of_birth: string | null;
  gender: string | null;
  address: string | null;
  postcode: string | null;
  phone: string | null;
  email: string | null;
  status: FosterCarerStatus;
  approval_type: string | null;
  approval_date: string | null;
  panel_date: string | null;
  qualifications: string[] | null;
  languages: string[] | null;
  has_car: boolean;
  has_own_home: boolean;
  can_accommodate_pets: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_CONFIG: Record<FosterCarerStatus, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pending', color: 'bg-amber-500', icon: Clock },
  approved: { label: 'Approved', color: 'bg-blue-500', icon: Award },
  active: { label: 'Active', color: 'bg-green-500', icon: CheckCircle },
  suspended: { label: 'Suspended', color: 'bg-red-500', icon: AlertCircle },
  deregistered: { label: 'Deregistered', color: 'bg-gray-500', icon: AlertCircle },
};

export default function FosterCarersTab() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCarer, setSelectedCarer] = useState<FosterCarer | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newCarer, setNewCarer] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    postcode: '',
    has_own_home: true,
    has_car: false,
    can_accommodate_pets: false,
  });

  // Get user's organisation (agency)
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('user_profiles')
        .select('organisation_id, role')
        .eq('id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch foster carers for the organisation
  const { data: fosterCarers, isLoading } = useQuery({
    queryKey: ['foster-carers', userProfile?.organisation_id, statusFilter],
    queryFn: async () => {
      if (!userProfile?.organisation_id) return [];
      
      let query = supabase
        .from('foster_carer_profiles')
        .select('*')
        .eq('organisation_id', userProfile.organisation_id)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as FosterCarer[] || [];
    },
    enabled: !!userProfile?.organisation_id,
  });

  // Filter by search
  const filteredCarers = fosterCarers?.filter(carer => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      (carer.first_name?.toLowerCase().includes(searchLower)) ||
      (carer.last_name?.toLowerCase().includes(searchLower)) ||
      (carer.email?.toLowerCase().includes(searchLower)) ||
      (carer.phone?.includes(searchQuery)) ||
      (carer.postcode?.toLowerCase().includes(searchLower))
    );
  }) || [];

  // Stats
  const stats = {
    total: fosterCarers?.length || 0,
    active: fosterCarers?.filter(c => c.status === 'active').length || 0,
    pending: fosterCarers?.filter(c => c.status === 'pending').length || 0,
    approved: fosterCarers?.filter(c => c.status === 'approved').length || 0,
  };

  // Add foster carers is limited - typically done by admin after inquiry
  // We'll just show a toast for now
  const handleAddClick = () => {
    toast.info('To add a new foster carrier, please use the Applicants flow or contact support.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Foster Carers</h2>
          <p className="text-muted-foreground">Manage approved and prospective foster carriers</p>
        </div>
        <Button onClick={handleAddClick} className="bg-primary">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Foster Carer
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Carers</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Active</p>
                <p className="text-2xl font-bold text-green-700">{stats.active}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">Approved</p>
                <p className="text-2xl font-bold text-blue-700">{stats.approved}</p>
              </div>
              <Award className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-700">Pending</p>
                <p className="text-2xl font-bold text-amber-700">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, phone, postcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="deregistered">Deregistered</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Carers List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredCarers.length === 0 ? (
        <Card className="p-12 text-center">
          <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No foster carriers found</h3>
          <p className="text-muted-foreground">
            {searchQuery || statusFilter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Add foster carriers through the applicant pipeline'}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredCarers.map((carer) => {
            const statusInfo = STATUS_CONFIG[carer.status] || STATUS_CONFIG.pending;
            const StatusIcon = statusInfo.icon;
            
            return (
              <Card key={carer.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Heart className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">
                            {carer.first_name} {carer.last_name}
                          </h3>
                          <Badge className={cn('text-white', statusInfo.color)}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusInfo.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {carer.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {carer.email}
                            </span>
                          )}
                          {carer.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {carer.phone}
                            </span>
                          )}
                          {carer.postcode && (
                            <span className="flex items-center gap-1">
                              <Home className="h-3 w-3" />
                              {carer.postcode}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedCarer(carer);
                          setViewDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>

                  {/* Quick Info Row */}
                  <div className="mt-4 pt-4 border-t flex flex-wrap gap-4 text-sm">
                    {carer.approval_type && (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Award className="h-4 w-4" />
                        {carer.approval_type}
                      </span>
                    )}
                    {carer.approval_date && (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        Approved: {format(new Date(carer.approval_date), 'MMM yyyy')}
                      </span>
                    )}
                    {carer.has_own_home && (
                      <span className="flex items-center gap-1 text-green-600">
                        <Home className="h-4 w-4" />
                        Own Home
                      </span>
                    )}
                    {carer.has_car && (
                      <span className="flex items-center gap-1 text-green-600">
                        <Car className="h-4 w-4" />
                        Has Car
                      </span>
                    )}
                    {carer.languages && carer.languages.length > 0 && (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {carer.languages.join(', ')}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* View Carer Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Foster Carer Profile</DialogTitle>
          </DialogHeader>
          {selectedCarer && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">
                    {selectedCarer.first_name} {selectedCarer.last_name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={STATUS_CONFIG[selectedCarer.status].color}>
                      {STATUS_CONFIG[selectedCarer.status].label}
                    </Badge>
                    {selectedCarer.approval_type && (
                      <Badge variant="outline">{selectedCarer.approval_type}</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedCarer.email || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Phone</Label>
                  <p className="font-medium">{selectedCarer.phone || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Address</Label>
                  <p className="font-medium">{selectedCarer.address || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Postcode</Label>
                  <p className="font-medium">{selectedCarer.postcode || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Approval Date</Label>
                  <p className="font-medium">
                    {selectedCarer.approval_date 
                      ? format(new Date(selectedCarer.approval_date), 'MMMM d, yyyy')
                      : 'Not approved'}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Panel Date</Label>
                  <p className="font-medium">
                    {selectedCarer.panel_date 
                      ? format(new Date(selectedCarer.panel_date), 'MMMM d, yyyy')
                      : 'Not scheduled'}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Household Details</Label>
                <div className="flex gap-4 mt-2">
                  <Badge variant={selectedCarer.has_own_home ? 'default' : 'secondary'} className={selectedCarer.has_own_home ? 'bg-green-500' : ''}>
                    <Home className="h-3 w-3 mr-1" />
                    {selectedCarer.has_own_home ? 'Own Home' : 'Renting'}
                  </Badge>
                  <Badge variant={selectedCarer.has_car ? 'default' : 'secondary'} className={selectedCarer.has_car ? 'bg-green-500' : ''}>
                    <Car className="h-3 w-3 mr-1" />
                    {selectedCarer.has_car ? 'Has Car' : 'No Car'}
                  </Badge>
                  <Badge variant={selectedCarer.can_accommodate_pets ? 'default' : 'secondary'} className={selectedCarer.can_accommodate_pets ? 'bg-green-500' : ''}>
                    <Heart className="h-3 w-3 mr-1" />
                    {selectedCarer.can_accommodate_pets ? 'Pets OK' : 'No Pets'}
                  </Badge>
                </div>
              </div>

              {selectedCarer.qualifications && selectedCarer.qualifications.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Qualifications</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedCarer.qualifications.map((q, i) => (
                      <Badge key={i} variant="outline">{q}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedCarer.notes && (
                <div>
                  <Label className="text-muted-foreground">Notes</Label>
                  <p className="mt-1">{selectedCarer.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}