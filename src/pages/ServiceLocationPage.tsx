import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
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
import { ConversationalQABlock } from "@/components/ai-seo/ConversationalQABlock";
import { QuickAnswerBox } from "@/components/ai-seo/QuickAnswerBox";
import { PeopleAlsoAskBlock } from "@/components/ai-seo/PeopleAlsoAskBlock";
import { useState as useStateData, useCity, useCitiesByStateSlug } from "@/hooks/useLocations";
import { useSeoPageContent } from "@/hooks/useSeoPageContent";
import { usePrerenderReady } from "@/hooks/usePrerenderReady";
import { normalizeStateSlug } from "@/lib/slug/normalizeStateSlug";
import {
  Heart, Shield, Users, MapPin, ArrowRight, Star, Search, ChevronRight, CheckCircle,
  Award, ThumbsUp, Clock, Wallet, Sparkles, Building2
} from "lucide-react";

const ServiceLocationPage = () => {
  const { stateSlug, citySlug, serviceSlug } = useParams();
  const normalizedStateSlug = normalizeStateSlug(stateSlug);
  const service = serviceSlug || "";

  const { data: state } = useStateData(normalizedStateSlug || '');
  const { data: city } = useCity(citySlug || '', normalizedStateSlug || '');

  const seoSlug = `${normalizedStateSlug || ""}/${citySlug || ""}/${serviceSlug || ""}`;
  const { data: seoContent } = useSeoPageContent(seoSlug);

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

  const isLoading = profilesLoading || treatmentLoading;
  usePrerenderReady(!isLoading);

  if (!state || !city || !treatment) {
    if (isLoading) {
      return (
        <PageLayout>
          <div className="container py-20">
            <Skeleton className="h-16 w-full mb-6 rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        </PageLayout>
      );
    }
    return (
      <PageLayout>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
          <Button asChild><Link to="/search">Browse Agencies</Link></Button>
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
  const agencyCount = profiles?.length || 0;

  const faqs = [
    { q: `What is ${treatmentName}?`, a: `${treatmentName} is a specialised form of fostering care for children with specific needs. Contact agencies to learn more.` },
    { q: `How do I find ${treatmentName} agencies in ${locationName}?`, a: `Browse our directory of agencies offering ${treatmentName.toLowerCase()} in ${locationName}.` },
    { q: `What support do agencies provide?`, a: `All agencies provide full training, ongoing support, and competitive fostering allowances. Contact agencies for specific details.` },
  ];

  const nearbyLocations = (nearbyCities || []).filter(c => c.slug !== citySlug).slice(0, 8);

  const trustBadges = [
    { icon: Award, title: "Ofsted Rated", desc: "All agencies inspected" },
    { icon: ThumbsUp, title: "Verified Reviews", desc: "Real foster carer feedback" },
    { icon: Clock, title: "24/7 Support", desc: "Round the clock help" },
    { icon: Wallet, title: "Competitive Rates", desc: "Fair allowances" },
  ];

  return (
    <PageLayout>
      <SEOHead
        title={pageTitle}
        description={pageDescription}
        canonical={`/${normalizedStateSlug}/${citySlug}/${service}/`}
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
          { type: 'webSite', name: pageTitle, url: `https://www.foster-care.co.uk/${normalizedStateSlug}/${citySlug}/${service}/` },
        ]}
        id="service-location-schema"
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=1600&q=80"
            alt=""
            className="w-full h-full object-cover"
            loading="eager"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-teal-950/95 via-slate-900/95 to-slate-950/95 pointer-events-none" />
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-teal-500/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px]" />
          </div>
        </div>

        <div className="container relative z-10 px-4 py-16 md:py-24">
          <Breadcrumbs items={breadcrumbs} className="mb-8 text-white/70 [&_a]:text-white/80 [&_a:hover]:text-teal-300" />

          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-fade-in-up">
              <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 mb-6">
                <Heart className="h-4 w-4 text-teal-400" />
                <span className="text-sm font-medium text-white">{treatmentName} Agencies</span>
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                {treatmentName} in <span className="text-teal-400">{locationName}</span>
              </h1>
              <p className="text-lg md:text-xl text-white/70 mb-8 max-w-2xl mx-auto">
                Find agencies offering {treatmentName.toLowerCase()} in {locationName}, {stateName}.
                Browse verified agencies and connect directly.
              </p>

              {/* Stats Cards */}
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-5 py-3">
                  <Building2 className="h-5 w-5 text-teal-400" />
                  <div className="text-left">
                    <p className="text-xl font-bold text-white">{agencyCount}</p>
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
              </div>
            </div>

            {/* CTA Buttons */}
            <div
              className="animate-fade-in-up flex flex-wrap justify-center gap-3"
              style={{ animationDelay: '0.3s' }}
            >
              <Button size="lg" className="h-14 px-8 text-base font-semibold bg-teal-500 hover:bg-teal-600 text-slate-900 rounded-xl shadow-lg shadow-teal-500/30" asChild>
                <Link to="/search">
                  <Search className="mr-2 h-5 w-5" />
                  Browse All Agencies
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 text-base font-semibold border-white/30 bg-transparent text-white hover:bg-white/10 rounded-xl" asChild>
                <Link to={`/${normalizedStateSlug}/${citySlug}/`}>
                  View All in {locationName}
                </Link>
              </Button>
            </div>
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
        <h2 className="sr-only">About {treatmentName} Fostering in {locationName}</h2>
        <div className="absolute inset-0 bg-subtle-grid opacity-20 pointer-events-none" />
        <div className="container px-4 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trustBadges.map((item, i) => (
              <div key={i} className="animate-fade-in-up" style={{ animationDelay: `${0.1 * i}s` }}>
                <Card className="text-center py-6 hover:border-teal-500/30 transition-colors">
                  <CardContent className="p-0">
                    <div className="w-12 h-12 rounded-full bg-teal-500/10 flex items-center justify-center mx-auto mb-3">
                      <item.icon className="h-6 w-6 text-teal-600" />
                    </div>
                    <h3 className="font-bold text-foreground">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* About Section */}
      <Section size="lg" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-subtle-dots opacity-10 pointer-events-none" />
        <div className="container px-4">
          <div className="max-w-3xl mx-auto">
            <div className="animate-fade-in-up text-center mb-10">
              <Badge variant="outline" className="mb-3">About</Badge>
              <h2 className="text-2xl md:text-3xl font-bold">
                About <span className="text-teal-600">{treatmentName}</span> in {locationName}
              </h2>
            </div>

            <Card className="bg-card border-border mb-6">
              <CardContent className="p-6 md:p-8">
                <h3 className="font-bold text-lg mb-3">What is {treatmentName}?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {treatment.description || `${treatmentName} is a specialised form of fostering that provides care for children with specific needs. 
                  In ${locationName}, several agencies offer this type of fostering with additional training and support packages. 
                  This type of fostering requires additional training but offers higher allowances and rewarding experiences.`}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border mb-6">
              <CardContent className="p-6 md:p-8">
                <h3 className="font-bold text-lg mb-3">How to Find {treatmentName} Agencies</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  When searching for "{treatmentName.toLowerCase()} fostering {locationName.toLowerCase()}" or 
                  "{treatmentName.toLowerCase()} agencies {locationName.toLowerCase()}", consider:
                </p>
                <ul className="space-y-3 text-muted-foreground">
                  {[
                    "Check their Ofsted rating and reviews from current carers",
                    "Ask about training packages and ongoing support",
                    "Inquire about allowances and any additional payments",
                    "Ask about respite options and peer support networks",
                  ].map((text, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </Section>

      {/* Agencies List */}
      <Section size="lg" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-muted/30 pointer-events-none" />
        <div className="container px-4 relative">
          <div className="animate-fade-in-up text-center mb-10">
            <Badge variant="outline" className="mb-3">Agencies</Badge>
            <h2 className="text-2xl md:text-3xl font-bold">
              {treatmentName} Agencies in <span className="text-teal-600">{locationName}</span>
            </h2>
            <p className="text-muted-foreground mt-2">Connect with verified fostering agencies</p>
          </div>

          <div className="grid gap-4 max-w-3xl mx-auto">
            {profilesLoading ? (
              [...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
            ) : profiles && profiles.length > 0 ? (
              profiles.map((agency, i) => (
                <div key={agency.id} className="animate-fade-in-up" style={{ animationDelay: `${0.08 * i}s` }}>
                  <Link to={`/agency/${agency.slug}/`}>
                    <Card className="hover:border-teal-500/50 hover:bg-teal-500/5 hover:shadow-lg transition-all duration-300 group">
                      <CardContent className="p-5 flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500/20 to-teal-600/20 flex items-center justify-center shrink-0 overflow-hidden">
                          {agency.cover_image_url ? (
                            <img src={agency.cover_image_url} alt={agency.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xl font-bold text-teal-600">{agency.name.charAt(0)}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-foreground group-hover:text-teal-600 transition-colors truncate">{agency.name}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3 shrink-0" /> {agency.city || `${locationName}, ${stateAbbr}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {(agency.rating || 0) > 0 && (
                            <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-500/10 rounded-lg px-2.5 py-1">
                              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                              <span className="font-semibold text-sm text-amber-700 dark:text-amber-400">{agency.rating?.toFixed(1)}</span>
                            </div>
                          )}
                          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-center py-16">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg mb-2">No agencies found for {treatmentName} in {locationName}.</p>
                <p className="text-muted-foreground text-sm mb-6">Try browsing all agencies in {locationName} or search nationally.</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button variant="outline" asChild>
                    <Link to={`/${normalizedStateSlug}/${citySlug}/`}>View All in {locationName}</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/search">Search All Agencies</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* FAQ Section */}
      <Section size="lg" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-subtle-dots opacity-10 pointer-events-none" />
        <div className="container px-4">
          <div className="max-w-3xl mx-auto space-y-8">
            <QuickAnswerBox
              question={`What ${treatmentName} fostering options are available in ${locationName}?`}
              answer={`${locationName} has agencies offering ${treatmentName.toLowerCase()} fostering, providing specialist support for children and families. The assessment process for fostering typically takes 4-6 months with comprehensive training and 24/7 support.`}
              highlights={[
                `Specialist ${treatmentName.toLowerCase()} fostering support`,
                `Full training and ongoing development provided`,
                `24/7 support from your chosen agency`,
                `Competitive fostering allowances`
              ]}
            />
            <ConversationalQABlock
              title={`${treatmentName} Fostering in ${locationName}`}
              subtitle="Common questions about this type of fostering"
              items={faqs.map(f => ({ question: f.q, answer: f.a }))}
              defaultOpen
            />
            <PeopleAlsoAskBlock
              items={[
                { question: `How do I apply for ${treatmentName.toLowerCase()} fostering in ${locationName}?`, answer: `Contact agencies in ${locationName} that offer ${treatmentName.toLowerCase()} fostering. They will guide you through the application, assessment, and training process.` },
                { question: `What support is available for ${treatmentName.toLowerCase()} foster carers?`, answer: `Agencies provide dedicated support workers, training programs, respite care, and access to specialist resources for ${treatmentName.toLowerCase()} placements.` }
              ]}
            />
          </div>
        </div>
      </Section>

      {/* Other Areas */}
      <Section size="md" className="bg-muted/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-subtle-grid opacity-20 pointer-events-none" />
        <div className="container px-4 relative">
          <div className="animate-fade-in-up text-center mb-8">
            <h2 className="text-xl font-bold">Other Areas in {stateName}</h2>
            <p className="text-muted-foreground text-sm mt-1">Find agencies in nearby locations</p>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {nearbyLocations.length > 0 ? nearbyLocations.map((loc) => (
              <Button key={loc.id} variant="outline" size="sm" className="rounded-full" asChild>
                <Link to={`/${normalizedStateSlug}/${loc.slug}/${service}/`}>
                  {loc.name}
                </Link>
              </Button>
            )) : (
              <p className="text-muted-foreground text-sm">No other locations available</p>
            )}
          </div>
        </div>
      </Section>

      {/* CTA */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-teal-800 pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
        <div className="container relative text-center">
          <div className="animate-fade-in-up">
            <Sparkles className="h-10 w-10 text-white/50 mx-auto mb-4" />
            <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-4">
              Interested in {treatmentName}?
            </h2>
            <p className="text-white/70 mb-8 max-w-xl mx-auto text-lg">
              Contact agencies in {locationName} that specialise in {treatmentName.toLowerCase()}. 
              They'll provide full information about the process and next steps.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button size="lg" variant="secondary" className="rounded-xl font-semibold h-12 px-8 shadow-lg" asChild>
                <Link to="/search">
                  <Search className="mr-2 h-4 w-4" />
                  Browse All Agencies
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-xl font-semibold h-12 px-8 border-white/30 text-white bg-white/10 hover:bg-white/20" asChild>
                <Link to="/faq">Fostering FAQ</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default ServiceLocationPage;
