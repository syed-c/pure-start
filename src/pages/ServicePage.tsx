import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { PageLayout } from "@/components/layout/PageLayout";
import { Section } from "@/components/layout/Section";
import { SearchBox } from "@/components/SearchBox";
import { AgencyListFrame, LocationQuickLinks } from "@/components/location";
import { SEOContentBlock } from "@/components/seo/SEOContentBlock";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SEOHead } from "@/components/seo/SEOHead";
import { StructuredData } from "@/components/seo/StructuredData";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { useProfiles } from "@/hooks/useProfiles";
import { useServicePriceRanges } from "@/hooks/useServicePriceRanges";
import { useSeoPageContent, parseMarkdownContent, parseFaqFromContent } from "@/hooks/useSeoPageContent";
import { usePrerenderReady } from "@/hooks/usePrerenderReady";
import { RichContentSections } from "@/components/seo/RichContentSections";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Users,
  Star,
  Shield,
  MapPin,
  Building2,
  ArrowRight,
} from "lucide-react";

const MIN_PROFILE_COUNT = 2;

const ServicePage = () => {
  const { serviceSlug: serviceSlugParam } = useParams();
  const serviceSlug = serviceSlugParam || "";

  const seoSlug = `services/${serviceSlug}`;
  const { data: seoContent, isLoading: seoContentLoading, isFetching: seoContentFetching } = useSeoPageContent(seoSlug);
  const isSeoContentPending = !seoContent && (seoContentLoading || seoContentFetching);

  const { data: treatment, isLoading: treatmentLoading } = useQuery({
    queryKey: ["treatment", serviceSlug],
    queryFn: async () => {
      const { data } = await supabase.from("treatments").select("*").eq("slug", serviceSlug).maybeSingle();
      return data;
    },
  });

  const { data: relatedTreatments } = useQuery({
    queryKey: ["related-treatments", serviceSlug],
    queryFn: async () => {
      const { data } = await supabase.from("treatments").select("*").eq("is_active", true).neq("slug", serviceSlug).order("display_order").limit(6);
      return data || [];
    },
  });

  const { data: profiles, isLoading: profilesLoading } = useProfiles({ limit: 50 });

  const { data: states } = useQuery({
    queryKey: ["states"],
    queryFn: async () => {
      const { data } = await supabase.from("states").select("*").eq("is_active", true).order("display_order");
      return data || [];
    },
  });

  const treatmentName = treatment?.name || serviceSlug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());

  const parsedContent = seoContent?.content ? parseMarkdownContent(seoContent.content) : null;
  const seoFaqs = seoContent?.faqs && Array.isArray(seoContent.faqs) && seoContent.faqs.length > 0
    ? seoContent.faqs
    : seoContent?.content ? parseFaqFromContent(seoContent.content) : [];

  const isDataReady = !treatmentLoading && !profilesLoading;
  usePrerenderReady(isDataReady);
  const shouldNoIndex = !profilesLoading && (!profiles || profiles.length < MIN_PROFILE_COUNT);

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Fostering Types", href: "/categories" },
    { label: treatmentName },
  ];

  const faqs = seoFaqs.length > 0 ? seoFaqs.map(f => ({ q: f.question, a: f.answer })) : [
    {
      q: `What is ${treatmentName}?`,
      a: treatment?.description || `${treatmentName} is a specialised type of fostering that provides care for children and young people with specific needs. Browse verified agencies on Foster Care to learn more.`,
    },
    {
      q: `How do I find ${treatmentName} agencies in the UK?`,
      a: `Use our directory to compare ${profiles?.length || 0}+ verified agencies across England, Scotland, Wales and Northern Ireland. Filter by rating, location, and Ofsted rating to find your ideal match.`,
    },
    {
      q: `What qualifications do I need for ${treatmentName}?`,
      a: `You don't need formal qualifications. Agencies provide comprehensive training specific to ${treatmentName.toLowerCase()}. Key qualities include patience, resilience, and a genuine desire to support children.`,
    },
    {
      q: `What support is available for ${treatmentName} carers?`,
      a: `Agencies provide 24/7 support, specialist training, supervision, peer groups, and competitive fostering allowances. Check individual agency profiles on Foster Care for specific support packages.`,
    },
  ];

  const relatedServices = (relatedTreatments || []).map(t => ({ name: t.name, slug: t.slug }));

  return (
    <PageLayout>
      <SEOHead
        title={seoContent?.meta_title || `${treatmentName} in the UK — Find Agencies & Compare`}
        description={seoContent?.meta_description || `Find the best ${treatmentName.toLowerCase()} agencies across the UK. Compare Ofsted ratings, read reviews, and enquire with verified agencies.`}
        canonical={`/services/${serviceSlug}/`}
        keywords={[`${treatmentName} UK`, `${treatmentName} agencies`, `${treatmentName} fostering`, `best ${treatmentName} agency UK`]}
        noindex={shouldNoIndex}
      />
      <StructuredData
        type="service"
        name={`${treatmentName} in the UK`}
        description={treatment?.description || `Professional ${treatmentName} services across the UK`}
        url={`/services/${serviceSlug}/`}
        provider="Foster Care Partner Agencies"
        areaServed="United Kingdom"
      />
      <StructuredData type="faq" questions={faqs.map(f => ({ question: f.q, answer: f.a }))} />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background via-emerald-light/30 to-background pt-6 pb-10">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            className="absolute top-20 left-[10%] w-48 md:w-64 h-48 md:h-64 bg-foreground/5 rounded-full blur-3xl"
            animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.1, 0.05] }}
            transition={{ duration: 6, repeat: Infinity }}
          />
          <motion.div 
            className="absolute bottom-10 right-[15%] w-56 md:w-80 h-56 md:h-80 bg-primary/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.15, 0.1] }}
            transition={{ duration: 8, repeat: Infinity, delay: 2 }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--foreground)/0.02)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground)/0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>
        
        <div className="container relative z-10 px-4">
          <div className="flex justify-center mb-4">
            <Breadcrumbs items={breadcrumbs} />
          </div>
          
          <div className="max-w-3xl mx-auto text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-foreground/5 backdrop-blur-sm border border-foreground/10 rounded-full px-4 py-2 mb-4"
            >
              <Building2 className="h-4 w-4 text-emerald" />
              <span className="text-xs md:text-sm font-bold text-foreground/80">UK Fostering Service</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-3 px-2"
            >
              {treatmentName} in the <span className="text-primary">UK</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-base md:text-lg text-muted-foreground mb-6 max-w-2xl mx-auto px-2"
            >
              {treatment?.description || `Find the best ${treatmentName.toLowerCase()} agencies across the UK. Compare Ofsted ratings, read reviews, and start your fostering journey.`}
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="max-w-xl md:max-w-2xl mx-auto mb-6"
            >
              <SearchBox variant="hero" />
            </motion.div>

            {/* Stats */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap justify-center gap-2"
            >
              <div className="flex items-center gap-1.5 bg-card/80 backdrop-blur-sm border border-border rounded-xl px-3 py-2 shadow-sm">
                <Users className="h-4 w-4 text-primary" />
                <span className="font-bold text-sm">{profiles?.length || 0}+ Agencies</span>
              </div>
              <div className="flex items-center gap-1.5 bg-card/80 backdrop-blur-sm border border-border rounded-xl px-3 py-2 shadow-sm">
                <Star className="h-4 w-4 text-gold fill-gold" />
                <span className="font-bold text-sm">4.8 Avg. Rating</span>
              </div>
              <div className="flex items-center gap-1.5 bg-card/80 backdrop-blur-sm border border-border rounded-xl px-3 py-2 shadow-sm">
                <Shield className="h-4 w-4 text-emerald" />
                <span className="font-bold text-sm">Ofsted Registered</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Related Services Quick Links */}
      {relatedServices.length > 0 && (
        <section className="py-4 bg-muted/30 border-y border-border">
          <div className="container px-4">
            <LocationQuickLinks
              variant="services"
              items={relatedServices}
              title="Related Fostering Types"
            />
          </div>
        </section>
      )}

      {/* Main Content */}
      <Section size="lg">
        <div className="container px-4">
          <div className="max-w-5xl mx-auto space-y-8">
            <AgencyListFrame
              profiles={profiles || []}
              isLoading={profilesLoading}
              locationName="the UK"
              emptyMessage="We're still adding agencies for this fostering type."
              maxHeight={700}
              initialCount={10}
            />

            <SEOContentBlock
              variant="service"
              locationName="the UK"
              treatmentName={treatmentName}
              clinicCount={profiles?.length || 0}
              parsedContent={parsedContent}
              isLoading={isSeoContentPending}
            />
          </div>
        </div>
      </Section>

      {/* Rich SEO Content Sections */}
      <Section size="lg" className="bg-muted/30">
        <div className="container px-4">
          <div className="max-w-5xl mx-auto">
            <RichContentSections
              pageType="service"
              serviceName={treatmentName}
              agencyCount={profiles?.length || 0}
              serviceSlug={serviceSlug}
            />
          </div>
        </div>
      </Section>

      {/* Find by Region */}
      {states && states.length > 0 && (
        <Section size="lg" className="bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <span className="inline-block text-xs font-bold text-emerald uppercase tracking-widest mb-2">By Location</span>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                {treatmentName} Agencies <span className="text-primary">Across the UK</span>
              </h2>
            </div>

            <div className="text-center text-muted-foreground leading-relaxed mb-6">
              <p>
                Looking for {treatmentName.toLowerCase()} agencies? Browse Ofsted-registered agencies across the UK: {states.map((state, i) => (
                  <span key={state.id}>
                    {i > 0 && (i === states.length - 1 ? ', and ' : ', ')}
                    <Link
                      to={`/${state.slug}`}
                      className="text-primary font-bold hover:underline"
                    >
                      {treatmentName} in {state.name}
                    </Link>
                  </span>
                ))}. Each region has Ofsted-registered agencies offering quality fostering services.
              </p>
            </div>
          </div>
        </Section>
      )}

      {/* FAQ Section */}
      <Section size="lg">
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

export default ServicePage;
