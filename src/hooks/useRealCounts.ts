import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface RealCounts {
  agencies: number;
  states: number;
  cities: number;
  fosteringTypes: number;
  fosterCarers: number;
  clinics: number;
}

export function useRealCounts() {
  return useQuery({
    queryKey: ['real-counts'],
    queryFn: async (): Promise<RealCounts> => {
      // Try agencies table first, no filters to avoid RLS issues
      const { count: agencies, error: agenciesError } = await supabase
        .from('agencies')
        .select('*', { count: 'exact', head: true });

      // Try cities table
      const { count: cities, error: citiesError } = await supabase
        .from('cities')
        .select('*', { count: 'exact', head: true });

      // Try states table
      const { count: states, error: statesError } = await supabase
        .from('states')
        .select('*', { count: 'exact', head: true });

      // Try fostering_types table
      const { count: fosteringTypes, error: fosteringTypesError } = await supabase
        .from('fostering_types')
        .select('*', { count: 'exact', head: true });

      // Try clinics as fallback
      const { count: clinics, error: clinicsError } = await supabase
        .from('clinics')
        .select('*', { count: 'exact', head: true });

      // Try foster_carers table
      const { count: fosterCarers, error: fosterCarersError } = await supabase
        .from('foster_carers')
        .select('*', { count: 'exact', head: true });

      if (agenciesError) console.log('agencies count:', agenciesError.message);
      if (citiesError) console.log('cities count:', citiesError.message);

      // If agencies is 0, use clinics count
      const totalAgencies = (agencies?.count || 0) + (clinics?.count || 0);

      return {
        agencies: totalAgencies,
        states: states?.count || 0,
        cities: cities?.count || 0,
        fosteringTypes: fosteringTypes?.count || 0,
        fosterCarers: fosterCarers?.count || 0,
        clinics: clinics?.count || 0,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}