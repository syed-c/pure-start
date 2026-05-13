import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: Request) {
  const baseUrl = process.env.SITE_URL || 'https://www.foster-care.co.uk';
  
  const urls: { loc: string; lastmod: string; changefreq: string; priority: number }[] = [];

  // 1. Static pages
  const staticPages = [
    { loc: '/', priority: 1.0 },
    { loc: '/search', priority: 0.9 },
    { loc: '/categories', priority: 0.9 },
    { loc: '/about', priority: 0.7 },
    { loc: '/contact', priority: 0.7 },
    { loc: '/blog', priority: 0.8 },
    { loc: '/faqs', priority: 0.6 },
    { loc: '/privacy', priority: 0.4 },
    { loc: '/terms', priority: 0.4 },
  ];

  staticPages.forEach(page => {
    urls.push({
      loc: `${baseUrl}${page.loc}`,
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: page.priority
    });
  });

  // 2. Fetch categories from constants
  const categories = [
    'short-term-fostering',
    'long-term-fostering', 
    'emergency-fostering',
    'therapeutic-fostering',
    'respite-fostering',
    'parent-and-child-fostering',
    'disability-complex-needs-fostering',
    'kinship-fostering',
    'independent-fostering-agency',
    'local-authority-fostering',
  ];

  categories.forEach(cat => {
    urls.push({
      loc: `${baseUrl}/categories/${cat}`,
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: 0.8
    });
  });

  // 3. Fetch cities from database
  try {
    const { data: cities } = await supabase
      .from('cities')
      .select('slug, updated_at')
      .eq('is_active', true);

    if (cities) {
      cities.forEach((city: any) => {
        urls.push({
          loc: `${baseUrl}/fostering-agencies/${city.slug}`,
          lastmod: city.updated_at || new Date().toISOString(),
          changefreq: 'weekly',
          priority: 0.7
        });

        // Category + Location combinations
        categories.slice(0, 6).forEach(cat => {
          urls.push({
            loc: `${baseUrl}/fostering-agencies/${city.slug}/${cat}`,
            lastmod: city.updated_at || new Date().toISOString(),
            changefreq: 'weekly',
            priority: 0.6
          });
        });
      });
    }
  } catch (e) {
    console.error('Error fetching cities:', e);
  }

  // 4. Fetch agencies from database
  try {
    const { data: agencies } = await supabase
      .from('agencies')
      .select('slug, updated_at, is_active, is_claimed')
      .eq('is_active', true)
      .neq('is_duplicate', true)
      .order('rating', { ascending: false })
      .limit(500);

    if (agencies) {
      agencies.forEach((agency: any) => {
        urls.push({
          loc: `${baseUrl}/agency/${agency.slug}`,
          lastmod: agency.updated_at || new Date().toISOString(),
          changefreq: 'monthly',
          priority: 0.6
        });
      });
    }
  } catch (e) {
    console.error('Error fetching agencies:', e);
  }

  // 5. Fetch blog posts
  try {
    const { data: blogs } = await supabase
      .from('blog_posts')
      .select('slug, updated_at, status')
      .eq('status', 'published');

    if (blogs) {
      blogs.forEach((blog: any) => {
        urls.push({
          loc: `${baseUrl}/blog/${blog.slug}`,
          lastmod: blog.updated_at || new Date().toISOString(),
          changefreq: 'monthly',
          priority: 0.5
        });
      });
    }
  } catch (e) {
    console.error('Error fetching blogs:', e);
  }

  // Generate XML sitemap
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
