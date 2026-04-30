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
  Users, Search, Phone, Mail, UserPlus, Plus, Eye, Loader2, 
  Calendar, Clock, CheckCircle, AlertCircle, FileText, ChevronRight,
  ArrowRight, MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ApplicationStage = 'enquiry' | 'initial_check' | 'assessment' | 'panel' | 'approved' | 'rejected';

interface Applicant {
  id: string;
  user_id: string | null;
  organisation_id: string | null;
  first_name: string | null;
  last_name: string | null;
  date_of_birth: string | null;
  address: string | null;
  postcode: string | null;
  phone: string | null;
  application_stage: ApplicationStage;
  enquiry_date: string | null;
  application_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const STAGE_CONFIG: Record<ApplicationStage, { label: string; color: string; icon: any; order: number }> = {
  enquiry: { label: 'New Enquiry', color: 'bg-blue-500', icon: Users, order: 1 },
  initial_check: { label: 'Initial Check', color: 'bg-amber-500', icon: Search, order: 2 },
  assessment: { label: 'Assessment', color: 'bg-purple-500', icon: FileText, order: 3 },
  panel: { label: 'Panel', color: 'bg-orange-500', icon: Calendar, order: 4 },
  approved: { label: 'Approved', color: 'bg-green-500', icon: CheckCircle, order: 5 },
  rejected: { label: 'Rejected', color: 'bg-red-500', icon: AlertCircle, order: 6 },
};

const STAGES = ['enquiry', 'initial_check', 'assessment', 'panel', 'approved', 'rejected'] as ApplicationStage[];

export default function ApplicantsTab() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

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

  // Fetch applicants for the organisation
  const { data: applicants, isLoading } = useQuery({
    queryKey: ['applicants', userProfile?.organisation_id, stageFilter],
    queryFn: async () => {
      if (!userProfile?.organisation_id) return [];
      
      let query = supabase
        .from('applicant_profiles')
        .select('*')
        .eq('organisation_id', userProfile.organisation_id)
        .order('created_at', { ascending: false });

      if (stageFilter !== 'all') {
        query = query.eq('application_stage', stageFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Applicant[] || [];
    },
    enabled: !!userProfile?.organisation_id,
  });

  // Filter by search
  const filteredApplicants = applicants?.filter(applicant => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      (applicant.first_name?.toLowerCase().includes(searchLower)) ||
      (applicant.last_name?.toLowerCase().includes(searchLower)) ||
      (applicant.email?.toLowerCase().includes(searchLower)) ||
      (applicant.phone?.includes(searchQuery)) ||
      (applicant.postcode?.toLowerCase().includes(searchLower))
    );
  }) || [];

  // Stats
  const stats = {
    total: applicants?.length || 0,
    new: applicants?.filter(a => a.application_stage === 'enquiry').length || 0,
    inAssessment: applicants?.filter(a => a.application_stage === 'assessment').length || 0,
    approved: applicants?.filter(a => a.application_stage === 'approved').length || 0,
  };

  // Group by stage for pipeline view
  const pipelineData = STAGES.map(stage => ({
    stage,
    ...STAGE_CONFIG[stage],
    count: applicants?.filter(a => a.application_stage === stage).length || 0,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Applicants</h2>
          <p className="text-muted-foreground">Track prospective foster carriers through the pipeline</p>
        </div>
        <Button className="bg-primary">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Applicant
        </Button>
      </div>

      {/* Pipeline Overview */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
        {pipelineData.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.stage}
              onClick={() => setStageFilter(stageFilter === item.stage ? 'all' : item.stage)}
              className={cn(
                'p-3 rounded-xl border text-left transition-all',
                stageFilter === item.stage 
                  ? 'bg-primary/10 border-primary/30' 
                  : 'bg-card hover:bg-accent'
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <Icon className={cn('h-4 w-4', item.color.replace('bg-', 'text-'))} />
                <span className="text-lg font-bold">{item.count}</span>
              </div>
              <p className="text-xs text-muted-foreground truncate">{item.label}</p>
            </button>
          );
        })}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Applicants</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">New Enquiries</p>
                <p className="text-2xl font-bold text-blue-700">{stats.new}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700">In Assessment</p>
                <p className="text-2xl font-bold text-purple-700">{stats.inAssessment}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Approved</p>
                <p className="text-2xl font-bold text-green-700">{stats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
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
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                {STAGES.map(stage => (
                  <SelectItem key={stage} value={stage}>
                    {STAGE_CONFIG[stage].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Applicants List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredApplicants.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No applicants found</h3>
          <p className="text-muted-foreground">
            {searchQuery || stageFilter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Applicants will appear here when they submit their application'}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredApplicants.map((applicant) => {
            const stageInfo = STAGE_CONFIG[applicant.application_stage];
            const StageIcon = stageInfo.icon;
            
            return (
              <Card key={applicant.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">
                            {applicant.first_name} {applicant.last_name}
                          </h3>
                          <Badge className={cn('text-white', stageInfo.color)}>
                            <StageIcon className="h-3 w-3 mr-1" />
                            {stageInfo.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {applicant.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {applicant.phone}
                            </span>
                          )}
                          {applicant.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {applicant.email}
                            </span>
                          )}
                          {applicant.postcode && (
                            <span className="flex items-center gap-1">
                              {applicant.postcode}
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
                          setSelectedApplicant(applicant);
                          setViewDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Message
                      </Button>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Enquired: {applicant.enquiry_date ? format(new Date(applicant.enquiry_date), 'MMM d, yyyy') : 'N/A'}</span>
                      {applicant.application_date && (
                        <>
                          <ArrowRight className="h-4 w-4" />
                          <span>Applied: {format(new Date(applicant.application_date), 'MMM d, yyyy')}</span>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* View Applicant Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Applicant Profile</DialogTitle>
          </DialogHeader>
          {selectedApplicant && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">
                    {selectedApplicant.first_name} {selectedApplicant.last_name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={STAGE_CONFIG[selectedApplicant.application_stage].color}>
                      {STAGE_CONFIG[selectedApplicant.application_stage].label}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedApplicant.email || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Phone</Label>
                  <p className="font-medium">{selectedApplicant.phone || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Address</Label>
                  <p className="font-medium">{selectedApplicant.address || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Postcode</Label>
                  <p className="font-medium">{selectedApplicant.postcode || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Enquiry Date</Label>
                  <p className="font-medium">
                    {selectedApplicant.enquiry_date 
                      ? format(new Date(selectedApplicant.enquiry_date), 'MMMM d, yyyy')
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Application Date</Label>
                  <p className="font-medium">
                    {selectedApplicant.application_date 
                      ? format(new Date(selectedApplicant.application_date), 'MMMM d, yyyy')
                      : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Stage Progression */}
              <div>
                <Label className="text-muted-foreground mb-2 block">Pipeline Progress</Label>
                <div className="flex items-center gap-1 overflow-x-auto pb-2">
                  {STAGES.map((stage, index) => {
                    const config = STAGE_CONFIG[stage];
                    const Icon = config.icon;
                    const isCurrentStage = selectedApplicant.application_stage === stage;
                    const isPastStage = config.order < STAGE_CONFIG[selectedApplicant.application_stage].order;
                    
                    return (
                      <div key={stage} className="flex items-center">
                        <div className={cn(
                          'flex items-center gap-2 px-3 py-2 rounded-lg',
                          isCurrentStage ? 'bg-primary/10 border border-primary' : 
                          isPastStage ? 'bg-green-50 border border-green-200' :
                          'bg-muted'
                        )}>
                          <Icon className={cn('h-4 w-4', 
                            isCurrentStage ? 'text-primary' : 
                            isPastStage ? 'text-green-600' :
                            'text-muted-foreground'
                          )} />
                          <span className="text-sm whitespace-nowrap">{config.label}</span>
                        </div>
                        {index < STAGES.length - 1 && (
                          <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedApplicant.notes && (
                <div>
                  <Label className="text-muted-foreground">Notes</Label>
                  <p className="mt-1">{selectedApplicant.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}