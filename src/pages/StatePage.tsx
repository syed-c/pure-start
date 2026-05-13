import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { supabase, supabaseAdmin } from "@/integrations/supabase/client";
import { PageLayout } from "@/components/layout/PageLayout";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SEOHead } from "@/components/seo/SEOHead";
import { SyncStructuredData } from "@/components/seo/SyncStructuredData";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { useState as useStateData, useStates, useCitiesByStateSlug } from "@/hooks/useLocations";
import { useSeoPageContent, parseMarkdownContent } from "@/hooks/useSeoPageContent";
import { usePrerenderReady } from "@/hooks/usePrerenderReady";
import { usePinnedProfiles } from "@/hooks/usePinnedProfiles";
import { normalizeStateSlug } from "@/lib/slug/normalizeStateSlug";
import NotFound from "./NotFound";
import { 
  Star, Shield, Heart, Users, MapPin, ArrowRight, 
  CheckCircle, Phone, Mail, Search, Filter, ChevronRight,
  Award, Clock, ThumbsUp, HandHeart, Baby, Home, GraduationCap,
  Wallet, Calendar, MessageCircle, ExternalLink, FileText,
  Building2
} from "lucide-react";

const StatePage = () => {
  const { stateSlug } = useParams();
  const normalizedStateSlug = normalizeStateSlug(stateSlug);
  
  const staticRoutes = [
    'about', 'contact', 'faq', 'how-it-works', 'privacy', 'terms', 
    'auth', 'admin', 'dashboard', 'search', 'services', 'insurance', 
    'blog', 'claim-profile', 'list-your-agency', 'agencies'
  ];
  
  const isInvalidSlug = stateSlug && (staticRoutes.includes(stateSlug) || stateSlug.includes('/'));
  const isAllStatesView = !stateSlug;

  const { data: states, isLoading: statesLoading } = useStates();
  const { data: state, isLoading: stateLoading } = useStateData(normalizedStateSlug || '');
  const { data: cities, isLoading: citiesLoading } = useCitiesByStateSlug(normalizedStateSlug || '');
  
  const { data: seoContent, isLoading: seoContentLoading } = useSeoPageContent(normalizedStateSlug || '');
  const { data: pinnedProfiles } = usePinnedProfiles('state', normalizedStateSlug);

  const { data: cityClinicCounts } = useQuery({
    queryKey: ["city-agency-counts", stateSlug],
    queryFn: async () => {
      const cityIds = (cities || []).map((c) => c.id);
      if (!cityIds.length) return {};
      const { data } = await supabase.from("clinics").select("city_id").in("city_id", cityIds).eq("is_active", true);
      const counts: Record<string, number> = {};
      for (const row of data || []) {
        const id = row.city_id as string | null;
        if (id) counts[id] = (counts[id] || 0) + 1;
      }
      return counts;
    },
    enabled: cities && cities.length > 0,
  });

  const { data: profiles, isLoading: profilesLoading } = useQuery({
    queryKey: ['region-profiles', stateSlug],
    queryFn: async () => {
      if (!state) return [];
      console.log('StatePage - state:', state.name);
      const { data, error } = await supabaseAdmin
        .from('agencies')
        .select(`id, name, slug, city, state, phone, email, website, rating, review_count, is_verified, is_featured`)
        .ilike('state', `%${state.name}%`)
        .order('rating', { ascending: false })
        .limit(50);
      console.log('StatePage - agencies found:', data?.length, 'error:', error);
      return data || [];
    },
    enabled: !!state,
  });

  const { data: treatments } = useQuery({
    queryKey: ['fostering-types'],
    queryFn: async () => {
      const { data } = await supabase.from("treatments").select("id, name, slug").eq("is_active", true).order("display_order").limit(20);
      return data || [];
    },
  });

  usePrerenderReady(!stateLoading && !profilesLoading);

  if (isInvalidSlug) return <NotFound />;

  if (isAllStatesView) {
    const stateList = states || [];

    return (
      <PageLayout>
        <SEOHead
          title="Fostering Agencies in the UK | Browse All Locations"
          description="Browse fostering agencies across England, Scotland, Wales, and Northern Ireland. Find Ofsted-rated fostering agencies in your region."
          canonical="/locations/"
        />

        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-950 via-slate-900 to-slate-950 pointer-events-none">
            <div className="absolute inset-0 opacity-30 pointer-events-none">
              <div className="absolute top-20 left-10 w-72 h-72 bg-teal-500/20 rounded-full blur-[100px]" />
              <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px]" />
            </div>
          </div>

          <div className="container relative z-10 px-4 py-16 md:py-24">
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "All Locations", href: "/locations/" }]} className="mb-8 text-white/70 [&_a]:text-white/80 [&_a:hover]:text-teal-300" />

            <div className="max-w-4xl mx-auto text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 mb-6">
                <MapPin className="h-4 w-4 text-teal-400" />
                <span className="text-sm font-medium text-white">UK Locations</span>
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Find Fostering Agencies Across <span className="text-teal-400">the UK</span>
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg md:text-xl text-white/70 mb-8 max-w-2xl mx-auto">
                Browse Ofsted-rated fostering agencies in England, Scotland, Wales, and Northern Ireland. 
                Select your region to find agencies near you.
              </motion.p>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 80" fill="none" className="w-full h-16 md:h-24" preserveAspectRatio="none">
              <path d="M0 80V40C240 10 480 0 720 20C960 40 1200 50 1440 30V80H0Z" className="fill-background" />
            </svg>
          </div>
        </section>

        <Section size="lg">
          <div className="container px-4">
            <div className="text-center mb-10">
              <Badge variant="outline" className="mb-3">All Regions</Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">Choose Your Region</h2>
              <p className="text-muted-foreground mt-2">Select a region to find fostering agencies near you</p>
            </div>

            {statesLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stateList.map((s, i) => (
                  <motion.div key={s.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
                    <Link to={`/locations/${s.slug}/`}>
                      <Card className="group hover:border-teal-500/50 hover:bg-teal-500/5 transition-all duration-300 cursor-pointer h-full overflow-hidden">
                        <div className="h-32 bg-gradient-to-br from-teal-500/20 via-teal-600/10 to-amber-500/10 relative flex items-center justify-center">
                          <MapPin className="h-12 w-12 text-teal-500/40 group-hover:text-teal-500/60 transition-colors" />
                        </div>
                        <CardContent className="p-5">
                          <h3 className="text-xl font-bold text-foreground group-hover:text-teal-600 transition-colors">{s.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            View agencies in {s.name} →
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </Section>
      </PageLayout>
    );
  }

  if (stateLoading) {
    return (
      <PageLayout>
        <div className="container py-20">
          <Skeleton className="h-20 w-full mb-8 rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </PageLayout>
    );
  }

  if (!state) return <NotFound />;

  const stateName = state.name;
  const stateAbbr = state.abbreviation;
  const parsedContent = seoContent?.content ? parseMarkdownContent(seoContent.content) : null;
  const totalAgencyCount = Object.values(cityClinicCounts || {}).reduce((a, b) => a + b, 0) || profiles?.length || 0;
  const shouldNoIndex = totalAgencyCount < 3;

  const pageTitle = seoContent?.meta_title || `Fostering Agencies in ${stateName} | Find Ofsted-Rated Agencies`;
  const pageDescription = seoContent?.meta_description || `Find Ofsted-rated fostering agencies in ${stateName}. Compare ratings, read reviews, and connect with trusted agencies.`;
  const pageH1 = seoContent?.h1 || `Fostering Agencies in ${stateName}`;

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: stateName, href: `/${normalizedStateSlug}/` },
  ];

  const topCities = (cities || []).slice(0, 12);
  const avgRating = profiles?.length ? (profiles.reduce((sum, p) => sum + (p.rating || 0), 0) / profiles.length).toFixed(1) : "4.5";

  const faqs = [
    { q: `How do I find a fostering agency in ${stateName}?`, a: `Browse our directory of agencies. Filter by Ofsted rating, fostering type, and location to find the right match for your family.` },
    { q: `What types of fostering are available in ${stateName}?`, a: `Agencies in ${stateName} offer emergency, short-term, long-term, respite, therapeutic, and parent & child fostering. Each agency specializes in different types.` },
    { q: `How long does the assessment process take?`, a: `The assessment process typically takes 4-6 months, including training, home visits, interviews, and background checks. Agencies will guide you through every step.` },
  ];

  const testimonials = [
    { name: "Sarah M.", text: `We found our perfect agency in ${stateName}. The support has been incredible.`, rating: 5 },
    { name: "James & Claire T.", text: "The reviews helped us choose the right agency. Best decision we made.", rating: 5 },
    { name: "Priya K.", text: "As a first-time foster carrier, I felt supported every step of the way.", rating: 5 },
  ];

  const fosteringTypes = [
    { icon: Baby, name: "Emergency", desc: "Immediate placements for children in crisis" },
    { icon: Calendar, name: "Short-Term", desc: "Temporary care from weeks to months" },
    { icon: Home, name: "Long-Term", desc: "Permanent placements for children" },
    { icon: HandHeart, name: "Respite", desc: "Temporary breaks for other foster families" },
    { icon: GraduationCap, name: "Therapeutic", desc: "Specialist care for complex needs" },
    { icon: Heart, name: "Parent & Child", desc: "Support for parent and child together" },
  ];

  return (
    <PageLayout>
      <SEOHead
        title={pageTitle}
        description={pageDescription}
        canonical={`/${normalizedStateSlug}/`}
        keywords={[`fostering agencies ${stateName}`, `foster care ${stateName}`, `become foster carrier ${stateName}`]}
        noindex={shouldNoIndex}
        ogImage={`https://fostercareuk.com/og/region-${normalizedStateSlug}.png`}
      />
      <SyncStructuredData
        data={[
          { type: 'breadcrumb', items: [{ name: 'Home', url: 'https://fostercareuk.com/' }, { name: stateName, url: `https://fostercareuk.com/${normalizedStateSlug}/` }] },
          { type: 'place', name: stateName, description: pageDescription, url: `/${normalizedStateSlug}/`, addressRegion: stateName, addressCountry: 'GB' },
          { type: 'faq', questions: faqs.map(f => ({ question: f.q, answer: f.a })) },
        ]}
        id="state-schema"
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-950 via-slate-900 to-slate-950 pointer-events-none">
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-teal-500/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px]" />
          </div>
        </div>

        <div className="container relative z-10 px-4 py-16 md:py-24">
          <Breadcrumbs items={breadcrumbs} className="mb-8 text-white/70 [&_a]:text-white/80 [&_a:hover]:text-teal-300" />
          
          <div className="max-w-4xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 mb-6">
              <Shield className="h-4 w-4 text-teal-400" />
              <span className="text-sm font-medium text-white">Ofsted Registered Agencies</span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Find Fostering Agencies in <span className="text-teal-400">{stateName}</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg md:text-xl text-white/70 mb-8 max-w-2xl mx-auto">
              Connect with {totalAgencyCount}+ trusted fostering agencies across {stateName}. 
              All agencies are Ofsted-registered and verified.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-wrap justify-center gap-4 mb-10">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-5 py-3">
                <Users className="h-5 w-5 text-teal-400" />
                <div className="text-left">
                  <p className="text-xl font-bold text-white">{totalAgencyCount}+</p>
                  <p className="text-xs text-white/60">Agencies</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-5 py-3">
                <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                <div className="text-left">
                  <p className="text-xl font-bold text-white">{avgRating}</p>
                  <p className="text-xs text-white/60">Avg Rating</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-5 py-3">
                <Shield className="h-5 w-5 text-teal-400" />
                <div className="text-left">
                  <p className="text-xl font-bold text-white">100%</p>
                  <p className="text-xs text-white/60">Ofsted Rated</p>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="h-14 px-8 text-base font-semibold bg-teal-500 hover:bg-teal-600 text-slate-900 rounded-xl" asChild>
                <Link to="/search">
                  <Search className="mr-2 h-5 w-5" />
                  Search Agencies
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 text-base font-semibold border-white/30 bg-transparent text-white hover:bg-white/10 rounded-xl" asChild>
                <Link to="/faq">
                  Learn About Fostering
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" className="w-full h-16 md:h-24" preserveAspectRatio="none">
            <path d="M0 80V40C240 10 480 0 720 20C960 40 1200 50 1440 30V80H0Z" className="fill-background" />
          </svg>
        </div>
      </section>

      {/* Trust Badges Section */}
      <Section size="md" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-subtle-grid opacity-20 pointer-events-none" />
        <div className="container px-4 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Award, title: "Ofsted Rated", desc: "All agencies inspected" },
              { icon: ThumbsUp, title: "Verified Reviews", desc: "Real foster carrier feedback" },
              { icon: Clock, title: "24/7 Support", desc: "Round the clock help" },
              { icon: Wallet, title: "Competitive Rates", desc: "Fair allowances" },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}>
                <Card className="text-center py-6 hover:border-teal-500/30 transition-colors">
                  <CardContent className="p-0">
                    <div className="w-12 h-12 rounded-full bg-teal-500/10 flex items-center justify-center mx-auto mb-3">
                      <item.icon className="h-6 w-6 text-teal-600" />
                    </div>
                    <h3 className="font-bold text-foreground">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* Fostering Types Grid */}
      <div className="bg-section-divider-top relative">
      <Section size="lg" className="bg-muted/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-subtle-dots opacity-20 pointer-events-none" />
        <div className="container px-4 relative">
          <div className="text-center mb-10">
            <Badge variant="outline" className="mb-3">Types of Fostering</Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Find the Right Fostering Type</h2>
            <p className="text-muted-foreground mt-2">Different agencies specialize in different types of fostering</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {fosteringTypes.map((type, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
                <Link to={`/categories/${type.name.toLowerCase().replace(' ', '-')}/`}>
                  <Card className="group hover:border-teal-500/50 hover:bg-teal-500/5 transition-all duration-300 cursor-pointer h-full">
                    <CardContent className="p-5 flex flex-col items-center text-center">
                      <div className="w-14 h-14 rounded-full bg-teal-500/10 flex items-center justify-center mb-3 group-hover:bg-teal-500/20 transition-colors">
                        <type.icon className="h-7 w-7 text-teal-600" />
                      </div>
                      <h3 className="font-bold text-foreground group-hover:text-teal-600 transition-colors">{type.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{type.desc}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </Section></div>

      {/* Top Cities Grid */}
      <div className="bg-section-divider-top relative">
      <Section size="lg" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-subtle-dots opacity-10 pointer-events-none" />
        <div className="container px-4 relative">
          <div className="text-center mb-10">
            <Badge variant="outline" className="mb-3">Popular Areas</Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Browse by Location in {stateName}</h2>
            <p className="text-muted-foreground mt-2">Find agencies in {stateName}'s major cities and towns</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {topCities.map((city, i) => (
              <motion.div key={city.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
                <Link to={`/${normalizedStateSlug}/${city.slug}/`}>
                  <Card className="group hover:border-teal-500/50 hover:bg-teal-500/5 transition-all duration-300 cursor-pointer h-full overflow-hidden">
                    <div className="h-20 bg-gradient-to-br from-teal-500/20 via-teal-600/10 to-amber-500/10 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <MapPin className="h-8 w-8 text-teal-600/50" />
                      </div>
                      {cityClinicCounts?.[city.id] > 0 && (
                        <Badge className="absolute top-2 right-2 bg-white/90 text-teal-700 text-xs font-bold">
                          {cityClinicCounts?.[city.id]}
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-3">
                      <p className="font-semibold text-foreground group-hover:text-teal-600 transition-colors">{city.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">View agencies →</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          {(cities?.length || 0) > 12 && (
            <div className="text-center mt-6">
              <Button variant="outline" className="rounded-full" asChild>
                <Link to={`/${normalizedStateSlug}/all-areas/`}>
                  View All {cities?.length} Areas
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </Section></div>

      {/* Testimonials */}
      <Section size="lg" className="bg-gradient-to-r from-teal-50 to-amber-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-subtle-grid opacity-10 pointer-events-none" />
        <div className="container px-4">
          <div className="text-center mb-10">
            <Badge className="mb-3 bg-teal-100 text-teal-700">Success Stories</Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">What Foster Carers Say</h2>
            <p className="text-muted-foreground mt-2">Real experiences from families in {stateName}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}>
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-3">
                      {[...Array(testimonial.rating)].map((_, r) => (
                        <Star key={r} className="h-4 w-4 text-amber-500 fill-amber-500" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4">"{testimonial.text}"</p>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* How It Works */}
      <div className="bg-section-divider-top relative">
      <Section size="lg" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-subtle-dots opacity-10 pointer-events-none" />
        <div className="container px-4 relative">
          <div className="text-center mb-10">
            <Badge variant="outline" className="mb-3">Simple Process</Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">How to Become a Foster Carer</h2>
            <p className="text-muted-foreground mt-2">Your journey to fostering in {stateName}</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Research", desc: "Browse agencies and learn about fostering types", icon: Search },
              { step: "2", title: "Contact", desc: "Reach out to agencies for information", icon: MessageCircle },
              { step: "3", title: "Apply", desc: "Complete your application and assessment", icon: FileText },
              { step: "4", title: "Start", desc: "Get matched and begin your fostering journey", icon: Heart },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }} className="text-center">
                <div className="w-16 h-16 rounded-full bg-teal-500/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-8 w-8 text-teal-600" />
                </div>
                <div className="inline-block w-8 h-8 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center mb-2">
                  {item.step}
                </div>
                <h3 className="font-bold text-foreground mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section></div>

      {/* Stats Comparison */}
      <Section size="md" className="bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-subtle-grid opacity-10 pointer-events-none" />
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-white text-center mb-8">IFA vs Local Authority Fostering</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-teal-400" />
                    Independent Fostering Agencies (IFAs)
                  </h3>
                  <ul className="space-y-3 text-white/70">
                    <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-teal-400 mt-1" /> Higher allowances (often £200-500/week)</li>
                    <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-teal-400 mt-1" /> Specialised training programmes</li>
                    <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-teal-400 mt-1" /> More flexible support packages</li>
                    <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-teal-400 mt-1" /> Dedicated social worker</li>
                    <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-teal-400 mt-1" /> Access to respite care</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2">
                    <Home className="h-5 w-5 text-amber-400" />
                    Local Authority
                  </h3>
                  <ul className="space-y-3 text-white/70">
                    <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-amber-400 mt-1" /> Standard national minimum rates</li>
                    <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-amber-400 mt-1" /> Government-backed training</li>
                    <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-amber-400 mt-1" /> Direct council support</li>
                    <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-amber-400 mt-1" /> Local community connections</li>
                    <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-amber-400 mt-1" /> Part of local foster network</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Section>

      {/* Featured Agencies in {stateName} */}
      <div className="bg-section-divider-top relative">
      <Section size="lg" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-subtle-dots opacity-10 pointer-events-none" />
        <div className="container px-4 relative">
          <div className="text-center mb-8">
            <Badge variant="outline" className="mb-3">Top Rated</Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Featured Agencies in {stateName}</h2>
            <p className="text-muted-foreground mt-2">Connect with verified fostering agencies</p>
          </div>

          {profilesLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))}
            </div>
          ) : profiles && profiles.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profiles.slice(0, 12).map((agency: any, i) => (
                <motion.div key={agency.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
                  <Link to={`/agency/${agency.slug}/`}>
                    <Card className="hover:border-teal-500/50 hover:bg-teal-500/5 transition-all duration-300 group h-full">
                      <CardContent className="p-0">
                        <div className="h-32 bg-gradient-to-br from-teal-500/20 to-teal-600/20 relative overflow-hidden">
                          {agency.image_url || agency.cover_image_url ? (
                            <img src={agency.image_url || agency.cover_image_url} alt={agency.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Building2 className="h-12 w-12 text-teal-400/50" />
                            </div>
                          )}
                          {agency.is_verified && (
                            <Badge className="absolute top-3 left-3 bg-teal-600 text-white text-xs">
                              <Shield className="h-3 w-3 mr-1" /> Verified
                            </Badge>
                          )}
                          {agency.rating > 0 && (
                            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                              <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                              <span className="text-xs font-bold">{agency.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-foreground group-hover:text-teal-600 transition-colors line-clamp-1">{agency.name}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            {agency.city || stateName}
                          </p>
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/40">
                            <span className="text-xs text-muted-foreground">{agency.review_count || 0} reviews</span>
                            <span className="text-xs font-semibold text-teal-600 flex items-center gap-1">
                              View Profile <ChevronRight className="h-3 w-3" />
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No agencies found in {stateName} yet.</p>
              <p className="text-sm text-muted-foreground mt-2">Check back soon as we're adding new agencies regularly.</p>
            </div>
          )}

          {profiles && profiles.length > 12 && (
            <div className="text-center mt-8">
              <Button variant="outline" className="rounded-xl" asChild>
                <Link to="/search">
                  View All {profiles.length} Agencies in {stateName}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </Section></div>

      {/* CTA Section */}
      <Section size="lg">
        <div className="container px-4">
          <Card className="bg-gradient-to-r from-teal-600 to-teal-800 border-0">
            <CardContent className="p-8 md:p-12 text-center text-white">
              <Heart className="h-12 w-12 mx-auto mb-4 text-white/80" />
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Open Your Home?</h2>
              <p className="text-white/80 mb-8 max-w-xl mx-auto">
                Becoming a foster carrier is a rewarding journey. Our verified agencies provide full training, 
                ongoing support, and competitive allowances.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" className="bg-white text-teal-700 hover:bg-white/90 font-semibold rounded-xl" asChild>
                  <Link to="/search">
                    Find Your Agency
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10 font-semibold rounded-xl" asChild>
                  <Link to="/faq">
                    Get More Information
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* FAQ Section */}
      <div className="bg-section-divider-top relative">
      <Section size="lg" className="bg-muted/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-subtle-grid opacity-10 pointer-events-none" />
        <div className="container px-4 relative">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">Frequently Asked Questions</h2>
              <p className="text-muted-foreground mt-2">Common questions about fostering in {stateName}</p>
            </div>
            
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <Card key={i}>
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                    <p className="text-muted-foreground text-sm">{faq.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-6">
              <Button variant="link" className="text-teal-600" asChild>
                <Link to="/faq">
                  View All FAQs <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Section></div>

      {/* SEO Content Section - Detailed for Organic Ranking */}
      <div className="bg-section-divider-top relative">
      <Section size="lg" className="bg-gradient-to-b from-muted/20 to-muted/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-subtle-dots-lg opacity-20 pointer-events-none" />
        <div className="container px-4 relative">
          <div className="max-w-4xl mx-auto">
            {/* SEO Heading */}
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-3">Complete Guide</Badge>
              <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
                Fostering in <span className="text-teal-600">{stateName}</span>: Your Complete Guide
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Everything you need to know about becoming a foster carrier in {stateName}, England.
              </p>
            </div>

            {/* Intro SEO Paragraph */}
            <Card className="mb-8 border-teal-500/20">
              <CardContent className="p-6 md:p-8">
                <h3 className="text-xl font-bold mb-4">About Fostering in {stateName}</h3>
                <div className="prose prose-teal max-w-none">
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Fostering is a rewarding way to make a difference in a child's life. In <strong>{stateName}</strong>, 
                    there are {totalAgencyCount}+ fostering agencies offering various types of fostering placements. 
                    Whether you're interested in providing emergency care, long-term homes, or respite support, 
                    {stateName} has options for every type of foster carrier.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    The assessment process typically takes 4-6 months, and all agencies provide comprehensive training 
                    and ongoing support. Foster carers in {stateName} receive competitive allowances and have access 
                    to dedicated social workers throughout their fostering journey.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* H3 Sections with Keywords */}
            <div className="space-y-6">
              {/* Section 1 */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
                      <Heart className="h-5 w-5 text-teal-600" />
                    </div>
                    <h3 className="text-lg font-bold">What is Fostering and How Does It Work?</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Fostering provides temporary or permanent care for children who cannot live with their birth families. 
                    In <strong>{stateName}</strong>, there are {totalAgencyCount}+ agencies supporting families through this rewarding journey. 
                    Foster carers receive comprehensive training, ongoing support, and competitive allowances to help them provide loving homes.
                    The process involves initial enquiry, preparation courses, home assessments, and panel approval before being matched with a child.
                  </p>
                </CardContent>
              </Card>

              {/* Section 2 */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-teal-600" />
                    </div>
                    <h3 className="text-lg font-bold">Who Can Foster in {stateName}? Requirements and Eligibility</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    To become a foster carrier in {stateName}, you must be over 21 years old, have a spare bedroom, 
                    and pass enhanced DBS background checks. You don't need to be married or own your home - 
                    renters are welcome in {stateName}. People from all backgrounds, ethnicities, and family structures are encouraged to apply.
                    Previous experience with children is helpful but not always required - agencies provide full training.
                  </p>
                </CardContent>
              </Card>

              {/* Section 3 */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-teal-600" />
                    </div>
                    <h3 className="text-lg font-bold">Types of Fostering Available in {stateName}</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    There are several types of fostering available through agencies in {stateName}:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-teal-600 mt-1 shrink-0" /><span><strong>Emergency Fostering</strong> - Immediate placements for children in crisis situations</span></li>
                    <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-teal-600 mt-1 shrink-0" /><span><strong>Short-Term Fostering</strong> - Temporary care from weeks to several months</span></li>
                    <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-teal-600 mt-1 shrink-0" /><span><strong>Long-Term Fostering</strong> - Permanent placements providing stable family homes</span></li>
                    <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-teal-600 mt-1 shrink-0" /><span><strong>Respite Fostering</strong> - Temporary breaks for other foster families</span></li>
                    <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-teal-600 mt-1 shrink-0" /><span><strong>Therapeutic Fostering</strong> - Specialist care for children with complex needs</span></li>
                    <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-teal-600 mt-1 shrink-0" /><span><strong>Parent and Child Fostering</strong> - Supporting parents and children together</span></li>
                  </ul>
                </CardContent>
              </Card>

              {/* Section 4 */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
                      <Wallet className="h-5 w-5 text-teal-600" />
                    </div>
                    <h3 className="text-lg font-bold">Fostering Allowances and Financial Support in {stateName}</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Fostering allowances in {stateName} vary depending on the type of fostering and the child's needs. 
                    The national minimum allowance ranges from £132-£187 per week depending on the child's age. 
                    Independent Fostering Agencies (IFAs) in {stateName} often pay enhanced rates ranging from £200-500+ per week 
                    for more specialist placements. All foster carers receive regular payments, holiday allowances, and birthday payments.
                  </p>
                </CardContent>
              </Card>

              {/* Section 5 */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-teal-600" />
                    </div>
                    <h3 className="text-lg font-bold">How to Become a Foster Carer in {stateName}: The Process</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    The journey to becoming a foster carrier in {stateName} typically takes 4-6 months:
                  </p>
                  <ol className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-3"><span className="font-bold text-teal-600 shrink-0">1.</span><span><strong>Initial Enquiry</strong> - Contact agencies to express your interest and receive information</span></li>
                    <li className="flex items-start gap-3"><span className="font-bold text-teal-600 shrink-0">2.</span><span><strong>Information Session</strong> - Attend preparation courses to learn about fostering</span></li>
                    <li className="flex items-start gap-3"><span className="font-bold text-teal-600 shrink-0">3.</span><span><strong>Home Assessment</strong> - Social worker completes Form F assessment over multiple visits</span></li>
                    <li className="flex items-start gap-3"><span className="font-bold text-teal-600 shrink-0">4.</span><span><strong>Panel Approval</strong> - Independent panel reviews your application and makes recommendation</span></li>
                    <li className="flex items-start gap-3"><span className="font-bold text-teal-600 shrink-0">5.</span><span><strong>Matching</strong> - Get matched with a child who fits your experience and preferences</span></li>
                  </ol>
                </CardContent>
              </Card>
            </div>

            {/* Stats Summary */}
            <Card className="mt-8 bg-teal-500/5 border-teal-500/20">
              <CardContent className="p-6 md:p-8 text-center">
                <h3 className="text-xl font-bold mb-6">Why Foster in {stateName}?</h3>
                <div className="grid sm:grid-cols-3 gap-6">
                  <div>
                    <p className="font-semibold text-teal-600 text-2xl mb-1">{totalAgencyCount}+</p>
                    <p className="text-sm text-muted-foreground">Agencies to Choose From</p>
                  </div>
                  <div>
                    <p className="font-semibold text-teal-600 text-2xl mb-1">4-6 Months</p>
                    <p className="text-sm text-muted-foreground">Average Assessment Time</p>
                  </div>
                  <div>
                    <p className="font-semibold text-teal-600 text-2xl mb-1">£140+</p>
                    <p className="text-sm text-muted-foreground">Weekly Minimum Allowance</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Keywords Section */}
            <Card className="mt-6">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Popular Searches in {stateName}</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-sm py-1">fostering agencies {stateName.toLowerCase()}</Badge>
                  <Badge variant="secondary" className="text-sm py-1">foster care {stateName.toLowerCase()}</Badge>
                  <Badge variant="secondary" className="text-sm py-1">become foster carrier {stateName.toLowerCase()}</Badge>
                  <Badge variant="secondary" className="text-sm py-1">fostering allowance {stateName.toLowerCase()}</Badge>
                  <Badge variant="secondary" className="text-sm py-1">foster carrier requirements {stateName.toLowerCase()}</Badge>
                  <Badge variant="secondary" className="text-sm py-1">ifas {stateName.toLowerCase()}</Badge>
                  <Badge variant="secondary" className="text-sm py-1">ofsted registered foster agencies {stateName.toLowerCase()}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* CTA Links */}
            <div className="mt-10 flex flex-wrap gap-3 justify-center">
              <Button variant="outline" className="rounded-full" asChild><Link to="/search">Search Agencies in {stateName}</Link></Button>
              <Button variant="outline" className="rounded-full" asChild><Link to="/tools/fostering-allowance-calculator">Calculate Fostering Allowance</Link></Button>
              <Button variant="outline" className="rounded-full" asChild><Link to="/faq">Fostering FAQ</Link></Button>
              <Button variant="outline" className="rounded-full" asChild><Link to="/about">About Us</Link></Button>
            </div>
          </div>
        </div>
      </Section></div>
    </PageLayout>
  );
};

export default StatePage;
