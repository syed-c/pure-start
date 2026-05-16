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
import { StructuredData } from "@/components/seo/StructuredData";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { useSeoPageContent } from "@/hooks/useSeoPageContent";
import { usePrerenderReady } from "@/hooks/usePrerenderReady";
import { Heart, Shield, Users, MapPin, Star, ArrowRight } from "lucide-react";

const FosteringCategoryLocationPage = () => {
  const { locationSlug, categorySlug } = useParams();
  const locationSlugLower = locationSlug?.toLowerCase() || '';
  const categorySlugLower = categorySlug?.toLowerCase() || '';

  const locationNameMap: Record<string, string> = {
    // Regions
    'england': 'England',
    'scotland': 'Scotland', 
    'wales': 'Wales',
    'northern-ireland': 'Northern Ireland',
    // Counties
    'greater-london': 'Greater London',
    'west-midlands': 'West Midlands',
    'greater-manchester': 'Greater Manchester',
    'west-yorkshire': 'West Yorkshire',
    'kent': 'Kent',
    'essex': 'Essex',
    'surrey': 'Surrey',
    'sussex': 'Sussex',
    'hertfordshire': 'Hertfordshire',
    'hampshire': 'Hampshire',
    // Major Cities
    'london': 'London',
    'birmingham': 'Birmingham',
    'manchester': 'Manchester',
    'leeds': 'Leeds',
    'liverpool': 'Liverpool',
    'bristol': 'Bristol',
    'newcastle': 'Newcastle',
    'sheffield': 'Sheffield',
    'nottingham': 'Nottingham',
    'southampton': 'Southampton',
    'edinburgh': 'Edinburgh',
    'glasgow': 'Glasgow',
    'cardiff': 'Cardiff',
    'belfast': 'Belfast',
    // Kent
    'maidstone': 'Maidstone',
    'canterbury': 'Canterbury',
    'ashford': 'Ashford',
    'dover': 'Dover',
    'tonbridge': 'Tonbridge',
    'folkestone': 'Folkestone',
    'margate': 'Margate',
    'gillingham': 'Gillingham',
    'chatham': 'Chatham',
    'ramsgate': 'Ramsgate',
    // Sussex
    'brighton': 'Brighton',
    'eastbourne': 'Eastbourne',
    'worthing': 'Worthing',
    'hastings': 'Hastings',
    'chichester': 'Chichester',
    'crawley': 'Crawley',
    'horsham': 'Horsham',
    // Surrey
    'guildford': 'Guildford',
    'woking': 'Woking',
    'redhill': 'Redhill',
    'epsom': 'Epsom',
    'windsor': 'Windsor',
    'slough': 'Slough',
    // Essex
    'chelmsford': 'Chelmsford',
    'colchester': 'Colchester',
    'southend-on-sea': 'Southend-on-Sea',
    'basildon': 'Basildon',
    'stevenage': 'Stevenage',
    // Hertfordshire
    'st-albans': 'St Albans',
    'hemel-hempstead': 'Hemel Hempstead',
    'watford': 'Watford',
    'hatfield': 'Hatfield',
    'bishop-stortford': 'Bishop Stortford',
    'borehamwood': 'Borehamwood',
    // London Boroughs
    'croydon': 'Croydon',
    'bromley': 'Bromley',
    'enfield': 'Enfield',
    'barnet': 'Barnet',
    'ealing': 'Ealing',
    'harrow': 'Harrow',
    'greenwich': 'Greenwich',
    'wandsworth': 'Wandsworth',
    'lewisham': 'Lewisham',
    'southwark': 'Southwark',
    'lambeth': 'Lambeth',
    'camden': 'Camden',
    'islington': 'Islington',
    'hackney': 'Hackney',
    'tower-hamlets': 'Tower Hamlets',
    'westminster': 'Westminster',
    // Other Cities
    'reading': 'Reading',
    'oxford': 'Oxford',
    'cambridge': 'Cambridge',
    'york': 'York',
    'wolverhampton': 'Wolverhampton',
    'warrington': 'Warrington',
    'peterborough': 'Peterborough',
    'luton': 'Luton',
    'bournemouth': 'Bournemouth',
    'derby': 'Derby',
    'doncaster': 'Doncaster',
    'stockport': 'Stockport',
    'sunderland': 'Sunderland',
    'stoke-on-trent': 'Stoke-on-Trent',
    'hull': 'Hull',
    'bradford': 'Bradford',
    'aberdeen': 'Aberdeen',
    'dundee': 'Dundee',
    'swansea': 'Swansea',
    'newport': 'Newport',
  };

  const categoryNameMap: Record<string, string> = {
    'short-term-fostering': 'Short-Term Fostering',
    'long-term-fostering': 'Long-Term Fostering',
    'emergency-fostering': 'Emergency Fostering',
    'therapeutic-fostering': 'Therapeutic Fostering',
    'respite-fostering': 'Respite Fostering',
    'parent-and-child-fostering': 'Parent and Child Fostering',
    'disability-fostering': 'Disability Fostering',
  };

  const fallbackLocation = locationNameMap[locationSlugLower]
    ? { id: `fallback-${locationSlugLower}`, name: locationNameMap[locationSlugLower], slug: locationSlugLower }
    : null;

  const fallbackCategory = categoryNameMap[categorySlugLower]
    ? { id: `fallback-${categorySlugLower}`, name: categoryNameMap[categorySlugLower], slug: categorySlugLower, description: '' }
    : null;

  const { data: location, isLoading: locationLoading } = useQuery({
    queryKey: ["location-by-slug", locationSlug],
    queryFn: async () => {
      if (fallbackLocation) return fallbackLocation;
      const { data: cityData } = await supabase.from("cities").select("id, name, slug").eq("slug", locationSlugLower).maybeSingle();
      if (cityData) return cityData;
      const { data: stateData } = await supabase.from("states").select("id, name, slug").eq("slug", locationSlugLower).maybeSingle();
      return stateData || fallbackLocation;
    },
    enabled: !!locationSlug,
  });

  const { data: category, isLoading: categoryLoading } = useQuery({
    queryKey: ["category-by-slug", categorySlug],
    queryFn: async () => {
      const { data } = await supabase.from("treatments").select("id, name, slug, description").eq("slug", categorySlugLower).maybeSingle();
      return data || fallbackCategory;
    },
    enabled: !!categorySlug,
  });

  const seoSlug = `fostering-agencies/${locationSlug}/${categorySlug}`;
  const { data: seoContent } = useSeoPageContent(seoSlug);

  const { data: agencies, isLoading: agenciesLoading } = useQuery({
    queryKey: ["category-location-agencies", location?.name],
    queryFn: async () => {
      if (!location) return [];
      const { data } = await supabaseAdmin
        .from("agencies")
        .select("id, name, slug, rating, review_count, is_verified, city, state, main_image_url, cover_image_url, description")
        .ilike("city", `%${location.name}%`)
        .eq("is_duplicate", false)
        .order("rating", { ascending: false })
        .limit(30);
      return (data || []) as any[];
    },
    enabled: !!location,
  });

  const { data: nearbyLocations } = useQuery({
    queryKey: ["nearby-locations", locationSlug],
    queryFn: async () => {
      const { data } = await supabase.from("cities").select("id, name, slug").neq("slug", locationSlug).limit(10);
      return (data || []).slice(0, 8);
    },
    enabled: !!locationSlug,
  });

  const isLoading = locationLoading || categoryLoading || agenciesLoading;
  usePrerenderReady(!isLoading);

  if (isLoading) {
    return <PageLayout><div className="container py-20"><Skeleton className="h-16 w-full mb-6 rounded-xl" /><Skeleton className="h-48 w-full mb-6 rounded-xl" /><Skeleton className="h-32 w-full rounded-xl" /></div></PageLayout>;
  }

  if (!location || !category) {
    return <PageLayout><div className="container py-20"><h1 className="text-2xl font-bold">Page Not Found</h1><p className="mt-2 text-muted-foreground">The category or location doesn't exist.</p><Button className="mt-4" asChild><Link to="/">Go Home</Link></Button></div></PageLayout>;
  }

  const categoryName = category.name;
  const locationName = location.name;
  const pageTitle = `${categoryName} Agencies in ${locationName} | Find Foster Care`;
  const pageDescription = `Find ${categoryName.toLowerCase()} fostering agencies in ${locationName}.`;
  const canonicalUrl = `https://www.foster-care.co.uk/fostering-agencies/${locationSlug}/${categorySlug}/`;
  const shouldNoIndex = !agenciesLoading && (!agencies || agencies.length === 0);

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Fostering Agencies", href: "/fostering-agencies" },
    { label: locationName, href: `/fostering-agencies/${locationSlug}` },
    { label: categoryName, href: canonicalUrl },
  ];

  return (
    <PageLayout>
      <SEOHead 
        title={seoContent?.meta_title || pageTitle} 
        description={seoContent?.meta_description || pageDescription} 
        canonical={canonicalUrl}
        keywords={[`${categoryName} agencies ${locationName}`, 'foster care agency', 'fostering type UK']}
        noindex={shouldNoIndex}
      />
      <StructuredData type="breadcrumb" items={[
        { name: "Home", url: "/" },
        { name: categoryName, url: `/fostering-types/${categorySlug}` },
        { name: locationName, url: `/fostering-agencies/${locationSlug}` }
      ]} />
      <StructuredData type="organization" />
      <StructuredData type="faq" questions={[
        { question: `What is ${categoryName}?`, answer: `${categoryName} is a specialised form of fostering care.` },
        { question: `How do I find ${categoryName} agencies in ${locationName}?`, answer: `Browse our directory of verified agencies.` },
        { question: `What support is available?`, answer: `All agencies provide full training and support for foster carers.` },
      ]} />
      <section className="relative overflow-hidden min-h-[40vh] flex items-center bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-[300px] h-[300px] bg-primary/15 rounded-full blur-[100px]" />
          <div className="absolute -bottom-20 -left-20 w-[250px] h-[250px] bg-primary/10 rounded-full blur-[80px]" />
        </div>
        <div className="container py-12 relative z-10">
          <Breadcrumbs items={breadcrumbs} className="[&_a]:text-white/60 [&_span]:text-white/40" />
          <h1 className="animate-fade-in-up text-4xl md:text-5xl font-bold text-white mt-6">{categoryName} in {locationName}</h1>
          <p className="animate-fade-in text-xl text-white/80 mt-4 max-w-2xl" style={{ animationDelay: '0.1s' }}>{seoContent?.content || `Find verified ${categoryName.toLowerCase()} agencies in ${locationName}.`}</p>
        </div>
      </section>
      <div className="container py-8">
        <Section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Available Agencies</h2>
            <Badge variant="outline">Agencies</Badge>
          </div>
          {agenciesLoading ? <div className="grid gap-6 md:grid-cols-3">{[1,2,3].map(i => <Skeleton key={i} className="h-72 rounded-xl" />)}</div> : agencies && agencies.length > 0 ? <div className="grid gap-6 md:grid-cols-3">{agencies.map((a: any) => {
              const agencyImage = a.main_image_url || a.cover_image_url;
              return (
                <Link key={a.id} to={`/agency/${a.slug}`}>
                  <Card className="h-full overflow-hidden hover:shadow-lg transition-all hover:border-teal-500/50">
                    <div className="relative h-32 bg-gradient-to-br from-teal-500/20 to-amber-500/20">
                      {agencyImage ? (
                        <img src={agencyImage} alt={a.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-600 to-slate-800">
                          <span className="text-3xl font-bold text-white/30">{a.name?.charAt(0)}</span>
                        </div>
                      )}
                      {a.is_verified && <Badge className="absolute top-2 left-2 bg-teal-500 text-white text-xs"><Shield className="w-3 h-3 mr-1" />Verified</Badge>}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg line-clamp-1">{a.name}</h3>
                      <div className="flex items-center mt-1 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-1" />
                        {a.city || locationName}
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        {a.rating && (
                          <div className="flex items-center">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                            <span className="font-medium">{a.rating.toFixed(1)}</span>
                            <span className="text-xs text-muted-foreground ml-1">({a.review_count || 0})</span>
                          </div>
                        )}
                        <Button size="sm">View</Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}</div> : <div className="text-center py-12 bg-muted/30 rounded-xl"><Users className="w-12 h-12 mx-auto text-muted-foreground/40" /><p className="mt-4 font-medium">No agencies found</p><p className="text-sm text-muted-foreground">We're still adding agencies for this service.</p></div>}
        </Section>
        <Section className="mt-12">
          <div className="flex gap-4">
            <Link to={`/fostering-types/${categorySlug}`} className="text-primary hover:underline flex items-center gap-2"><ArrowRight className="w-4 h-4 rotate-180" />All {categoryName}</Link>
            <Link to={`/fostering-agencies/${locationSlug}`} className="text-primary hover:underline">All in {locationName}</Link>
          </div>
        </Section>
        {nearbyLocations && <Section className="mt-12"><h3 className="font-bold mb-4">Nearby</h3><div className="flex flex-wrap gap-2">{nearbyLocations.map((l: any) => <Link key={l.id} to={`/fostering-agencies/${l.slug}/${categorySlug}`}><Badge>{l.name}</Badge></Link>)}</div></Section>}
        <Section className="mt-12">
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
            <CardContent className="p-8 text-center text-white">
              <h2 className="text-2xl font-bold">Ready to Start?</h2>
              <div className="mt-4 flex gap-4 justify-center">
                <Button size="lg" asChild><Link to="/search">Find Agencies</Link></Button>
                <Button size="lg" variant="outline" asChild><Link to="/become-foster-carer">Become Carer</Link></Button>
              </div>
            </CardContent>
          </Card>
        </Section>
      </div>
    </PageLayout>
  );
};

export default FosteringCategoryLocationPage;