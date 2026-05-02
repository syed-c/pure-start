import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { createAuditLog } from '@/lib/audit';
import { toast } from 'sonner';

export interface AdminStats {
  locations: { countries: number; cities: number; areas: number };
  services: { total: number; parents: number; children: number };
  agencies: { 
    total: number; 
    unclaimed: number; 
    claimed: number; 
    verified: number; 
    duplicates: number; 
    suspended: number;
    active: number;
    paused: number;
    gmbImported: number;
    manual: number;
  };
  agencies: { total: number; active: number; featured: number };
  patients: { total: number }; // foster_carers
  leads: { today: number; week: number; month: number; total: number };
  appointments: { pending: number; confirmed: number; completed: number; cancelled: number; noShow: number };
  reviews: { pending: number; approved: number; rejected: number };
  revenue: { activeSubscriptions: number; monthlyRevenue: number; yearlyRevenue: number };
  claims: { pending: number; approved: number; rejected: number };
  alerts: { unresolved: number; critical: number };
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async (): Promise<AdminStats> => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      const [
        // Locations
        { count: countriesCount },
        { count: citiesCount },
        { count: areasCount },
        // Services (fostering_categories)
        { count: totalTreatments },
        // Agencies
        { count: totalAgencies },
        { count: unclaimedAgencies },
        { count: claimedAgencies },
        { count: verifiedAgencies },
        { count: duplicateAgencies },
        { count: activeAgencies },
        { count: pausedAgencies },
        { count: gmbImportedAgencies },
        { count: manualAgencies },
        // Foster Carers
        { count: totalFosterCarers },
        // Enquiries
        { count: enquiriesToday },
        { count: enquiriesWeek },
        { count: enquiriesMonth },
        { count: enquiriesTotal },
        // Alerts
        { count: unresolvedAlerts },
        { count: criticalAlerts },
      ] = await Promise.all([
        // Locations
        supabase.from('countries').select('*', { count: 'exact', head: true }),
        supabase.from('cities').select('*', { count: 'exact', head: true }),
        supabase.from('areas').select('*', { count: 'exact', head: true }),
        // Services (fostering_categories)
        supabase.from('fostering_categories').select('*', { count: 'exact', head: true }),
        // Agencies
        supabase.from('agencies').select('*', { count: 'exact', head: true }),
        supabase.from('agencies').select('*', { count: 'exact', head: true }).eq('claim_status', 'unclaimed'),
        supabase.from('agencies').select('*', { count: 'exact', head: true }).eq('claim_status', 'claimed'),
        supabase.from('agencies').select('*', { count: 'exact', head: true }).eq('verification_status', 'verified'),
        supabase.from('agencies').select('*', { count: 'exact', head: true }).eq('is_duplicate', true),
        supabase.from('agencies').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('agencies').select('*', { count: 'exact', head: true }).eq('is_active', false),
        supabase.from('agencies').select('*', { count: 'exact', head: true }).eq('source', 'gmb'),
        supabase.from('agencies').select('*', { count: 'exact', head: true }).eq('source', 'manual'),
        // Foster Carers
        supabase.from('foster_carers').select('*', { count: 'exact', head: true }),
        // Enquiries
        supabase.from('fostering_enquiries').select('*', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
        supabase.from('fostering_enquiries').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo.toISOString()),
        supabase.from('fostering_enquiries').select('*', { count: 'exact', head: true }).gte('created_at', monthAgo.toISOString()),
        supabase.from('fostering_enquiries').select('*', { count: 'exact', head: true }),
        // Alerts
        supabase.from('platform_alerts').select('*', { count: 'exact', head: true }).eq('is_read', false),
        supabase.from('platform_alerts').select('*', { count: 'exact', head: true }).eq('severity', 'critical').eq('is_read', false),
      ]);

      return {
        locations: {
          countries: countriesCount || 0,
          cities: citiesCount || 0,
          areas: areasCount || 0,
        },
        services: {
          total: totalTreatments || 0,
          parents: 0,
          children: 0,
        },
        agencies: {
          total: totalAgencies || 0,
          unclaimed: unclaimedAgencies || 0,
          claimed: claimedAgencies || 0,
          verified: verifiedAgencies || 0,
          duplicates: duplicateAgencies || 0,
          suspended: 0,
          active: activeAgencies || 0,
          paused: pausedAgencies || 0,
          gmbImported: gmbImportedAgencies || 0,
          manual: manualAgencies || 0,
        },
        fosterCarers: {
          total: totalFosterCarers || 0,
        },
        leads: {
          today: enquiriesToday || 0,
          week: enquiriesWeek || 0,
          month: enquiriesMonth || 0,
          total: enquiriesTotal || 0,
        },
        appointments: {
          pending: 0,
          confirmed: 0,
          completed: 0,
          cancelled: 0,
          noShow: 0,
        },
        reviews: {
          pending: 0,
          approved: 0,
          rejected: 0,
        },
        revenue: {
          activeSubscriptions: 0,
          monthlyRevenue: 0,
          yearlyRevenue: 0,
        },
        claims: {
          pending: 0,
          approved: 0,
          rejected: 0,
        },
        alerts: {
          unresolved: unresolvedAlerts || 0,
          critical: criticalAlerts || 0,
        },
      };
    },
    staleTime: 60000, // 1 minute
  });
}

export function useCreatePlatformAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (alert: { alert_type: string; title: string; message?: string; severity?: string }) => {
      const { error } = await supabase.from('platform_alerts').insert([alert]);
      if (error) throw error;
      await createAuditLog({ action: 'CREATE_ALERT', entityType: 'platform_alert', newValues: alert });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Alert created');
    },
    onError: (e) => toast.error('Failed: ' + e.message),
  });
}

export function useResolvePlatformAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('platform_alerts')
        .update({ is_read: true })
        .eq('id', alertId);
      if (error) throw error;
      await createAuditLog({ action: 'RESOLVE_ALERT', entityType: 'platform_alert', entityId: alertId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      queryClient.invalidateQueries({ queryKey: ['platform-alerts'] });
      toast.success('Alert resolved');
    },
    onError: (e) => toast.error('Failed: ' + e.message),
  });
}

export interface PlatformAlert {
  id: string;
  alert_type: string;
  title: string;
  message: string | null;
  severity: string | null;
  is_read: boolean | null;
  created_at: string;
}

export function usePlatformAlerts() {
  return useQuery({
    queryKey: ['platform-alerts'],
    queryFn: async (): Promise<PlatformAlert[]> => {
      const { data, error } = await supabase
        .from('platform_alerts')
        .select('*')
        .eq('is_read', false)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as PlatformAlert[];
    },
  });
}

export function useResolveAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('platform_alerts')
        .update({ is_read: true })
        .eq('id', alertId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Alert resolved');
    },
    onError: (e) => toast.error('Failed: ' + e.message),
  });
}
