import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ContactDetails {
  support_email?: string;
  booking_email?: string;
  sales_email?: string;
  partnerships_email?: string;
  support_phone?: string;
  booking_phone?: string;
  sales_phone?: string;
  whatsapp?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
}

export interface FooterLink {
  label: string;
  path: string;
  external?: boolean;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export interface Branding {
  logo_url?: string;
  logo_dark_url?: string;
  favicon_url?: string;
}

export interface SiteSettings {
  siteName: string;
  siteUrl: string;
  siteTagline: string;
  contactDetails: ContactDetails;
  socialLinks: SocialLinks;
  footerSections: FooterSection[];
  legalText: string;
  copyrightText: string;
  branding: Branding;
}

const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteName: 'Foster Care',
  siteUrl: 'https://www.foster-care.co.uk/',
  siteTagline: 'UK Fostering Agency Directory',
  contactDetails: {
    support_email: 'support@foster-care.co.uk',
    sales_email: 'agencies@foster-care.co.uk',
    partnerships_email: 'partners@foster-care.co.uk',
    support_phone: '+44 20 7946 0958',
    address_line1: '',
    address_line2: '',
    city: 'London',
    state: 'England',
    zip_code: '',
    country: 'United Kingdom',
  },
  socialLinks: {
    facebook: '',
    instagram: '',
    twitter: '',
    linkedin: '',
    youtube: '',
    tiktok: '',
  },
  footerSections: [],
  legalText: 'Connecting families with trusted fostering agencies across the UK.',
  copyrightText: '© 2026 Foster Care. All rights reserved.',
  branding: {
    logo_url: '',
    logo_dark_url: '',
    favicon_url: '',
  },
};

export function useSiteSettings() {
  return useQuery({
    queryKey: ['site-settings'],
    queryFn: async (): Promise<SiteSettings> => {
      try {
        const { data, error } = await supabase
          .from('global_settings')
          .select('key, value')
          .in('key', ['platform', 'contact_details', 'social_links', 'footer_config', 'legal', 'header_nav', 'branding']);

        if (error) {
          // Table doesn't exist yet — return defaults
          return DEFAULT_SITE_SETTINGS;
        }

        const settingsMap: Record<string, Record<string, unknown>> = {};
        data?.forEach(s => {
          settingsMap[s.key] = s.value as Record<string, unknown>;
        });

        const platform = settingsMap['platform'] || {};
        const contacts = settingsMap['contact_details'] || {};
        const social = settingsMap['social_links'] || {};
        const footerConfig = settingsMap['footer_config'] || {};
        const legal = settingsMap['legal'] || {};
        const branding = settingsMap['branding'] || {};

        return {
          siteName: (platform.site_name as string) || DEFAULT_SITE_SETTINGS.siteName,
          siteUrl: (platform.site_url as string) || DEFAULT_SITE_SETTINGS.siteUrl,
          siteTagline: (platform.tagline as string) || DEFAULT_SITE_SETTINGS.siteTagline,
          contactDetails: {
            support_email: (contacts.support_email as string) || DEFAULT_SITE_SETTINGS.contactDetails.support_email,
            booking_email: (contacts.booking_email as string) || '',
            sales_email: (contacts.sales_email as string) || DEFAULT_SITE_SETTINGS.contactDetails.sales_email,
            partnerships_email: (contacts.partnerships_email as string) || DEFAULT_SITE_SETTINGS.contactDetails.partnerships_email,
            support_phone: (contacts.support_phone as string) || DEFAULT_SITE_SETTINGS.contactDetails.support_phone,
            booking_phone: (contacts.booking_phone as string) || '',
            sales_phone: (contacts.sales_phone as string) || '',
            whatsapp: (contacts.whatsapp as string) || '',
            address_line1: (contacts.address_line1 as string) || '',
            address_line2: (contacts.address_line2 as string) || '',
            city: (contacts.city as string) || 'London',
            state: (contacts.state as string) || 'England',
            zip_code: (contacts.zip_code as string) || '',
            country: (contacts.country as string) || 'United Kingdom',
          },
          socialLinks: {
            facebook: (social.facebook as string) || '',
            instagram: (social.instagram as string) || '',
            twitter: (social.twitter as string) || '',
            linkedin: (social.linkedin as string) || '',
            youtube: (social.youtube as string) || '',
            tiktok: (social.tiktok as string) || '',
          },
          footerSections: (footerConfig.sections as FooterSection[]) || [],
          legalText: (legal.footer_text as string) || DEFAULT_SITE_SETTINGS.legalText,
          copyrightText: (legal.copyright_text as string) || DEFAULT_SITE_SETTINGS.copyrightText,
          branding: {
            logo_url: (branding.logo_url as string) || '',
            logo_dark_url: (branding.logo_dark_url as string) || '',
            favicon_url: (branding.favicon_url as string) || '',
          },
        };
      } catch {
        return DEFAULT_SITE_SETTINGS;
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
  });
}
