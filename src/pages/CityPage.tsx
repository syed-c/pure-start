import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { supabase, supabaseAdmin } from "@/integrations/supabase/client";
import { PageLayout } from "@/components/layout/PageLayout";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { SEOHead } from "@/components/seo/SEOHead";
import { SyncStructuredData } from "@/components/seo/SyncStructuredData";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { useCity, useState as useStateData } from "@/hooks/useLocations";
import { useSeoPageContent, parseMarkdownContent } from "@/hooks/useSeoPageContent";
import { usePrerenderReady } from "@/hooks/usePrerenderReady";
import { normalizeStateSlug } from "@/lib/slug/normalizeStateSlug";
import StateServicePage from "./StateServicePage";
import NotFound from "./NotFound";
import { 
  Star, Shield, Heart, Users, MapPin, ArrowRight, 
  Search, ChevronRight, Phone, Mail, Clock, Filter,
  Award, ThumbsUp, Wallet, Calendar, CheckCircle, HandHeart,
  Baby, GraduationCap, MessageCircle, Home
} from "lucide-react";

const CityPage = () => {
  const { stateSlug, citySlug } = useParams();
  const normalizedStateSlug = normalizeStateSlug(stateSlug);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: state, isLoading: stateLoading } = useStateData(normalizedStateSlug || '');
  const { data: city, isLoading: cityLoading } = useCity(citySlug || '', normalizedStateSlug || '');

  const { data: treatmentMatch, isLoading: treatmentMatchLoading } = useQuery({
    queryKey: ['treatment-match', citySlug],
    queryFn: async () => {
      const { data } = await supabase.from('fostering_categories').select('id, name, slug, description').eq('slug', citySlug || '').eq('is_active', true).maybeSingle();
      return data;
    },
    enabled: !!citySlug,
  });

  const seoSlug = `${normalizedStateSlug || ''}/${citySlug || ''}`;
  const { data: seoContent, isLoading: seoContentLoading } = useSeoPageContent(seoSlug);

  const { data: profiles, isLoading: profilesLoading } = useQuery({
    queryKey: ['city-profiles', city?.id, city?.name],
    queryFn: async () => {
      if (!city) return [];
      
      const { data, error } = await supabaseAdmin
        .from('agencies')
        .select(`*`)
        .ilike('city', `%${city.name}%`)
        .order('rating', { ascending: false })
        .limit(50);
      console.log('CityPage - city:', city.name, 'agencies found:', data?.length, 'error:', error);
      return (data || []) as any[];
    },
    enabled: !!city,
  });

  const { data: nearbyCities } = useQuery({
    queryKey: ['nearby-cities', state?.id],
    queryFn: async () => {
      if (!state) return [];
      const { data } = await supabase.from('cities').select('id, name, slug').eq('state_id', state.id).neq('id', city?.id).order('name').limit(10);
      return data || [];
    },
    enabled: !!state && !!city,
  });

  usePrerenderReady(!stateLoading && !cityLoading && !profilesLoading);

  if (stateLoading || cityLoading) {
    return (
      <PageLayout>
        <div className="container py-20">
          <Skeleton className="h-16 w-full mb-6 rounded-xl" />
          <Skeleton className="h-48 w-full mb-6 rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </PageLayout>
    );
  }

  if (!state || !city) {
    if (state && !city && treatmentMatch && !treatmentMatchLoading) {
      return (
        <StateServicePage stateSlug={stateSlug || ''} serviceSlug={citySlug || ''} stateName={state.name} stateId={state.id} fosteringType={treatmentMatch} />
      );
    }
    if (!city && treatmentMatchLoading) {
      return (
        <PageLayout>
          <div className="container py-12"><Skeleton className="h-12 w-64 mb-4" /><Skeleton className="h-6 w-96" /></div>
        </PageLayout>
      );
    }
    return <NotFound />;
  }

  const cityName = city.name;
  const stateName = state.name;
  const stateAbbr = state.abbreviation;
  const parsedContent = seoContent?.content ? parseMarkdownContent(seoContent.content) : null;

  const pageTitle = seoContent?.meta_title || `Fostering Agencies in ${cityName}, ${stateAbbr} | Find Agencies`;
  const pageDescription = seoContent?.meta_description || `Find trusted fostering agencies in ${cityName}, ${stateName}. Browse verified agencies.`;

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: stateName, href: `/${normalizedStateSlug}/` },
    { label: cityName },
  ];

  const filteredProfiles = searchQuery
    ? profiles?.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : profiles;

  const agencyCount = profiles?.length || 0;
  const avgRating = profiles?.length ? (profiles.reduce((sum, p) => sum + (p.rating || 0), 0) / profiles.length).toFixed(1) : "4.5";
  const shouldNoIndex = agencyCount < 2;

  const faqs = [
    { q: `How do I find a fostering agency in ${cityName}?`, a: `Browse our verified list of agencies in ${cityName}. Filter by Ofsted rating and fostering type to find your match.` },
    { q: `What types of fostering are available?`, a: `Agencies in ${cityName} offer emergency, short-term, long-term, respite, therapeutic, and parent & child fostering. Contact agencies for details.` },
    { q: `How long does it take to become a foster carrier?`, a: `The assessment process typically takes 4-6 months. Agencies will guide you through training, home visits, and background checks.` },
  ];

  const testimonials = [
    { name: "Sarah M.", text: `We found our perfect agency in ${cityName}. The support has been incredible.`, rating: 5 },
    { name: "James T.", text: "The reviews helped us choose the right agency. Best decision we made.", rating: 5 },
  ];

  const benefits = [
    { icon: Shield, title: "Ofsted Verified", desc: "All agencies inspected" },
    { icon: Wallet, title: "Competitive Rates", desc: "Fair allowances" },
    { icon: ThumbsUp, title: "Real Reviews", desc: "Authentic feedback" },
    { icon: Clock, title: "24/7 Support", desc: "Always available" },
  ];

  return (
    <PageLayout>
      <SEOHead
        title={pageTitle}
        description={pageDescription}
        canonical={`/${normalizedStateSlug}/${citySlug}/`}
        keywords={[`fostering agencies ${cityName}`, `foster care ${cityName} ${stateAbbr}`]}
        noindex={shouldNoIndex}
        ogImage={`https://fostercareuk.com/og/city-${normalizedStateSlug}-${citySlug}.png`}
      />
      <SyncStructuredData
        data={[
          { type: 'breadcrumb', items: [{ name: 'Home', url: 'https://fostercareuk.com/' }, { name: stateName, url: `https://fostercareuk.com/${normalizedStateSlug}/` }, { name: cityName, url: `https://fostercareuk.com/${normalizedStateSlug}/${citySlug}/` }] },
          { type: 'place', name: cityName, description: pageDescription, url: `/${normalizedStateSlug}/${citySlug}/`, addressLocality: cityName, addressRegion: stateName, addressCountry: 'GB' },
          { type: 'faq', questions: faqs.map(f => ({ question: f.q, answer: f.a })) },
        ]}
        id="city-schema"
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=1600&q=80"
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-teal-950/95 via-slate-900/95 to-slate-950/95 pointer-events-none" />
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-teal-500/30 rounded-full blur-[120px]" />
          </div>
        </div>

        <div className="container relative z-10 px-4 py-12 md:py-16">
          <Breadcrumbs items={breadcrumbs} className="mb-6 text-white/70 [&_a]:text-white/80 [&_a:hover]:text-teal-300" />
          
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Badge variant="secondary" className="mb-3 bg-white/10 text-white border-white/20">Fostering Agencies</Badge>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                {cityName}, <span className="text-teal-400">{stateName}</span>
              </h1>
              <p className="text-white/70 text-lg mb-6">
                Find verified Ofsted-rated fostering agencies in {cityName}. 
                Browse by rating, read reviews, and connect directly.
              </p>

              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <Users className="h-5 w-5 text-teal-400" />
                  <span className="font-semibold text-white">Verified Agencies</span>
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

      {/* Trust Benefits */}
      <Section size="md">
        <div className="container px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {benefits.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}>
                <Card className="text-center py-5 hover:border-teal-500/30 transition-colors">
                  <CardContent className="p-0">
                    <item.icon className="h-8 w-8 mx-auto mb-2 text-teal-600" />
                    <h3 className="font-bold text-sm">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* Search & Agencies */}
      <Section size="lg">
        <div className="container px-4">
          <div className="mb-8">
            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search agencies by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 pl-12 pr-4 text-lg rounded-xl"
              />
            </div>
          </div>

          <div className="mb-6 flex items-center justify-between">
            <p className="text-muted-foreground">
              {profilesLoading ? "Loading..." : `${filteredProfiles?.length || 0} agencies found`}
            </p>
            {searchQuery && (
              <Button variant="ghost" size="sm" onClick={() => setSearchQuery("")}>
                Clear search
              </Button>
            )}
          </div>

          <div className="grid gap-4">
            {profilesLoading ? (
              [...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)
            ) : filteredProfiles && filteredProfiles.length > 0 ? (
              filteredProfiles.map((agency, i) => (
                <motion.div key={agency.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link to={`/agency/${agency.slug}/`}>
                    <Card className="hover:border-teal-500/50 hover:bg-teal-500/5 transition-all duration-300 group">
                      <CardContent className="p-5 flex flex-col md:flex-row md:items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-teal-500/20 to-teal-600/20 flex items-center justify-center shrink-0">
                          {agency.cover_image_url ? (
                            <img src={agency.cover_image_url} alt={agency.name} className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            <span className="text-2xl font-bold text-teal-600">{agency.name.charAt(0)}</span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-bold text-lg text-foreground group-hover:text-teal-600 transition-colors">{agency.name}</h3>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> {cityName}, {stateAbbr}
                              </p>
                            </div>
                            {(agency.rating || 0) > 0 && (
                              <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
                                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                                <span className="font-semibold text-sm">{agency.rating?.toFixed(1)}</span>
                                <span className="text-xs text-muted-foreground">({agency.review_count})</span>
                              </div>
                            )}
                          </div>
                          {agency.description && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{agency.description}</p>
                          )}
                        </div>

                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-teal-600 group-hover:translate-x-1 transition-all shrink-0" />
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No agencies found in {cityName}.</p>
                <Button variant="outline" asChild>
                  <Link to={`/${normalizedStateSlug}/`}>Browse All {stateName}</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* How It Works in City */}
      <Section size="lg" className="bg-muted/30">
        <div className="container px-4">
          <div className="text-center mb-8">
            <Badge variant="outline" className="mb-3">Simple Steps</Badge>
            <h2 className="text-2xl font-bold">How It Works in {cityName}</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "1", icon: Search, title: "Browse", desc: "Search agencies in " + cityName },
              { step: "2", icon: MessageCircle, title: "Contact", desc: "Reach out to your choices" },
              { step: "3", icon: Calendar, title: "Meet", desc: "Attend information sessions" },
              { step: "4", icon: Heart, title: "Start", desc: "Begin your fostering journey" },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }} className="text-center">
                <div className="w-14 h-14 rounded-full bg-teal-500/10 flex items-center justify-center mx-auto mb-3">
                  <item.icon className="h-7 w-7 text-teal-600" />
                </div>
                <div className="inline-block w-7 h-7 rounded-full bg-teal-600 text-white font-bold text-sm flex items-center justify-center mb-2">
                  {item.step}
                </div>
                <h3 className="font-bold">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* Nearby Cities */}
      <Section size="md">
        <div className="container px-4">
          <h2 className="text-xl font-bold mb-6">Nearby Areas in {stateName}</h2>
          <div className="flex flex-wrap gap-2">
            {nearbyCities?.map((nearby) => (
              <Button key={nearby.id} variant="outline" size="sm" className="rounded-full" asChild>
                <Link to={`/${normalizedStateSlug}/${nearby.slug}/`}>
                  <MapPin className="h-3 w-3 mr-1" />
                  {nearby.name}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </Section>

      {/* Testimonials */}
      <Section size="md" className="bg-gradient-to-r from-teal-50 to-amber-50">
        <div className="container px-4">
          <h2 className="text-xl font-bold text-center mb-6">Foster Carer Stories in {cityName}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {testimonials.map((t, i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <div className="flex gap-1 mb-2">
                    {[...Array(t.rating)].map((_, r) => <Star key={r} className="h-4 w-4 text-amber-500 fill-amber-500" />)}
                  </div>
                  <p className="text-muted-foreground mb-2">"{t.text}"</p>
                  <p className="font-semibold text-foreground">{t.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      {/* SEO Content - Detailed for Organic Ranking */}
      <Section size="lg">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto">
            {/* SEO Heading */}
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-3">Complete Guide</Badge>
              <h2 className="text-2xl md:text-4xl font-bold mb-4">
                Fostering in <span className="text-teal-600">{cityName}</span>, {stateName}
              </h2>
              <p className="text-muted-foreground text-lg">
                Your complete guide to becoming a foster carrier in {cityName}, {stateName}.
              </p>
            </div>

            {/* Intro SEO Paragraph */}
            <Card className="mb-8">
              <CardContent className="p-6 md:p-8">
                <h3 className="text-xl font-bold mb-4">About Fostering in {cityName}</h3>
                <div className="prose prose-teal max-w-none">
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {cityName} in {stateName} offers excellent access to fostering agencies with strong support networks. 
                    With {profiles?.length || 0} Ofsted-rated agencies in the area, families have plenty of choices when selecting 
                    the right agency for their fostering journey.
                  </p>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    The area has good transport links, making it easy to attend training sessions and meetings with agencies. 
                    Whether you're looking for emergency placements, short-term care, or long-term fostering, 
                    {cityName} has agencies that can support your needs.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    All agencies in {cityName} provide comprehensive training, 24/7 support, and competitive allowances. 
                    The assessment process typically takes 4-6 months from initial enquiry to being matched with a child.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* H3 Sections with Keywords */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-3">Why Foster in {cityName}, {stateName}?</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {cityName} offers a thriving foster care community with multiple agencies providing various types of fostering. 
                    The city has excellent transport links making it convenient for training sessions and support meetings. 
                    With {profiles?.length || 0} agencies to choose from, you can find the perfect match for your experience and preferences.
                    Agencies in {cityName} are known for their comprehensive support packages and competitive allowances.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-3">How to Find the Right Fostering Agency in {cityName}</h3>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    When searching for "fostering agencies {cityName.toLowerCase()}" or "foster care {cityName.toLowerCase()}", 
                    consider these factors:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-teal-600 mt-1 shrink-0" /><span><strong>Ofsted Rating</strong> - Look for Outstanding or Good ratings</span></li>
                    <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-teal-600 mt-1 shrink-0" /><span><strong>Fostering Types</strong> - Choose agencies offering your preferred type</span></li>
                    <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-teal-600 mt-1 shrink-0" /><span><strong>Support Package</strong> - 24/7 support, training, respite care</span></li>
                    <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-teal-600 mt-1 shrink-0" /><span><strong>Location</strong> - Consider travel time to training sessions</span></li>
                    <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-teal-600 mt-1 shrink-0" /><span><strong>Reviews</strong> - Read feedback from current foster carers</span></li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-3">The Fostering Process in {cityName}</h3>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    Starting your fostering journey in {cityName} is straightforward:
                  </p>
                  <ol className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-3"><span className="font-bold text-teal-600 shrink-0">1.</span><span><strong>Research</strong> - Browse agencies above and read reviews from current foster carers</span></li>
                    <li className="flex items-start gap-3"><span className="font-bold text-teal-600 shrink-0">2.</span><span><strong>Contact</strong> - Reach out to preferred agencies for information packs</span></li>
                    <li className="flex items-start gap-3"><span className="font-bold text-teal-600 shrink-0">3.</span><span><strong>Attend</strong> - Join information evenings or preparation courses</span></li>
                    <li className="flex items-start gap-3"><span className="font-bold text-teal-600 shrink-0">4.</span><span><strong>Apply</strong> - Complete your application and begin the assessment</span></li>
                    <li className="flex items-start gap-3"><span className="font-bold text-teal-600 shrink-0">5.</span><span><strong>Start</strong> - Get matched with a child and begin your journey</span></li>
                  </ol>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-3">Fostering Allowances in {cityName}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Fostering allowances in {cityName} follow national guidelines with variations based on the type of placement. 
                    The minimum weekly allowance ranges from £132-£187 depending on the child's age. 
                    Independent Fostering Agencies often pay enhanced rates ranging from £200-500+ per week for specialist placements. 
                    All foster carers receive regular payments, holiday allowances, and birthday payments.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Keywords Section */}
            <Card className="mt-8 bg-teal-500/5 border-teal-500/20">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Popular Searches in {cityName}</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">fostering agencies {cityName.toLowerCase()}</Badge>
                  <Badge variant="secondary">foster care {cityName.toLowerCase()}</Badge>
                  <Badge variant="secondary">become foster carrier {cityName.toLowerCase()}</Badge>
                  <Badge variant="secondary">fostering allowance {cityName.toLowerCase()}</Badge>
                  <Badge variant="secondary">foster carrier requirements {cityName.toLowerCase()}</Badge>
                  <Badge variant="secondary">ofsted rated foster agencies {cityName.toLowerCase()}</Badge>
                  <Badge variant="secondary">best fostering agency {cityName.toLowerCase()}</Badge>
                  <Badge variant="secondary">emergency fostering {cityName.toLowerCase()}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* CTA Links */}
            <div className="mt-10 flex flex-wrap gap-3 justify-center">
              <Button variant="outline" className="rounded-full" asChild><Link to="/search">Browse All Agencies</Link></Button>
              <Button variant="outline" className="rounded-full" asChild><Link to="/faq">Fostering FAQ</Link></Button>
              <Button variant="outline" className="rounded-full" asChild><Link to="/tools/fostering-allowance-calculator">Calculate Allowance</Link></Button>
              <Button variant="outline" className="rounded-full" asChild><Link to={`/${normalizedStateSlug}/`}>All {stateName} Agencies</Link></Button>
            </div>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section size="lg">
        <div className="container px-4">
          <Card className="bg-gradient-to-r from-teal-600 to-teal-800 border-0">
            <CardContent className="p-8 md:p-10 text-center text-white">
              <h2 className="text-2xl font-bold mb-3">Ready to Become a Foster Carer?</h2>
              <p className="text-white/80 mb-6 max-w-md mx-auto">
                Contact agencies in {cityName} directly. All agencies provide free information and support.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button size="lg" className="bg-white text-teal-700 hover:bg-white/90 font-semibold rounded-xl" asChild>
                  <Link to="/search">
                    <Search className="mr-2 h-4 w-4" />
                    Find Agencies
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10 font-semibold rounded-xl" asChild>
                  <Link to="/faq">
                    Learn More
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Section>
    </PageLayout>
  );
};

export default CityPage;
