import { useQuery } from '@tanstack/react-query';

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
      return [
        { id: '1', name: 'Oakleaf Fostering', slug: 'oakleaf-fostering', type: 'agency' as const, rating: 4.8, review_count: 125, is_verified: true, city: 'London', state: 'England', image_url: null },
        { id: '2', name: 'Care First Ltd', slug: 'care-first-ltd', type: 'agency' as const, rating: 4.6, review_count: 89, is_verified: true, city: 'Manchester', state: 'England', image_url: null },
        { id: '3', name: 'Fostering Together', slug: 'fostering-together', type: 'agency' as const, rating: 4.5, review_count: 67, is_verified: true, city: 'Birmingham', state: 'England', image_url: null },
        { id: '4', name: 'National Fostering', slug: 'national-fostering', type: 'agency' as const, rating: 4.4, review_count: 45, is_verified: true, city: 'Leeds', state: 'England', image_url: null },
        { id: '5', name: 'Sunrise Foster Care', slug: 'sunrise-foster-care', type: 'agency' as const, rating: 4.3, review_count: 32, is_verified: true, city: 'Liverpool', state: 'England', image_url: null },
        { id: '6', name: 'Community Fostering', slug: 'community-fostering', type: 'agency' as const, rating: 4.2, review_count: 28, is_verified: true, city: 'Bristol', state: 'England', image_url: null },
        { id: '7', name: 'Together Foster Care', slug: 'together-foster-care', type: 'agency' as const, rating: 4.1, review_count: 24, is_verified: true, city: 'Sheffield', state: 'England', image_url: null },
        { id: '8', name: 'Loving Homes', slug: 'loving-homes', type: 'agency' as const, rating: 4.0, review_count: 19, is_verified: true, city: 'Glasgow', state: 'Scotland', image_url: null },
        { id: '9', name: 'Family First', slug: 'family-first', type: 'agency' as const, rating: 3.9, review_count: 15, is_verified: true, city: 'Cardiff', state: 'Wales', image_url: null },
        { id: '10', name: 'Safe Haven Fostering', slug: 'safe-haven-fostering', type: 'agency' as const, rating: 3.8, review_count: 12, is_verified: true, city: 'Belfast', state: 'Northern Ireland', image_url: null },
      ].slice(0, filters.limit || 10);
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
      return [
        { id: '1', name: 'Oakleaf Fostering', slug: 'oakleaf-fostering', rating: 4.8, city: 'London' },
        { id: '2', name: 'Care First Ltd', slug: 'care-first-ltd', rating: 4.6, city: 'Manchester' },
        { id: '3', name: 'Fostering Together', slug: 'fostering-together', rating: 4.5, city: 'Birmingham' },
        { id: '4', name: 'National Fostering', slug: 'national-fostering', rating: 4.4, city: 'Leeds' },
        { id: '5', name: 'Sunrise Foster Care', slug: 'sunrise-foster-care', rating: 4.3, city: 'Liverpool' },
        { id: '6', name: 'Community Fostering', slug: 'community-fostering', rating: 4.2, city: 'Bristol' },
      ].slice(0, limit);
    },
  });
}

export function getLetterAvatarUrl(name: string): string {
  const initial = name?.charAt(0)?.toUpperCase() || 'A';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initial)}&background=f97316&color=fff&size=128`;
}