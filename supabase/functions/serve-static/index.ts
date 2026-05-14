// Serve-static edge function for SEO prerendered pages
// Referenced in vercel.json for bot-only traffic
// This function serves a proper SPA shell so bots at least get meta tags
// For full prerendering, see /api/prerender (Prerender.io)

export const config = {
  runtime: 'edge',
};

function buildSpaShell(path: string): string {
  const title = "Foster Care UK — Find Trusted Fostering Agencies";
  const description = "Browse verified Ofsted-registered fostering agencies across England, Scotland, Wales, and Northern Ireland. Compare ratings, read reviews, and connect with agencies.";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <link rel="canonical" href="https://www.foster-care.co.uk${path}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://www.foster-care.co.uk${path}" />
  <meta name="robots" content="index, follow" />
  <script>window.prerenderReady = false;</script>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/assets/index.js"></script>
</body>
</html>`;
}

export default async function handler(request: Request) {
  const url = new URL(request.url);
  const path = url.searchParams.get('path') || url.pathname;

  const ignoreExtensions = [
    '.js', '.css', '.xml', '.png', '.jpg', '.jpeg', '.gif', '.pdf',
    '.ico', '.svg', '.webp', '.woff', '.woff2', '.ttf', '.mp4', '.webm'
  ];

  if (ignoreExtensions.some(ext => path.endsWith(ext))) {
    return new Response(null, { status: 200 });
  }

  const html = buildSpaShell(path);

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
