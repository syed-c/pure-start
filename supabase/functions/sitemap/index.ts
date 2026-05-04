import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// UK Fostering Platform ONLY - No dental/dentist/UAE/USA references
const BASE_URL = "https://www.foster-care.co.uk";
const CHUNK_SIZE = 2500;

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  priority: number;
  changefreq: string;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function normalizeUrl(path: string): string {
  let cleanPath = path.startsWith('/') ? path : `/${path}`;
  cleanPath = cleanPath.replace(/\/+/g, '/');
  if (cleanPath !== '/' && !cleanPath.endsWith('/')) {
    cleanPath = cleanPath + '/';
  }
  return `${BASE_URL}${cleanPath}`;
}

function isValidSitemapUrl(loc: string): boolean {
  if (!loc || loc.length < 10) return false;
  const afterProtocol = loc.replace('https://', '');
  if (afterProtocol.includes('//')) return false;
  if (loc.endsWith('//')) return false;
  return true;
}

function generateSitemapXml(urls: SitemapUrl[]): string {
  const validUrls = urls.filter(url => isValidSitemapUrl(url.loc));
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${validUrls.map((url) => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    ${url.lastmod ? `<lastmod>${new Date(url.lastmod).toISOString().split("T")[0]}</lastmod>\n    ` : ""}<changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join("\n")}
</urlset>`;
}

function generateSitemapIndex(sitemaps: string[]): string {
  const today = new Date().toISOString().split("T")[0];
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map((sitemap) => `  <sitemap>
    <loc>${BASE_URL}/${sitemap}</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`).join("\n")}
</sitemapindex>`;
}

async function fetchAllRows(supabase: any, table: string, selectQuery: string, filters: Record<string, any> = {}) {
  const allRows: any[] = [];
  let offset = 0;
  const limit = 1000;
  
  while (true) {
    let query = supabase.from(table).select(selectQuery).range(offset, offset + limit - 1);
    
    for (const [key, value] of Object.entries(filters)) {
      query = query.eq(key, value);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error(`Error fetching ${table}:`, error);
      break;
    }
    
    if (!data || data.length === 0) break;
    
    allRows.push(...data);
    
    if (data.length < limit) break;
    offset += limit;
  }
  
  return allRows;
}

function getChunk(urls: SitemapUrl[], chunkIndex: number): SitemapUrl[] {
  const start = (chunkIndex - 1) * CHUNK_SIZE;
  return urls.slice(start, start + CHUNK_SIZE);
}

function xmlResponse(xml: string) {
  return new Response(xml, {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const sitemapType = url.searchParams.get("type") || "index";
    const chunk = url.searchParams.get("chunk") ? parseInt(url.searchParams.get("chunk")!, 10) : null;

    console.log(`Generating sitemap type: ${sitemapType}, chunk: ${chunk}`);

    // === SITEMAP INDEX ===
    if (sitemapType === "index") {
      const sitemaps = [
        "sitemap-static.xml",
        "sitemap-categories.xml",
        "sitemap-cities.xml",
        "sitemap-agencies.xml",
      ];
      return xmlResponse(generateSitemapIndex(sitemaps));
    }

    // === STATIC PAGES (UK Fostering Platform) ===
    if (sitemapType === "static") {
      const staticPages = [
        { path: "/", priority: 1.0, changefreq: "daily" },
        { path: "/search", priority: 0.9, changefreq: "daily" },
        { path: "/categories", priority: 0.8, changefreq: "weekly" },
        { path: "/about", priority: 0.7, changefreq: "monthly" },
        { path: "/contact", priority: 0.6, changefreq: "monthly" },
        { path: "/faq", priority: 0.6, changefreq: "monthly" },
        { path: "/how-it-works", priority: 0.7, changefreq: "weekly" },
        { path: "/become-foster-carer", priority: 0.9, changefreq: "daily" },
        { path: "/blog", priority: 0.7, changefreq: "weekly" },
        { path: "/sitemap", priority: 0.3, changefreq: "weekly" },
        { path: "/privacy", priority: 0.3, changefreq: "yearly" },
        { path: "/terms", priority: 0.3, changefreq: "yearly" },
        { path: "/verification-policy", priority: 0.3, changefreq: "yearly" },
        { path: "/list-your-agency", priority: 0.8, changefreq: "weekly" },
        { path: "/claim-profile", priority: 0.7, changefreq: "weekly" },
      ];

      return xmlResponse(generateSitemapXml(staticPages.map(p => ({
        loc: normalizeUrl(p.path),
        priority: p.priority,
        changefreq: p.changefreq,
      }))));
    }

    // === FOSTERING CATEGORIES (Services) ===
    if (sitemapType === "categories") {
      const urls: SitemapUrl[] = [];

      // Try fostering_categories first
      let categories = await fetchAllRows(supabase, "fostering_categories", "slug, updated_at", { is_active: true });
      
      // Fallback to agencies if no categories
      if (categories.length === 0) {
        console.log("No fostering_categories, using agencies_type from agencies table");
        const agencies = await fetchAllRows(supabase, "agencies", "id, type, updated_at", { is_active: true });
        const typeSet = new Set(agencies.map(a => a.type).filter(Boolean));
        categories = Array.from(typeSet).map(type => ({ slug: type?.toLowerCase().replace(/\s+/g, '-'), updated_at: new Date().toISOString() }));
      }

      for (const cat of categories) {
        if (!cat.slug || cat.slug.trim() === '') continue;
        urls.push({
          loc: normalizeUrl(`/categories/${cat.slug}`),
          lastmod: cat.updated_at,
          priority: 0.7,
          changefreq: "weekly",
        });
      }

      console.log(`Categories sitemap: ${urls.length} URLs`);
      return xmlResponse(generateSitemapXml(urls));
    }

    // === CITIES (UK Locations) ===
    if (sitemapType === "cities") {
      const urls: SitemapUrl[] = [];

      // Fetch active cities
      const cities = await fetchAllRows(supabase, "cities", "slug, updated_at", { is_active: true });

      for (const city of cities) {
        if (!city.slug || city.slug.trim() === '') continue;
        urls.push({
          loc: normalizeUrl(`/england/${city.slug}`),
          lastmod: city.updated_at,
          priority: 0.7,
          changefreq: "weekly",
        });
      }

      console.log(`Cities sitemap: ${urls.length} URLs`);
      return xmlResponse(generateSitemapXml(urls));
    }

    // === AGENCIES (Fostering Agencies) ===
    if (sitemapType === "agencies") {
      const allUrls: SitemapUrl[] = [];

      const agencies = await fetchAllRows(supabase, "agencies", "slug, updated_at", { is_active: true });

      for (const agency of agencies) {
        if (!agency.slug || agency.slug.trim() === '') continue;
        allUrls.push({
          loc: normalizeUrl(`/agency/${agency.slug}`),
          lastmod: agency.updated_at,
          priority: 0.6,
          changefreq: "weekly",
        });
      }

      // Handle chunking
      if (chunk && chunk > 1) {
        const chunkUrls = getChunk(allUrls, chunk);
        console.log(`Agencies sitemap chunk ${chunk}: ${chunkUrls.length} URLs`);
        return xmlResponse(generateSitemapXml(chunkUrls));
      }

      console.log(`Agencies sitemap: ${allUrls.length} URLs`);
      return xmlResponse(generateSitemapXml(allUrls));
    }

    // Default: Return index
    const sitemaps = [
      "sitemap-static.xml",
      "sitemap-categories.xml",
      "sitemap-cities.xml",
      "sitemap-agencies.xml",
    ];
    return xmlResponse(generateSitemapIndex(sitemaps));

  } catch (error) {
    console.error("Sitemap error:", error);
    return new Response("Error generating sitemap", { status: 500 });
  }
});