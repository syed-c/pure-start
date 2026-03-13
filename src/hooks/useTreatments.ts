import { useQuery } from '@tanstack/react-query';
import { FOSTERING_CATEGORIES } from '@/lib/constants/activeRegions';

export interface Treatment {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  image_url: string | null;
  display_order: number | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
  children?: Treatment[];
}

// Now returns static fostering categories instead of querying treatments table
export function useTreatments() {
  return useQuery({
    queryKey: ['fostering-categories'],
    queryFn: async () => {
      return FOSTERING_CATEGORIES.map((cat, i) => ({
        id: cat.slug,
        name: cat.name,
        slug: cat.slug,
        description: null,
        icon: null,
        image_url: null,
        display_order: i,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })) as Treatment[];
    },
    staleTime: Infinity,
  });
}

export function useTreatment(id: string) {
  return useQuery({
    queryKey: ['fostering-category', id],
    queryFn: async () => {
      const cat = FOSTERING_CATEGORIES.find(c => c.slug === id);
      if (!cat) return null;
      return {
        id: cat.slug,
        name: cat.name,
        slug: cat.slug,
        description: null,
        icon: null,
        image_url: null,
        display_order: 0,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Treatment;
    },
    enabled: !!id,
  });
}
