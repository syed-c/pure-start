import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface FeatureFlags {
  booking_engine_enabled: boolean;
  booking_default_on: boolean;
  gbp_appointment_sync_enabled: boolean;
  insurance_filter_enabled: boolean;
  ai_match_enabled: boolean;
  review_ai_summary_enabled: boolean;
}

const DEFAULT_FLAGS: FeatureFlags = {
  booking_engine_enabled: false,
  booking_default_on: false,
  gbp_appointment_sync_enabled: false,
  insurance_filter_enabled: false,
  ai_match_enabled: false,
  review_ai_summary_enabled: false,
};

export function useFeatureFlags() {
  const { data: flags, isLoading, error } = useQuery({
    queryKey: ['feature-flags-client'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('global_settings')
          .select('key, value')
          .like('key', 'feature_%');

        if (error) return DEFAULT_FLAGS;

        const result = { ...DEFAULT_FLAGS };
        data?.forEach(setting => {
          const flagKey = setting.key.replace('feature_', '') as keyof FeatureFlags;
          if (flagKey in result && typeof setting.value === 'object' && setting.value !== null && 'enabled' in setting.value) {
            result[flagKey] = (setting.value as { enabled: boolean }).enabled;
          }
        });
        return result;
      } catch {
        return DEFAULT_FLAGS;
      }
    },
    staleTime: 60000,
    gcTime: 300000,
    retry: false,
  });

  return {
    flags: flags ?? DEFAULT_FLAGS,
    isLoading,
    error,
    isEnabled: (flag: keyof FeatureFlags) => flags?.[flag] ?? DEFAULT_FLAGS[flag],
  };
}

export type { FeatureFlags };
