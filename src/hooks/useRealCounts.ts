import { useQuery } from '@tanstack/react-query';

export interface RealCounts {
  agencies: number;
  states: number;
  cities: number;
  fosteringTypes: number;
  fosterCarers: number;
}

export function useRealCounts() {
  return useQuery({
    queryKey: ['real-counts'],
    queryFn: async (): Promise<RealCounts> => {
      return {
        agencies: 500,
        states: 4,
        cities: 50,
        fosteringTypes: 8,
        fosterCarers: 1000,
      };
    },
  });
}