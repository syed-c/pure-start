// SEO utility functions and constants — Foster Connect UK Fostering Agency Directory

export const SITE_CONFIG = {
  name: 'Foster Connect',
  domain: 'fosterconnect.co.uk',
  baseUrl: 'https://www.fosterconnect.co.uk',
  defaultCountry: 'gb',
  defaultCity: 'london',
};

// URL helper functions
export const getCountryUrl = (countryCode: string = SITE_CONFIG.defaultCountry) => 
  `/${countryCode}`;

export const getCityUrl = (citySlug: string, countryCode: string = SITE_CONFIG.defaultCountry) => 
  `/${countryCode}/${citySlug}`;

export const getAreaUrl = (citySlug: string, areaSlug: string, countryCode: string = SITE_CONFIG.defaultCountry) => 
  `/${countryCode}/${citySlug}/${areaSlug}`;

export const getServiceUrl = (serviceSlug: string, countryCode: string = SITE_CONFIG.defaultCountry) => 
  `/${countryCode}/services/${serviceSlug}`;

export const getCityServiceUrl = (citySlug: string, serviceSlug: string, countryCode: string = SITE_CONFIG.defaultCountry) => 
  `/${countryCode}/${citySlug}/${serviceSlug}`;

export const getAreaServiceUrl = (citySlug: string, areaSlug: string, serviceSlug: string, countryCode: string = SITE_CONFIG.defaultCountry) => 
  `/${countryCode}/${citySlug}/${areaSlug}/${serviceSlug}`;

export const getClinicUrl = (clinicSlug: string, countryCode: string = SITE_CONFIG.defaultCountry) => 
  `/${countryCode}/agency/${clinicSlug}`;

export const getDentistUrl = (dentistSlug: string, countryCode: string = SITE_CONFIG.defaultCountry) => 
  `/${countryCode}/contact/${dentistSlug}`;

export const getBlogUrl = (countryCode: string = SITE_CONFIG.defaultCountry) => 
  `/${countryCode}/blog`;

export const getBlogPostUrl = (postSlug: string, countryCode: string = SITE_CONFIG.defaultCountry) => 
  `/${countryCode}/blog/${postSlug}`;

// SEO meta generators
export const generatePageTitle = (parts: string[]) => 
  [...parts, SITE_CONFIG.name].join(' | ');

export const generateLocationMeta = (locationName: string, type: 'city' | 'area') => ({
  title: `Fostering Agencies in ${locationName} | Find Local Support`,
  description: `Discover fostering agencies in ${locationName}. Compare verified agencies, read carer reviews, and find the right fostering support for your family.`,
  keywords: [
    `fostering agencies in ${locationName}`,
    `foster care ${locationName}`,
    `fostering support ${locationName}`,
    `become a foster carer ${locationName}`,
    `fostering services ${locationName}`,
  ],
});

export const generateServiceMeta = (serviceName: string, locationName?: string) => ({
  title: locationName 
    ? `${serviceName} in ${locationName} | Find Fostering Agencies`
    : `${serviceName} in the UK | Find Fostering Agencies`,
  description: locationName
    ? `Find the best ${serviceName.toLowerCase()} agencies in ${locationName}. Compare verified agencies, read reviews, and start your fostering journey today.`
    : `Find the best ${serviceName.toLowerCase()} agencies in the UK. Compare verified agencies, read reviews, and start your fostering journey today.`,
  keywords: [
    serviceName.toLowerCase(),
    locationName ? `${serviceName.toLowerCase()} ${locationName}` : `${serviceName.toLowerCase()} UK`,
    `${serviceName.toLowerCase()} agency`,
    `${serviceName.toLowerCase()} support`,
    `fostering agency`,
  ],
});

export const generateClinicMeta = (agencyName: string, locationName?: string) => ({
  title: `${agencyName}${locationName ? ` - ${locationName}` : ''} | Reviews & Fostering Support`,
  description: `${agencyName} is a verified fostering agency${locationName ? ` in ${locationName}` : ''}. Read carer reviews, view services offered, and contact them to start your fostering journey.`,
  keywords: [
    agencyName.toLowerCase(),
    `${agencyName.toLowerCase()} reviews`,
    locationName ? `fostering agency ${locationName}` : 'fostering agency UK',
    'fostering support',
    'foster care',
  ],
});

export const generateDentistMeta = (contactName: string, specialty?: string, agencyName?: string) => ({
  title: `${contactName}${specialty ? ` - ${specialty}` : ''} | Contact`,
  description: `Get in touch with ${contactName}${specialty ? `, a ${specialty.toLowerCase()} specialist` : ''}${agencyName ? ` at ${agencyName}` : ''}. Learn about fostering support and services available.`,
  keywords: [
    contactName.toLowerCase(),
    specialty ? specialty.toLowerCase() : 'fostering',
    'fostering agency contact',
    'foster care support',
    'fostering services',
  ],
});

export const generateBlogPostMeta = (title: string, excerpt?: string) => ({
  title,
  description: excerpt || `Read ${title} on Foster Connect's fostering blog. Expert advice and guidance for foster carers and families across the UK.`,
  keywords: [
    'fostering',
    'foster care',
    'fostering advice',
    'foster carer support',
  ],
});

// Breadcrumb type
export interface BreadcrumbItem {
  label: string;
  href?: string;
}

// Breadcrumb generators
export const generateHomeBreadcrumb = (countryCode: string = SITE_CONFIG.defaultCountry): BreadcrumbItem[] => [
  { label: 'Home', href: `/${countryCode}` },
];

export const generateLocationBreadcrumbs = (
  cityName: string,
  citySlug: string,
  areaName?: string,
  areaSlug?: string,
  countryCode: string = SITE_CONFIG.defaultCountry
): BreadcrumbItem[] => {
  const crumbs: BreadcrumbItem[] = [
    { label: 'Home', href: `/${countryCode}` },
    { label: cityName, href: areaSlug ? getCityUrl(citySlug, countryCode) : undefined },
  ];
  
  if (areaName && areaSlug) {
    crumbs.push({ label: areaName });
  }
  
  return crumbs;
};

export const generateServiceBreadcrumbs = (
  serviceName: string,
  serviceSlug: string,
  cityName?: string,
  citySlug?: string,
  countryCode: string = SITE_CONFIG.defaultCountry
): BreadcrumbItem[] => {
  const crumbs: BreadcrumbItem[] = [
    { label: 'Home', href: `/${countryCode}` },
    { label: 'Fostering Types', href: `/${countryCode}/services` },
  ];
  
  if (cityName && citySlug) {
    crumbs.push(
      { label: serviceName, href: getServiceUrl(serviceSlug, countryCode) },
      { label: `in ${cityName}` }
    );
  } else {
    crumbs.push({ label: serviceName });
  }
  
  return crumbs;
};

export const generateClinicBreadcrumbs = (
  agencyName: string,
  cityName?: string,
  citySlug?: string,
  countryCode: string = SITE_CONFIG.defaultCountry
): BreadcrumbItem[] => [
  { label: 'Home', href: `/${countryCode}` },
  ...(cityName && citySlug ? [{ label: cityName, href: getCityUrl(citySlug, countryCode) }] : []),
  { label: agencyName },
];

export const generateDentistBreadcrumbs = (
  contactName: string,
  cityName?: string,
  citySlug?: string,
  countryCode: string = SITE_CONFIG.defaultCountry
): BreadcrumbItem[] => [
  { label: 'Home', href: `/${countryCode}` },
  ...(cityName && citySlug ? [{ label: cityName, href: getCityUrl(citySlug, countryCode) }] : []),
  { label: contactName },
];

export const generateBlogBreadcrumbs = (
  postTitle?: string,
  countryCode: string = SITE_CONFIG.defaultCountry
): BreadcrumbItem[] => [
  { label: 'Home', href: `/${countryCode}` },
  { label: 'Blog', href: postTitle ? getBlogUrl(countryCode) : undefined },
  ...(postTitle ? [{ label: postTitle }] : []),
];
