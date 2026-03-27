import { useState as useReactState, useMemo } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { PageLayout } from "@/components/layout/PageLayout";
import { ConversationalQABlock, AIDiscoveryMeta } from "@/components/ai-seo";
import { generateCityQA } from "@/lib/ai-seo/generateQAContent";
import { Section } from "@/components/layout/Section";
import { SearchBox } from "@/components/SearchBox";
import { BudgetFilterSidebar, useBudgetFilters } from "@/components/filters";
import { DentistListFrame, LocationQuickLinks } from "@/components/location";
import { SEOContentBlock } from "@/components/seo/SEOContentBlock";
import { PageIntroSection } from "@/components/seo/PageIntroSection";
import { GeographicLinkBlock } from "@/components/seo/GeographicLinkBlock";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SEOHead } from "@/components/seo/SEOHead";
import { SyncStructuredData } from "@/components/seo/SyncStructuredData";
import { InternalLinkBlock, generateCityInternalLinks } from "@/components/seo/InternalLinkBlock";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { useCity, useState as useStateData, useCitiesByStateSlug } from "@/hooks/useLocations";
import { useSeoPageContent, parseMarkdownContent, parseFaqFromContent } from "@/hooks/useSeoPageContent";
import { usePrerenderReady } from "@/hooks/usePrerenderReady";
import { usePinnedProfiles, sortWithPinnedFirst } from "@/hooks/usePinnedProfiles";
import { useAreaLocalContent, generateAreaIntro } from "@/hooks/useAreaLocalContent";
import { normalizeStateSlug } from "@/lib/slug/normalizeStateSlug";
import { RichContentSections } from "@/components/seo/RichContentSections";
import NotFound from "./NotFound";
import StateServicePage from "./StateServicePage";
import { 
  Star, 
  Users,
  Clock,
  Shield,
  SlidersHorizontal
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const MIN_AGENCY_COUNT = 2; // noindex pages with fewer than 2 agencies
const MIN_PROFILES = 10; // Minimum profiles to show on a city page

const CityPage = () => {
  const { stateSlug, citySlug } = useParams();
  const normalizedStateSlug = normalizeStateSlug(stateSlug);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useReactState(false);
  const { filters, setFilters } = useBudgetFilters();
  
  const { data: state, isLoading: stateLoading } = useStateData(normalizedStateSlug || '');
  const { data: city, isLoading: cityLoading } = useCity(citySlug || '', normalizedStateSlug || '');

  // Check if "citySlug" is actually a treatment slug (for state-level service pages like /dubai/teeth-whitening/)
  const { data: treatmentMatch, isLoading: treatmentMatchLoading } = useQuery({
    queryKey: ['treatment-match', citySlug],
    queryFn: async () => {
      const { data } = await supabase
        .from('treatments')
        .select('id, name, slug, description')
        .eq('slug', citySlug || '')
        .eq('is_active', true)
        .maybeSingle();
      return data;
    },
    enabled: !!citySlug,
  });

  // Fetch SEO content from seo_pages table
  const seoSlug = `${normalizedStateSlug || ''}/${citySlug || ''}`;
  const { data: seoContent, isLoading: seoContentLoading, isFetching: seoContentFetching } = useSeoPageContent(seoSlug);

  // IMPORTANT: Don't hide content during background refetches - only show loading state when no data exists
  const isSeoContentPending = !seoContent && (seoContentLoading || seoContentFetching);

  // Fetch pinned profiles for this city page
  const { data: pinnedProfiles } = usePinnedProfiles('city', normalizedStateSlug, citySlug);

  // Get area-specific local content for unique page differentiation
  const areaLocalContent = useAreaLocalContent(citySlug);

  // Fetch TOTAL clinic count for this city (for SEO content - not limited)
  const { data: totalClinicCount } = useQuery({
    queryKey: ['city-clinic-count', city?.id],
    queryFn: async () => {
      if (!city) return 0;
      const { count, error } = await supabase
        .from('clinics')
        .select('id', { count: 'exact', head: true })
        .eq('city_id', city.id)
        .eq('is_active', true);
      if (error) return 0;
      return count || 0;
    },
    enabled: !!city,
  });

  // Fetch profiles for this city (limited for display)
  const { data: rawProfiles, isLoading: profilesLoading } = useQuery({
    queryKey: ['city-profiles', citySlug, pinnedProfiles?.map(p => p.id).join(',')],
    queryFn: async () => {
      if (!city) return [];
      
      const pinnedIds = (pinnedProfiles || []).map(p => p.id);
      
      const { data: clinics } = await supabase
        .from('clinics')
        .select(`
          id, name, slug, description, cover_image_url, rating, review_count,
          address, phone, verification_status, claim_status,
          city:cities(name, slug, state:states(name, abbreviation))
        `)
        .eq('city_id', city.id)
        .eq('is_active', true)
        .order('rating', { ascending: false })
        .limit(50);
      
      let allClinics = clinics || [];
      
      // Fallback: if fewer than MIN_PROFILES, fill from UK-wide agencies
      if (allClinics.length < MIN_PROFILES) {
        const existingIds = allClinics.map(c => c.id);
        const needed = MIN_PROFILES - allClinics.length;
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
        allClinics = [...allClinics, ...(fallbackData || [])];
      }
      
      const resultIds = new Set(allClinics.map(c => c.id));
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
      
      const seenIds = new Set<string>();
      const combined = [...allClinics, ...pinnedClinics].filter(c => {
        if (seenIds.has(c.id)) return false;
        seenIds.add(c.id);
        return true;
      });
      
      return combined.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        type: 'clinic' as const,
        specialty: 'Fostering Agency',
        location: c.city ? `${c.city.name}, ${c.city.state?.abbreviation || ''}` : '',
        rating: c.rating || 0,
        reviewCount: c.review_count || 0,
        image: c.cover_image_url,
        isVerified: c.verification_status === 'verified',
        isClaimed: c.claim_status === 'claimed',
        isPinned: false,
      }));
    },
    enabled: !!city,
  });

  // Sort profiles with pinned ones first and apply filters
  const filteredProfiles = useMemo(() => {
    if (!rawProfiles) return [];
    const sorted = sortWithPinnedFirst(rawProfiles, pinnedProfiles || []);
    const pinnedIds = new Set((pinnedProfiles || []).map(p => p.id));
    let result = sorted.map(p => ({ ...p, isPinned: pinnedIds.has(p.id) }));
    
    if (filters.minRating > 0) {
      result = result.filter(p => (p.rating || 0) >= filters.minRating);
    }
    if (filters.verifiedOnly) {
      result = result.filter(p => p.isVerified);
    }
    
    return result;
  }, [rawProfiles, pinnedProfiles, filters]);

  const profiles = filteredProfiles;

  // Fetch treatments
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

  // Fetch nearby cities for internal linking
  const { data: nearbyCities, isLoading: nearbyCitiesLoading } = useCitiesByStateSlug(normalizedStateSlug || '');

  // Signal prerender when ALL SEO-critical data loads
  // Includes: location data, profiles (for listings), treatments, nearby cities (internal links), and SEO content
  const isDataReady = !stateLoading && !cityLoading && !profilesLoading && !treatmentsLoading && !nearbyCitiesLoading && !seoContentLoading && !seoContentFetching;
  usePrerenderReady(isDataReady, { delay: 600 });

  if (!stateSlug || !citySlug) {
    return <NotFound />;
  }

  if (stateSlug && normalizedStateSlug && stateSlug !== normalizedStateSlug) {
    return <Navigate to={`/${normalizedStateSlug}/${citySlug}/`} replace />;
  }

  if (stateSlug === "clinic") {
    return <Navigate to={`/clinic/${citySlug}/`} replace />;
  }
  if (stateSlug === "dentist") {
    return <Navigate to={`/dentist/${citySlug}/`} replace />;
  }
  
  if (stateLoading || cityLoading) {
    return (
      <PageLayout>
        <div className="container py-12">
          <Skeleton className="h-12 w-64 mb-4" />
          <Skeleton className="h-6 w-96" />
        </div>
      </PageLayout>
    );
  }

  if (!state || !city) {
    // If city not found but the slug matches a treatment, render state-level service page
    if (state && !city && treatmentMatch && !treatmentMatchLoading) {
      return (
        <StateServicePage
          stateSlug={stateSlug || ''}
          serviceSlug={citySlug || ''}
          stateName={state.name}
          stateId={state.id}
          treatment={treatmentMatch}
        />
      );
    }
    // Still loading treatment check
    if (!city && treatmentMatchLoading) {
      return (
        <PageLayout>
          <div className="container py-12">
            <Skeleton className="h-12 w-64 mb-4" />
            <Skeleton className="h-6 w-96" />
          </div>
        </PageLayout>
      );
    }
    return <NotFound />;
  }

  const cityName = city.name;
  const stateName = state.name;
  const stateAbbr = state.abbreviation;
  const locationDisplay = `${cityName}, ${stateAbbr}`;

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: stateName, href: `/${normalizedStateSlug}/` },
    { label: cityName },
  ];

  // Parse SEO content
  const parsedContent = seoContent?.content ? parseMarkdownContent(seoContent.content) : null;
  // Use dedicated faqs column first, fallback to parsing from content for legacy pages
  const seoFaqs = seoContent?.faqs && Array.isArray(seoContent.faqs) && seoContent.faqs.length > 0
    ? seoContent.faqs
    : seoContent?.content ? parseFaqFromContent(seoContent.content) : [];

  const pageTitle = seoContent?.meta_title || `Best Fostering Agencies in ${cityName}, ${stateAbbr} - Find Agencies`;
  const pageDescription = seoContent?.meta_description || `Find trusted fostering agencies in ${cityName}, ${stateName}. Compare ${profiles?.length || 0}+ Ofsted-rated agencies.`;
  const pageH1 = seoContent?.h1 || `Fostering Agencies in ${locationDisplay}`;
  
  const faqs = seoFaqs.length > 0 ? seoFaqs.map(f => ({ q: f.question, a: f.answer })) : [
    {
      q: `How do I find a fostering agency in ${cityName}?`,
      a: `Browse our verified list of fostering agencies in ${cityName}. Look for Ofsted ratings, carer reviews, and fostering types that match your needs.`,
    },
    {
      q: `Are the agencies in ${cityName} Ofsted registered?`,
      a: `All agencies listed are Ofsted-registered or regulated by the relevant authority. Agencies with the "Verified" badge have completed our additional verification process.`,
    },
    {
      q: `What types of fostering are available in ${cityName}?`,
      a: `Agencies in ${cityName} offer various fostering types including emergency, respite, long-term, short-term, therapeutic, and parent & child fostering.`,
    },
    {
      q: `How do I become a foster carer in ${cityName}?`,
      a: `Contact agencies in ${cityName} through our directory. The process typically takes 4-6 months and includes training, home visits, and assessments.`,
    },
  ];

  const shouldNoIndex = !profilesLoading && (!profiles || profiles.length < MIN_AGENCY_COUNT);

  const popularTreatments = (treatments || []).map(t => ({ name: t.name, slug: t.slug }));
  const nearbyLocations = (nearbyCities || [])
    .filter(c => c.slug !== citySlug)
    .slice(0, 6)
    .map(c => ({ name: c.name, slug: c.slug }));

  const hasActiveFilters = filters.maxBudget !== null || filters.minRating > 0 || filters.verifiedOnly;

  return (
    <PageLayout>
      <SEOHead
        title={pageTitle}
        description={pageDescription}
        canonical={`/${normalizedStateSlug}/${citySlug}/`}
        keywords={[`fostering agencies ${cityName}`, `foster care ${cityName} ${stateAbbr}`, `best fostering agency ${cityName}`]}
        noindex={shouldNoIndex}
      />
      {/* Synchronous JSON-LD structured data for SEO */}
      <SyncStructuredData
        data={[
          {
            type: 'breadcrumb',
            items: [
              { name: 'Home', url: '/' },
              { name: stateName, url: `/${normalizedStateSlug}/` },
              { name: cityName, url: `/${normalizedStateSlug}/${citySlug}/` },
            ],
          },
          {
            type: 'faq',
            questions: faqs.map(f => ({ question: f.q, answer: f.a })),
          },
          {
            type: 'itemList',
            name: `Fostering Agencies in ${cityName}, ${stateAbbr}`,
            description: `Top-rated fostering agencies in ${cityName}`,
            items: (profiles || []).slice(0, 10).map((p, i) => ({
              name: p.name,
              url: `/clinic/${p.slug}/`,
              position: i + 1,
              image: p.image,
            })),
          },
          {
            type: 'place' as const,
            name: cityName,
            description: `Find the best fostering agencies in ${cityName}, ${stateName}`,
            url: `/${normalizedStateSlug}/${citySlug}/`,
            containedInPlace: stateName,
          },
        ]}
        id="city-page-schema"
      />
      
      {/* Hero - Dark Gradient */}
      <section className="relative py-14 md:py-22 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-80 h-80 bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-teal/10 rounded-full blur-[100px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>
        <div className="container px-4 relative z-10">
          <div className="flex justify-center mb-4">
            <Breadcrumbs items={breadcrumbs} className="text-white/60 [&_a]:text-white/80 [&_a:hover]:text-primary" />
          </div>
          <div className="max-w-3xl mx-auto text-center">
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">
              Ofsted Rated Agencies
            </motion.p>
            <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-3 text-white">
              {pageH1.includes(cityName) ? (
                <>{pageH1.split(cityName)[0]}<span className="text-primary">{cityName}</span>{pageH1.split(cityName)[1] || ''}</>
              ) : (
                pageH1
              )}
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
              className="text-sm md:text-base lg:text-lg text-white/60 mb-6 max-w-2xl mx-auto">
              {areaLocalContent.hasLocalContext
                ? `Discover fostering agencies serving ${areaLocalContent.demographics} in this ${areaLocalContent.character} community.`
                : `Find trusted fostering agencies in ${cityName}. Compare Ofsted-rated agencies and read carer reviews.`
              }
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="max-w-xl md:max-w-2xl mx-auto mb-6">
              <SearchBox variant="hero" stateSlug={stateSlug} defaultCity={`${citySlug}|${stateSlug}`} />
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="flex flex-wrap justify-center gap-2">
              {[
                { icon: Users, value: `${profiles?.length || 0}+`, label: "Agencies" },
                { icon: Star, value: "4.8", label: "Rating" },
                { icon: Shield, value: "Ofsted", label: "Verified" },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-1.5 bg-white/10 border border-white/10 rounded-xl px-3 py-2 backdrop-blur-sm">
                  <s.icon className="h-3.5 w-3.5 text-primary" />
                  <span className="font-bold text-sm text-white">{s.value}</span>
                  <span className="text-xs text-white/50">{s.label}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Page Intro Section - CMS Content */}
      <PageIntroSection
        title={parsedContent?.sections?.[0]?.heading || `About Fostering in ${cityName}`}
        content={(seoContent as any)?.page_intro || parsedContent?.intro || parsedContent?.sections?.[0]?.content || generateAreaIntro(cityName, stateName, totalClinicCount || profiles?.length || 0, areaLocalContent)}
        isLoading={isSeoContentPending}
      />

      {/* Main Content: Agencies + SEO Content */}
      <Section size="lg">
        <div className="container px-4">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Mobile Filter Button */}
            <div className="lg:hidden">
              <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full rounded-xl font-bold gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                    {hasActiveFilters && (
                      <span className="bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {(filters.maxBudget !== null ? 1 : 0) + (filters.minRating > 0 ? 1 : 0) + (filters.verifiedOnly ? 1 : 0)}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[320px] p-0">
                  <SheetHeader className="p-4 border-b">
                    <SheetTitle>Filter Results</SheetTitle>
                  </SheetHeader>
                  <div className="overflow-y-auto max-h-[calc(100vh-80px)]">
                    <BudgetFilterSidebar
                      filters={filters}
                      onFiltersChange={setFilters}
                      availableServices={treatments?.map(t => ({ id: t.id, name: t.name, slug: t.slug })) || []}
                      locationName={cityName}
                      totalResults={profiles?.length || 0}
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
                  filters={filters}
                  onFiltersChange={setFilters}
                  availableServices={treatments?.map(t => ({ id: t.id, name: t.name, slug: t.slug })) || []}
                  locationName={cityName}
                  totalResults={profiles?.length || 0}
                />
              </div>
            </aside>
            
            {/* Main Content Column */}
            <div className="flex-1 min-w-0 space-y-8">
              {/* Agency List Frame */}
              <DentistListFrame
                profiles={profiles}
                isLoading={profilesLoading}
                locationName={cityName}
                hasActiveFilters={hasActiveFilters}
                onClearFilters={() => setFilters({ maxBudget: null, minRating: 0, verifiedOnly: false, selectedServices: [] })}
                maxHeight={700}
                initialCount={10}
              />

              {/* SEO Content Block */}
              <SEOContentBlock
                variant="city"
                locationName={cityName}
                stateName={stateName}
                stateAbbr={stateAbbr}
                stateSlug={stateSlug}
                citySlug={citySlug}
                clinicCount={totalClinicCount || profiles?.length || 0}
                parsedContent={parsedContent}
                popularTreatments={popularTreatments}
                nearbyLocations={nearbyLocations}
                isLoading={isSeoContentPending}
              />

              {/* SEO Internal Links - 8-15 contextual links for crawlability */}
              <InternalLinkBlock
                title="Explore Fostering Options"
                links={generateCityInternalLinks(
                  normalizedStateSlug || '',
                  citySlug || '',
                  cityName,
                  stateName,
                  popularTreatments,
                  nearbyLocations
                )}
                variant="grid"
                showDescriptions
                className="mt-8"
              />

              {/* Geographic Link Block - SEO Authority Distribution */}
              <GeographicLinkBlock
                pageType="city"
                stateSlug={normalizedStateSlug || ''}
                stateName={stateName}
                citySlug={citySlug}
                cityName={cityName}
                nearbyCities={nearbyLocations}
                services={popularTreatments}
              />

              {/* Nearby Cities Links */}
              {nearbyLocations.length > 0 && (
                <LocationQuickLinks
                  variant="nearby"
                  stateSlug={stateSlug}
                  items={nearbyLocations}
                />
              )}
            </div>
          </div>
        </div>
      </Section>

      {/* AI-Optimized FAQ Section */}
      <Section size="lg" className="bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <ConversationalQABlock
            title={`Fostering in ${cityName}`}
            subtitle={`Common questions about finding a fostering agency in ${cityName}, ${stateAbbr}`}
            items={[
              ...faqs.map(f => ({ question: f.q, answer: f.a })),
              ...generateCityQA({ name: cityName, stateName, clinicCount: profiles?.length })
                .filter(cq => !faqs.some(f => f.q.toLowerCase().includes(cq.question.split(' ').slice(0, 4).join(' ').toLowerCase())))
                .slice(0, 3),
            ]}
            contextLabel={`city-${citySlug}`}
          />
        </div>
      </Section>

      {/* AI Discovery Meta */}
      <AIDiscoveryMeta
        pageTitle={pageTitle}
        aiSummary={`Find ${profiles?.length || 0}+ verified fostering agencies in ${cityName}, ${stateName}, UK. Compare ratings, read carer reviews, and submit enquiries online through Foster Connect.`}
        entityType="location"
        location={{ city: cityName, country: "UK" }}
        url={`/${normalizedStateSlug}/${citySlug}/`}
        faqs={faqs.map(f => ({ question: f.q, answer: f.a }))}
        keyFacts={[
          `${profiles?.length || 0}+ fostering agencies listed in ${cityName}`,
          "All agencies verified with Ofsted registration",
          "Online enquiry with quick response",
          "Carer reviews and transparent information",
        ]}
      />
    </PageLayout>
  );
};

export default CityPage;
