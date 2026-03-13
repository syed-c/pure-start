import { useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { PageLayout } from "@/components/layout/PageLayout";
import { Section } from "@/components/layout/Section";
import { SearchBox } from "@/components/SearchBox";
import { DentistListFrame, LocationQuickLinks } from "@/components/location";
import { SEOContentBlock } from "@/components/seo/SEOContentBlock";
import { PageIntroSection } from "@/components/seo/PageIntroSection";
import { GeographicLinkBlock } from "@/components/seo/GeographicLinkBlock";
import { useProfiles } from "@/hooks/useProfiles";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SEOHead } from "@/components/seo/SEOHead";
import { SyncStructuredData } from "@/components/seo/SyncStructuredData";
import { InternalLinkBlock, generateServiceLocationInternalLinks } from "@/components/seo/InternalLinkBlock";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { useState as useStateData, useCity, useCitiesByStateSlug } from "@/hooks/useLocations";
import { useSeoPageContent, parseMarkdownContent, parseFaqFromContent } from "@/hooks/useSeoPageContent";
import { usePrerenderReady } from "@/hooks/usePrerenderReady";
import { normalizeStateSlug } from "@/lib/slug/normalizeStateSlug";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Users,
  Shield,
  Clock,
  Star,
  Building2
} from "lucide-react";

const MIN_PROFILE_COUNT = 2;

const ServiceLocationPage = () => {
  const { stateSlug, citySlug, serviceSlug } = useParams();
  const normalizedStateSlug = normalizeStateSlug(stateSlug);
  const service = serviceSlug || "";

  const { data: state } = useStateData(normalizedStateSlug || '');
  const { data: city } = useCity(citySlug || '', normalizedStateSlug || '');

  const seoSlug = `${normalizedStateSlug || ""}/${citySlug || ""}/${serviceSlug || ""}`;
  const {
    data: seoContent,
    isLoading: seoContentLoading,
    isFetching: seoContentFetching,
  } = useSeoPageContent(seoSlug);

  const isSeoContentPending = !seoContent && (seoContentLoading || seoContentFetching);

  const { data: treatment, isLoading: treatmentLoading, isFetching: treatmentFetching } = useQuery({
    queryKey: ["treatment", service],
    queryFn: async () => {
      const { data } = await supabase
        .from("treatments")
        .select("*")
        .eq("slug", service)
        .maybeSingle();
      return data;
    },
    enabled: !!service,
  });

  const { data: profiles, isLoading: profilesLoading } = useProfiles({
    cityId: city?.id,
    treatmentId: treatment?.id,
    limit: 50,
  });

  const { data: relatedServices, isLoading: relatedServicesLoading } = useQuery({
    queryKey: ["related-services", service],
    queryFn: async () => {
      const { data } = await supabase
        .from("treatments")
        .select("*")
        .eq("is_active", true)
        .neq("slug", service)
        .order("display_order")
        .limit(6);
      return data || [];
    },
  });

  const { data: nearbyCities, isLoading: nearbyCitiesLoading } = useCitiesByStateSlug(normalizedStateSlug || '');

  const isDataReady =
    !!state &&
    !!city &&
    !profilesLoading &&
    !relatedServicesLoading &&
    !nearbyCitiesLoading &&
    !treatmentLoading &&
    !treatmentFetching &&
    !seoContentLoading &&
    !seoContentFetching;
  usePrerenderReady(isDataReady, { delay: 600 });

  const locationName = city?.name || citySlug?.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()) || '';
  const stateName = state?.name || '';
  const stateAbbr = state?.abbreviation || '';
  const treatmentName = treatment?.name || service.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const locationDisplay = stateName ? `${locationName}, ${stateName}` : locationName;

  if (stateSlug && normalizedStateSlug && stateSlug !== normalizedStateSlug && citySlug && serviceSlug) {
    return <Navigate to={`/${normalizedStateSlug}/${citySlug}/${serviceSlug}/`} replace />;
  }

  const breadcrumbs = [
    { label: "Home", href: "/" },
    ...(normalizedStateSlug && stateName ? [{ label: stateName, href: `/${normalizedStateSlug}/` }] : []),
    ...(citySlug && normalizedStateSlug ? [{ label: locationName, href: `/${normalizedStateSlug}/${citySlug}/` }] : []),
    { label: treatmentName },
  ];

  const parsedContent = seoContent?.content ? parseMarkdownContent(seoContent.content) : null;
  const seoFaqs = seoContent?.faqs && Array.isArray(seoContent.faqs) && seoContent.faqs.length > 0
    ? seoContent.faqs
    : seoContent?.content ? parseFaqFromContent(seoContent.content) : [];

  const pageTitle = seoContent?.meta_title || `${treatmentName} in ${locationDisplay} - Find Agencies`;
  const pageDescription = seoContent?.meta_description || `Find the best ${treatmentName.toLowerCase()} agencies in ${locationDisplay}. Compare ${profiles?.length || 0}+ verified agencies.`;
  const pageH1 = seoContent?.h1 || `${treatmentName} in ${locationDisplay}`;

  const faqs = seoFaqs.length > 0 ? seoFaqs.map(f => ({ q: f.question, a: f.answer })) : [
    {
      q: `Where can I find ${treatmentName} agencies in ${locationName}?`,
      a: `We have ${profiles?.length || 0}+ verified ${treatmentName.toLowerCase()} agencies in ${locationName}. Browse our directory above to compare ratings and submit enquiries.`,
    },
    {
      q: `What support do ${treatmentName} carers get in ${locationName}?`,
      a: `${treatmentName} carers in ${locationName} receive comprehensive training, 24/7 support, and competitive fostering allowances. Specific support varies by agency — check individual profiles for details.`,
    },
    {
      q: `Are the ${treatmentName} agencies in ${locationName} Ofsted registered?`,
      a: `All agencies on our platform are Ofsted-registered. Profiles with the "Verified" badge have completed our additional verification process.`,
    },
    {
      q: `How do I enquire about ${treatmentName} in ${locationName}?`,
      a: `Browse the agencies above, click "Enquire" on any profile, and fill in your details. The agency will contact you to discuss the next steps in your fostering journey.`,
    },
  ];

  const shouldNoIndex = !profilesLoading && (!profiles || profiles.length < MIN_PROFILE_COUNT);

  const nearbyLocations = (nearbyCities || [])
    .filter(c => c.slug !== citySlug)
    .slice(0, 5)
    .map(c => ({ name: c.name, slug: c.slug }));

  const relatedTreatments = (relatedServices || []).map(t => ({ name: t.name, slug: t.slug }));

  return (
    <PageLayout>
      <SEOHead
        title={pageTitle}
        description={pageDescription}
        canonical={`/${normalizedStateSlug}/${citySlug}/${service}/`}
        keywords={[`${treatmentName} ${locationName}`, `${treatmentName} agency`, `best ${treatmentName} agency`]}
        noindex={shouldNoIndex}
      />
      <SyncStructuredData
        data={[
          {
            type: 'breadcrumb',
            items: [
              { name: 'Home', url: '/' },
              ...(normalizedStateSlug && stateName ? [{ name: stateName, url: `/${normalizedStateSlug}/` }] : []),
              ...(citySlug && normalizedStateSlug ? [{ name: locationName, url: `/${normalizedStateSlug}/${citySlug}/` }] : []),
              { name: treatmentName, url: `/${normalizedStateSlug}/${citySlug}/${service}/` },
            ],
          },
          {
            type: 'faq',
            questions: faqs.map(f => ({ question: f.q, answer: f.a })),
          },
          {
            type: 'itemList',
            name: `${treatmentName} Agencies in ${locationName}`,
            description: `Top-rated ${treatmentName.toLowerCase()} agencies in ${locationName}`,
            items: (profiles || []).slice(0, 10).map((p, i) => ({
              name: p.name,
              url: `/clinic/${p.slug}/`,
              position: i + 1,
              image: p.image,
            })),
          },
        ]}
        id="service-location-schema"
      />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[45vh] flex items-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[120px]" />
          <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-teal/10 rounded-full blur-[100px]" />
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }} />
        </div>
        
        <div className="container relative z-10 py-14 md:py-18 px-4">
          <div className="flex justify-center mb-4">
            <Breadcrumbs items={breadcrumbs} className="[&_a]:text-white/60 [&_span]:text-white/40 [&_svg]:text-white/30" />
          </div>
          
          <div className="max-w-4xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Badge variant="secondary" className="rounded-full px-4 py-1.5 text-xs md:text-sm font-bold mb-4 bg-primary/15 text-primary border-primary/30 backdrop-blur-md">
                <Building2 className="h-3 w-3 md:h-4 md:w-4 mr-1.5" />
                Ofsted Registered Agencies
              </Badge>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3 px-2" 
              style={{ fontFamily: "'Varela Round', system-ui, sans-serif" }}
            >
              {pageH1.includes(locationName) ? (
                <>
                  <span className="text-white">{pageH1.split(locationName)[0]}</span>
                  <span className="block text-primary mt-1">{locationName}{pageH1.split(locationName)[1] || ''}</span>
                </>
              ) : (
                <span className="text-white">{pageH1}</span>
              )}
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm md:text-base lg:text-lg text-white/40 max-w-2xl mx-auto mb-5 px-2"
            >
              Find and enquire with top-rated {treatmentName.toLowerCase()} agencies in {locationName}.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="max-w-xl md:max-w-2xl mx-auto mb-5"
            >
              <SearchBox variant="hero" stateSlug={stateSlug} defaultCity={`${citySlug}|${stateSlug}`} defaultTreatment={service} />
            </motion.div>

            {/* Stats */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap justify-center gap-2"
            >
              <div className="flex items-center gap-1.5 bg-white/[0.06] backdrop-blur-md border border-white/10 rounded-xl px-3 py-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="font-bold text-sm text-white">{profiles?.length || 0}+ Agencies</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/[0.06] backdrop-blur-md border border-white/10 rounded-xl px-3 py-2">
                <Star className="h-4 w-4 text-gold fill-gold" />
                <span className="font-bold text-sm text-white">4.8 Avg. Rating</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/[0.06] backdrop-blur-md border border-white/10 rounded-xl px-3 py-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="font-bold text-sm text-white">Ofsted Registered</span>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" className="w-full h-12 md:h-16" preserveAspectRatio="none">
            <path d="M0 80V40C240 10 480 0 720 20C960 40 1200 50 1440 30V80H0Z" className="fill-background" />
          </svg>
        </div>
      </section>

      {/* Page Intro Section */}
      <PageIntroSection
        title={parsedContent?.sections?.[0]?.heading || `${treatmentName} Services in ${locationName}`}
        content={(seoContent as any)?.page_intro || parsedContent?.intro || parsedContent?.sections?.[0]?.content || `Find the best ${treatmentName.toLowerCase()} agencies in ${locationDisplay}. Our directory features Ofsted-registered agencies with proven expertise in ${treatmentName.toLowerCase()}.`}
        isLoading={isSeoContentPending}
      />

      {/* Main Content */}
      <Section size="lg">
        <div className="container px-4">
          <div className="max-w-5xl mx-auto space-y-8">
            <DentistListFrame
              profiles={profiles || []}
              isLoading={profilesLoading}
              locationName={locationName}
              emptyMessage={`We're still adding ${treatmentName.toLowerCase()} agencies in ${locationName}.`}
              maxHeight={700}
              initialCount={10}
            />

            <SEOContentBlock
              variant="service-location"
              locationName={locationName}
              stateName={stateName}
              stateAbbr={stateAbbr}
              stateSlug={stateSlug || ''}
              citySlug={citySlug || ''}
              treatmentName={treatmentName}
              treatmentSlug={service}
              clinicCount={profiles?.length || 0}
              parsedContent={parsedContent}
              nearbyLocations={nearbyLocations}
              isLoading={isSeoContentPending}
            />

            <GeographicLinkBlock
              pageType="service-location"
              stateSlug={normalizedStateSlug || ''}
              stateName={stateName}
              citySlug={citySlug}
              cityName={locationName}
              serviceSlug={service}
              serviceName={treatmentName}
              nearbyCities={nearbyLocations}
              services={relatedTreatments}
            />

            {nearbyLocations.length > 0 && (
              <LocationQuickLinks
                variant="nearby"
                stateSlug={normalizedStateSlug || stateSlug}
                items={nearbyLocations}
                title={`${treatmentName} in Nearby Cities`}
              />
            )}
          </div>
        </div>
      </Section>

      {/* FAQ Section */}
      <Section size="lg" className="bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <span className="inline-block text-xs font-bold text-primary uppercase tracking-widest mb-2">Have Questions?</span>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Frequently Asked <span className="text-primary">Questions</span>
            </h2>
          </div>
          
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="bg-card border border-border rounded-2xl px-5 data-[state=open]:border-primary/30"
              >
                <AccordionTrigger className="text-left font-bold hover:no-underline py-4 text-sm md:text-base">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4 text-sm">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Section>
    </PageLayout>
  );
};

export default ServiceLocationPage;
