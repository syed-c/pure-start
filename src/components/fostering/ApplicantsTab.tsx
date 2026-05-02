/**
 * Applicants Pipeline Tab
 * Proper applicant tracking using fostering schema
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Users, Search, Plus, ArrowRight, Calendar, 
  Phone, Mail, Loader2, Clock, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import { NoPracticeLinked } from '@/components/agency/NoPracticeLinked';

const STAGES = [
  { id: 'enquiry', label: 'Enquiry', color: 'bg-gray-500' },
  { id: 'initial_contact', label: 'Initial Contact', color: 'bg-blue-500' },
  { id: 'home_visit', label: 'Home Visit', color: 'bg-indigo-500' },
  { id: 'assessment', label: 'Assessment', color: 'bg-purple-500' },
  { id: 'preparation', label: 'Preparation', color: 'bg-pink-500' },
  { id: 'panel', label: 'Panel', color: 'bg-orange-500' },
  { id: 'approved', label: 'Approved', color: 'bg-green-500' },
];

interface Applicant {
  id: string;
  agency_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  stage: string;
  status: string;
  priority: string;
  enquiry_date: string;
  notes: string | null;
  created_at: string;
}

export default function ApplicantsTab() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingApplicant, setEditingApplicant] = useState<Applicant | null>(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    stage: 'enquiry',
    priority: 'normal',
    notes: '',
  });

  // Fetch agency
  const { data: agency, isLoading: agencyLoading } = useQuery({
    queryKey: ['agency-applicants', user?.id],
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

  // Fetch applicants
  const { data: applicants, isLoading: applicantsLoading } = useQuery({
    queryKey: ['fostering-applicants', agency?.id, searchQuery, stageFilter],
    queryFn: async () => {
      let query = supabase
        .from('applicants')
        .select('*')
        .eq('agency_id', agency?.id);

      if (searchQuery) {
        query = query.or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%`);
      }
      if (stageFilter !== 'all') {
        query = query.eq('stage', stageFilter);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data as Applicant[];
    },
    enabled: !!agency?.id,
  });

  // Add applicant mutation
  const addApplicant = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!agency?.id) throw new Error('No agency found');

      const { error } = await supabase
        .from('applicants')
        .insert({
          agency_id: agency.id,
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email || null,
          phone: data.phone || null,
          stage: data.stage,
          status: 'active',
          priority: data.priority,
          notes: data.notes || null,
          enquiry_date: new Date().toISOString(),
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fostering-applicants'] });
      setShowAddDialog(false);
      resetForm();
      toast.success('Applicant added successfully');
    },
    onError: (error: any) => toast.error(error.message || 'Failed to add applicant'),
  });

  // Update applicant stage mutation
  const updateStage = useMutation({
    mutationFn: async ({ id, stage }: { id: string; stage: string }) => {
      const updateData: any = { stage, updated_at: new Date().toISOString() };
      
      // Set date for stage
      if (stage === 'initial_contact') updateData.initial_contact_date = new Date().toISOString();
      if (stage === 'home_visit') updateData.home_visit_date = new Date().toISOString();
      if (stage === 'assessment') updateData.assessment_date = new Date().toISOString();
      if (stage === 'panel') updateData.panel_date = new Date().toISOString();
      if (stage === 'approved') updateData.approval_date = new Date().toISOString();

      const { error } = await supabase
        .from('applicants')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fostering-applicants'] });
      toast.success('Stage updated');
    },
    onError: (error: any) => toast.error(error.message || 'Failed to update stage'),
  });

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      stage: 'enquiry',
      priority: 'normal',
      notes: '',
    });
  };

  const handleAdd = () => {
    addApplicant.mutate(formData);
  };

  const getStageIndex = (stage: string) => STAGES.findIndex(s => s.id === stage);

  const getStageBadge = (stage: string) => {
    const stageObj = STAGES.find(s => s.id === stage);
    return stageObj ? (
      <Badge className={stageObj.color + ' text-white'}>{stageObj.label}</Badge>
    ) : null;
  };

  if (!agency && !agencyLoading) {
    return <NoPracticeLinked />;
  }

  // Calculate stages with counts
  const stageCounts = STAGES.map(stage => ({
    ...stage,
    count: applicants?.filter(a => a.stage === stage.id).length || 0,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Applicants Pipeline</h2>
          <p className="text-muted-foreground">Track applicant progress through assessment</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Applicant
        </Button>
      </div>

      {/* Pipeline Visual */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-2 min-w-max">
          {stageCounts.map((stage, index) => (
            <div key={stage.id} className="flex items-center">
              <div className={`rounded-lg p-4 ${stageFilter === stage.id ? 'ring-2 ring-primary' : ''}`}>
                <div className="text-center">
                  <div className={`w-10 h-10 rounded-full ${stage.color} flex items-center justify-center mx-auto mb-2`}>
                    <span className="text-white font-bold">{stage.count}</span>
                  </div>
                  <p className="text-sm font-medium">{stage.label}</p>
                </div>
              </div>
              {index < stageCounts.length - 1 && (
                <ArrowRight className="w-4 h-4 mx-2 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search applicants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {STAGES.map(s => (
              <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{applicants?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Total Applicants</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{applicants?.filter(a => a.stage === 'panel').length || 0}</p>
                <p className="text-sm text-muted-foreground">At Panel</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{applicants?.filter(a => a.stage === 'approved').length || 0}</p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{applicants?.filter(a => a.priority === 'urgent').length || 0}</p>
                <p className="text-sm text-muted-foreground">Urgent</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Applicants List */}
      {applicantsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : !applicants?.length ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Applicants Yet</h3>
            <p className="text-muted-foreground mb-4">Add your first applicant or receive enquiries.</p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Applicant
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {applicants.map((applicant) => (
            <Card key={applicant.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">
                        {applicant.first_name[0]}{applicant.last_name[0]}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{applicant.first_name} {applicant.last_name}</h3>
                        {getStageBadge(applicant.stage)}
                        {applicant.priority === 'urgent' && (
                          <Badge variant="destructive">Urgent</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        {applicant.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {applicant.phone}
                          </span>
                        )}
                        {applicant.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {applicant.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Select 
                    value={applicant.stage} 
                    onValueChange={(stage) => updateStage.mutate({ id: applicant.id, stage })}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STAGES.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Applicant</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name *</Label>
                <Input
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                />
              </div>
              <div>
                <Label>Last Name *</Label>
                <Input
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
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
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!formData.first_name || !formData.last_name}>
              Add Applicant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}