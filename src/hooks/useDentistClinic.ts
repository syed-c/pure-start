import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

/**
 * Hook to get the agency owned/claimed by the current fosterer user
 * This enforces that agencies can ONLY access their own agency data
 */
export function useAgencyProfile() {
  const { user, isDentist, isAdmin, isSuperAdmin } = useAuth();

  return useQuery({
    queryKey: ['agency-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Get clinic where this user is the owner (claimed_by)
      const { data, error } = await supabase
        .from('agencies')
        .select(`
          *,
          city:cities(id, name, slug, state:states(id, name, slug))
        `)
        .eq('claimed_by', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching dentist clinic:', error);
        throw error;
      }

      return data;
    },
    // Admins don't need to have a clinic linked - they can access admin features
    // Only require clinic for dentist-only users
    enabled: !!user?.id && isDentist && !isAdmin && !isSuperAdmin,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

/**
 * Hook to get appointments ONLY for the dentist's own clinic
 */
export function useFostererAppointments() {
  const { data: agency } = useAgencyProfile();

  return useQuery({
    queryKey: ['fosterer-appointments', agency?.id],
    queryFn: async () => {
      if (!agency?.id) return [];

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          treatment:treatments(id, name),
          fosterer:dentists(id, name)
        `)
        .eq('agency_id', agency.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!agency?.id,
  });
}

/**
 * Hook to get reviews ONLY for the fosterer's own agency
 */
export function useFostererReviews() {
  const { data: agency } = useAgencyProfile();

  return useQuery({
    queryKey: ['fosterer-reviews', agency?.id],
    queryFn: async () => {
      if (!agency?.id) return { internal: [], google: [] };

      const [internalResult, googleResult] = await Promise.all([
        supabase
          .from('internal_reviews')
          .select('*')
          .eq('agency_id', agency.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('google_reviews')
          .select('*')
          .eq('agency_id', agency.id)
          .order('review_time', { ascending: false }),
      ]);

      return {
        internal: internalResult.data || [],
        google: googleResult.data || [],
      };
    },
    enabled: !!agency?.id,
  });
}

/**
 * Hook to get team members (fosterers) ONLY for the fosterer's own agency
 */
export function useFostererTeam() {
  const { data: agency } = useAgencyProfile();

  return useQuery({
    queryKey: ['fosterer-team', agency?.id],
    queryFn: async () => {
      if (!agency?.id) return [];

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('agency_id', agency.id)
        .order('is_primary', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!agency?.id,
  });
}

/**
 * Hook to get foster children ONLY for the fosterer's own agency
 */
export function useFostererChildren() {
  const { data: agency } = useAgencyProfile();

  return useQuery({
    queryKey: ['fosterer-children', agency?.id],
    queryFn: async () => {
      if (!agency?.id) return [];

      const { data, error } = await supabase
        .from('foster_carers')
        .select('*')
        .eq('agency_id', agency.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!agency?.id,
  });
}

/**
 * Hook to get messages ONLY for the fosterer's own agency
 */
export function useFostererMessages() {
  const { data: agency } = useAgencyProfile();

  return useQuery({
    queryKey: ['fosterer-messages', agency?.id],
    queryFn: async () => {
      if (!agency?.id) return [];

      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          patient:patients(id, name, phone)
        `)
        .eq('agency_id', agency.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    },
    enabled: !!agency?.id,
  });
}

/**
 * Hook to get leads ONLY for the fosterer's own agency
 */
export function useFostererLeads() {
  const { data: agency } = useAgencyProfile();

  return useQuery({
    queryKey: ['fosterer-leads', agency?.id],
    queryFn: async () => {
      if (!agency?.id) return [];

      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          treatment:treatments(id, name)
        `)
        .eq('agency_id', agency.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!agency?.id,
  });
}

/**
 * Hook to get agency stats for the fosterer's own agency only
 */
export function useFostererStats() {
  const { data: agency } = useAgencyProfile();

  return useQuery({
    queryKey: ['fosterer-stats', agency?.id],
    queryFn: async () => {
      if (!agency?.id) return null;

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      const [
        { count: totalAppointments },
        { count: pendingAppointments },
        { count: confirmedAppointments },
        { count: leadsThisMonth },
        { count: reviewsTotal },
        { count: childrenTotal },
      ] = await Promise.all([
        supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('agency_id', agency.id),
        supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('agency_id', agency.id).eq('status', 'pending'),
        supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('agency_id', agency.id).eq('status', 'confirmed'),
        supabase.from('leads').select('*', { count: 'exact', head: true }).eq('agency_id', agency.id).gte('created_at', monthAgo.toISOString()),
        supabase.from('internal_reviews').select('*', { count: 'exact', head: true }).eq('agency_id', agency.id),
        supabase.from('foster_carers').select('*', { count: 'exact', head: true }).eq('agency_id', agency.id),
      ]);

      return {
        appointments: {
          total: totalAppointments || 0,
          pending: pendingAppointments || 0,
          confirmed: confirmedAppointments || 0,
        },
        leads: leadsThisMonth || 0,
        reviews: reviewsTotal || 0,
        children: childrenTotal || 0,
        rating: agency.rating || 0,
        reviewCount: agency.review_count || 0,
      };
    },
    enabled: !!agency?.id,
    refetchInterval: 60000, // Refresh every minute
  });
}
