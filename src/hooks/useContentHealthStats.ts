import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { fetchAllWithRange } from '@/lib/api/fetchAllWithRange';

// UK nations and their slug prefixes for the fostering platform
const ACTIVE_NATION_SLUGS = ['england', 'scotland', 'wales', 'northern-ireland'];

// Known UK city slugs for direct city pages (e.g., /london, /manchester)
const KNOWN_CITY_SLUGS = [
  'london', 'manchester', 'birmingham', 'leeds', 'liverpool',
  'bristol', 'sheffield', 'glasgow', 'cardiff', 'newcastle',
  'edinburgh', 'nottingham', 'leicester', 'coventry',
  'plymouth', 'ipswich', 'exeter', 'derby', 'hull',
  'portsmouth', 'luton', 'milton-keynes', 'northampton',
  'wolverhampton', 'sunderland', 'stoke-on-trent', 'bradford',
];

// Also accept US state slugs for backwards compatibility with any existing legacy data
const KNOWN_STATE_SLUGS = [
  'california', 'connecticut', 'massachusetts', 'new-jersey',
  'ca', 'ct', 'ma', 'nj',
];

export interface ContentHealthStats {
  total: number;
  good: number;
  thin: number;
  missing: number;
  byType: {
    page_type: string;
    total: number;
    good: number;
    thin: number;
    missing: number;
  }[];
}

/**
 * Check if a slug belongs to an active location.
 * Pages under /england, /scotland, /wales, /northern-ireland or their children are valid.
 * Also accepts direct city slugs (e.g., /london, /manchester).
 * Non-location page types are always valid.
 */
function isActiveLocationSlug(slug: string, pageType: string): boolean {
  if (!slug) return false;

  // Non-location page types are always valid
  if (['static', 'blog', 'treatment', 'service', 'service_location', 'clinic'].includes(pageType)) return true;

  const normalized = slug.toLowerCase().replace(/^\//, '');

  // Check for agency/other non-location paths (always valid)
  if (normalized.startsWith('agency/') || normalized.startsWith('agencies')) return true;
  if (normalized.startsWith('services') || normalized.startsWith('blog') || normalized.startsWith('insurance')) return true;
  if (normalized.startsWith('fostering-')) return true;
  if (normalized.startsWith('tools')) return true;
  if (normalized.startsWith('auth') || normalized.startsWith('login') || normalized.startsWith('onboarding')) return true;
  if (normalized.startsWith('compare') || normalized.startsWith('claim') || normalized.startsWith('list-your')) return true;
  if (normalized.startsWith('review') || normalized.startsWith('appointment') || normalized.startsWith('form') || normalized.startsWith('book')) return true;
  if (normalized.startsWith('carer') || normalized.startsWith('applicant') || normalized.startsWith('trainer') || normalized.startsWith('la')) return true;

  // Known direct city pages
  if (KNOWN_CITY_SLUGS.includes(normalized)) return true;

  // Check nation prefixes (UK)
  for (const nationSlug of ACTIVE_NATION_SLUGS) {
    if (normalized === nationSlug || normalized.startsWith(`${nationSlug}/`)) {
      return true;
    }
  }

  // Backwards compatibility: known US state slugs
  for (const stateSlug of KNOWN_STATE_SLUGS) {
    if (normalized === stateSlug || normalized.startsWith(`${stateSlug}/`)) {
      return true;
    }
  }

  return false;
}

export function useContentHealthStats() {
  return useQuery({
    queryKey: ['content-health-stats-uk'],
    queryFn: async (): Promise<ContentHealthStats> => {
      // PostgREST defaults to 1,000 rows unless we explicitly page.
      // For accurate stats across 20k+ pages we must fetch in chunks.
      const pages = await fetchAllWithRange<{ page_type: string | null; word_count: number | null; slug: string }>(
        async (from, to) => {
          const { data, error } = await supabase
            .from('seo_pages')
            .select('page_type, word_count, slug')
            .range(from, to);
          if (error) throw error;
          return data || [];
        }
      );

      const stats: ContentHealthStats = {
        total: 0,
        good: 0,
        thin: 0,
        missing: 0,
        byType: [],
      };

      const typeMap = new Map<string, { total: number; good: number; thin: number; missing: number }>();

      for (const page of pages) {
        const pageType = page.page_type || 'unknown';

        // Skip pages from inactive locations
        if (!isActiveLocationSlug(page.slug, pageType)) continue;

        const wordCount = page.word_count ?? 0;

        // Service and service-location pages require 800+ words for "good" status
        // All other page types require 300+ words
        const minGoodWords = ['service', 'service_location'].includes(pageType) ? 800 : 300;

        let status: 'good' | 'thin' | 'missing';
        if (wordCount >= minGoodWords) {
          status = 'good';
          stats.good++;
        } else if (wordCount >= 1) {
          status = 'thin';
          stats.thin++;
        } else {
          status = 'missing';
          stats.missing++;
        }

        stats.total++;

        if (!typeMap.has(pageType)) {
          typeMap.set(pageType, { total: 0, good: 0, thin: 0, missing: 0 });
        }
        const typeStats = typeMap.get(pageType)!;
        typeStats.total++;
        typeStats[status]++;
      }

      stats.byType = Array.from(typeMap.entries()).map(([page_type, counts]) => ({
        page_type,
        ...counts,
      })).sort((a, b) => b.missing - a.missing);

      return stats;
    },
    staleTime: 60000, // 1 minute
  });
}