import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageLayout } from "@/components/layout/PageLayout";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SEOHead } from "@/components/seo/SEOHead";
import { StructuredData } from "@/components/seo/StructuredData";
import { useRealCounts } from "@/hooks/useRealCounts";
import { Calendar, User, ArrowRight, Clock, Tag, MapPin, Search, Star, Sparkles, BookOpen, TrendingUp, Heart } from "lucide-react";
import { format } from "date-fns";

const BlogPage = () => {
  const { data: counts } = useRealCounts();

  const { data: posts, isLoading } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false });
      return data || [];
    },
  });

  const { data: featuredPosts } = useQuery({
    queryKey: ["featured-posts"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("blog_posts")
        .select("*")
        .eq("status", "published")
        .eq("is_featured", true)
        .order("published_at", { ascending: false })
        .limit(3);
      return data || [];
    },
  });

  const { data: popularStates } = useQuery({
    queryKey: ["popular-states-blog"],
    queryFn: async () => {
      const { data } = await supabase
        .from("states")
        .select("name, slug")
        .eq("is_active", true)
        .order("display_order")
        .limit(5);
      return data || [];
    },
  });

  const { data: popularTreatments } = useQuery({
    queryKey: ["popular-treatments-blog"],
    queryFn: async () => {
      const { data } = await supabase
        .from("treatments")
        .select("name, slug")
        .eq("is_active", true)
        .order("display_order")
        .limit(8);
      return data || [];
    },
  });

  const categories = ["Foster Care", "Carer Stories", "Agency News", "Advice & Tips", "Regulations"];

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Blog" },
  ];

  return (
    <PageLayout>
      <SEOHead
        title="Fostering Blog — Tips, Carer Stories & Agency News | Foster Connect"
        description="Expert fostering advice, carer stories, and the latest news from fostering agencies across the UK. Learn about becoming a foster carer, regulations, and more."
        canonical="/blog/"
        keywords={['fostering blog', 'foster carer advice', 'fostering tips', 'foster care stories', 'UK fostering news']}
      />
      <StructuredData
        type="breadcrumb"
        items={breadcrumbs.map(b => ({ name: b.label, url: b.href }))}
      />

      {/* Hero */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">Fostering Insights</p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6">
              Fostering <span className="text-primary">Blog</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
              Expert advice, carer stories, and the latest fostering news from across the United Kingdom.
            </p>
            <div className="flex flex-wrap justify-center gap-3 text-sm">
              <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="font-medium">{posts?.length || 0} Articles</span>
              </div>
              <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-2">
                <Heart className="h-4 w-4 text-coral" />
                <span className="font-medium">Carer Stories</span>
              </div>
              <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-2">
                <Clock className="h-4 w-4 text-gold" />
                <span className="font-medium">Updated Weekly</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts && featuredPosts.length > 0 && (
        <Section size="md" className="-mt-8 relative z-10">
          <div className="grid md:grid-cols-3 gap-6">
            {featuredPosts.map((post: any, i: number) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className={`card-modern overflow-hidden group ${i === 0 ? "md:col-span-2 md:row-span-2" : ""}`}
              >
                <div className={`relative ${i === 0 ? "h-80 md:h-full" : "h-48"}`}>
                  {post.featured_image_url ? (
                    <img
                      src={post.featured_image_url}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/10 to-gold/20" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-primary text-primary-foreground rounded-full">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  </div>
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <Badge className="w-fit bg-white/20 backdrop-blur-sm text-white rounded-full mb-3">
                      {post.category || "Fostering"}
                    </Badge>
                    <h3 className={`font-display font-bold text-white group-hover:text-primary transition-colors ${i === 0 ? "text-2xl md:text-3xl" : "text-lg"}`}>
                      {post.title}
                    </h3>
                    {i === 0 && post.excerpt && (
                      <p className="text-white/70 mt-2 line-clamp-2">{post.excerpt}</p>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-sm text-white/60">
                      {post.author_name && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {post.author_name}
                        </span>
                      )}
                      {post.published_at && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(post.published_at), "MMM d, yyyy")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* Categories */}
      <Section variant="muted" size="sm">
        <div className="flex flex-wrap justify-center gap-3">
          <Button variant="default" className="rounded-full font-bold">
            All Posts
          </Button>
          {categories.map((cat) => (
            <Button key={cat} variant="outline" className="rounded-full font-bold">
              {cat}
            </Button>
          ))}
        </div>
      </Section>

      {/* Main Content Grid */}
      <Section size="lg">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Posts Grid */}
          <div className="lg:col-span-2">
            <SectionHeader
              label="Latest Articles"
              title="All Blog"
              highlight="Posts"
            />

            {isLoading ? (
              <div className="grid md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="card-modern p-0">
                    <Skeleton className="h-48 rounded-t-xl" />
                    <div className="p-5 space-y-3">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : posts && posts.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    to={`/blog/${post.slug}`}
                    className="card-modern overflow-hidden group card-hover"
                  >
                    <div className="h-48 relative overflow-hidden">
                      {post.featured_image_url ? (
                        <img
                          src={post.featured_image_url}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/10 to-gold/20 flex items-center justify-center">
                          <BookOpen className="h-12 w-12 text-primary/40" />
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        {post.category && (
                          <Badge variant="secondary" className="rounded-full text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {post.category}
                          </Badge>
                        )}
                        {post.published_at && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(post.published_at), "MMM d, yyyy")}
                          </span>
                        )}
                      </div>
                      <h3 className="font-display text-lg font-bold group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-4 text-sm font-bold text-primary">
                        Read More
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 card-modern">
                <BookOpen className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="font-display text-xl font-bold mb-2">No posts yet</h3>
                <p className="text-muted-foreground">
                  We're working on bringing you great fostering content. Check back soon!
                </p>
              </div>
            )}

            {posts && posts.length > 9 && (
              <div className="text-center mt-8">
                <Button variant="outline" size="lg" className="rounded-2xl font-bold">
                  Load More Posts
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Search CTA */}
            <div className="card-modern p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Find an Agency</h3>
                  <p className="text-sm text-muted-foreground">In your area</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Browse {counts?.clinics?.toLocaleString() || "500+"}+ verified fostering agencies and start your journey today.
              </p>
              <Button asChild className="w-full rounded-xl font-bold">
                <Link to="/search">
                  Search Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Browse by Region */}
            <div className="card-modern p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-primary" />
                <h3 className="font-bold">Find by Region</h3>
              </div>
              <div className="space-y-2">
                {popularStates?.map((state) => (
                  <Link
                    key={state.slug}
                    to={`/${state.slug}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-primary/10 transition-colors group"
                  >
                    <span className="font-medium group-hover:text-primary">{state.name}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                  </Link>
                ))}
                <Link
                  to="/search"
                  className="flex items-center justify-center p-3 rounded-xl border border-dashed border-border hover:border-primary hover:text-primary transition-colors text-sm font-medium"
                >
                  View All Regions
                </Link>
              </div>
            </div>

            {/* Popular Fostering Types */}
            <div className="card-modern p-6">
              <div className="flex items-center gap-2 mb-4">
                <Star className="h-5 w-5 text-gold" />
                <h3 className="font-bold">Fostering Types</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {popularTreatments?.map((treatment) => (
                  <Link
                    key={treatment.slug}
                    to={`/categories/${treatment.slug}`}
                    className="px-3 py-1.5 text-sm rounded-full bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    {treatment.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Newsletter CTA */}
            <div className="card-modern p-6 bg-gradient-to-br from-gold/10 to-gold/5 border-gold/20">
              <h3 className="font-bold text-lg mb-2">Stay Updated</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get the latest fostering tips and news delivered to your inbox.
              </p>
              <Button asChild variant="outline" className="w-full rounded-xl font-bold border-gold/30 hover:bg-gold/10">
                <Link to="/contact">Subscribe</Link>
              </Button>
            </div>
          </aside>
        </div>
      </Section>

      {/* CTA */}
      <Section variant="primary" size="md">
        <div className="text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Ready to Find Your Agency?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Browse our directory of verified fostering agencies across the United Kingdom.
          </p>
          <Button asChild size="lg" variant="secondary" className="rounded-2xl font-bold">
            <Link to="/search">
              Find an Agency
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </Section>
    </PageLayout>
  );
};

export default BlogPage;
