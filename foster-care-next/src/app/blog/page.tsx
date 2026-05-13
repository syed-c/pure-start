import { Metadata } from 'next';
import { getBlogPosts } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Foster Care Blog | Tips, Guides & News',
  description: 'Read the latest articles about fostering in the UK. Tips for foster parents, guides for agencies, and news about foster care.',
  keywords: ['foster care blog UK', 'foster parenting tips', 'foster care news', 'becoming a foster car'],
  alternates: {
    canonical: 'https://www.foster-care.co.uk/blog',
  },
  openGraph: {
    title: 'Foster Care Blog | Tips, Guides & News',
    description: 'Read the latest articles about fostering in the UK.',
    url: 'https://www.foster-care.co.uk/blog',
    siteName: 'Foster Care UK',
    locale: 'en_GB',
    type: 'website',
    images: [
      {
        url: 'https://www.foster-care.co.uk/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Foster Care UK Blog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Foster Care Blog | Tips, Guides & News',
    description: 'Read the latest articles about fostering in the UK.',
    images: ['https://www.foster-care.co.uk/og-image.jpg'],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: 'Foster Care UK Blog',
  description: 'Tips, guides and news about fostering in the UK',
  url: 'https://www.foster-care.co.uk/blog',
};

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main>
      <section className="py-20 bg-gradient-to-b from-[#0a0a0f] to-[#0f0f14]">
        <div className="container px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white text-center">Foster Care Blog</h1>
          <p className="text-slate-400 text-lg mt-4 text-center max-w-2xl mx-auto">
            Tips, guides and news about fostering in the UK
          </p>
        </div>
      </section>

      <section className="py-12 bg-[#0f0f14]">
        <div className="container px-4">
          {posts.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <a
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group p-6 rounded-xl bg-white/5 border border-white/10 hover:border-[#f97316] transition-colors"
                >
                  <h2 className="text-xl font-semibold text-white group-hover:text-[#f97316] transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-slate-400 text-sm mt-2 line-clamp-3">{post.excerpt}</p>
                  <p className="text-slate-500 text-xs mt-4">
                    {new Date(post.published_at).toLocaleDateString('en-GB')}
                  </p>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-400">No blog posts yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>
      </main>
    </div>
  );
}