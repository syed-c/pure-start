import { Metadata } from 'next';
import { getBlogPosts, getBlogPost } from '@/lib/data';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  
  if (!post) {
    return {
      title: 'Blog | Foster Care UK',
    };
  }
  
  return {
    title: `${post.title} | Foster Care UK`,
    description: post.excerpt || post.content.slice(0, 160),
    alternates: {
      canonical: `https://www.foster-care.co.uk/blog/${slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  const posts = await getBlogPosts();

  if (!post) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Post not found</h1>
          <a href="/blog" className="text-[#f97316] mt-4 inline-block">Back to Blog</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <article>
        <header className="py-20 bg-gradient-to-b from-[#0a0a0f] to-[#0f0f14]">
          <div className="container px-4 max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white">{post.title}</h1>
            <p className="text-slate-400 mt-4">
              {new Date(post.published_at).toLocaleDateString('en-GB', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </p>
          </div>
        </header>

        <div className="py-12 bg-[#0f0f14]">
          <div className="container px-4 max-w-3xl mx-auto">
            <div 
              className="prose prose-invert prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        </div>
      </article>

      <section className="py-12 bg-[#0a0a0f]">
        <div className="container px-4">
          <h2 className="text-2xl font-bold text-white mb-6">Recent Posts</h2>
          <div className="grid gap-4">
            {posts.filter(p => p.slug !== slug).slice(0, 3).map((p) => (
              <a
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-[#f97316] transition-colors"
              >
                <h3 className="text-lg font-semibold text-white">{p.title}</h3>
                <p className="text-slate-400 text-sm mt-2 line-clamp-2">{p.excerpt}</p>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}