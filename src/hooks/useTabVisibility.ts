import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TabVisibility {
  adminTabs: Record<string, boolean>;
  agencyTabs: Record<string, boolean>;
}

const DEFAULT_VISIBILITY: TabVisibility = {
  adminTabs: {},
  agencyTabs: {},
};

export function useTabVisibility() {
  const { data, isLoading } = useQuery({
    queryKey: ['tab-visibility-settings'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('global_settings')
          .select('*')
          .eq('key', 'tab_visibility')
          .maybeSingle();
        if (error) return null;
        if (!data) return null;
        return data.value as unknown as TabVisibility;
      } catch {
        return null;
      }
    },
    staleTime: 60000,
    gcTime: 300000,
    retry: false,
  });

  const isTabVisible = (tabId: string, dashboardType: 'admin' | 'agency'): boolean => {
    if (!data) return true;
    const visibilityMap = dashboardType === 'admin' ? data.adminTabs : data.agencyTabs;
    if (!visibilityMap) return true;
    if (visibilityMap[tabId] === undefined) return true;
    return visibilityMap[tabId];
  };

  return {
    visibility: data ?? DEFAULT_VISIBILITY,
    isLoading,
    isTabVisible,
  };
}
