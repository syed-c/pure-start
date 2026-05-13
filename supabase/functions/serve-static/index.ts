// Serve-static edge function for SEO prerendered pages
// Referenced in vercel.json for bot-only traffic
// This function serves pre-rendered static HTML for SEO-critical pages

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Only serve bot traffic (this function is called via Vercel rewrite rules
  // that check for bot user-agent headers)
  
  // Map paths to pre-rendered content
  // This is a fallback - in production, use a proper static generation pipeline
  // or a service like Prerender.io (already configured via /api/prerender)
  
  const staticPages: Record<string, string> = {
    '/robots.txt': 'User-agent: *\nAllow: /\nSitemap: https://www.foster-care.co.uk/sitemap.xml\n',
    '/sitemap.xml': '', // Sitemap is dynamically generated
  };

  const contentType = getContentType(path);
  
  if (staticPages[path]) {
    return new Response(staticPages[path], {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }

  // For unknown paths, return a 404 with a minimal HTML shell
  // so bots don't see empty responses
  return new Response(
    '<!DOCTYPE html><html><head><title>Foster Care UK</title></head><body><h1>Foster Care UK</h1><p>Loading...</p></body></html>',
    {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=600',
      },
      status: 200,
    }
  );
}

function getContentType(path: string): string {
  if (path.endsWith('.xml')) return 'application/xml';
  if (path.endsWith('.txt')) return 'text/plain';
  if (path.endsWith('.json')) return 'application/json';
  if (path.endsWith('.html')) return 'text/html';
  if (path.endsWith('.css')) return 'text/css';
  if (path.endsWith('.js')) return 'application/javascript';
  return 'text/html';
}