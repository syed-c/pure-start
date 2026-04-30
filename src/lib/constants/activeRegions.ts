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
  // Additional English Counties
  { name: 'Derbyshire', slug: 'derbyshire', abbr: 'DER' },
  { name: 'East Riding of Yorkshire', slug: 'east-riding-of-yorkshire', abbr: 'ERY' },
  { name: 'Berkshire', slug: 'berkshire', abbr: 'BRK' },
  { name: 'Buckinghamshire', slug: 'buckinghamshire', abbr: 'BKM' },
  { name: 'Staffordshire', slug: 'staffordshire', abbr: 'STS' },
  { name: 'Cheshire', slug: 'cheshire', abbr: 'CHE' },
  { name: 'Cambridgeshire', slug: 'cambridgeshire', abbr: 'CAM' },
  { name: 'East Sussex', slug: 'east-sussex', abbr: 'ESX' },
  { name: 'Leicestershire', slug: 'leicestershire', abbr: 'LEI' },
  { name: 'North Yorkshire', slug: 'north-yorkshire', abbr: 'NYK' },
  { name: 'Bedfordshire', slug: 'bedfordshire', abbr: 'BDF' },
] as const;

/**
 * Scotland regions/cities
 */
export const SCOTLAND_REGIONS = [
  { name: 'Glasgow City', slug: 'glasgow-city', abbr: 'GLG' },
  { name: 'City of Edinburgh', slug: 'city-of-edinburgh', abbr: 'EDH' },
  { name: 'Aberdeen City', slug: 'aberdeen-city', abbr: 'ABD' },
  { name: 'Dundee City', slug: 'dundee-city', abbr: 'DND' },
  { name: 'Highland', slug: 'highland', abbr: 'HLD' },
  { name: 'Stirling', slug: 'stirling', abbr: 'STG' },
  { name: 'Renfrewshire', slug: 'renfrewshire', abbr: 'RFW' },
] as const;

/**
 * Wales counties
 */
export const WALES_COUNTIES = [
  { name: 'Cardiff', slug: 'cardiff', abbr: 'CDF' },
  { name: 'Swansea', slug: 'swansea', abbr: 'SWA' },
  { name: 'Newport', slug: 'newport', abbr: 'NWP' },
  { name: 'Wrexham', slug: 'wrexham', abbr: 'WRX' },
  { name: 'Vale of Glamorgan', slug: 'vale-of-glamorgan', abbr: 'VGL' },
  { name: 'Powys', slug: 'powys', abbr: 'POW' },
  { name: 'Carmarthenshire', slug: 'carmarthenshire', abbr: 'CMN' },
  { name: 'Gwynedd', slug: 'gwynedd', abbr: 'GWN' },
] as const;

/**
 * Northern Ireland counties
 */
export const NORTHERN_IRELAND_COUNTIES = [
  { name: 'Belfast', slug: 'belfast', abbr: 'BFS' },
  { name: 'Derry and Strabane', slug: 'derry-and-strabane', abbr: 'DER' },
  { name: 'Lisburn and Castlereagh', slug: 'lisburn-and-castlereagh', abbr: 'LBC' },
  { name: 'Newry, Mourne and Down', slug: 'newry-mourne-and-down', abbr: 'NMD' },
  { name: 'Antrim and Newtownabbey', slug: 'antrim-and-newtownabbey', abbr: 'ANN' },
  { name: 'Armagh City, Banbridge and Craigavon', slug: 'armagh-banbridge-craigavon', abbr: 'ABC' },
] as const;

/**
 * Major cities for quick access / popular areas
 * Priority UK cities for SEO - balanced coverage across nations
 */
export const POPULAR_CITIES = [
  // England - Major Cities
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
  // Additional England Cities
  { name: 'Derby', slug: 'derby', region: 'england', county: 'derbyshire' },
  { name: 'Hull', slug: 'hull', region: 'england', county: 'east-riding-of-yorkshire' },
  { name: 'Portsmouth', slug: 'portsmouth', region: 'england', county: 'hampshire' },
  { name: 'Luton', slug: 'luton', region: 'england', county: 'bedfordshire' },
  { name: 'Milton Keynes', slug: 'milton-keynes', region: 'england', county: 'buckinghamshire' },
  { name: 'Wolverhampton', slug: 'wolverhampton', region: 'england', county: 'west-midlands' },
  { name: 'Sunderland', slug: 'sunderland', region: 'england', county: 'tyne-and-wear' },
  { name: 'Walsall', slug: 'walsall', region: 'england', county: 'west-midlands' },
  { name: 'Oldham', slug: 'oldham', region: 'england', county: 'greater-manchester' },
  { name: 'Wigan', slug: 'wigan', region: 'england', county: 'greater-manchester' },
  { name: 'Stoke-on-Trent', slug: 'stoke-on-trent', region: 'england', county: 'staffordshire' },
  { name: 'Warrington', slug: 'warrington', region: 'england', county: 'cheshire' },
  { name: 'Bradford', slug: 'bradford', region: 'england', county: 'west-yorkshire' },
  { name: 'York', slug: 'york', region: 'england', county: 'north-yorkshire' },
  { name: 'Salford', slug: 'salford', region: 'england', county: 'greater-manchester' },
  { name: 'Blackpool', slug: 'blackpool', region: 'england', county: 'lancashire' },
  { name: 'Exeter', slug: 'exeter', region: 'england', county: 'devon' },
  { name: 'Colchester', slug: 'colchester', region: 'england', county: 'essex' },
  { name: 'Chelmsford', slug: 'chelmsford', region: 'england', county: 'essex' },
  { name: 'Maidstone', slug: 'maidstone', region: 'england', county: 'kent' },
  // Scotland
  { name: 'Glasgow', slug: 'glasgow', region: 'scotland', county: 'glasgow-city' },
  { name: 'Edinburgh', slug: 'edinburgh', region: 'scotland', county: 'city-of-edinburgh' },
  { name: 'Aberdeen', slug: 'aberdeen', region: 'scotland', county: 'aberdeen-city' },
  { name: 'Dundee', slug: 'dundee', region: 'scotland', county: 'dundee-city' },
  { name: 'Inverness', slug: 'inverness', region: 'scotland', county: 'highland' },
  { name: 'Stirling', slug: 'stirling', region: 'scotland', county: 'stirling' },
  { name: 'Paisley', slug: 'paisley', region: 'scotland', county: 'renfrewshire' },
  // Wales
  { name: 'Cardiff', slug: 'cardiff', region: 'wales', county: 'cardiff' },
  { name: 'Swansea', slug: 'swansea', region: 'wales', county: 'swansea' },
  { name: 'Newport', slug: 'newport', region: 'wales', county: 'newport' },
  { name: 'Wrexham', slug: 'wrexham', region: 'wales', county: 'wrexham' },
  { name: 'Barry', slug: 'barry', region: 'wales', county: 'vale-of-glamorgan' },
  // Northern Ireland
  { name: 'Belfast', slug: 'belfast', region: 'northern-ireland', county: 'belfast' },
  { name: 'Derry', slug: 'derry', region: 'northern-ireland', county: 'derry-and-strabane' },
  { name: 'Lisburn', slug: 'lisburn', region: 'northern-ireland', county: 'lisburn-and-castlereagh' },
  { name: 'Newry', slug: 'newry', region: 'northern-ireland', county: 'newry-mourne-and-down' },
] as const;

/**
 * Fostering categories / service types
 */
export const FOSTERING_CATEGORIES = [
  // Agency Types
  { name: 'Independent Fostering Agency', slug: 'independent-fostering-agency' },
  { name: 'Local Authority Fostering', slug: 'local-authority-fostering' },
  // Primary Fostering Types
  { name: 'Emergency Fostering', slug: 'emergency-fostering' },
  { name: 'Short-Term Fostering', slug: 'short-term-fostering' },
  { name: 'Long-Term Fostering', slug: 'long-term-fostering' },
  { name: 'Respite Fostering', slug: 'respite-fostering' },
  // Specialised Types
  { name: 'Parent & Child Fostering', slug: 'parent-and-child-fostering' },
  { name: 'Therapeutic Fostering', slug: 'therapeutic-fostering' },
  { name: 'Sibling Fostering', slug: 'sibling-fostering' },
  { name: 'Teenage Fostering', slug: 'teenage-fostering' },
  { name: 'Disability & Complex Needs', slug: 'disability-complex-needs-fostering' },
  // Additional Types
  { name: 'Kinship Fostering', slug: 'kinship-fostering' },
  { name: 'Remand Fostering', slug: 'remand-fostering' },
  { name: 'Specialist Fostering', slug: 'specialist-fostering' },
  { name: 'UASC Fostering', slug: 'uasc-fostering' },
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
