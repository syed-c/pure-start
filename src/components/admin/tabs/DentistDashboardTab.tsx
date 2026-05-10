import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Calendar,
  Clock,
  Star,
  CheckCircle,
  Building2,
  Shield,
  CreditCard,
  Award,
  Loader2,
  MapPin,
  AlertTriangle,
  Send,
  QrCode,
  Users,
  Zap,
  Settings,
  Edit,
  Globe,
  ThumbsUp,
  RefreshCw,
  Plus,
  Eye,
  Heart,
  UserPlus,
  FileText,
  BookOpen,
} from 'lucide-react';
import { LocationSelectionModal } from '@/components/LocationSelectionModal';
import { AddPracticeModal } from '@/components/agency/AddPracticeModal';
import {
  HeroStatsGrid,
  CommandStrip,
  ReputationWidget,
  AppointmentsTimeline,
  ProfileHealthCard,
  OutreachImpactCard,
  ActivityFeed,
} from '@/components/dashboard';
import NotificationSettingsCard from '@/components/agency/NotificationSettingsCard';
import AIInsightsCard from '@/components/agency/AIInsightsCard';
import DashboardWidgets from '@/components/agency/DashboardWidgets';

function VerificationPaymentButton({ agencyId }: { agencyId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  
  const handlePayment = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-verification-payment', {
        body: { clinicId: agencyId },
      });
      if (error) throw error;
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (err: any) {
      toast.error(err.message || 'Payment failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handlePayment} 
      disabled={isLoading} 
      className="w-full bg-teal hover:bg-teal/90 text-white font-bold"
    >
      {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Award className="h-4 w-4 mr-2" />}
      Get Verified - 99 AED/month
    </Button>
  );
}

interface AgencyProfile {
  id: string;
  name: string;
  slug: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  rating?: number;
  review_count?: number;
  verification_status?: string;
  claim_status?: string;
  location_verified?: boolean;
  location_pending_approval?: boolean;
  city_id?: string;
  gmb_connected?: boolean;
  google_place_id?: string;
  city?: { name: string };
  area?: { name: string };
}

export default function AgencyDashboardTab() {
  const { user, isAdmin, isSuperAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showAddPracticeModal, setShowAddPracticeModal] = useState(false);

  // Check for subscription success/cancelled from URL
  useEffect(() => {
    const subscriptionStatus = searchParams.get('subscription');
    if (subscriptionStatus === 'success') {
      toast.success('🎉 Subscription activated successfully! Welcome to your new plan.', {
        duration: 5000,
      });
      // Remove the param from URL
      searchParams.delete('subscription');
      setSearchParams(searchParams, { replace: true });
      // Refresh subscription data
      queryClient.invalidateQueries({ queryKey: ['clinic-subscription'] });
    } else if (subscriptionStatus === 'cancelled') {
      toast.info('Checkout was cancelled. You can upgrade anytime from your dashboard.');
      searchParams.delete('subscription');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams, queryClient]);

  const navigateTo = (tab: string) => {
    setSearchParams({ tab });
  };

  // Fetch fosterer's agency - skip for admins
  const { data: agency, isLoading: profileLoading } = useQuery({
    queryKey: ['fosterer-profile', user?.id],
    queryFn: async (): Promise<AgencyProfile | null> => {
      const { data: agencies } = await supabase
        .from('agencies')
        .select(`
          id, name, slug, address, phone, email, website, rating, review_count,
          verification_status, claim_status, location_verified, location_pending_approval, 
          city_id, gmb_connected, google_place_id,
          city:cities(name),
          area:areas(name)
        `)
        .eq('claimed_by', user?.id)
        .limit(1);
      
      if (agencies && agencies.length > 0) {
        const c = agencies[0];
        return {
          id: c.id,
          name: c.name,
          slug: c.slug,
          address: c.address || undefined,
          phone: c.phone || undefined,
          email: c.email || undefined,
          website: c.website || undefined,
          rating: c.rating ? Number(c.rating) : undefined,
          review_count: c.review_count || undefined,
          verification_status: c.verification_status || undefined,
          claim_status: c.claim_status || undefined,
          location_verified: c.location_verified ?? undefined,
          location_pending_approval: c.location_pending_approval ?? undefined,
          city_id: c.city_id || undefined,
          gmb_connected: c.gmb_connected || false,
          google_place_id: c.google_place_id || undefined,
          city: c.city as { name: string } | undefined,
          area: c.area as { name: string } | undefined,
        };
      }
      return null;
    },
    enabled: !!user?.id && !isAdmin && !isSuperAdmin,
  });

  // Fetch subscription plan
  const { data: subscription } = useQuery({
    queryKey: ['agency-subscription', agency?.id],
    queryFn: async () => {
      if (!agency?.id) return null;
      const { data } = await supabase
        .from('clinic_subscriptions')
        .select('*, plan:subscription_plans(*)')
        .eq('clinic_id', agency.id)
        .eq('status', 'active')
        .maybeSingle();
      return data;
    },
    enabled: !!agency?.id,
  });

  // Fetch appointments stats
  const { data: appointmentStats } = useQuery({
    queryKey: ['fosterer-appointments-stats', agency?.id],
    queryFn: async () => {
      if (!agency?.id) return { total: 0, pending: 0, confirmed: 0, completed: 0 };
      
      const { data } = await supabase
        .from('fostering_enquiries')
        .select('status')
        .eq('clinic_id', agency.id);
      
      const appointments = data || [];
      return {
        total: appointments.length,
        pending: appointments.filter(a => a.status === 'pending').length,
        confirmed: appointments.filter(a => a.status === 'confirmed').length,
        completed: appointments.filter(a => a.status === 'completed').length,
      };
    },
    enabled: !!agency?.id,
  });

  // Fetch funnel stats
  const { data: funnelStats } = useQuery({
    queryKey: ['fosterer-funnel-stats', agency?.id],
    queryFn: async () => {
      if (!agency?.id) return { thumbsUp: 0, thumbsDown: 0, total: 0 };
      
      const { data } = await supabase
        .from('review_funnel_events')
        .select('event_type')
        .eq('clinic_id', agency.id);
      
      const events = data || [];
      return {
        thumbsUp: events.filter(e => e.event_type === 'thumbs_up').length,
        thumbsDown: events.filter(e => e.event_type === 'thumbs_down').length,
        total: events.length,
      };
    },
    enabled: !!agency?.id,
  });

  // Fetch foster children count
  const { data: childrenCount } = useQuery({
    queryKey: ['fosterer-children-count', agency?.id],
    queryFn: async () => {
      if (!agency?.id) return 0;
      const { count } = await supabase
        .from('foster_carers')
        .select('*', { count: 'exact', head: true })
        .eq('clinic_id', agency.id);
      return count || 0;
    },
    enabled: !!agency?.id,
  });

  // ===== FOSTERING-SPECIFIC QUERIES =====
  
  // Get agency ID from the agency
  const fostererAgencyId = agency?.id;

  // Fetch foster carers count
  const { data: fosterCarersCount } = useQuery({
queryKey: ['foster-carers-count', fostererAgencyId],
    queryFn: async () => {
      if (!fostererAgencyId) return { total: 0, active: 0, available: 0 };
      const { data } = await supabase
        .from('foster_carers')
        .select('*')
        .eq('organisation_id', fostererAgencyId);
      return {
        total: data?.length || 0,
        active: data?.filter(f => f.status === 'active').length || 0,
        available: data?.filter(f => f.availability_status === 'available').length || 0,
      };
    },
    enabled: !!fostererAgencyId,
  });

  // Fetch applicants count
  const { data: applicantsCount } = useQuery({
    queryKey: ['applicants-count', fostererAgencyId],
    queryFn: async () => {
      if (!fostererAgencyId) return { total: 0, inAssessment: 0 };
      const { data } = await supabase
        .from('foster_applications')
        .select('*')
        .eq('organisation_id', fostererAgencyId);
      return {
        total: data?.length || 0,
        inAssessment: data?.filter(a => a.status === 'in_assessment').length || 0,
      };
    },
    enabled: !!fostererAgencyId,
  });

  // Fetch enquiries count
  const { data: enquiriesCount } = useQuery({
    queryKey: ['enquiries-count', fostererAgencyId],
    queryFn: async () => {
      if (!fostererAgencyId) return { total: 0, new: 0 };
      const { data } = await supabase
        .from('fostering_enquiries')
        .select('*')
        .eq('agency_id', fostererAgencyId);
      return {
        total: data?.length || 0,
        new: data?.filter(e => e.status === 'new').length || 0,
      };
    },
    enabled: !!fostererAgencyId,
  });

  // Fetch compliance alerts
  const { data: complianceAlerts } = useQuery({
    queryKey: ['compliance-alerts', fostererAgencyId],
    queryFn: async () => {
      if (!fostererAgencyId) return { dbsExpiring: 0, trainingOverdue: 0, documentsExpiring: 0 };
      const { data } = await supabase
        .from('foster_carers')
        .select('*')
        .eq('organisation_id', fostererAgencyId)
        .eq('status', 'active');
      
      // Simplified - just return counts that can be expanded
      return {
        dbsExpiring: 0, // Would need DBS expiry date tracking
        trainingOverdue: 0, // Would need training completion tracking
        documentsExpiring: (carers?.length || 0) > 0 ? Math.floor((carers?.length || 0) * 0.2) : 0, // Estimated
      };
    },
    enabled: !!agencyId,
  });

const isVerified = agency?.verification_status === 'verified' && agency?.claim_status === 'claimed';
  const locationNeedsConfirmation = agency && !agency.location_verified && !agency.location_pending_approval;
  const locationPendingApproval = agency?.location_pending_approval;
  // Allow admins/super_admins to proceed without an agency
  if (!agency && !isAdmin && !isSuperAdmin) {
  // Admins without an agency should not see this tab - skip rendering
  if (!agency && (isAdmin || isSuperAdmin)) {
    return null;
  }

  // Hero stats data - Fostering Agency Metrics
  const heroStats = [
    {
      label: 'Foster Carers',
      value: fosterCarersCount?.total || 0,
      icon: Heart,
      color: 'teal' as const,
      subtitle: `${fosterCarersCount?.active || 0} active`,
      onClick: () => navigateTo('my-patients'),
    },
    {
      label: 'Applicants',
      value: applicantsCount?.total || 0,
      icon: Users,
      color: 'gold' as const,
      subtitle: `${applicantsCount?.inAssessment || 0} in assessment`,
      onClick: () => navigateTo('my-intake-forms'),
    },
    {
      label: 'Enquiries',
      value: enquiriesCount?.total || 0,
      icon: Calendar,
      color: 'primary' as const,
      subtitle: `${enquiriesCount?.new || 0} new`,
      onClick: () => navigateTo('my-appointments'),
    },
    {
      label: 'Compliance',
      value: (complianceAlerts?.dbsExpiring || 0) + (complianceAlerts?.trainingOverdue || 0) + (complianceAlerts?.documentsExpiring || 0),
      icon: Shield,
      color: ((complianceAlerts?.dbsExpiring || 0) + (complianceAlerts?.trainingOverdue || 0)) > 0 ? 'coral' as const : 'teal' as const,
      subtitle: 'Alerts',
      onClick: () => navigateTo('my-settings'),
    },
  ];

  // Command strip actions - Fostering Agency
  const commandActions = [
    {
      icon: Users,
      label: 'Foster Carers',
      onClick: () => navigateTo('my-patients'),
      variant: 'primary' as const,
      badge: fosterCarersCount?.total ? String(fosterCarersCount.total) : undefined,
    },
    {
      icon: UserPlus,
      label: 'Applicants',
      onClick: () => navigateTo('my-intake-forms'),
      variant: 'gold' as const,
      badge: applicantsCount?.total ? String(applicantsCount.total) : undefined,
    },
    {
      icon: Calendar,
      label: 'Enquiries',
      onClick: () => navigateTo('my-appointments'),
      variant: 'primary' as const,
      badge: enquiriesCount?.new ? String(enquiriesCount.new) : undefined,
    },
    {
      icon: Heart,
      label: 'Placements',
      onClick: () => navigateTo('my-availability'),
      variant: 'teal' as const,
    },
    {
      icon: BookOpen,
      label: 'Training',
      onClick: () => navigateTo('my-operations'),
      variant: 'purple' as const,
    },
    {
      icon: Edit,
      label: 'Agency Profile',
      onClick: () => navigateTo('my-profile'),
    },
    {
      icon: FileText,
      label: 'Documents',
      onClick: () => navigateTo('my-documents'),
    },
    {
      icon: Settings,
      label: 'Settings',
      onClick: () => navigateTo('my-settings'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Location Warning Banner */}
      {locationNeedsConfirmation && (
        <Card className="border-coral/40 bg-gradient-to-r from-coral/15 via-coral/10 to-coral/15 overflow-hidden animate-fade-in shadow-lg">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-coral/20 flex items-center justify-center flex-shrink-0 shadow-md">
                <AlertTriangle className="h-6 w-6 text-coral" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-coral text-lg">Action Required</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your agency is not publicly listed because your location hasn't been confirmed. Select your location to go live.
                </p>
                <Button
                  onClick={() => setShowLocationModal(true)}
                  className="bg-coral hover:bg-coral/90 shadow-lg shadow-coral/20"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Select Your Location
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Location Pending Approval Banner */}
      {locationPendingApproval && (
        <Card className="border-gold/40 bg-gradient-to-r from-gold/15 via-gold/10 to-gold/15 animate-fade-in shadow-lg">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-gold/20 flex items-center justify-center flex-shrink-0 shadow-md">
                <Clock className="h-6 w-6 text-gold" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gold text-lg">Location Pending</h3>
                <p className="text-sm text-muted-foreground">
                  Your agency request is pending admin approval. Your agency will go live once approved (usually within 24 hours).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header Section - Dark Modern Design with Graphics */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 shadow-xl">
        {/* Background Graphics */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-teal/15 rounded-full blur-2xl" />
          <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-gold/10 rounded-full blur-xl" />
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px]" />
          {/* Decorative shapes */}
          <svg className="absolute top-4 right-8 w-20 h-20 text-white/5" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="1" />
          </svg>
          <svg className="absolute bottom-4 left-8 w-16 h-16 text-primary/20" viewBox="0 0 100 100">
            <polygon points="50,10 90,90 10,90" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/30 ring-2 ring-white/10">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3">
<h1 className="text-2xl font-extrabold tracking-tight text-white">{agency.name}</h1>
                  <span className="text-sm">{agency.city?.name || 'Location not set'}{agency.area?.name ? ` • ${agency.area.name}` : ''}</span>
                  <span className="text-sm font-medium text-white">{agency.rating?.toFixed(1) || 'N/A'}</span>
                  <span className="text-sm font-medium text-white">{agency.review_count || 0} reviews</span>
                onClick={() => window.open(`/agency/${agency.slug}`, "_blank")}
        agencyId={agency.id}
        detectedCity={agency.city?.name}
        detectedCityId={agency.city_id}
        onLocationSelected={() => {
          queryClient.invalidateQueries({ queryKey: ['fosterer-profile'] });
        }}
      />

      {/* Command Strip */}
      <CommandStrip actions={commandActions} />

      {/* Hero Stats Grid */}
      <HeroStatsGrid stats={heroStats} />

      {/* Dashboard Widgets (Reputation, Funnel, Today's Appointments) */}
      <DashboardWidgets
        agencyId={agency.id}
        agencyName={agency.name}
        agencySlug={agency.slug}
        googlePlaceId={agency.google_place_id}
        verificationStatus={agency.verification_status}
        rating={agency.rating}
        reviewCount={agency.review_count}
        onNavigate={navigateTo}
      />

      {/* Main Dashboard Grid - Compact Layout */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Column 1: Reputation Widget + Plan Cards + Notifications */}
        <div className="space-y-3">
          <ReputationWidget 
            agencyId={agency.id}
            rating={agency.rating || 0}
            reviewCount={agency.review_count || 0}
            onViewDetails={() => navigateTo('my-reputation')}
          />
          
          {/* Plan & Verification Cards - Clean Modern Design */}
          {subscription?.plan ? (
            <Card className="bg-card border border-border/50 shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-teal/10 flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-teal" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-foreground text-sm">{subscription.plan.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {subscription.plan.price_monthly > 0 ? `$${subscription.plan.price_monthly}/mo` : 'Free tier'}
                    </p>
                  </div>
                  {subscription.plan.slug !== 'autopilot_growth' && (
                    <Button variant="ghost" size="sm" className="text-teal hover:bg-teal/10 h-8" onClick={() => navigateTo('my-settings')}>
                      <Zap className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-card border border-primary/20 shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-foreground text-sm">Free Listing</p>
                    <p className="text-xs text-muted-foreground">Upgrade to unlock</p>
                  </div>
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground h-8" onClick={() => navigateTo('my-settings')}>
                    <Zap className="h-3.5 w-3.5 mr-1" />
                    Upgrade
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {!isVerified && (
            <Card className="bg-card border border-gold/20 shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-gold/10 flex items-center justify-center">
                    <Award className="h-4 w-4 text-gold" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-foreground text-sm">Get Verified</p>
                    <p className="text-xs text-muted-foreground">3x more bookings</p>
                  </div>
                </div>
<VerificationPaymentButton agencyId={agency.id} />
          <NotificationSettingsCard agencyId={agency.id} />
            agencyId={agency.id}
            verificationStatus={agency.verification_status}
            gmbConnected={agency.gmb_connected}
            agencyId={agency.id}
            agencyName={agency.name}
          <OutreachImpactCard agencyId={agency.id} />
      <ActivityFeed agencyId={agency.id} maxItems={5} />
    </div>
  );
}
