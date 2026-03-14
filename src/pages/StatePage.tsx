import { useMemo } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageLayout } from "@/components/layout/PageLayout";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { DentistListFrame } from "@/components/location";
import { SEOContentBlock } from "@/components/seo/SEOContentBlock";
import { PageIntroSection } from "@/components/seo/PageIntroSection";
import { GeographicLinkBlock } from "@/components/seo/GeographicLinkBlock";
import { BudgetFilterSidebar, useBudgetFilters } from "@/components/filters";
import { Skeleton } from "@/components/ui/skeleton";
import { SEOHead } from "@/components/seo/SEOHead";
import { StructuredData } from "@/components/seo/StructuredData";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { useState as useStateData, useCitiesByStateSlug } from "@/hooks/useLocations";
import { useSeoPageContent, parseMarkdownContent, parseFaqFromContent } from "@/hooks/useSeoPageContent";
import { usePrerenderReady } from "@/hooks/usePrerenderReady";
import { usePinnedProfiles, sortWithPinnedFirst } from "@/hooks/usePinnedProfiles";
import { normalizeStateSlug } from "@/lib/slug/normalizeStateSlug";
import NotFound from "./NotFound";
import { 
  Star, Shield, Clock, Building2, ArrowRight, SlidersHorizontal
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const StatePage = () => {
  const { stateSlug } = useParams();

  const normalizedStateSlug = normalizeStateSlug(stateSlug);
  
  // Check if this is actually a static page route or reserved path
  const staticRoutes = [
    'about', 'contact', 'faq', 'how-it-works', 'privacy', 'terms', 
    'auth', 'admin', 'dashboard', 'search', 'services', 'insurance', 
    'blog', 'claim-profile', 'list-your-practice', 'onboarding', 
    'gmb-select', 'find-dentist', 'clinic', 'dentist', 'sitemap',
    'pricing', 'appointment', 'review', 'rq', 'tools', 'emergency-dentist',
    'editorial-policy', 'medical-review-policy', 'verification-policy',
    'home-v2', 'dashboard-v2', 'form', 'book'
  ];
  
  const isInvalidSlug = !stateSlug || staticRoutes.includes(stateSlug) || stateSlug.includes('/');

  // All hooks must be called before any conditional returns
  const { data: state, isLoading: stateLoading } = useStateData(normalizedStateSlug || '');
  const { data: cities, isLoading: citiesLoading } = useCitiesByStateSlug(normalizedStateSlug || '');
  
  // Fetch SEO content from seo_pages table
  const { data: seoContent, isLoading: seoContentLoading, isFetching: seoContentFetching } = useSeoPageContent(normalizedStateSlug || '');

  // IMPORTANT: Don't hide content during background refetches - only show loading state when no data exists
  const isSeoContentPending = !seoContent && (seoContentLoading || seoContentFetching);

  // Fetch pinned profiles for this state page
  const { data: pinnedProfiles } = usePinnedProfiles('state', normalizedStateSlug);

  // City-level clinic counts (fallback when dentist_count is 0)
  const cityIds = (cities || []).map((c) => c.id);
  const { data: cityClinicCounts } = useQuery({
    queryKey: ["city-clinic-counts", stateSlug, cityIds.join(",")],
    queryFn: async () => {
      if (!cityIds.length) return {} as Record<string, number>;

      const { data, error } = await supabase
        .from("clinics")
        .select("city_id")
        .in("city_id", cityIds)
        .eq("is_active", true);

      if (error) throw error;

      const counts: Record<string, number> = {};
      for (const row of data || []) {
        const id = row.city_id as string | null;
        if (!id) continue;
        counts[id] = (counts[id] || 0) + 1;
      }
      return counts;
    },
    enabled: cityIds.length > 0,
  });

  // Fetch profiles for this state - includes pinned clinics explicitly
  const MIN_PROFILES = 10;

  const { data: rawProfiles, isLoading: profilesLoading } = useQuery({
    queryKey: ['state-profiles', stateSlug, pinnedProfiles?.map(p => p.id).join(',')],
    queryFn: async () => {
      if (!state) return [];
      
      const pinnedIds = (pinnedProfiles || []).map(p => p.id);
      
      const { data: stateCities } = await supabase
        .from('cities')
        .select('id')
        .eq('state_id', state.id);
      
      const stateCityIds = (stateCities || []).map(c => c.id);
      
      let clinics: any[] = [];
      
      if (stateCityIds.length > 0) {
        const { data } = await supabase
          .from('clinics')
          .select(`
            id, name, slug, description, cover_image_url, rating, review_count,
            address, phone, verification_status, claim_status,
            city:cities(name, slug, state:states(name, abbreviation))
          `)
          .in('city_id', stateCityIds)
          .eq('is_active', true)
          .order('rating', { ascending: false })
          .limit(50);
        clinics = data || [];
      }
      
      // Fallback: if fewer than MIN_PROFILES, fill from UK-wide agencies
      if (clinics.length < MIN_PROFILES) {
        const existingIds = clinics.map(c => c.id);
        const needed = MIN_PROFILES - clinics.length;
        let fallbackQuery = supabase
          .from('clinics')
          .select(`
            id, name, slug, description, cover_image_url, rating, review_count,
            address, phone, verification_status, claim_status,
            city:cities(name, slug, state:states(name, abbreviation))
          `)
          .eq('is_active', true)
          .order('rating', { ascending: false })
          .limit(needed);
        
        if (existingIds.length > 0) {
          fallbackQuery = fallbackQuery.not('id', 'in', `(${existingIds.join(',')})`);
        }
        
        const { data: fallbackData } = await fallbackQuery;
        clinics = [...clinics, ...(fallbackData || [])];
      }
      
      // If there are pinned IDs not in the result, fetch them separately
      const resultIds = new Set(clinics.map(c => c.id));
      const missingPinnedIds = pinnedIds.filter(id => !resultIds.has(id));
      
      let pinnedClinics: any[] = [];
      if (missingPinnedIds.length > 0) {
        const { data: extraPinned } = await supabase
          .from('clinics')
          .select(`
            id, name, slug, description, cover_image_url, rating, review_count,
            address, phone, verification_status, claim_status,
            city:cities(name, slug, state:states(name, abbreviation))
          `)
          .in('id', missingPinnedIds)
          .eq('is_active', true);
        pinnedClinics = extraPinned || [];
      }
      
      // Combine and dedupe
      const seenIds = new Set<string>();
      const allClinics = [...clinics, ...pinnedClinics].filter(c => {
        if (seenIds.has(c.id)) return false;
        seenIds.add(c.id);
        return true;
      });
      
      return allClinics.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        type: 'clinic' as const,
        specialty: 'Fostering Agency',
        location: c.city ? `${c.city.name}, ${c.city.state?.name || c.city.state?.abbreviation || ''}` : '',
        rating: c.rating || 0,
        reviewCount: c.review_count || 0,
        image: c.cover_image_url,
        isVerified: c.verification_status === 'verified',
        isClaimed: c.claim_status === 'claimed',
        isPinned: false,
      }));
    },
    enabled: !!state,
  });

  // Sort profiles with pinned ones first
  const profiles = useMemo(() => {
    if (!rawProfiles) return [];
    const sorted = sortWithPinnedFirst(rawProfiles, pinnedProfiles || []);
    // Mark pinned profiles
    const pinnedIds = new Set((pinnedProfiles || []).map(p => p.id));
    return sorted.map(p => ({ ...p, isPinned: pinnedIds.has(p.id) }));
  }, [rawProfiles, pinnedProfiles]);

  // Filters for state page (same as city page)
  const { filters: stateFilters, setFilters: setStateFilters } = useBudgetFilters();

  const filteredStateProfiles = useMemo(() => {
    let result = [...profiles];
    if (stateFilters.minRating > 0) {
      result = result.filter(p => (p.rating || 0) >= stateFilters.minRating);
    }
    if (stateFilters.verifiedOnly) {
      result = result.filter(p => p.isVerified);
    }
    return result;
  }, [profiles, stateFilters]);

  const hasActiveStateFilters = stateFilters.maxBudget !== null || stateFilters.minRating > 0 || stateFilters.verifiedOnly;
  const { data: treatments, isLoading: treatmentsLoading } = useQuery({
    queryKey: ["treatments"],
    queryFn: async () => {
      const { data } = await supabase
        .from("treatments")
        .select("*")
        .eq("is_active", true)
        .order("display_order")
        .limit(8);
      return data || [];
    },
  });

  // Signal prerender when ALL data is ready (including SEO content)
  const isDataReady = !stateLoading && !citiesLoading && !profilesLoading && !treatmentsLoading && !seoContentLoading && !seoContentFetching && !!state;
  usePrerenderReady(isDataReady);

  // Now check for invalid slug after all hooks
  if (isInvalidSlug) {
    return <NotFound />;
  }

  // Redirect legacy full-name state slugs to canonical abbreviation slugs
  if (stateSlug && normalizedStateSlug && stateSlug !== normalizedStateSlug) {
    return <Navigate to={`/${normalizedStateSlug}/`} replace />;
  }

  if (stateLoading) {
    return (
      <PageLayout>
        <div className="container py-12">
          <Skeleton className="h-12 w-64 mb-4" />
          <Skeleton className="h-6 w-96" />
        </div>
      </PageLayout>
    );
  }

  if (!state) {
    return <NotFound />;
  }

  const stateName = state.name;
  const stateAbbr = state.abbreviation;

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: stateName },
  ];

  // Parse SEO content if available
  const parsedContent = seoContent?.content ? parseMarkdownContent(seoContent.content) : null;
  // Use dedicated faqs column first, fallback to parsing from content for legacy pages
  const seoFaqs = seoContent?.faqs && Array.isArray(seoContent.faqs) && seoContent.faqs.length > 0
    ? seoContent.faqs
    : seoContent?.content ? parseFaqFromContent(seoContent.content) : [];

  // Use SEO content if optimized, otherwise use defaults
  const pageTitle = seoContent?.meta_title || `Find Fostering Agencies in ${stateName} - Trusted Agencies`;
  const pageDescription = seoContent?.meta_description || `Find Ofsted-rated fostering agencies in ${stateName}. Compare agencies across ${cities?.length || 0}+ cities.`;
  const pageH1 = seoContent?.h1 || `Fostering Agencies in ${stateName}`;

  // Use SEO FAQs if available, otherwise use defaults
  const faqs = seoFaqs.length > 0 ? seoFaqs.map(f => ({ q: f.question, a: f.answer })) : [
    {
      q: `How do I find a fostering agency in ${stateName}?`,
      a: `Browse our verified list of agencies across ${stateName}. Select your city, then filter by fostering type and rating to find the perfect match.`,
    },
    {
      q: `Are agencies in ${stateName} Ofsted registered?`,
      a: `All agencies listed are Ofsted-registered. Agencies with the "Verified" badge have completed our additional verification process.`,
    },
    {
      q: `What cities in ${stateName} do you cover?`,
      a: `We cover major cities across ${stateName} including ${cities?.slice(0, 5).map(c => c.name).join(', ') || 'multiple locations'}. More cities are being added regularly.`,
    },
    {
      q: `How do I become a foster carer?`,
      a: `Contact agencies in ${stateName} through our directory. They will guide you through the assessment process which typically takes 4-6 months.`,
    },
  ];

  const totalClinicCount = Object.values(cityClinicCounts || {}).reduce((a, b) => a + b, 0) || profiles?.length || 0;
  const popularTreatments = (treatments || []).map(t => ({ name: t.name, slug: t.slug }));

  return (
    <PageLayout>
      <SEOHead
        title={pageTitle}
        description={pageDescription}
        canonical={`/${normalizedStateSlug}/`}
        keywords={[`fostering agencies ${stateName}`, `foster care ${stateName}`, `find fostering agency ${stateName}`, 'become a foster carer']}
      />
      <StructuredData
        type="breadcrumb"
        items={[
          { name: 'Home', url: '/' },
          { name: stateName, url: `/${normalizedStateSlug}/` },
        ]}
      />
      <StructuredData
        type="faq"
        questions={faqs.map(f => ({ question: f.q, answer: f.a }))}
      />
      
      {/* Hero - Dark Gradient */}
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-teal/10 rounded-full blur-[100px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>
        <div className="container px-4 relative z-10">
          <div className="flex justify-center mb-4">
            <Breadcrumbs items={breadcrumbs} className="text-white/60 [&_a]:text-white/80 [&_a:hover]:text-primary" />
          </div>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">Ofsted Rated Agencies</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">
              {pageH1.includes(stateName) ? (
                <>{pageH1.split(stateName)[0]}<span className="text-primary">{stateName}</span></>
              ) : (
                pageH1
              )}
            </h1>
            <p className="text-lg text-white/60 mb-8 max-w-2xl mx-auto">
              Discover trusted fostering agencies across {stateName}. Browse by city, compare reviews, and start your fostering journey.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {[
                { icon: Building2, value: `${totalClinicCount}+`, label: "Agencies" },
                { icon: Star, value: "4.8", label: "Avg Rating" },
                { icon: Shield, value: "Ofsted", label: "Verified" },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-1.5 bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 backdrop-blur-sm">
                  <s.icon className="h-4 w-4 text-primary" />
                  <span className="font-bold text-sm text-white">{s.value}</span>
                  <span className="text-xs text-white/50">{s.label}</span>
                </div>
              ))}
            </div>
            <Link to="/search">
              <Button size="lg" className="h-12 px-8 font-bold rounded-xl shadow-lg shadow-primary/30">
                Find an Agency <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Page Intro Section - CMS Content */}
      <PageIntroSection
        title={parsedContent?.sections?.[0]?.heading || `About Fostering in ${stateName}`}
        content={(seoContent as any)?.page_intro || parsedContent?.intro || parsedContent?.sections?.[0]?.content || `Discover trusted fostering agencies across ${stateName}. Browse by city, compare reviews, and start your fostering journey.`}
        isLoading={isSeoContentPending}
      />

      {/* Main Content: Agencies + Filters */}
      <Section size="lg">
        <div className="container px-4">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 max-w-6xl mx-auto">
            {/* Mobile Filter Button */}
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full rounded-xl font-bold gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[320px] p-0">
                  <SheetHeader className="p-4 border-b">
                    <SheetTitle>Filter Results</SheetTitle>
                  </SheetHeader>
                  <div className="overflow-y-auto max-h-[calc(100vh-80px)]">
                    <BudgetFilterSidebar
                      filters={stateFilters}
                      onFiltersChange={setStateFilters}
                      availableServices={treatments?.map(t => ({ id: t.id, name: t.name, slug: t.slug })) || []}
                      locationName={stateName}
                      totalResults={filteredStateProfiles?.length || 0}
                      className="border-0 rounded-none shadow-none"
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-72 shrink-0">
              <div className="sticky top-24">
                <BudgetFilterSidebar
                  filters={stateFilters}
                  onFiltersChange={setStateFilters}
                  availableServices={treatments?.map(t => ({ id: t.id, name: t.name, slug: t.slug })) || []}
                  locationName={stateName}
                  totalResults={filteredStateProfiles?.length || 0}
                />
              </div>
            </aside>

            {/* Main Content Column */}
            <div className="flex-1 min-w-0 space-y-8">
              <DentistListFrame
                profiles={filteredStateProfiles}
                isLoading={profilesLoading}
                locationName={stateName}
                emptyMessage={`We're adding fostering agencies in ${stateName}. Check back soon!`}
                hasActiveFilters={hasActiveStateFilters}
                onClearFilters={() => setStateFilters({ maxBudget: null, minRating: 0, verifiedOnly: false, selectedServices: [] })}
                maxHeight={700}
                initialCount={10}
              />
            </div>
          </div>
        </div>
      </Section>

      {/* SECTION 3: Areas (Text Links) */}
      <Section size="md">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <span className="inline-block text-xs font-bold text-primary uppercase tracking-widest mb-2">Browse by Area</span>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Areas in <span className="text-primary">{stateName}</span>
            </h2>
          </div>
          
          {citiesLoading ? (
            <div className="flex flex-wrap gap-2">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-28 rounded-full" />
              ))}
            </div>
          ) : cities && cities.length > 0 ? (
            <div className="flex flex-wrap gap-x-1 gap-y-1.5">
              {cities.map((city, i) => (
                <span key={city.id}>
                  <Link
                    to={`/${normalizedStateSlug}/${city.slug}/`}
                    className="text-primary hover:text-primary/80 font-semibold hover:underline transition-colors"
                  >
                    {city.name}
                  </Link>
                  {i < cities.length - 1 && <span className="text-muted-foreground mx-1">·</span>}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">We're adding areas in {stateName}. Check back soon!</p>
          )}
        </div>
      </Section>

      {/* SEO Content Section */}
      <Section size="lg">
        <div className="max-w-5xl mx-auto">
          <SEOContentBlock
            variant="state"
            locationName={stateName}
            stateAbbr={stateAbbr}
            stateSlug={stateSlug}
            clinicCount={totalClinicCount}
            cityCount={cities?.length || 0}
            parsedContent={parsedContent}
            popularTreatments={popularTreatments}
            isLoading={seoContentLoading || seoContentFetching}
          />
        </div>
      </Section>

      {/* SECTION 5: FAQ */}
      <Section size="lg" className="bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-block text-xs font-bold text-primary uppercase tracking-widest mb-2">Have Questions?</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Frequently Asked <span className="text-primary">Questions</span>
            </h2>
          </div>
          
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="bg-card border border-border rounded-2xl px-6 data-[state=open]:border-primary/30"
              >
                <AccordionTrigger className="text-left font-bold hover:no-underline py-5">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Section>

      {/* SECTION 6: Geographic Link Block - SEO Authority Distribution */}
      <Section size="md">
        <div className="max-w-5xl mx-auto">
          <GeographicLinkBlock
            pageType="state"
            stateSlug={normalizedStateSlug || ''}
            stateName={stateName}
            topCities={(cities || []).slice(0, 8).map(c => ({ name: c.name, slug: c.slug }))}
            services={popularTreatments}
          />
        </div>
      </Section>

      {/* SECTION 7: Services Links */}
      {treatments && treatments.length > 0 && (
        <Section size="md">
          <div className="max-w-4xl mx-auto">
            <span className="inline-block text-xs font-bold text-primary uppercase tracking-widest mb-2">Browse Services</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-6">
              Fostering Types in <span className="text-primary">{stateName}</span>
            </h2>
            <div className="flex flex-wrap gap-x-2 gap-y-2">
              {treatments.map((treatment, idx) => (
                <span key={treatment.id} className="inline-flex items-center">
                  <Link
                    to={`/${normalizedStateSlug}/${treatment.slug}/`}
                    className="text-primary hover:text-primary/80 font-semibold hover:underline transition-colors"
                  >
                    {treatment.name}
                  </Link>
                  {idx < treatments.length - 1 && <span className="text-muted-foreground ml-2">·</span>}
                </span>
              ))}
            </div>
          </div>
        </Section>
      )}
    </PageLayout>
  );
};

export default StatePage;
