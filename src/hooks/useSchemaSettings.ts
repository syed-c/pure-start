import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface OrganizationSettings {
  name: string;
  url: string;
  logo: string;
  description: string;
  email: string;
  phone: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  socialProfiles: string[];
  foundingDate: string;
  founders: string[];
}

export interface SitewideSettings {
  defaultRating: number;
  enableBreadcrumbs: boolean;
  enableFAQSchema: boolean;
  enableReviewSchema: boolean;
  enableLocalBusinessSchema: boolean;
}

export interface SchemaSettings {
  organization: OrganizationSettings;
  sitewide: SitewideSettings;
}

const defaultOrganization: OrganizationSettings = {
  name: 'Foster Care',
  url: 'https://www.foster-care.co.uk',
  logo: 'https://www.foster-care.co.uk/logo.png',
  description: 'Find trusted fostering agencies across England and the UK. Compare services, read reviews, and take the first step towards fostering.',
  email: 'support@foster-care.co.uk',
  phone: '',
  address: {
    streetAddress: '',
    addressLocality: 'London',
    addressRegion: 'England',
    postalCode: '',
    addressCountry: 'GB',
  },
  socialProfiles: [],
  foundingDate: '',
  founders: [],
};

const defaultSitewide: SitewideSettings = {
  defaultRating: 4.5,
  enableBreadcrumbs: true,
  enableFAQSchema: true,
  enableReviewSchema: true,
  enableLocalBusinessSchema: true,
};

export function useSchemaSettings() {
  return useQuery({
    queryKey: ['schema-settings-public'],
    queryFn: async (): Promise<SchemaSettings> => {
      try {
        const { data, error } = await supabase
          .from('schema_settings')
          .select('setting_key, setting_value');
        
        if (error) {
          return { organization: defaultOrganization, sitewide: defaultSitewide };
        }
        
        const settings: Record<string, any> = {};
        data?.forEach(row => {
          settings[row.setting_key] = row.setting_value;
        });
        
        return {
          organization: settings.organization || defaultOrganization,
          sitewide: settings.sitewide || defaultSitewide,
        };
      } catch {
        return { organization: defaultOrganization, sitewide: defaultSitewide };
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function getDefaultSchemaSettings(): SchemaSettings {
  return { organization: defaultOrganization, sitewide: defaultSitewide };
}
