import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { State, City, Area } from '@/types/database';
import { normalizeStateSlug } from '@/lib/slug/normalizeStateSlug';
import { ACTIVE_STATE_SLUGS } from '@/lib/constants/activeStates';
import { ACTIVE_REGIONS, POPULAR_CITIES } from '@/lib/constants/activeRegions';

// Static fallback data for when DB tables don't exist yet
const STATIC_STATES: State[] = ACTIVE_REGIONS.map((r, i) => ({
  id: r.slug,
  name: r.name,
  slug: r.slug,
  abbreviation: r.abbreviation,
  country_code: 'GB',
  image_url: null,
  agency_count: 0,
  is_active: true,
  display_order: i,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}));

const STATIC_CITIES: City[] = POPULAR_CITIES.map(c => ({
  id: c.slug,
  name: c.name,
  slug: c.slug,
  state_id: 'england',
  country: 'GB',
  image_url: null,
  agency_count: 0,
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  state: STATIC_STATES.find(s => s.slug === 'england') || undefined,
}));

export function useStates() {
  return useQuery({
    queryKey: ['states'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('states')
          .select('*')
          .eq('is_active', true)
          .in('slug', ACTIVE_STATE_SLUGS)
          .order('display_order');
        if (error) return STATIC_STATES;
        return (data?.length ? data : STATIC_STATES) as State[];
      } catch {
        return STATIC_STATES;
      }
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: false,
  });
}

export function useStatesWithClinics() {
  return useStates(); // Simplified — same as useStates until we have agency data
}

export function useState(slug: string) {
  const normalized = normalizeStateSlug(slug);
  return useQuery({
    queryKey: ['state', normalized],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('states')
          .select('*')
          .eq('slug', normalized)
          .eq('is_active', true)
          .maybeSingle();
        if (error || !data) {
          return STATIC_STATES.find(s => s.slug === normalized) || null;
        }
        return data as State;
      } catch {
        return STATIC_STATES.find(s => s.slug === normalized) || null;
      }
    },
    enabled: !!normalized,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

export function useCities(stateId?: string) {
  return useQuery({
    queryKey: ['cities', stateId],
    queryFn: async () => {
      try {
        let query = supabase
          .from('cities')
          .select('*, state:states(*)')
          .eq('is_active', true)
          .not('state_id', 'is', null)
          .order('name');
        if (stateId) query = query.eq('state_id', stateId);
        const { data, error } = await query;
        if (error) return stateId ? STATIC_CITIES.filter(c => c.state_id === stateId) : STATIC_CITIES;
        return (data?.length ? data : STATIC_CITIES) as City[];
      } catch {
        return STATIC_CITIES;
      }
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: false,
  });
}

export function useCitiesByStateSlug(stateSlug: string) {
  const normalized = normalizeStateSlug(stateSlug);
  return useQuery({
    queryKey: ['cities-by-state', normalized],
    queryFn: async () => {
      try {
        const { data: stateData, error: stateError } = await supabase
          .from('states')
          .select('id')
          .eq('slug', normalized)
          .maybeSingle();
        if (stateError || !stateData) {
          return STATIC_CITIES.filter(c => c.state_id === normalized);
        }
        const { data, error } = await supabase
          .from('cities')
          .select('*, state:states(*)')
          .eq('state_id', stateData.id)
          .eq('is_active', true)
          .order('name');
        if (error) return STATIC_CITIES.filter(c => c.state_id === normalized);
        return data as City[];
      } catch {
        return STATIC_CITIES.filter(c => c.state_id === normalized);
      }
    },
    enabled: !!normalized,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: false,
  });
}

export function useCity(slug: string, stateSlug?: string) {
  const normalizedStateSlug = stateSlug ? normalizeStateSlug(stateSlug) : null;
  return useQuery({
    queryKey: ['city', slug, normalizedStateSlug],
    queryFn: async () => {
      try {
        const query = supabase
          .from('cities')
          .select('*, state:states(*)')
          .eq('slug', slug)
          .eq('is_active', true);
        const { data: cities, error } = await query;
        if (error || !cities?.length) {
          return STATIC_CITIES.find(c => c.slug === slug) || null;
        }
        if (normalizedStateSlug) {
          const matchingCity = cities.find((city: any) => city.state?.slug === normalizedStateSlug);
          return (matchingCity as City) || null;
        }
        return cities[0] as City;
      } catch {
        return STATIC_CITIES.find(c => c.slug === slug) || null;
      }
    },
    enabled: !!slug,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

export function useAreas(cityId?: string) {
  return useQuery({
    queryKey: ['areas', cityId],
    queryFn: async () => {
      try {
        let query = supabase
          .from('areas')
          .select('*, city:cities(*, state:states(*))')
          .eq('is_active', true)
          .order('name');
        if (cityId) query = query.eq('city_id', cityId);
        const { data, error } = await query;
        if (error) return [];
        return data as Area[];
      } catch {
        return [];
      }
    },
    retry: false,
  });
}

export function formatLocation(city?: City | null, state?: State | null): string {
  if (city && city.state) {
    return `${city.name}, ${city.state.name}`;
  }
  if (city && state) {
    return `${city.name}, ${state.name}`;
  }
  if (city) return city.name;
  if (state) return state.name;
  return 'England';
}
