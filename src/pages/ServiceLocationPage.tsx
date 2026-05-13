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
import { useState as useStateData, useCity, useCitiesByStateSlug } from "@/hooks/useLocations";
import { useSeoPageContent } from "@/hooks/useSeoPageContent";
import { usePrerenderReady } from "@/hooks/usePrerenderReady";
import { normalizeStateSlug } from "@/lib/slug/normalizeStateSlug";
import { 
  Heart, Shield, Users, MapPin, ArrowRight, Star, Search, ChevronRight, CheckCircle
} from "lucide-react";

const ServiceLocationPage = () => {
  const { stateSlug, citySlug, serviceSlug } = useParams();
  const normalizedStateSlug = normalizeStateSlug(stateSlug);
  const service = serviceSlug || "";

  const { data: state } = useStateData(normalizedStateSlug || '');
  const { data: city } = useCity(citySlug || '', normalizedStateSlug || '');

  const seoSlug = `${normalizedStateSlug || ""}/${citySlug || ""}/${serviceSlug || ""}`;
  const { data: seoContent, isLoading: seoContentLoading } = useSeoPageContent(seoSlug);

  const { data: treatment, isLoading: treatmentLoading } = useQuery({
    queryKey: ["treatment", service],
    queryFn: async () => {
      const { data } = await supabase.from("treatments").select("id, name, slug, description").eq("slug", service).maybeSingle();
      return data;
    },
    enabled: !!service,
  });

  const { data: profiles, isLoading: profilesLoading } = useQuery({
    queryKey: ['service-location-profiles', city?.id, treatment?.id],
    queryFn: async () => {
      if (!city) return [];
      const { data } = await supabaseAdmin
        .from('agencies')
        .select(`*`)
        .ilike('city', `%${city.name}%`)
        .order('rating', { ascending: false })
        .limit(30);
      return (data || []) as any[];
    },
    enabled: !!city,
  });

  const { data: nearbyCities } = useCitiesByStateSlug(normalizedStateSlug || '');

  usePrerenderReady(!profilesLoading && !treatmentLoading);

  if (!state || !city || !treatment) {
    return (
      <PageLayout>
        <div className="container py-20">
          <Skeleton className="h-16 w-full mb-6 rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </PageLayout>
    );
  }

  const treatmentName = treatment.name;
  const locationName = city.name;
  const stateName = state.name;
  const stateAbbr = state.abbreviation;
  
  const pageTitle = `${treatmentName} Agencies in ${locationName} | Find Fostering`;
  const pageDescription = `Find ${treatmentName.toLowerCase()} fostering agencies in ${locationName}, ${stateName}. Browse verified agencies and start your journey.`;
  
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: stateName, href: `/${normalizedStateSlug}/` },
    { label: locationName, href: `/${normalizedStateSlug}/${citySlug}/` },
    { label: treatmentName },
  ];

  const shouldNoIndex = !profilesLoading && (!profiles || profiles.length < 2);
  const avgRating = profiles?.length ? (profiles.reduce((sum, p) => sum + (p.rating || 0), 0) / profiles.length).toFixed(1) : "4.5";

  const faqs = [
    { q: `What is ${treatmentName}?`, a: `${treatmentName} is a specialised form of fostering care for children with specific needs. Contact agencies to learn more.` },
    { q: `How do I find ${treatmentName} agencies in ${locationName}?`, a: `Browse our directory of agencies offering ${treatmentName.toLowerCase()} in ${locationName}.` },
    { q: `What support do agencies provide?`, a: `All agencies provide full training, ongoing support, and competitive fostering allowances. Contact agencies for specific details.` },
  ];

  const nearbyLocations = (nearbyCities || []).filter(c => c.slug !== citySlug).slice(0, 8);

  return (
    <PageLayout>
      <SEOHead
        title={pageTitle}
        description={pageDescription}
        canonical={`https://www.foster-care.co.uk/${normalizedStateSlug}/${citySlug}/${service}/`}
        keywords={[`${treatmentName} ${locationName}`, `fostering ${locationName}`, `${treatmentName.toLowerCase()} agency`]}
        noindex={shouldNoIndex}
        ogImage={`https://www.foster-care.co.uk/og/${service}-${normalizedStateSlug}-${citySlug}.png`}
      />
      <SyncStructuredData
        data={[
          { type: 'breadcrumb', items: [
            { name: 'Home', url: 'https://www.foster-care.co.uk/' },
            { name: stateName, url: `https://www.foster-care.co.uk/${normalizedStateSlug}/` },
            { name: locationName, url: `https://www.foster-care.co.uk/${normalizedStateSlug}/${citySlug}/` },
            { name: treatmentName, url: `https://www.foster-care.co.uk/${normalizedStateSlug}/${citySlug}/${service}/` },
          ]},
          { type: 'place', name: locationName, description: pageDescription, url: `/${normalizedStateSlug}/${citySlug}/${service}/`, addressLocality: locationName, addressRegion: stateName, addressCountry: 'GB' },
          { type: 'service', name: treatmentName, description: treatment?.description || `${treatmentName} fostering services`, provider: { name: 'Foster Care UK', url: 'https://www.foster-care.co.uk' } },
          { type: 'faq', questions: faqs.map(f => ({ question: f.q, answer: f.a })) },
        ]}
        id="service-location-schema"
      />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-950 via-slate-900 to-slate-950 pointer-events-none">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-teal-500/30 rounded-full blur-[120px]" />
          </div>
        </div>

        <div className="container relative z-10 px-4 py-12 md:py-16">
          <Breadcrumbs items={breadcrumbs} className="mb-6 text-white/70 [&_a]:text-white/80" />
          
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Badge variant="secondary" className="mb-3 bg-teal-500/20 text-teal-300 border-teal-500/30">
                <Heart className="h-3 w-3 mr-1" /> {treatmentName}
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                {treatmentName} in <span className="text-teal-400">{locationName}</span>
              </h1>
              <p className="text-white/70 text-lg mb-6">
                Find agencies offering {treatmentName.toLowerCase()} in {locationName}, {stateName}. 
                Browse verified agencies and connect directly.
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <Users className="h-5 w-5 text-teal-400" />
                  <span className="font-semibold text-white">Agencies</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                  <span className="font-semibold text-white">{avgRating} Avg</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <Shield className="h-5 w-5 text-teal-400" />
                  <span className="font-semibold text-white">Ofsted Verified</span>
                </div>
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

      {/* About This Fostering Type */}
      <Section size="md">
        <div className="container px-4">
          <Card className="bg-muted/30 border-0">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Heart className="h-5 w-5 text-teal-600" />
                About {treatmentName}
              </h2>
              <p className="text-muted-foreground">
                {treatment.description || `${treatmentName} provides specialised care for children with specific needs. 
                Agencies offering this type of fostering provide additional training, support, and resources to help foster carers succeed.`}
              </p>
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* Agencies */}
      <Section size="lg">
        <div className="container px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Agencies in {locationName}</h2>
            <p className="text-muted-foreground">Verified agencies available</p>
          </div>

          <div className="grid gap-4">
            {profilesLoading ? (
              [...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
            ) : profiles && profiles.length > 0 ? (
              profiles.map((agency, i) => (
                <motion.div key={agency.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link to={`/agency/${agency.slug}/`}>
                    <Card className="hover:border-teal-500/50 hover:bg-teal-500/5 transition-all duration-300 group">
                      <CardContent className="p-5 flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500/20 to-teal-600/20 flex items-center justify-center shrink-0">
                          {agency.cover_image_url ? (
                            <img src={agency.cover_image_url} alt={agency.name} className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            <span className="text-xl font-bold text-teal-600">{agency.name.charAt(0)}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-foreground group-hover:text-teal-600 transition-colors">{agency.name}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {locationName}, {stateAbbr}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          {(agency.rating || 0) > 0 && (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                              <span className="font-semibold text-sm">{agency.rating?.toFixed(1)}</span>
                            </div>
                          )}
                          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No agencies found for this type in {locationName}.</p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link to={`/${normalizedStateSlug}/${citySlug}/`}>View All Agencies</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* Other Areas */}
      <Section size="md" className="bg-muted/30">
        <div className="container px-4">
          <h2 className="text-lg font-semibold mb-4">Other Areas in {stateName}</h2>
          <div className="flex flex-wrap gap-2">
            {nearbyLocations.map((loc) => (
              <Button key={loc.id} variant="outline" size="sm" className="rounded-full" asChild>
                <Link to={`/${normalizedStateSlug}/${loc.slug}/${service}/`}>
                  {loc.name}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </Section>

      {/* SEO Content Section for organic ranking */}
      <Section size="lg">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <Badge variant="outline" className="mb-3">Your Guide</Badge>
              <h2 className="text-2xl font-bold">
                About <span className="text-teal-600">{treatmentName}</span> in {locationName}
              </h2>
            </div>

            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-3">What is {treatmentName}?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {treatment.description || `${treatmentName} is a specialised form of fostering that provides care for children with specific needs. 
                  In ${locationName}, several agencies offer this type of fostering with additional training and support packages. 
                  This type of fostering requires additional training but offers higher allowances and rewarding experiences.`}
                </p>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-3">How to Find {treatmentName} Agencies</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  When searching for "{treatmentName.toLowerCase()} fostering {locationName.toLowerCase()}" or 
                  "{treatmentName.toLowerCase()} agencies {locationName.toLowerCase()}", consider:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                    <span>Check their Ofsted rating and reviews from current carers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                    <span>Ask about training packages and ongoing support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                    <span>Inquire about allowances and any additional payments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                    <span>Ask about respite options and peer support networks</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Keywords for this page */}
            <Card className="bg-teal-500/5 border-teal-500/20">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-3">Popular Searches</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{treatmentName.toLowerCase()} fostering {locationName.toLowerCase()}</Badge>
                  <Badge variant="secondary">{treatmentName.toLowerCase()} agency {locationName.toLowerCase()}</Badge>
                  <Badge variant="secondary">fostering {locationName.toLowerCase()}</Badge>
                  <Badge variant="secondary">become foster carrier {locationName.toLowerCase()}</Badge>
                </div>
              </CardContent>
            </Card>

            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              <Button variant="outline" className="rounded-full" asChild>
                <Link to="/search">Browse All Agencies</Link>
              </Button>
              <Button variant="outline" className="rounded-full" asChild>
                <Link to="/faq">Fostering FAQ</Link>
              </Button>
            </div>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section size="lg">
        <div className="container px-4">
          <Card className="bg-gradient-to-r from-teal-600 to-teal-800 border-0">
            <CardContent className="p-8 text-center text-white">
              <h2 className="text-2xl font-bold mb-3">Interested in {treatmentName}?</h2>
              <p className="text-white/80 mb-6">
                Contact agencies in {locationName} that specialise in {treatmentName.toLowerCase()}. 
                They'll provide full information about the process.
              </p>
              <Button size="lg" className="bg-white text-teal-700 hover:bg-white/90 font-semibold rounded-xl" asChild>
                <Link to="/search">
                  <Search className="mr-2 h-4 w-4" />
                  Find Agencies
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Section>
    </PageLayout>
  );
};

export default ServiceLocationPage;
