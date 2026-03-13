import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PinnedClinic {
  id: string;
  position: number;
  featured: boolean;
}

export function usePinnedProfiles(pageType: 'homepage' | 'state' | 'city' | 'service', stateSlug?: string, citySlug?: string, serviceSlug?: string) {
  const getSettingKey = () => {
    if (pageType === 'homepage') return 'pinned_agencies_homepage';
    if (pageType === 'state' && stateSlug) return `pinned_agencies_state_${stateSlug}`;
    if (pageType === 'city' && stateSlug && citySlug) return `pinned_agencies_city_${stateSlug}_${citySlug}`;
    if (pageType === 'service' && serviceSlug) return `pinned_agencies_service_${serviceSlug}`;
    return null;
  };

  const settingKey = getSettingKey();

  return useQuery({
    queryKey: ['pinned-profiles', settingKey],
    queryFn: async () => {
      if (!settingKey) return [];
      try {
        const { data } = await supabase
          .from('global_settings')
          .select('value')
          .eq('key', settingKey)
          .maybeSingle();
        if (!data?.value) return [];
        const pins = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
        return (Array.isArray(pins) ? pins : []) as PinnedClinic[];
      } catch {
        return [];
      }
    },
    enabled: !!settingKey,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function sortWithPinnedFirst<T extends { id: string }>(
  items: T[],
  pinnedProfiles: PinnedClinic[] | undefined
): T[] {
  if (!pinnedProfiles?.length) return items;
  const pinnedMap = new Map(pinnedProfiles.map(p => [p.id, p.position]));
  const pinned = items
    .filter(item => pinnedMap.has(item.id))
    .sort((a, b) => (pinnedMap.get(a.id) || 0) - (pinnedMap.get(b.id) || 0));
  const unpinned = items.filter(item => !pinnedMap.has(item.id));
  return [...pinned, ...unpinned];
}
