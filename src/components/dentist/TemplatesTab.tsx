import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  FileText,
  Mail,
  MessageSquare,
  Phone,
  Star,
  Calendar,
  Clock,
  Send,
  Copy,
  Edit,
  Plus,
  Sparkles,
  Bell,
  Heart,
  CheckCircle,
  RefreshCw,
  Users,
  Zap,
  Eye,
  MessageCircle,
} from 'lucide-react';
import { NoPracticeLinked } from './NoPracticeLinked';

// System Templates
const SYSTEM_TEMPLATES = [
  {
    id: 'review_request',
    category: 'review',
    name: 'Review Request',
    description: 'Ask carers for a review after their experience',
    icon: Star,
    color: 'from-amber-500 to-orange-500',
    channels: ['email', 'sms', 'whatsapp'],
    subject: 'How was your experience with {agency_name}?',
    message: 'Hi {carer_name}! Thank you for working with {agency_name}. We hope you had a great experience. Would you take a moment to share your feedback? It really helps us improve and helps others find quality fostering support.\n\n{review_link}',
    variables: ['carer_name', 'agency_name', 'review_link'],
  },
  {
    id: 'enquiry_confirmation',
    category: 'booking',
    name: 'Enquiry Confirmation',
    description: 'Confirm a new enquiry with the carer',
    icon: CheckCircle,
    color: 'from-emerald-500 to-teal-500',
    channels: ['email', 'sms', 'whatsapp'],
    subject: 'Your enquiry is confirmed at {agency_name}',
    message: 'Hi {carer_name}! Your enquiry at {agency_name} is confirmed.\n\n📅 Date: {enquiry_date}\n⏰ Time: {enquiry_time}\n📍 Address: {agency_address}\n\nPlease arrive 10 minutes early. If you need to reschedule, reply to this message or call us.',
    variables: ['carer_name', 'agency_name', 'enquiry_date', 'enquiry_time', 'agency_address'],
  },
  {
    id: 'meeting_reminder_2day',
    category: 'reminder',
    name: 'Reminder (2 Days)',
    description: 'Remind carers 2 days before meeting',
    icon: Bell,
    color: 'from-blue-500 to-indigo-500',
    channels: ['email', 'sms', 'whatsapp'],
    subject: 'Reminder: Your meeting in 2 days',
    message: 'Hi {carer_name}! This is a friendly reminder about your upcoming meeting at {agency_name}.\n\n📅 Date: {enquiry_date}\n⏰ Time: {enquiry_time}\n\nWe look forward to seeing you!',
    variables: ['carer_name', 'agency_name', 'enquiry_date', 'enquiry_time'],
  },
  {
    id: 'meeting_reminder_1day',
    category: 'reminder',
    name: 'Reminder (1 Day)',
    description: 'Remind carers 1 day before meeting',
    icon: Clock,
    color: 'from-purple-500 to-pink-500',
    channels: ['email', 'sms', 'whatsapp'],
    subject: 'Tomorrow: Your meeting at {agency_name}',
    message: 'Hi {carer_name}! Just a quick reminder - your meeting at {agency_name} is tomorrow!\n\n📅 Date: {enquiry_date}\n⏰ Time: {enquiry_time}\n\nSee you soon!',
    variables: ['carer_name', 'agency_name', 'enquiry_date', 'enquiry_time'],
  },
  {
    id: 'meeting_reminder_3hr',
    category: 'reminder',
    name: 'Reminder (3 Hours)',
    description: 'Final reminder 3 hours before meeting',
    icon: Zap,
    color: 'from-rose-500 to-red-500',
    channels: ['sms', 'whatsapp'],
    subject: 'Your meeting is in 3 hours',
    message: 'Hi {carer_name}! Your meeting at {agency_name} is in 3 hours at {enquiry_time}. Please arrive 10 minutes early. See you soon!',
    variables: ['carer_name', 'agency_name', 'enquiry_time'],
  },
  {
    id: 'follow_up',
    category: 'followup',
    name: 'Follow-up Message',
    description: 'Check in with carers after their assessment',
    icon: Heart,
    color: 'from-pink-500 to-rose-500',
    channels: ['email', 'sms', 'whatsapp'],
    subject: 'How are you feeling after your meeting?',
    message: 'Hi {carer_name}! We wanted to check in and see how you\'re feeling after your recent meeting with {agency_name}.\n\nIf you have any questions or concerns about the fostering process, please don\'t hesitate to reach out. We\'re here to help!\n\nWarm regards,\n{agency_name} Team',
    variables: ['carer_name', 'agency_name'],
  },
  {
    id: 'thank_you',
    category: 'followup',
    name: 'Thank You',
    description: 'Thank carers for choosing your agency',
    icon: Sparkles,
    color: 'from-teal-500 to-cyan-500',
    channels: ['email', 'sms', 'whatsapp'],
    subject: 'Thank you for choosing {agency_name}!',
    message: 'Hi {carer_name}! Thank you for choosing {agency_name} for your fostering journey. We truly appreciate your trust in us!\n\nIf you have any questions or need to schedule your next meeting, we\'re always here to help.',
    variables: ['carer_name', 'agency_name'],
  },
  {
    id: 'reschedule',
    category: 'booking',
    name: 'Reschedule Request',
    description: 'Ask carer to reschedule their meeting',
    icon: RefreshCw,
    color: 'from-slate-500 to-slate-700',
    channels: ['email', 'sms', 'whatsapp'],
    subject: 'Need to reschedule your meeting?',
    message: 'Hi {carer_name}! We noticed you might need to reschedule your meeting at {agency_name}.\n\nPlease reply to this message or call us to find a new time that works better for you. We\'re flexible and happy to accommodate your schedule!',
    variables: ['carer_name', 'agency_name'],
  },
  {
    id: 'missed_meeting',
    category: 'reminder',
    name: 'Missed Meeting',
    description: 'Follow up on missed meetings',
    icon: Calendar,
    color: 'from-amber-500 to-yellow-500',
    channels: ['email', 'sms', 'whatsapp'],
    subject: 'We missed you today!',
    message: 'Hi {carer_name}! We noticed you weren\'t able to make it to your meeting today at {agency_name}.\n\nWe hope everything is okay! Please reach out to reschedule at your convenience. Your fostering journey is important to us.',
    variables: ['carer_name', 'agency_name'],
  },
  {
    id: 'recall_reminder',
    category: 'marketing',
    name: 'Check-in Reminder',
    description: 'Remind carers about their regular check-in',
    icon: Users,
    color: 'from-green-500 to-emerald-600',
    channels: ['email', 'sms'],
    subject: 'Time for your fostering check-in!',
    message: 'Hi {carer_name}! It\'s been a while since your last visit to {agency_name}. Regular check-ins are important for your fostering journey.\n\nWe\'d love to hear from you! Book your meeting today.\n\n{booking_link}',
    variables: ['carer_name', 'agency_name', 'booking_link'],
  },
];

const CATEGORY_CONFIG = {
  review: { label: 'Review Requests', icon: Star, color: 'text-amber-500' },
  booking: { label: 'Booking & Confirmation', icon: Calendar, color: 'text-emerald-500' },
  reminder: { label: 'Reminders', icon: Bell, color: 'text-blue-500' },
  followup: { label: 'Follow-up', icon: Heart, color: 'text-pink-500' },
  marketing: { label: 'Marketing', icon: Users, color: 'text-green-500' },
};

interface Patient {
  id: string;
  name: string;
  phone: string;
  email: string | null;
}

export default function TemplatesTab() {
  const { user, isAdmin, isSuperAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState('all');
  const [previewTemplate, setPreviewTemplate] = useState<typeof SYSTEM_TEMPLATES[0] | null>(null);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [sendTemplate, setSendTemplate] = useState<typeof SYSTEM_TEMPLATES[0] | null>(null);
  const [sendChannel, setSendChannel] = useState<'email' | 'sms' | 'whatsapp'>('email');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Fetch clinic - skip for admins
  const { data: clinic, isLoading: clinicLoading } = useQuery({
    queryKey: ['dentist-clinic-templates', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clinics')
        .select('id, name, slug, address')
        .eq('claimed_by', user?.id)
        .limit(1)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user?.id && !isAdmin && !isSuperAdmin,
  });

  // Fetch patients for selection
  const { data: patients = [] } = useQuery({
    queryKey: ['clinic-patients-templates', clinic?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('id, name, phone, email')
        .eq('clinic_id', clinic?.id)
        .eq('is_deleted_by_dentist', false)
        .order('name')
        .limit(200);
      if (error) throw error;
      return (data || []) as Patient[];
    },
    enabled: !!clinic?.id,
  });

  // Send template mutation
  const sendTemplateMutation = useMutation({
    mutationFn: async () => {
      if (!sendTemplate || !clinic) throw new Error('No template selected');
      
      const patient = patients.find(p => p.id === selectedPatientId);
      if (!patient) throw new Error('No patient selected');

      // Replace variables in message
      const message = (customMessage || sendTemplate.message)
        .replace(/{patient_name}/g, patient.name)
        .replace(/{clinic_name}/g, clinic.name)
        .replace(/{clinic_address}/g, clinic.address || '')
        .replace(/{review_link}/g, `${window.location.origin}/review/${clinic.slug}`)
        .replace(/{booking_link}/g, `${window.location.origin}/clinic/${clinic.slug}`);

      const { error } = await supabase.functions.invoke('send-review-request', {
        body: {
          clinicId: clinic.id,
          recipientName: patient.name,
          recipientEmail: sendChannel === 'email' ? patient.email : undefined,
          recipientPhone: sendChannel !== 'email' ? patient.phone : undefined,
          channel: sendChannel,
          customMessage: message,
          templateId: sendTemplate.id,
        },
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Message sent successfully!');
      setSendDialogOpen(false);
      setSendTemplate(null);
      setSelectedPatientId(null);
      setCustomMessage('');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send message');
    },
  });

  const handleSend = async () => {
    setIsSending(true);
    try {
      await sendTemplateMutation.mutateAsync();
    } finally {
      setIsSending(false);
    }
  };

  const openSendDialog = (template: typeof SYSTEM_TEMPLATES[0]) => {
    setSendTemplate(template);
    setCustomMessage(template.message);
    setSendChannel(template.channels.includes('email') ? 'email' : template.channels[0] as 'sms' | 'whatsapp');
    setSendDialogOpen(true);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const filteredTemplates = activeCategory === 'all' 
    ? SYSTEM_TEMPLATES 
    : SYSTEM_TEMPLATES.filter(t => t.category === activeCategory);

  if (clinicLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-40" />)}
        </div>
      </div>
    );
  }

  if (!clinic && !isAdmin && !isSuperAdmin) return <NoPracticeLinked compact />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Message Templates
          </h1>
          <p className="text-white/70 mt-1">
            Pre-built templates for all your carer communications
          </p>
        </div>
        <Badge className="bg-primary/20 text-primary-foreground border-0">
          {SYSTEM_TEMPLATES.length} Templates
        </Badge>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid w-full grid-cols-6 bg-muted/50 rounded-xl p-1 h-auto">
          <TabsTrigger value="all" className="rounded-lg py-2 text-xs sm:text-sm">
            All
          </TabsTrigger>
          {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <TabsTrigger key={key} value={key} className="rounded-lg py-2 text-xs sm:text-sm gap-1">
                <Icon className={`h-3 w-3 sm:h-4 sm:w-4 ${config.color}`} />
                <span className="hidden sm:inline">{config.label.split(' ')[0]}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={activeCategory} className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => {
              const Icon = template.icon;
              const categoryConfig = CATEGORY_CONFIG[template.category as keyof typeof CATEGORY_CONFIG];
              
              return (
                <Card 
                  key={template.id}
                  className="group hover:shadow-lg transition-all duration-300 border-muted/50 overflow-hidden"
                >
                  <div className={`h-2 bg-gradient-to-r ${template.color}`} />
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${template.color} flex items-center justify-center shadow-lg`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex gap-1">
                        {template.channels.map(channel => (
                          <Badge key={channel} variant="secondary" className="text-[10px] px-1.5 py-0">
                            {channel === 'email' && <Mail className="h-2.5 w-2.5" />}
                            {channel === 'sms' && <Phone className="h-2.5 w-2.5" />}
                            {channel === 'whatsapp' && <MessageCircle className="h-2.5 w-2.5" />}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <CardTitle className="text-base mt-3">{template.name}</CardTitle>
                    <CardDescription className="text-xs line-clamp-2">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 gap-1 text-xs"
                        onClick={() => setPreviewTemplate(template)}
                      >
                        <Eye className="h-3 w-3" />
                        Preview
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 gap-1 text-xs bg-gradient-to-r from-primary to-teal text-white"
                        onClick={() => openSendDialog(template)}
                      >
                        <Send className="h-3 w-3" />
                        Send
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {previewTemplate && <previewTemplate.icon className="h-5 w-5 text-primary" />}
              {previewTemplate?.name}
            </DialogTitle>
            <DialogDescription>{previewTemplate?.description}</DialogDescription>
          </DialogHeader>
          
          {previewTemplate && (
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Subject Line</Label>
                <div className="p-3 bg-muted/50 rounded-lg mt-1">
                  <p className="text-sm font-medium">{previewTemplate.subject}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-xs text-muted-foreground">Message Content</Label>
                <div className="p-3 bg-muted/50 rounded-lg mt-1">
                  <p className="text-sm whitespace-pre-wrap">{previewTemplate.message}</p>
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Variables</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {previewTemplate.variables.map(v => (
                    <Badge key={v} variant="outline" className="text-xs">
                      {`{${v}}`}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Available Channels</Label>
                <div className="flex gap-2 mt-1">
                  {previewTemplate.channels.map(channel => (
                    <Badge key={channel} className="gap-1">
                      {channel === 'email' && <Mail className="h-3 w-3" />}
                      {channel === 'sms' && <Phone className="h-3 w-3" />}
                      {channel === 'whatsapp' && <MessageCircle className="h-3 w-3" />}
                      {channel.charAt(0).toUpperCase() + channel.slice(1)}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => copyToClipboard(previewTemplate?.message || '')}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Message
            </Button>
            <Button onClick={() => { setPreviewTemplate(null); if(previewTemplate) openSendDialog(previewTemplate); }}>
              <Send className="h-4 w-4 mr-2" />
              Send This
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Dialog */}
      <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              Send {sendTemplate?.name}
            </DialogTitle>
            <DialogDescription>
              Select a carer and channel to send this message
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Carer Selection */}
            <div>
              <Label>Select Carer</Label>
              <Select value={selectedPatientId || ''} onValueChange={setSelectedPatientId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose a carer..." />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="max-h-[200px]">
                    {patients.map(patient => (
                      <SelectItem key={patient.id} value={patient.id}>
                        <div className="flex items-center gap-2">
                          <span>{patient.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {patient.email || patient.phone}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
            </div>

            {/* Channel Selection */}
            <div>
              <Label>Send Via</Label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {sendTemplate?.channels.map(channel => {
                  const patient = patients.find(p => p.id === selectedPatientId);
                  const disabled = channel === 'email' ? !patient?.email : !patient?.phone;
                  
                  return (
                    <Button
                      key={channel}
                      type="button"
                      variant={sendChannel === channel ? 'default' : 'outline'}
                      className={`gap-2 ${sendChannel === channel ? 'bg-primary text-white' : ''}`}
                      onClick={() => setSendChannel(channel as 'email' | 'sms' | 'whatsapp')}
                      disabled={disabled}
                    >
                      {channel === 'email' && <Mail className="h-4 w-4" />}
                      {channel === 'sms' && <Phone className="h-4 w-4" />}
                      {channel === 'whatsapp' && <MessageCircle className="h-4 w-4" />}
                      {channel.charAt(0).toUpperCase() + channel.slice(1)}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Message Preview/Edit */}
            <div>
              <Label>Message (editable)</Label>
              <Textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={6}
                className="mt-1 font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Variables like {'{patient_name}'} will be replaced automatically
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSendDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSend} 
              disabled={!selectedPatientId || isSending}
              className="gap-2"
            >
              {isSending ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {isSending ? 'Sending...' : 'Send Message'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
