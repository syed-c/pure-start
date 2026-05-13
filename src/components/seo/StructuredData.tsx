import { Helmet } from 'react-helmet-async';
import { useSchemaSettings } from '@/hooks/useSchemaSettings';
import { withTrailingSlash } from '@/lib/url/withTrailingSlash';

const BASE_URL = 'https://www.foster-care.co.uk';

// Organization Schema
export interface OrganizationSchemaProps {
  type: 'organization';
}

// WebSite Schema for search box
export interface WebSiteSchemaProps {
  type: 'website';
}

// LocalBusiness/Dentist Schema
export interface LocalBusinessSchemaProps {
  type: 'localBusiness';
  name: string;
  description?: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  url: string;
  image?: string;
  rating?: number;
  reviewCount?: number;
  priceRange?: string;
  openingHours?: { day: string; open: string; close: string }[];
  geo?: { lat: number; lng: number };
}

// Person/Dentist Schema
export interface PersonSchemaProps {
  type: 'person';
  name: string;
  jobTitle?: string;
  description?: string;
  image?: string;
  url: string;
  worksFor?: { name: string; url: string };
  qualifications?: string[];
}

// Article Schema
export interface ArticleSchemaProps {
  type: 'article';
  headline: string;
  description?: string;
  image?: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
  author?: string;
}

// FAQ Schema
export interface FAQSchemaProps {
  type: 'faq';
  questions: { question: string; answer: string }[];
}

// Breadcrumb Schema
export interface BreadcrumbSchemaProps {
  type: 'breadcrumb';
  items: { name: string; url?: string }[];
}

// Organization Schema
const generateOrganizationSchema = (props?: { name?: string; url?: string; logo?: string }) => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: props?.name || 'Foster Care UK',
  url: props?.url || BASE_URL,
  logo: props?.logo || `${BASE_URL}/logo.png`,
  sameAs: [
    'https://www.facebook.com/fostercareuk',
    'https://www.twitter.com/fostercareuk',
    'https://www.instagram.com/fostercareuk',
  ],
});

// Service Schema
const generateServiceSchema = (props: ServiceSchemaProps) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: props.name,
  description: props.description,
  provider: {
    '@type': 'Organization',
    name: props.provider?.name || 'Foster Care UK',
    url: props.provider?.url || BASE_URL,
  },
});

// WebSite Schema with SearchAction
const generateWebSiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Foster Care UK',
  url: BASE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${BASE_URL}/search?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
});

const generatePersonSchema = (props: PersonSchemaProps) => ({
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: props.name,
  jobTitle: props.jobTitle || 'Foster Care Agency',
  description: props.description,
  image: props.image,
  url: `${BASE_URL}${withTrailingSlash(props.url)}`,
  worksFor: props.worksFor
    ? {
        '@type': 'FosterCareAgency',
        name: props.worksFor.name,
        url: `${BASE_URL}${withTrailingSlash(props.worksFor.url)}`,
      }
    : undefined,
  hasCredential: props.qualifications?.map((q) => ({
    '@type': 'EducationalOccupationalCredential',
    name: q,
  })),
});

const generateArticleSchema = (props: ArticleSchemaProps) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: props.headline,
  description: props.description,
  image: props.image,
  url: `${BASE_URL}${withTrailingSlash(props.url)}`,
  datePublished: props.datePublished,
  dateModified: props.dateModified || props.datePublished,
  author: {
    '@type': 'Person',
    name: props.author || 'Foster Care Team',
  },
  publisher: {
    '@type': 'Organization',
    name: 'Foster Care',
    logo: {
      '@type': 'ImageObject',
      url: `${BASE_URL}/logo.png`,
    },
  },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': `${BASE_URL}${withTrailingSlash(props.url)}`,
  },
});

const generateFAQSchema = (props: FAQSchemaProps) => {
  // Filter out FAQs with empty questions or answers to prevent schema errors
  const validQuestions = props.questions.filter(q => q.question?.trim() && q.answer?.trim());
  if (validQuestions.length === 0) return null;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: validQuestions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  };
};

const generateBreadcrumbSchema = (props: BreadcrumbSchemaProps) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: props.items.map((item, index) => {
    let itemUrl: string | undefined;
    if (item.url) {
      itemUrl = item.url.startsWith('http') ? item.url : `${BASE_URL}${withTrailingSlash(item.url)}`;
    }
    return {
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: itemUrl,
    };
  }),
});

export const StructuredData = (props: StructuredDataProps) => {
  const { data: schemaSettings } = useSchemaSettings();

  let schema: object;

  switch (props.type) {
    case 'organization':
      schema = generateOrganizationSchema(schemaSettings?.organization);
      break;
    case 'localBusiness':
      schema = generateLocalBusinessSchema(props);
      break;
    case 'person':
      schema = generatePersonSchema(props);
      break;
    case 'article':
      schema = generateArticleSchema(props);
      break;
    case 'faq':
      schema = generateFAQSchema(props);
      break;
    case 'breadcrumb':
      schema = generateBreadcrumbSchema(props);
      break;
    case 'service':
      schema = generateServiceSchema(props);
      break;
    case 'website':
      schema = generateWebSiteSchema();
      break;
  }

  if (!schema) return null;

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};

export default StructuredData;
