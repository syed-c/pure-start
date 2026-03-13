/**
 * BreadcrumbSchema - JSON-LD Breadcrumb structured data
 * 
 * Implements BreadcrumbList schema for full hierarchy:
 * Home > Region > City > Category > Agency Profile
 * 
 * CANONICAL: All URLs use trailing slash format (except root /).
 */

import { Helmet } from "react-helmet-async";

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
  baseUrl?: string;
}

const ensureTrailingSlash = (url: string): string => {
  if (url === '/' || url === '') return '/';
  return url.endsWith('/') ? url : `${url}/`;
};

export const BreadcrumbSchema = ({ 
  items, 
  baseUrl = "https://www.fosterconnect.co.uk" 
}: BreadcrumbSchemaProps) => {
  const schemaItems = items.map((item, index) => {
    const url = item.url.startsWith("http") 
      ? item.url 
      : `${baseUrl}${ensureTrailingSlash(item.url)}`;
    return {
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: url,
    };
  });

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: schemaItems,
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

/**
 * Helper functions to generate breadcrumb items for different page types
 */

export const generateStateBreadcrumbs = (
  regionName: string,
  regionSlug: string
): BreadcrumbItem[] => [
  { name: "Home", url: "/" },
  { name: regionName, url: `/${regionSlug}/` },
];

export const generateCityBreadcrumbs = (
  regionName: string,
  regionSlug: string,
  cityName: string,
  citySlug: string
): BreadcrumbItem[] => [
  { name: "Home", url: "/" },
  { name: regionName, url: `/${regionSlug}/` },
  { name: cityName, url: `/${regionSlug}/${citySlug}/` },
];

export const generateServiceBreadcrumbs = (
  categoryName: string,
  categorySlug: string
): BreadcrumbItem[] => [
  { name: "Home", url: "/" },
  { name: "Categories", url: "/categories/" },
  { name: categoryName, url: `/categories/${categorySlug}/` },
];

export const generateServiceLocationBreadcrumbs = (
  regionName: string,
  regionSlug: string,
  cityName: string,
  citySlug: string,
  categoryName: string,
  categorySlug: string
): BreadcrumbItem[] => [
  { name: "Home", url: "/" },
  { name: regionName, url: `/${regionSlug}/` },
  { name: cityName, url: `/${regionSlug}/${citySlug}/` },
  { name: categoryName, url: `/${regionSlug}/${citySlug}/${categorySlug}/` },
];

export const generateClinicBreadcrumbs = (
  agencyName: string,
  agencySlug: string,
  regionName?: string,
  regionSlug?: string,
  cityName?: string,
  citySlug?: string
): BreadcrumbItem[] => {
  const crumbs: BreadcrumbItem[] = [{ name: "Home", url: "/" }];
  
  if (regionName && regionSlug) {
    crumbs.push({ name: regionName, url: `/${regionSlug}/` });
  }
  
  if (cityName && citySlug && regionSlug) {
    crumbs.push({ name: cityName, url: `/${regionSlug}/${citySlug}/` });
  }
  
  crumbs.push({ name: agencyName, url: `/agency/${agencySlug}/` });
  
  return crumbs;
};

// Alias for backward compatibility
export const generateDentistBreadcrumbs = generateClinicBreadcrumbs;

export const generateAgencyBreadcrumbs = generateClinicBreadcrumbs;

export default BreadcrumbSchema;
