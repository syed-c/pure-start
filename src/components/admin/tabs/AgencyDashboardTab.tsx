import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Calendar,
  Clock,
  Building2,
  Shield,
  CreditCard,
  Award,
  Loader2,
  MapPin,
  AlertTriangle,
  Users,
  Settings,
  Edit,
  Heart,
  UserPlus,
  FileText,
  BookOpen,
  Zap,
  Globe,
} from 'lucide-react';
import {
  HeroStatsGrid,
  CommandStrip,
  ReputationWidget,
  ActivityFeed,
} from '@/components/dashboard';
import DashboardWidgets from '@/components/agency/DashboardWidgets';

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

export default function AgencyDashboardTab() {
  const { user, isAdmin, isSuperAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [showLocationModal, setShowLocationModal] = useState(false);

  useEffect(() => {
    const subscriptionStatus = searchParams.get('subscription');
    if (subscriptionStatus === 'success') {
      toast.success('🎉 Subscription activated successfully!', { duration: 5000 });
      searchParams.delete('subscription');
      setSearchParams(searchParams, { replace: true });
      queryClient.invalidateQueries({ queryKey: ['agency-subscription'] });
    } else if (subscriptionStatus === 'cancelled') {
      toast.info('Checkout was cancelled.');
      searchParams.delete('subscription');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams, queryClient]);

  const navigateTo = (tab: string) => {
    setSearchParams({ tab });
  };

  const { data: agency, isLoading: profileLoading } = useQuery({
    queryKey: ['fosterer-profile', user?.id],
    queryFn: async (): Promise<AgencyProfile | null> => {
      if (!user?.id || isAdmin || isSuperAdmin) return null;
      const { data: agencies } = await supabase
        .from('agencies')
        .select(`
          id, name, slug, address, phone, email, website, rating, review_count,
          verification_status, claim_status, location_verified, location_pending_approval, 
          city_id, gmb_connected, google_place_id,
          city:cities(name),
          area:areas(name)
        `)
        .eq('claimed_by', user.id)
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
    enabled: !!user?.id,
  });

  const { data: subscription } = useQuery({
    queryKey: ['agency-subscription', agency?.id],
    queryFn: async () => {
      if (!agency?.id) return null;
      const { data } = await supabase
        .from('agency_subscriptions')
        .select('*, plan:subscription_plans(*)')
        .eq('agency_id', agency.id)
        .eq('status', 'active')
        .maybeSingle();
      return data;
    },
    enabled: !!agency?.id,
  });

  const { data: fosterCarersCount } = useQuery({
    queryKey: ['foster-carers-count', agency?.id],
    queryFn: async () => {
      if (!agency?.id) return { total: 0, active: 0, available: 0 };
      const { data } = await supabase
        .from('foster_carers')
        .select('*')
        .eq('organisation_id', agency.id);
      return {
        total: data?.length || 0,
        active: data?.filter(f => f.status === 'active').length || 0,
        available: data?.filter(f => f.availability_status === 'available').length || 0,
      };
    },
    enabled: !!agency?.id,
  });

  const { data: applicantsCount } = useQuery({
    queryKey: ['applicants-count', agency?.id],
    queryFn: async () => {
      if (!agency?.id) return { total: 0, inAssessment: 0 };
      const { data } = await supabase
        .from('foster_applications')
        .select('*')
        .eq('organisation_id', agency.id);
      return {
        total: data?.length || 0,
        inAssessment: data?.filter(a => a.status === 'in_assessment').length || 0,
      };
    },
    enabled: !!agency?.id,
  });

  const { data: enquiriesCount } = useQuery({
    queryKey: ['enquiries-count', agency?.id],
    queryFn: async () => {
      if (!agency?.id) return { total: 0, new: 0 };
      const { data } = await supabase
        .from('fostering_enquiries')
        .select('*')
        .eq('agency_id', agency.id);
      return {
        total: data?.length || 0,
        new: data?.filter(e => e.status === 'new').length || 0,
      };
    },
    enabled: !!agency?.id,
  });

  const { data: complianceAlerts } = useQuery({
    queryKey: ['compliance-alerts', agency?.id],
    queryFn: async () => {
      if (!agency?.id) return { dbsExpiring: 0, trainingOverdue: 0, documentsExpiring: 0 };
      return {
        dbsExpiring: 0,
        trainingOverdue: 0,
        documentsExpiring: 0,
      };
    },
    enabled: !!agency?.id,
  });

  const isVerified = agency?.verification_status === 'verified' && agency?.claim_status === 'claimed';
  const locationNeedsConfirmation = agency && !agency.location_verified && !agency.location_pending_approval;
  const locationPendingApproval = agency?.location_pending_approval;

  if (!agency && !isAdmin && !isSuperAdmin) {
    return null;
  }

  if (profileLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48" />
        <div className="grid grid-cols-4 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    );
  }

  const heroStats = [
    {
      label: 'Foster Carers',
      value: fosterCarersCount?.total || 0,
      icon: Heart,
      color: 'teal' as const,
      subtitle: `${fosterCarersCount?.active || 0} active`,
      onClick: () => navigateTo('fc-carers'),
    },
    {
      label: 'Applicants',
      value: applicantsCount?.total || 0,
      icon: Users,
      color: 'gold' as const,
      subtitle: `${applicantsCount?.inAssessment || 0} in assessment`,
      onClick: () => navigateTo('fc-applicants'),
    },
    {
      label: 'Enquiries',
      value: enquiriesCount?.total || 0,
      icon: Calendar,
      color: 'primary' as const,
      subtitle: `${enquiriesCount?.new || 0} new`,
      onClick: () => navigateTo('fc-enquiries'),
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

  const commandActions = [
    {
      icon: Users,
      label: 'Foster Carers',
      onClick: () => navigateTo('fc-carers'),
      variant: 'primary' as const,
      badge: fosterCarersCount?.total ? String(fosterCarersCount.total) : undefined,
    },
    {
      icon: UserPlus,
      label: 'Applicants',
      onClick: () => navigateTo('fc-applicants'),
      variant: 'gold' as const,
      badge: applicantsCount?.total ? String(applicantsCount.total) : undefined,
    },
    {
      icon: Calendar,
      label: 'Enquiries',
      onClick: () => navigateTo('fc-enquiries'),
      variant: 'primary' as const,
      badge: enquiriesCount?.new ? String(enquiriesCount.new) : undefined,
    },
    {
      icon: Heart,
      label: 'Placements',
      onClick: () => navigateTo('fc-placements'),
      variant: 'teal' as const,
    },
    {
      icon: BookOpen,
      label: 'Training',
      onClick: () => navigateTo('fc-training'),
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
                  Your agency is not publicly listed because your location hasn&apos;t been confirmed.
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
                  Your agency request is pending admin approval (usually within 24 hours).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 shadow-xl">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-teal/15 rounded-full blur-2xl" />
          <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-gold/10 rounded-full blur-xl" />
        </div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/30 ring-2 ring-white/10">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-extrabold tracking-tight text-white">{agency?.name}</h1>
                <span className="text-sm">{agency?.city?.name || 'Location not set'}{agency?.area?.name ? ` • ${agency.area.name}` : ''}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <span className="font-medium text-white">{agency?.rating?.toFixed(1) || 'N/A'}</span>
                <span className="font-medium text-white">{agency?.review_count || 0} reviews</span>
                {isVerified && (
                  <span className="inline-flex items-center gap-1 text-teal">
                    <Award className="h-3 w-3" />
                    Verified
                  </span>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
            onClick={() => window.open(`/agency/${agency?.slug}`, '_blank')}
          >
            <Globe className="h-4 w-4 mr-2" />
            View Profile
          </Button>
        </div>
      </div>

      <CommandStrip actions={commandActions} />
      <HeroStatsGrid stats={heroStats} />

      {agency?.id && (
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
      )}

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="space-y-3">
          {agency?.id && (
            <ReputationWidget
              agencyId={agency.id}
              rating={agency.rating || 0}
              reviewCount={agency.review_count || 0}
              onViewDetails={() => navigateTo('my-reputation')}
            />
          )}

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

          {!isVerified && agency?.id && (
            <Card className="bg-card border border-gold/20 shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-gold/10 flex items-center justify-center">
                    <Award className="h-4 w-4 text-gold" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-foreground text-sm">Get Verified</p>
                    <p className="text-xs text-muted-foreground">3x more visibility</p>
                  </div>
                </div>
                <VerificationPaymentButton agencyId={agency.id} />
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2">
          {agency?.id && <ActivityFeed agencyId={agency.id} maxItems={5} />}
        </div>
      </div>
    </div>
  );
}