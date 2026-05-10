import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Profile {
  id: string;
  name: string;
  slug: string;
  type: 'agency';
  specialty?: string;
  location?: string;
  rating: number;
  reviewCount: number;
  image?: string;
  isVerified: boolean;
  isClaimed?: boolean;
  isPinned?: boolean;
  agencyName?: string;
  agencyId?: string;
  languages?: string[];
}

interface ProfileFilters {
  cityId?: string;
  areaId?: string;
  treatmentId?: string;
  limit?: number;
}

export function useProfiles(filters: ProfileFilters = {}) {
  return useQuery({
    queryKey: ['profiles', filters],
    queryFn: async () => {
      // Try agencies table first
      const { data, error } = await supabase
        .from('agencies')
        .select('id, name, slug, rating, review_count, is_verified, city, state, main_image_url, cover_image_url')
        .order('rating', { ascending: false })
        .limit(filters.limit || 50);
      
      if (error) {
        console.log('Profiles query error:', error.message);
      }
      
      // If no data, try clinics
      let profilesData = data;
      if (!profilesData || profilesData.length === 0) {
        const { data: clinicData } = await supabase
          .from('clinics')
          .select('id, name, slug, rating, review_count, is_verified, city, state, main_image_url, cover_image_url')
          .order('rating', { ascending: false })
          .limit(filters.limit || 50);
        profilesData = clinicData;
      }
      
      if (!profilesData || profilesData.length === 0) {
        return [];
      }
      
      // Map to Profile format
      return profilesData.map((agency: any) => ({
        id: agency.id,
        name: agency.name,
        slug: agency.slug,
        type: 'agency' as const,
        rating: agency.rating || 0,
        reviewCount: agency.review_count || 0,
        image: agency.main_image_url || agency.cover_image_url || undefined,
        isVerified: agency.is_verified === true,
        location: agency.city,
        agencyName: agency.name,
        isClaimed: false,
        isPinned: false,
      }));
    },
  });
}

export function useFeaturedProfiles(limit: number = 6) {
  return useProfiles({ limit });
}

export function useTopAgenciesPerLocation(limit: number = 8) {
  return useQuery({
    queryKey: ['top-agencies-per-location', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agencies')
        .select('id, name, slug, rating, review_count, city, is_verified')
        .eq('is_duplicate', false)
        .eq('is_active', true)
        .order('rating', { ascending: false })
        .limit(limit || 8);
      
      if (error) {
        console.error('useTopAgenciesPerLocation error:', error.message);
      }
      
      if (!data || data.length === 0) {
        return [];
      }

      return data.map(agency => ({
        id: agency.id,
        name: agency.name,
        slug: agency.slug,
        rating: agency.rating || 0,
        city: agency.city,
        isVerified: agency.is_verified === true,
      }));
    },
  });
}

export function getLetterAvatarUrl(name: string): string {
  const initial = name?.charAt(0)?.toUpperCase() || 'A';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initial)}&background=f97316&color=fff&size=128`;
}