import { getCities, getFosteringCategories, getBlogPosts } from '@/lib/data';

export default async function sitemap() {
  const baseUrl = 'https://www.foster-care.co.uk';
  
  const cities = await getCities();
  const categories = await getFosteringCategories();
  const posts = await getBlogPosts();
  
  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1 },
    { url: `${baseUrl}/fostering-types`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${baseUrl}/locations/england`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
  ];
  
  const cityPages = cities.map((city) => ({
    url: `${baseUrl}/locations/england/${city.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));
  
  const categoryPages = categories.map((cat) => ({
    url: `${baseUrl}/fostering-types/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));
  
  const categoryLocationPages = [];
  for (const city of cities.slice(0, 12)) {
    for (const cat of categories) {
      categoryLocationPages.push({
        url: `${baseUrl}/fostering-agencies/${city.slug}/${cat.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      });
    }
  }
  
  const blogPages = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.published_at),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));
  
  return [
    ...staticPages,
    ...cityPages,
    ...categoryPages,
    ...categoryLocationPages,
    ...blogPages,
  ];
}