import { Link } from "react-router-dom";
import { 
  MapPin, Home, Building2, FileText, ChevronRight,
  Info, HelpCircle, Shield, FileCheck, BookOpen, Phone, UserPlus, CheckCircle,
  Sparkles, Globe, ArrowRight, Search, Star
} from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHero } from "@/components/layout/PageHero";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useStates, useCities } from "@/hooks/useLocations";
import { useTreatments } from "@/hooks/useTreatments";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import SEOHead from "@/components/seo/SEOHead";
import { usePrerenderReady } from "@/hooks/usePrerenderReady";

const SitemapPage = () => {
  const { data: states, isLoading: statesLoading } = useStates();
  const { data: cities, isLoading: citiesLoading } = useCities();
  const { data: fosteringTypes, isLoading: typesLoading } = useTreatments();

  const { data: blogPosts, isLoading: blogLoading } = useQuery({
    queryKey: ['sitemap-blog-posts'],
    queryFn: async () => {
      const { data } = await supabase.from('blog_posts').select('title, slug').eq('status', 'published').order('published_at', { ascending: false }).limit(50);
      return data || [];
    }
  });

  const { data: agenciesData, isLoading: agenciesLoading } = useQuery({
    queryKey: ['sitemap-agencies'],
    queryFn: async () => {
      // Updated to use agencies table
      const { count } = await supabase.from('agencies').select('*', { count: 'exact', head: true }).eq('is_active', true).eq('is_duplicate', false);
      const { data } = await supabase.from('agencies').select('name, slug, city:cities(name)').eq('is_active', true).eq('is_duplicate', false).order('name').limit(100);
      return { agencies: data || [], count: count || 0 };
    }
  });

  const agencies = agenciesData?.agencies || [];
  const totalAgencies = agenciesData?.count || 0;

  const { data: citiesWithAgencies } = useQuery({
    queryKey: ['cities-with-agencies-count'],
    queryFn: async () => {
      const { data } = await supabase.from('clinics').select('city_id').eq('is_active', true).eq('is_duplicate', false);
      return new Set(data?.map(c => c.city_id).filter(Boolean)).size;
    }
  });

  const mainPages = [
    { name: "Home", path: "/", icon: Home, description: "Find fostering agencies" },
    { name: "Find an Agency", path: "/search", icon: Search, description: "Search fostering agencies" },
    { name: "About Us", path: "/about", icon: Info, description: "Our mission & story" },
    { name: "How It Works", path: "/how-it-works", icon: HelpCircle, description: "How Foster Care works" },
    { name: "Contact", path: "/contact", icon: Phone, description: "Get in touch" },
    { name: "FAQs", path: "/faq", icon: HelpCircle, description: "Common questions" },
    { name: "Blog", path: "/blog", icon: BookOpen, description: "Fostering resources & guides" },
  ];

  const forAgencies = [
    { name: "List Your Agency", path: "/list-your-agency", icon: UserPlus, description: "Get more enquiries" },
    { name: "Claim Profile", path: "/claim-profile", icon: CheckCircle, description: "Own your listing" },
  ];

  const legalPages = [
    { name: "Privacy Policy", path: "/privacy", icon: Shield },
    { name: "Terms of Service", path: "/terms", icon: FileCheck },
  ];

  const citiesByState = cities?.reduce((acc, city) => {
    const stateSlug = (city as any).state?.slug || 'other';
    const stateName = (city as any).state?.name || 'Other';
    if (!acc[stateSlug]) acc[stateSlug] = { name: stateName, cities: [] };
    acc[stateSlug].cities.push(city);
    return acc;
  }, {} as Record<string, { name: string; cities: typeof cities }>) || {};

  const breadcrumbs = [{ label: "Home", href: "/" }, { label: "Sitemap" }];

  const totalPages = mainPages.length + forAgencies.length + legalPages.length +
    (states?.length || 0) + (citiesWithAgencies || cities?.length || 0) + (fosteringTypes?.length || 0) +
    totalAgencies + (blogPosts?.length || 0);

  const isDataReady = !statesLoading && !citiesLoading && !typesLoading && !agenciesLoading;
  usePrerenderReady(isDataReady);

  return (
    <PageLayout>
      <SEOHead
        title="Sitemap | Foster Care"
        description="Navigate all pages on Foster Care — find fostering agencies, locations, fostering types, and resources across England & the UK."
        canonical="/sitemap"
      />

      <PageHero
        title="Complete Site Directory"
        highlight="Navigate Every Page"
        description="Explore our comprehensive directory of fostering agencies, locations, and resources across England & the UK."
        breadcrumbs={breadcrumbs}
        size="sm"
      />

      {/* Stats Bar */}
      <section className="py-6 bg-primary/5 border-y">
        <div className="container">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{states?.length || 0}</div>
              <div className="text-sm text-muted-foreground font-medium">Regions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{citiesWithAgencies || cities?.length || 0}</div>
              <div className="text-sm text-muted-foreground font-medium">Cities</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{fosteringTypes?.length || 0}</div>
              <div className="text-sm text-muted-foreground font-medium">Fostering Types</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{totalAgencies.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground font-medium">Agencies</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{totalPages.toLocaleString()}+</div>
              <div className="text-sm text-muted-foreground font-medium">Total Pages</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container">
          {/* XML Sitemap Notice */}
          <div className="mb-12 p-6 rounded-3xl bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border border-primary/20">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center"><Globe className="h-6 w-6 text-primary" /></div>
                <div>
                  <h3 className="font-bold text-lg">XML Sitemap for Search Engines</h3>
                  <p className="text-muted-foreground text-sm">Submit to Google Search Console for better indexing</p>
                </div>
              </div>
              <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors shadow-lg">
                View sitemap.xml <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Main Pages & For Agencies Row */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="rounded-3xl bg-gradient-to-br from-background to-muted/30 border p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><Sparkles className="h-5 w-5 text-primary" /></div>
                <h2 className="text-xl font-bold">Main Pages</h2>
              </div>
              <div className="grid gap-3">
                {mainPages.map((page) => (
                  <Link key={page.path} to={page.path} className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 transition-colors group">
                    <page.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <div className="flex-1">
                      <span className="font-medium group-hover:text-primary transition-colors">{page.name}</span>
                      <span className="text-sm text-muted-foreground ml-2">— {page.description}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              <div className="rounded-3xl bg-gradient-to-br from-coral/5 to-coral/10 border border-coral/20 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-coral/20 flex items-center justify-center"><Building2 className="h-5 w-5 text-coral" /></div>
                  <h2 className="text-xl font-bold">For Fostering Agencies</h2>
                </div>
                <div className="grid gap-3">
                  {forAgencies.map((page) => (
                    <Link key={page.path} to={page.path} className="flex items-center gap-3 p-3 rounded-xl hover:bg-coral/10 transition-colors group">
                      <page.icon className="h-5 w-5 text-muted-foreground group-hover:text-coral transition-colors" />
                      <div className="flex-1">
                        <span className="font-medium group-hover:text-coral transition-colors">{page.name}</span>
                        <span className="text-sm text-muted-foreground ml-2">— {page.description}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-coral transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl bg-muted/30 border p-6">
                <div className="flex items-center gap-3 mb-4"><FileCheck className="h-5 w-5 text-muted-foreground" /><h3 className="font-semibold">Legal</h3></div>
                <div className="flex flex-wrap gap-4">
                  {legalPages.map((page) => (
                    <Link key={page.path} to={page.path} className="text-muted-foreground hover:text-primary transition-colors">{page.name}</Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Fostering Types Section */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-gold/20 flex items-center justify-center"><Home className="h-5 w-5 text-gold" /></div>
              <h2 className="text-xl font-bold">Fostering Types</h2>
              {fosteringTypes && <Badge variant="secondary" className="ml-2">{fosteringTypes.length} types</Badge>}
            </div>
            {typesLoading ? (
              <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}</div>
            ) : (
              <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                <Link to="/services" className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-gold/10 to-gold/5 border border-gold/20 hover:border-gold/40 transition-colors group">
                  <Star className="h-5 w-5 text-gold" /><span className="font-semibold text-gold">All Types</span><ArrowRight className="h-4 w-4 text-gold ml-auto" />
                </Link>
                {fosteringTypes?.map((type) => (
                  <Link key={type.slug} to={`/services/${type.slug}`} className="flex items-center gap-3 p-4 rounded-2xl bg-muted/30 border hover:border-primary/40 hover:bg-primary/5 transition-colors group">
                    <span className="font-medium group-hover:text-primary transition-colors">{type.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Locations Section */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><MapPin className="h-5 w-5 text-primary" /></div>
              <h2 className="text-xl font-bold">Locations</h2>
              {states && <Badge variant="secondary" className="ml-2">{states.length} Regions</Badge>}
              {cities && <Badge variant="outline" className="ml-2">{cities.length} Cities</Badge>}
            </div>
            {statesLoading || citiesLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-3xl" />)}</div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {states?.map((state) => {
                  const stateCities = citiesByState[state.slug]?.cities || [];
                  return (
                    <div key={state.slug} className="rounded-3xl bg-gradient-to-br from-background to-muted/30 border p-6 hover:shadow-lg transition-shadow">
                      <Link to={`/${state.slug}`} className="flex items-center gap-3 mb-4 group">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><MapPin className="h-5 w-5 text-primary" /></div>
                        <div className="flex-1">
                          <h3 className="font-bold group-hover:text-primary transition-colors">{state.name}</h3>
                          <p className="text-sm text-muted-foreground">{stateCities.length} cities</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </Link>
                      <div className="flex flex-wrap gap-2">
                        {stateCities.slice(0, 8).map((city) => (
                          <Link key={city.slug} to={`/${state.slug}/${city.slug}`} className="text-sm px-3 py-1 rounded-full bg-muted hover:bg-primary/10 hover:text-primary transition-colors">{city.name}</Link>
                        ))}
                        {stateCities.length > 8 && <span className="text-sm px-3 py-1 text-muted-foreground">+{stateCities.length - 8} more</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Agencies Section */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-accent/30 flex items-center justify-center"><Building2 className="h-5 w-5 text-accent-foreground" /></div>
              <h2 className="text-xl font-bold">Fostering Agencies</h2>
              {totalAgencies > 0 && <Badge variant="secondary" className="ml-2">{totalAgencies.toLocaleString()} agencies</Badge>}
            </div>
            {agenciesLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}</div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {agencies?.slice(0, 20).map((agency) => (
                  <Link key={agency.slug} to={`/agency/${agency.slug}`} className="flex flex-col p-4 rounded-2xl bg-muted/30 border hover:border-primary/40 hover:bg-primary/5 transition-colors group">
                    <span className="font-medium group-hover:text-primary transition-colors line-clamp-1">{agency.name}</span>
                    {(agency as any).city?.name && <span className="text-sm text-muted-foreground">{(agency as any).city.name}</span>}
                  </Link>
                ))}
                {agencies && agencies.length > 20 && (
                  <Link to="/search" className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors text-primary font-semibold">
                    View All Agencies <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Blog Section */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><FileText className="h-5 w-5 text-primary" /></div>
              <h2 className="text-xl font-bold">Blog & Resources</h2>
              {blogPosts && <Badge variant="secondary" className="ml-2">{blogPosts.length} articles</Badge>}
            </div>
            {blogLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}</div>
            ) : blogPosts && blogPosts.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link to="/blog" className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 hover:border-primary/40 transition-colors group">
                  <BookOpen className="h-5 w-5 text-primary" /><span className="font-semibold text-primary">All Blog Posts</span><ArrowRight className="h-4 w-4 text-primary ml-auto" />
                </Link>
                {blogPosts.map((post) => (
                  <Link key={post.slug} to={`/blog/${post.slug}`} className="flex items-center p-4 rounded-2xl bg-muted/30 border hover:border-primary/40 hover:bg-primary/5 transition-colors group">
                    <span className="font-medium group-hover:text-primary transition-colors line-clamp-1">{post.title}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No blog posts published yet.</p>
            )}
          </div>

          {/* Type + Location Matrix */}
          <div className="rounded-3xl bg-gradient-to-br from-primary/5 via-background to-accent/5 border p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><Sparkles className="h-5 w-5 text-primary" /></div>
              <div>
                <h2 className="text-xl font-bold">Fostering Type + Location Pages</h2>
                <p className="text-sm text-muted-foreground">Dedicated pages for every fostering type in every city</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {states?.slice(0, 3).flatMap((state) => {
                const stateCities = citiesByState[state.slug]?.cities || [];
                return stateCities.slice(0, 3).flatMap((city) =>
                  fosteringTypes?.slice(0, 2).map((type) => (
                    <Link key={`${state.slug}-${city.slug}-${type.slug}`} to={`/${state.slug}/${city.slug}/${type.slug}`}
                      className="text-sm px-4 py-2 rounded-full bg-muted hover:bg-primary/10 hover:text-primary transition-colors text-center">
                      {type.name} in {city.name}
                    </Link>
                  ))
                );
              })}
            </div>
            {fosteringTypes && cities && (
              <p className="text-sm text-muted-foreground mt-6 text-center">
                <span className="font-semibold text-primary">{fosteringTypes.length * (cities?.length || 0)}+</span> total type-location combinations available
              </p>
            )}
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default SitemapPage;
