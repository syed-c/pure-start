/**
 * Active Regions Configuration (UK Market)
 * 
 * These are the regions/nations that are live on the platform.
 * All UI features, content management, and location filters
 * MUST use these regions.
 * 
 * Primary focus: England
 * Future: Scotland, Wales, Northern Ireland
 */

export const ACTIVE_REGION_SLUGS = [
  'england',
  'scotland',
  'wales',
  'northern-ireland',
];
export type ActiveRegionSlug = 'england' | 'scotland' | 'wales' | 'northern-ireland';

export const ACTIVE_REGIONS = [
  { name: 'England', slug: 'england', abbr: 'ENG', fullSlug: 'england', isPrimary: true },
  { name: 'Scotland', slug: 'scotland', abbr: 'SCT', fullSlug: 'scotland', isPrimary: false },
  { name: 'Wales', slug: 'wales', abbr: 'WLS', fullSlug: 'wales', isPrimary: false },
  { name: 'Northern Ireland', slug: 'northern-ireland', abbr: 'NIR', fullSlug: 'northern-ireland', isPrimary: false },
] as const;

export type ActiveRegion = typeof ACTIVE_REGIONS[number];

/**
 * England counties/regions for deeper location hierarchy
 */
export const ENGLAND_COUNTIES = [
  { name: 'Greater London', slug: 'greater-london', abbr: 'LON' },
  { name: 'West Midlands', slug: 'west-midlands', abbr: 'WMD' },
  { name: 'Greater Manchester', slug: 'greater-manchester', abbr: 'GMR' },
  { name: 'West Yorkshire', slug: 'west-yorkshire', abbr: 'WYK' },
  { name: 'South Yorkshire', slug: 'south-yorkshire', abbr: 'SYK' },
  { name: 'Merseyside', slug: 'merseyside', abbr: 'MSY' },
  { name: 'Hampshire', slug: 'hampshire', abbr: 'HAM' },
  { name: 'Kent', slug: 'kent', abbr: 'KEN' },
  { name: 'Essex', slug: 'essex', abbr: 'ESS' },
  { name: 'Surrey', slug: 'surrey', abbr: 'SRY' },
  { name: 'Lancashire', slug: 'lancashire', abbr: 'LAN' },
  { name: 'Devon', slug: 'devon', abbr: 'DEV' },
  { name: 'Norfolk', slug: 'norfolk', abbr: 'NFK' },
  { name: 'Oxfordshire', slug: 'oxfordshire', abbr: 'OXF' },
  { name: 'Nottinghamshire', slug: 'nottinghamshire', abbr: 'NTT' },
  { name: 'Bristol', slug: 'bristol', abbr: 'BST' },
  { name: 'Tyne and Wear', slug: 'tyne-and-wear', abbr: 'TWR' },
] as const;

/**
 * Major cities for quick access / popular areas
 */
export const POPULAR_CITIES = [
  { name: 'London', slug: 'london', region: 'england', county: 'greater-london' },
  { name: 'Birmingham', slug: 'birmingham', region: 'england', county: 'west-midlands' },
  { name: 'Manchester', slug: 'manchester', region: 'england', county: 'greater-manchester' },
  { name: 'Leeds', slug: 'leeds', region: 'england', county: 'west-yorkshire' },
  { name: 'Liverpool', slug: 'liverpool', region: 'england', county: 'merseyside' },
  { name: 'Bristol', slug: 'bristol', region: 'england', county: 'bristol' },
  { name: 'Sheffield', slug: 'sheffield', region: 'england', county: 'south-yorkshire' },
  { name: 'Newcastle', slug: 'newcastle', region: 'england', county: 'tyne-and-wear' },
  { name: 'Nottingham', slug: 'nottingham', region: 'england', county: 'nottinghamshire' },
  { name: 'Southampton', slug: 'southampton', region: 'england', county: 'hampshire' },
  { name: 'Oxford', slug: 'oxford', region: 'england', county: 'oxfordshire' },
  { name: 'Cambridge', slug: 'cambridge', region: 'england', county: 'cambridgeshire' },
  { name: 'Brighton', slug: 'brighton', region: 'england', county: 'east-sussex' },
  { name: 'Leicester', slug: 'leicester', region: 'england', county: 'leicestershire' },
  { name: 'Coventry', slug: 'coventry', region: 'england', county: 'west-midlands' },
  { name: 'Plymouth', slug: 'plymouth', region: 'england', county: 'devon' },
  { name: 'Reading', slug: 'reading', region: 'england', county: 'berkshire' },
  { name: 'Norwich', slug: 'norwich', region: 'england', county: 'norfolk' },
] as const;

/**
 * Fostering categories
 */
export const FOSTERING_CATEGORIES = [
  { name: 'Independent Fostering Agency', slug: 'independent-fostering-agency' },
  { name: 'Local Authority Fostering', slug: 'local-authority-fostering' },
  { name: 'Emergency Fostering', slug: 'emergency-fostering' },
  { name: 'Respite Fostering', slug: 'respite-fostering' },
  { name: 'Parent & Child Fostering', slug: 'parent-and-child-fostering' },
  { name: 'Therapeutic Fostering', slug: 'therapeutic-fostering' },
  { name: 'Long-Term Fostering', slug: 'long-term-fostering' },
  { name: 'Short-Term Fostering', slug: 'short-term-fostering' },
  { name: 'Disability & Complex Needs', slug: 'disability-complex-needs-fostering' },
] as const;

/**
 * Check if a slug is in the active regions list
 */
export function isActiveRegion(slug: string): boolean {
  const lower = slug.toLowerCase();
  return ACTIVE_REGION_SLUGS.includes(lower) || ACTIVE_REGIONS.some(s => s.fullSlug === lower);
}

/**
 * Map of abbreviation to full slug for DB queries
 */
const ABBREV_TO_FULL: Record<string, string> = Object.fromEntries(
  ACTIVE_REGIONS.map(s => [s.abbr.toLowerCase(), s.fullSlug])
);

export function getFullSlug(slug: string): string {
  const lower = slug.toLowerCase();
  return ABBREV_TO_FULL[lower] ?? lower;
}

/**
 * Filter an array of regions to only include active ones
 */
export function filterActiveRegions<T extends { slug?: string | null }>(regions: T[]): T[] {
  return regions.filter(r => r.slug && isActiveRegion(r.slug));
}

/**
 * Get region info by slug
 */
export function getActiveRegionBySlug(slug: string): ActiveRegion | undefined {
  return ACTIVE_REGIONS.find(s => s.slug === slug.toLowerCase());
}

/**
 * Check if an SEO page slug belongs to an active region.
 */
export function isPageInActiveRegion(pageSlug: string, pageType?: string): boolean {
  const normalized = pageSlug.replace(/^\/+/, '').toLowerCase();
  const type = (pageType || '').toLowerCase();

  // Non-location page types should always be visible in admin studios
  // so editors can generate content/FAQs for all global pages.
  const alwaysAllowedTypes = new Set([
    'static',
    'blog',
    'blog-index',
    'blog-post',
    'agency',
    'category',
    'treatment',
    'service',
    'clinic',
    'dentist',
    'insurance',
    'insurance-index',
    'insurance-detail',
  ]);

  if (alwaysAllowedTypes.has(type)) {
    return true;
  }

  if (!normalized || normalized === '/') {
    return true;
  }

  // Location-based pages must belong to one of the active regions.
  const locationScopedTypes = new Set([
    'state',
    'region',
    'city',
    'service_location',
    'service-location',
    'city_treatment',
    'city_category',
    'city-category',
  ]);

  if (locationScopedTypes.has(type) || !type) {
    for (const regionSlug of ACTIVE_REGION_SLUGS) {
      if (normalized === regionSlug || normalized.startsWith(`${regionSlug}/`)) {
        return true;
      }
    }
  }

  if (normalized.startsWith('categories/') || normalized === 'categories') {
    return true;
  }

  // For unknown/custom page types, keep them visible if they are not tied to a region pattern.
  return !normalized.includes('/');
}
