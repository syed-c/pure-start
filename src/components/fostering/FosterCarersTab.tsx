/**
 * Foster Carers Management Tab
 * Proper foster caring management using fostering schema
 */

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Users, Search, Plus, Edit, Trash2, Eye, 
  Heart, Home, Calendar, AlertTriangle, Loader2,
  Phone, Mail, MapPin, FileText, UserCheck
} from 'lucide-react';
import { NoPracticeLinked } from '@/components/agency/NoPracticeLinked';

const FOSTERING_TYPES = [
  { id: 'short_term', label: 'Short-Term' },
  { id: 'long_term', label: 'Long-Term' },
  { id: 'respite', label: 'Respite' },
  { id: 'emergency', label: 'Emergency' },
  { id: 'therapeutic', label: 'Therapeutic' },
  { id: 'parent_child', label: 'Parent & Child' },
];

const AGE_GROUPS = [
  { id: '0_5', label: '0-5 years' },
  { id: '5_10', label: '5-10 years' },
  { id: '10_15', label: '10-15 years' },
  { id: '15_18', label: '15-18 years' },
];

const CARER_STATUSES = [
  { id: 'pending', label: 'Pending', color: 'bg-yellow-500' },
  { id: 'assessment', label: 'In Assessment', color: 'bg-blue-500' },
  { id: 'approved', label: 'Approved', color: 'bg-green-500' },
  { id: 'active', label: 'Active', color: 'bg-emerald-500' },
  { id: 'inactive', label: 'Inactive', color: 'bg-gray-500' },
];

interface FosterCarer {
  id: string;
  agency_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  postcode: string | null;
  status: string;
  fostering_types: string[] | null;
  age_groups_supported: string[] | null;
  availability_status: string;
  available_from: string | null;
  approval_date: string | null;
  supervising_social_worker_id: string | null;
  notes: string | null;
  created_at: string;
}

export default function FosterCarersTab() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingCarer, setEditingCarer] = useState<FosterCarer | null>(null);
  const [selectedCarer, setSelectedCarer] = useState<FosterCarer | null>(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    postcode: '',
    status: 'pending',
    fostering_types: [] as string[],
    age_groups_supported: [] as string[],
    availability_status: 'unavailable',
    notes: '',
  });

  // Fetch agency
  const { data: agency, isLoading: agencyLoading } = useQuery({
    queryKey: ['agency-carers', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agencies')
        .select('id, name')
        .eq('claimed_by', user?.id)
        .limit(1)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch foster carers
  const { data: carers, isLoading: carersLoading } = useQuery({
    queryKey: ['foster-carers', agency?.id, searchQuery, statusFilter, availabilityFilter],
    queryFn: async () => {
      let query = supabase
        .from('foster_carers')
        .select('*')
        .eq('agency_id', agency?.id);

      if (searchQuery) {
        query = query.or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%`);
      }
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      if (availabilityFilter !== 'all') {
        query = query.eq('availability_status', availabilityFilter);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data as FosterCarer[];
    },
    enabled: !!agency?.id,
  });

  // Add foster carer mutation
  const addCarer = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!agency?.id) throw new Error('No agency found');

      const { error } = await supabase
        .from('foster_carers')
        .insert({
          agency_id: agency.id,
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email || null,
          phone: data.phone || null,
          address: data.address || null,
          postcode: data.postcode || null,
          status: data.status,
          fostering_types: data.fostering_types,
          age_groups_supported: data.age_groups_supported,
          availability_status: data.availability_status,
          notes: data.notes || null,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foster-carers'] });
      setShowAddDialog(false);
      resetForm();
      toast.success('Foster Carer added successfully');
    },
    onError: (error: any) => toast.error(error.message || 'Failed to add foster carer'),
  });

  // Update foster carer mutation
  const updateCarer = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from('foster_carers')
        .update({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email || null,
          phone: data.phone || null,
          address: data.address || null,
          postcode: data.postcode || null,
          status: data.status,
          fostering_types: data.fostering_types,
          age_groups_supported: data.age_groups_supported,
          availability_status: data.availability_status,
          notes: data.notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foster-carers'] });
      setEditingCarer(null);
      toast.success('Foster Carer updated successfully');
    },
    onError: (error: any) => toast.error(error.message || 'Failed to update foster carer'),
  });

  // Delete foster carer mutation
  const deleteCarer = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('foster_carers')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foster-carers'] });
      toast.success('Foster Carer removed');
    },
    onError: (error: any) => toast.error(error.message || 'Failed to remove foster carers'),
  });

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      address: '',
      postcode: '',
      status: 'pending',
      fostering_types: [],
      age_groups_supported: [],
      availability_status: 'unavailable',
      notes: '',
    });
  };

  const handleAdd = () => {
    addCarer.mutate(formData);
  };

  const handleEdit = (carer: FosterCarer) => {
    setFormData({
      first_name: carer.first_name,
      last_name: carer.last_name,
      email: carer.email || '',
      phone: carer.phone || '',
      address: carer.address || '',
      postcode: carer.postcode || '',
      status: carer.status,
      fostering_types: carer.fostering_types || [],
      age_groups_supported: carer.age_groups_supported || [],
      availability_status: carer.availability_status,
      notes: carer.notes || '',
    });
    setEditingCarer(carer);
  };

  const handleUpdate = () => {
    if (editingCarer) {
      updateCarer.mutate({ id: editingCarer.id, data: formData });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusObj = CARER_STATUSES.find(s => s.id === status);
    return statusObj ? (
      <Badge className={statusObj.color + ' text-white'}>{statusObj.label}</Badge>
    ) : null;
  };

  if (!agency && !agencyLoading) {
    return <NoPracticeLinked />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Foster Carers</h2>
          <p className="text-muted-foreground">Manage your approved foster carers</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Foster Carer
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {CARER_STATUSES.map(s => (
              <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Availability" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Availability</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="unavailable">Unavailable</SelectItem>
            <SelectItem value="on_hold">On Hold</SelectItem>
            <SelectItem value="emergency_only">Emergency Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{carers?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Total Carers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{carers?.filter(c => c.status === 'active').length || 0}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Heart className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{carers?.filter(c => c.availability_status === 'available').length || 0}</p>
                <p className="text-sm text-muted-foreground">Available</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{carers?.filter(c => c.status === 'assessment').length || 0}</p>
                <p className="text-sm text-muted-foreground">In Assessment</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Carers List */}
      {carersLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : !carers?.length ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Foster Carers Yet</h3>
            <p className="text-muted-foreground mb-4">Add your first foster carer to get started.</p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Foster Carer
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {carers.map((carer) => (
            <Card key={carer.id} className="hover:border-primary/50 transition-colors">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">
                        {carer.first_name[0]}{carer.last_name[0]}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{carer.first_name} {carer.last_name}</h3>
                        {getStatusBadge(carer.status)}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        {carer.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {carer.phone}
                          </span>
                        )}
                        {carer.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {carer.email}
                          </span>
                        )}
                        {carer.postcode && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {carer.postcode}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {carer.fostering_types?.map(type => (
                          <Badge key={type} variant="outline">{type.replace('_', ' ')}</Badge>
                        ))}
                        {carer.age_groups_supported?.map(age => (
                          <Badge key={age} variant="outline">{age.replace('_', '-')}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => { setSelectedCarer(carer); handleEdit(carer); }}>
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteCarer.mutate(carer.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog || !!editingCarer} onOpenChange={(open) => {
        if (!open) {
          setShowAddDialog(false);
          setEditingCarer(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingCarer ? 'Edit Foster Carer' : 'Add Foster Carer'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name *</Label>
                <Input
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <Label>Last Name *</Label>
                <Input
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="Enter last name"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Phone number"
                />
              </div>
            </div>
            <div>
              <Label>Address</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Address"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CARER_STATUSES.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Availability</Label>
                <Select value={formData.availability_status} onValueChange={(v) => setFormData({ ...formData, availability_status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="unavailable">Unavailable</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="emergency_only">Emergency Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Fostering Types</Label>
              <div className="flex flex-wrap gap-2">
                {FOSTERING_TYPES.map(type => (
                  <Badge
                    key={type.id}
                    variant={formData.fostering_types.includes(type.id) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => {
                      const types = formData.fostering_types.includes(type.id)
                        ? formData.fostering_types.filter(t => t !== type.id)
                        : [...formData.fostering_types, type.id];
                      setFormData({ ...formData, fostering_types: types });
                    }}
                  >
                    {type.label}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label>Age Groups Supported</Label>
              <div className="flex flex-wrap gap-2">
                {AGE_GROUPS.map(age => (
                  <Badge
                    key={age.id}
                    variant={formData.age_groups_supported.includes(age.id) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => {
                      const ages = formData.age_groups_supported.includes(age.id)
                        ? formData.age_groups_supported.filter(a => a !== age.id)
                        : [...formData.age_groups_supported, age.id];
                      setFormData({ ...formData, age_groups_supported: ages });
                    }}
                  >
                    {age.label}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddDialog(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={editingCarer ? handleUpdate : handleAdd} disabled={!formData.first_name || !formData.last_name}>
              {editingCarer ? 'Update' : 'Add'} Foster Carer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}