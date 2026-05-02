import { useState } from 'react';
import { useAdminStats, usePlatformAlerts } from '@/hooks/useAdminStats';
import { useSearchParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Building2,
  Users,
  UserPlus,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield,
  TrendingUp,
  Globe,
  Star,
  MessageSquare,
  RefreshCw,
  Bot,
  Activity,
  Zap,
  ArrowRight,
  Phone,
  Mail,
  Target,
  BarChart3,
  PieChart,
  FileText,
  Award,
  Sparkles,
  Play,
  Pause,
  StopCircle,
  Eye,
  MousePointer,
  Home,
  Heart,
  GraduationCap,
  AlertCircle,
  TrendingDown,
  Briefcase,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import AIInsightsWidget from '@/components/admin/AIInsightsWidget';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfDay, endOfDay, subHours, differenceInSeconds } from 'date-fns';
import ModernStatCard from '@/components/dashboard/ModernStatCard';
import ModernCard from '@/components/dashboard/ModernCard';
import QuickActionGrid from '@/components/dashboard/QuickActionGrid';
import ProjectList from '@/components/dashboard/ProjectList';
import CircularProgress from '@/components/dashboard/CircularProgress';
import { toast } from 'sonner';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--teal))', 'hsl(var(--gold))', 'hsl(var(--coral))'];

export default function OverviewTab() {
  const [, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { data: stats, isLoading, refetch: refetchStats } = useAdminStats();
  const { data: alerts } = usePlatformAlerts();

  const navigateTo = (tab: string) => {
    setSearchParams({ tab });
  };

  // Master refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      refetchStats(),
      queryClient.invalidateQueries({ queryKey: ['platform-trend-data'] }),
      queryClient.invalidateQueries({ queryKey: ['recent-signups-24h'] }),
      queryClient.invalidateQueries({ queryKey: ['gmb-connected-count'] }),
      queryClient.invalidateQueries({ queryKey: ['platform-activity'] }),
      queryClient.invalidateQueries({ queryKey: ['platform-visitors-analytics'] }),
      queryClient.invalidateQueries({ queryKey: ['system-uptime'] }),
    ]);
    setIsRefreshing(false);
    toast.success('Dashboard refreshed!');
  };

  // Fetch real trend data from database (14 days)
  const { data: trendData = [] } = useQuery({
    queryKey: ['platform-trend-data'],
    queryFn: async () => {
      const data = [];
      for (let i = 13; i >= 0; i--) {
        const dayStart = startOfDay(subDays(new Date(), i));
        const dayEnd = endOfDay(subDays(new Date(), i));
        
        const [leadsResult, enquiriesResult, viewsResult] = await Promise.all([
          supabase.from('fostering_enquiries').select('id', { count: 'exact', head: true })
            .gte('created_at', dayStart.toISOString())
            .lte('created_at', dayEnd.toISOString()),
          supabase.from('fostering_enquiries').select('id', { count: 'exact', head: true })
            .gte('created_at', dayStart.toISOString())
            .lte('created_at', dayEnd.toISOString()),
          supabase.from('page_views').select('id', { count: 'exact', head: true })
            .gte('viewed_at', dayStart.toISOString())
            .lte('viewed_at', dayEnd.toISOString()),
        ]);
        
        data.push({
          date: format(dayStart, 'MMM dd'),
          shortDate: format(dayStart, 'dd'),
          leads: leadsResult.count || 0,
          enquiries: enquiriesResult.count || 0,
          views: viewsResult.count || 0,
        });
      }
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Weekly chart data
  const weeklyChartData = trendData.slice(-7).map((d, i) => ({
    label: ['S', 'M', 'T', 'W', 'T', 'F', 'S'][new Date(subDays(new Date(), 6 - i)).getDay()],
    leads: d.leads,
    enquiries: d.enquiries,
    views: d.views,
  }));

  // Fetch 24h signups
  const { data: recentSignups = 0 } = useQuery({
    queryKey: ['recent-signups-24h'],
    queryFn: async () => {
      const twentyFourHoursAgo = subHours(new Date(), 24).toISOString();
      const { count } = await supabase
        .from('agencies')
        .select('*', { count: 'exact', head: true })
        .gte('claimed_at', twentyFourHoursAgo);
      return count || 0;
    },
  });

  // Fetch Ofsted verified count
  const { data: verifiedAgencyCount = 0 } = useQuery({
    queryKey: ['verified-agency-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('agencies')
        .select('*', { count: 'exact', head: true })
        .eq('verification_status', 'verified');
      return count || 0;
    },
  });

  // Fetch visitor analytics
  const { data: visitorAnalytics } = useQuery({
    queryKey: ['platform-visitors-analytics'],
    queryFn: async () => {
      const today = startOfDay(new Date()).toISOString();
      const week = startOfDay(subDays(new Date(), 7)).toISOString();
      
      const [todaySessions, weekSessions, todayPageviews, weekPageviews] = await Promise.all([
        supabase.from('visitor_sessions').select('*', { count: 'exact', head: true })
          .gte('created_at', today),
        supabase.from('visitor_sessions').select('*', { count: 'exact', head: true })
          .gte('created_at', week),
        supabase.from('page_views').select('*', { count: 'exact', head: true })
          .gte('viewed_at', today),
        supabase.from('page_views').select('*', { count: 'exact', head: true })
          .gte('viewed_at', week),
      ]);

      return {
        todaySessions: todaySessions.count || 0,
        weekSessions: weekSessions.count || 0,
        todayPageviews: todayPageviews.count || 0,
        weekPageviews: weekPageviews.count || 0,
      };
    },
  });

  // Fetch recent activity - Fostering specific
  const { data: recentActivity = [] } = useQuery({
    queryKey: ['platform-activity'],
    queryFn: async () => {
      const [enquiries, fosterCarers, applicants] = await Promise.all([
        supabase.from('enquiries').select('id, name, created_at, status')
          .order('created_at', { ascending: false }).limit(3),
        supabase.from('foster_carer_profiles').select('id, first_name, last_name, status, created_at')
          .order('created_at', { ascending: false }).limit(2),
        supabase.from('applicant_profiles').select('id, first_name, last_name, application_stage, created_at')
          .order('created_at', { ascending: false }).limit(2),
      ]);

      return [
        ...(enquiries.data || []).map(a => ({
          id: a.id,
          icon: Calendar,
          iconColor: 'blue',
          title: `New enquiry`,
          subtitle: a.name || 'Unknown',
        })),
        ...(fosterCarers.data || []).map(fc => ({
          id: fc.id,
          icon: Heart,
          iconColor: 'teal',
          title: `New foster carer`,
          subtitle: `${fc.first_name || ''} ${fc.last_name || ''}`.trim() || 'Pending',
        })),
        ...(applicants.data || []).map(app => ({
          id: app.id,
          icon: UserPlus,
          iconColor: 'gold',
          title: `New applicant`,
          subtitle: `${app.first_name || ''} ${app.last_name || ''}`.trim() || 'Pending',
        })),
      ].slice(0, 5);
    },
    refetchInterval: 30000,
  });

  // System uptime calculation
  const { data: systemMetrics } = useQuery({
    queryKey: ['system-uptime'],
    queryFn: async () => {
      const [lastEnquiry, lastLead, lastSession] = await Promise.all([
        supabase.from('fostering_enquiries').select('created_at').order('created_at', { ascending: false }).limit(1),
        supabase.from('fostering_enquiries').select('created_at').order('created_at', { ascending: false }).limit(1),
        supabase.from('visitor_sessions').select('created_at').order('created_at', { ascending: false }).limit(1),
      ]);

      const now = new Date();
      const lastActivityTime = new Date(
        lastSession.data?.[0]?.created_at || 
        lastEnquiry.data?.[0]?.created_at || 
        lastLead.data?.[0]?.created_at ||
        now.toISOString()
      );
      
      const secondsSinceActivity = differenceInSeconds(now, lastActivityTime);
      const isActive = secondsSinceActivity < 300;

      return {
        isActive,
        lastActivity: lastActivityTime,
        secondsSinceActivity,
        uptime: '99.9%',
      };
    },
    refetchInterval: 60000,
  });

  // Fostering-specific stats
  const { data: fosterStats } = useQuery({
    queryKey: ['foster-platform-stats'],
    queryFn: async () => {
      const [
        fosterCarersResult,
        applicantsResult,
        activePlacementsResult,
        pendingEnquiriesResult,
        agenciesWithCarersResult,
        trainingCoursesResult,
      ] = await Promise.all([
        supabase.from('foster_carer_profiles').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('applicant_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('foster_carer_profiles').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('enquiries').select('id', { count: 'exact', head: true }).eq('status', 'new'),
        supabase.from('foster_carer_profiles').select('organisation_id', { count: 'exact', head: true }).not('organisation_id', 'is', null).eq('status', 'active'),
        supabase.from('trainer_profiles').select('id', { count: 'exact', head: true }),
      ]);

      return {
        activeFosterCarers: fosterCarersResult.count || 0,
        applicants: applicantsResult.count || 0,
        pendingPlacements: activePlacementsResult.count || 0,
        pendingEnquiries: pendingEnquiriesResult.count || 0,
        agenciesWithCarers: agenciesWithCarersResult.count || 0,
        trainingCourses: trainingCoursesResult.count || 0,
      };
    },
    staleTime: 30000,
  });

  // Compliance alerts - overdue reviews, expiring approvals
  const { data: complianceAlerts } = useQuery({
    queryKey: ['compliance-alerts'],
    queryFn: async () => {
      const sixMonthsAgo = subDays(new Date(), 180).toISOString();
      const [
        overdueReviews,
        expiringApprovals,
        pendingApplications,
      ] = await Promise.all([
        supabase.from('foster_carer_profiles')
          .select('id, first_name, last_name, panel_date')
          .lt('panel_date', sixMonthsAgo)
          .eq('status', 'active')
          .limit(5),
        supabase.from('foster_carer_profiles')
          .select('id, first_name, last_name, approval_date')
          .gte('approval_date', subDays(new Date(), 730).toISOString())
          .lt('approval_date', subDays(new Date(), 695).toISOString())
          .eq('status', 'active')
          .limit(5),
        supabase.from('applicant_profiles')
          .select('id, first_name, last_name, application_stage')
          .eq('application_stage', 'assessment')
          .limit(5),
      ]);

      return {
        overdueReviews: overdueReviews.data || [],
        expiringApprovals: expiringApprovals.data || [],
        pendingApplications: pendingApplications.data || [],
        totalAlerts: (overdueReviews.data?.length || 0) + (expiringApprovals.data?.length || 0) + (pendingApplications.data?.length || 0),
      };
    },
    staleTime: 60000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const claimRate = stats?.agencies?.total 
    ? Math.round(((stats.agencies.claimed || 0) / stats.agencies.total) * 100) 
    : 0;

  const verificationRate = stats?.agencies?.claimed 
    ? Math.round(((stats.agencies.verified || 0) / stats.agencies.claimed) * 100) 
    : 0;

  // Quick actions - Fostering Platform
  const quickActions = [
    { icon: Building2, label: 'Agencies', onClick: () => navigateTo('agencies'), color: 'primary' as const },
    { icon: Heart, label: 'Foster Carers', onClick: () => navigateTo('users'), color: 'teal' as const, badge: String(fosterStats?.activeFosterCarers || 0) },
    { icon: UserPlus, label: 'Applicants', onClick: () => navigateTo('users'), color: 'gold' as const },
    { icon: Calendar, label: 'Enquiries', onClick: () => navigateTo('leads'), color: 'coral' as const, badge: String(fosterStats?.pendingEnquiries || 0) },
    { icon: MessageSquare, label: 'Reviews', onClick: () => navigateTo('review-insights'), color: 'purple' as const },
    { icon: Shield, label: 'Ofsted Status', onClick: () => navigateTo('gmb-connections'), color: 'teal' as const },
    { icon: GraduationCap, label: 'Training', onClick: () => navigateTo('users'), color: 'primary' as const },
    { icon: AlertCircle, label: 'Compliance', onClick: () => navigateTo('audit'), color: 'coral' as const },
  ];

  // Pie chart data for agency distribution
  const pieData = [
    { name: 'Verified', value: stats?.agencies?.verified || 0 },
    { name: 'Claimed', value: (stats?.agencies?.claimed || 0) - (stats?.agencies?.verified || 0) },
    { name: 'Unclaimed', value: stats?.agencies?.unclaimed || 0 },
  ].filter(d => d.value > 0);

  // Task items for project list - Fostering specific
  const taskItems = [
    { id: '1', icon: AlertCircle, iconColor: 'coral', title: 'Compliance review', subtitle: `${complianceAlerts?.totalAlerts || 0} items need attention` },
    { id: '2', icon: Heart, iconColor: 'teal', title: 'Carer assessments', subtitle: `${complianceAlerts?.pendingApplications?.length || 0} pending` },
    { id: '3', icon: BarChart3, iconColor: 'gold', title: 'Monthly report', subtitle: 'Due in 3 days' },
    { id: '4', icon: Calendar, iconColor: 'blue', title: 'Enquiry follow-ups', subtitle: `${fosterStats?.pendingEnquiries || 0} awaiting response` },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Header with visual accent */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 shadow-xl">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary blur-3xl" />
          <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full bg-teal blur-3xl" />
        </div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-primary/20 text-primary border-0 text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                Command Centre
              </Badge>
              {systemMetrics?.isActive && (
                <Badge className="bg-teal/20 text-teal border-0 text-xs">
                  <div className="h-2 w-2 rounded-full bg-teal animate-pulse mr-1" />
                  Live
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Dashboard</h1>
            <p className="text-white/60 mt-1">Foster Care — UK Fostering Agency Directory</p>
          </div>
          <div className="flex items-center gap-3">
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/30">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Agency
            </Button>
            <Button 
              variant="outline" 
              className="rounded-xl border-white/20 text-white hover:bg-white/10" 
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
        
        {/* Quick status indicators */}
        <div className="relative mt-6 flex flex-wrap gap-4">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
            <div className={`h-2 w-2 rounded-full ${systemMetrics?.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="text-sm text-white/80">
              {systemMetrics?.isActive ? 'Systems Online' : 'Low Activity'}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
            <Activity className="h-4 w-4 text-primary" />
            <span className="text-sm text-white/80">{recentSignups} signups today</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
            <Shield className="h-4 w-4 text-teal" />
            <span className="text-sm text-white/80">{verifiedAgencyCount} verified agencies</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
            <Eye className="h-4 w-4 text-gold" />
            <span className="text-sm text-white/80">{visitorAnalytics?.todaySessions || 0} visitors today</span>
          </div>
        </div>
      </div>

      {/* Primary Stats Row - Fostering Platform */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <ModernStatCard
          title="Fostering Agencies"
          value={stats?.clinics?.total || 0}
          icon={Building2}
          variant="filled"
          color="primary"
          onClick={() => navigateTo('agencies')}
        />
        <ModernStatCard
          title="Active Carers"
          value={fosterStats?.activeFosterCarers || 0}
          icon={Heart}
          color="teal"
          onClick={() => navigateTo('users')}
        />
        <ModernStatCard
          title="Applicants"
          value={fosterStats?.applicants || 0}
          icon={UserPlus}
          color="gold"
          onClick={() => navigateTo('users')}
        />
        <ModernStatCard
          title="Pending Enquiries"
          value={fosterStats?.pendingEnquiries || 0}
          icon={MessageSquare}
          color="coral"
          onClick={() => navigateTo('leads')}
        />
        <ModernStatCard
          title="Training Providers"
          value={fosterStats?.trainingCourses || 0}
          icon={GraduationCap}
          color="purple"
          onClick={() => navigateTo('users')}
        />
        <ModernStatCard
          title="Compliance Alerts"
          value={complianceAlerts?.totalAlerts || 0}
          icon={AlertCircle}
          subtitle={complianceAlerts?.totalAlerts ? 'Requires attention' : 'All clear'}
          color={complianceAlerts?.totalAlerts ? 'coral' : 'teal'}
          onClick={() => navigateTo('audit')}
        />
      </div>

      {/* Quick Actions */}
      <QuickActionGrid actions={quickActions} />

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Analytics Chart - Takes 2 columns */}
        <div className="lg:col-span-2">
          <ModernCard title="Platform Analytics (14 Days)" className="h-full">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--teal))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--teal))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="shortDate" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  />
                  <YAxis hide />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-popover border border-border text-popover-foreground px-4 py-3 rounded-lg shadow-lg">
                            <p className="font-semibold mb-2">{payload[0]?.payload?.date}</p>
                            {payload.map((p: any, i: number) => (
                              <div key={i} className="flex items-center gap-2 text-sm">
                                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
                                <span className="capitalize">{p.dataKey}:</span>
                                <span className="font-bold">{p.value}</span>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="views" 
                    stroke="hsl(var(--primary))" 
                    fill="url(#colorViews)" 
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="leads" 
                    stroke="hsl(var(--teal))" 
                    fill="url(#colorLeads)"
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="enquiries" 
                    stroke="hsl(var(--gold))" 
                    fill="transparent"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border/50">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-primary" />
                <span className="text-sm font-medium text-muted-foreground">Page Views</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-teal" />
                <span className="text-sm font-medium text-muted-foreground">Leads</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-gold" />
                <span className="text-sm font-medium text-muted-foreground">Enquiries</span>
              </div>
            </div>
          </ModernCard>
        </div>

        {/* Weekly Report Card */}
        <div className="bg-card rounded-2xl border border-border/50 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground">Weekly Report</h3>
            <Button variant="ghost" size="sm" onClick={() => navigateTo('weekly')}>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Eye className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Page Views</p>
                  <p className="text-xs text-muted-foreground">This week</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-primary">{visitorAnalytics?.weekPageviews?.toLocaleString() || 0}</p>
            </div>
            <div className="flex items-center justify-between p-3 bg-teal/5 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-teal/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-teal" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Sessions</p>
                  <p className="text-xs text-muted-foreground">This week</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-teal">{visitorAnalytics?.weekSessions?.toLocaleString() || 0}</p>
            </div>
            <div className="flex items-center justify-between p-3 bg-gold/5 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gold/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Enquiries</p>
                  <p className="text-xs text-muted-foreground">This week</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-gold">{stats?.appointments?.confirmed || 0}</p>
            </div>
            <Button 
              onClick={() => navigateTo('weekly')}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
            >
              <FileText className="h-4 w-4 mr-2" />
              View Full Report
            </Button>
          </div>
        </div>
      </div>

      {/* Secondary Row - Team & Tasks */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <ProjectList
          title="Recent Activity"
          items={recentActivity.map((a: any) => ({
            id: a.id,
            icon: a.icon,
            iconColor: a.iconColor,
            title: a.title,
            subtitle: a.subtitle,
            onClick: () => navigateTo('appointments'),
          }))}
          action={{
            label: 'View All',
            onClick: () => navigateTo('appointments'),
          }}
        />

        {/* Progress Circle */}
        <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm">
          <h3 className="font-bold text-foreground mb-4">Agency Progress</h3>
          <div className="flex flex-col items-center">
            <CircularProgress value={claimRate} size="lg" label="Claimed" />
            <div className="flex items-center justify-center gap-4 mt-6 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-primary" />
                <span className="text-xs text-muted-foreground">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-gold" />
                <span className="text-xs text-muted-foreground">In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-coral" />
                <span className="text-xs text-muted-foreground">Pending</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks / To-Do */}
        <ProjectList
          title="Priority Tasks"
          items={taskItems.map(item => ({
            ...item,
            onClick: () => navigateTo('claims'),
          }))}
          action={{
            label: '+ New',
            onClick: () => {},
          }}
        />
      </div>

      {/* System Metrics & Pie Chart Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* System Metrics Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 shadow-xl">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 overflow-hidden">
            {[...Array(12)].map((_, i) => (
              <div 
                key={i} 
                className="absolute h-full w-0.5 bg-gradient-to-b from-transparent via-primary to-transparent transform rotate-12"
                style={{ right: `${i * 16}px` }}
              />
            ))}
          </div>
          <div className="relative z-10">
            <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-3">System Metrics</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="text-3xl font-extrabold text-white font-mono">{stats?.clinics?.verified || 0}</p>
                <p className="text-xs text-white/50">Verified</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-extrabold text-teal font-mono">{verifiedAgencyCount}</p>
                <p className="text-xs text-white/50">Ofsted</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-extrabold text-gold font-mono">{recentSignups}</p>
                <p className="text-xs text-white/50">24h Signups</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <div className={`h-2 w-2 rounded-full ${systemMetrics?.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-sm text-white/60">
                {systemMetrics?.isActive ? 'All systems operational' : `Last activity ${Math.round((systemMetrics?.secondsSinceActivity || 0) / 60)}m ago`}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <Button 
                size="sm" 
                className="bg-white/10 hover:bg-white/20 text-white"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-white/60 hover:text-white hover:bg-white/10"
                onClick={() => navigateTo('audit-logs')}
              >
                View Logs
              </Button>
            </div>
          </div>
        </div>

        {/* Agency Distribution Pie Chart */}
        <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm">
          <h3 className="font-bold text-foreground mb-4">Agency Distribution</h3>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-popover border border-border text-popover-foreground px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg">
                          {payload[0].name}: {Number(payload[0].value).toLocaleString()}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-4 mt-2 flex-wrap">
            {pieData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                <span className="text-xs text-muted-foreground">{item.name}: {item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Summary */}
        <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm">
          <h3 className="font-bold text-foreground mb-4">Performance Summary</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Claim Rate</span>
                <span className="text-sm font-bold text-primary">{claimRate}%</span>
              </div>
              <Progress value={claimRate} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Verification Rate</span>
                <span className="text-sm font-bold text-teal">{verificationRate}%</span>
              </div>
              <Progress value={verificationRate} className="h-2 [&>div]:bg-teal" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Ofsted Verified</span>
                <span className="text-sm font-bold text-gold">{Math.round((verifiedAgencyCount / (stats?.clinics?.total || 1)) * 100)}%</span>
              </div>
              <Progress value={Math.round((verifiedAgencyCount / (stats?.clinics?.total || 1)) * 100)} className="h-2 [&>div]:bg-gold" />
            </div>
            <Button variant="outline" className="w-full rounded-xl mt-2" onClick={() => navigateTo('weekly')}>
              <FileText className="h-4 w-4 mr-2" />
              Full Report
            </Button>
          </div>
        </div>
      </div>

      {/* Foster Care Compliance & Alerts */}
      {(complianceAlerts?.totalAlerts || 0) > 0 && (
        <div className="bg-card rounded-2xl border border-coral/30 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-gradient-to-r from-coral/5 to-amber/5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-coral to-amber flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Compliance Alerts</h3>
                <p className="text-xs text-muted-foreground">Items requiring immediate attention</p>
              </div>
            </div>
            <Badge className="bg-coral/10 text-coral border-0">
              {complianceAlerts?.totalAlerts} Alert{complianceAlerts?.totalAlerts !== 1 ? 's' : ''}
            </Badge>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-3 gap-4">
              {complianceAlerts?.overdueReviews?.length > 0 && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-100">
                  <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Overdue Reviews
                  </h4>
                  <ul className="space-y-2">
                    {complianceAlerts.overdueReviews.slice(0, 3).map((fc: any) => (
                      <li key={fc.id} className="text-sm text-red-700">
                        {fc.first_name} {fc.last_name} - Panel due {fc.panel_date ? new Date(fc.panel_date).toLocaleDateString() : 'N/A'}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {complianceAlerts?.expiringApprovals?.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                  <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Expiring Approvals
                  </h4>
                  <ul className="space-y-2">
                    {complianceAlerts.expiringApprovals.slice(0, 3).map((fc: any) => (
                      <li key={fc.id} className="text-sm text-amber-700">
                        {fc.first_name} {fc.last_name} - Expires {fc.approval_date ? new Date(fc.approval_date).toLocaleDateString() : 'N/A'}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {complianceAlerts?.pendingApplications?.length > 0 && (
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                  <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Pending Assessments
                  </h4>
                  <ul className="space-y-2">
                    {complianceAlerts.pendingApplications.slice(0, 3).map((app: any) => (
                      <li key={app.id} className="text-sm text-blue-700">
                        {app.first_name} {app.last_name} - Stage: {app.application_stage}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={() => navigateTo('audit')}>
                View All Compliance
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* AI Insights */}
      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-gradient-to-r from-purple/5 to-primary/5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple to-primary flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">AI Insights</h3>
              <p className="text-xs text-muted-foreground">Powered by intelligent automation</p>
            </div>
          </div>
          <Badge className="bg-purple/10 text-purple border-0">
            <Sparkles className="h-3 w-3 mr-1" />
            Live
          </Badge>
        </div>
        <div className="p-6">
          <AIInsightsWidget />
        </div>
      </div>
    </div>
  );
}