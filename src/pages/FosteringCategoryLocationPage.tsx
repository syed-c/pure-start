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
      const { data } = await supabaseAdmin.from("agencies").select("*").ilike("city", `%${location.name}%`).limit(30);
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
    return <PageLayout><div className="container py-20"><h1 className="text-2xl font-bold">Page Not Found</h1><p className="mt-2 text-muted-foreground">The category or location doesn't exist.</p><Link to="/"><Button className="mt-4">Go Home</Button></Link></div></PageLayout>;
  }

  const categoryName = category.name;
  const locationName = location.name;
  const pageTitle = `${categoryName} Agencies in ${locationName} | Find Foster Care`;
  const pageDescription = `Find ${categoryName.toLowerCase()} fostering agencies in ${locationName}.`;
  const canonicalUrl = `https://www.foster-care.co.uk/fostering-agencies/${locationSlug}/${categorySlug}/`;

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Fostering Agencies", href: "/fostering-agencies" },
    { label: locationName, href: `/fostering-agencies/${locationSlug}` },
    { label: categoryName, href: canonicalUrl },
  ];

  return (
    <PageLayout>
      <SEOHead title={seoContent?.meta_title || pageTitle} description={seoContent?.meta_description || pageDescription} canonical={canonicalUrl} />
      <section className="relative overflow-hidden min-h-[40vh] flex items-center bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-[300px] h-[300px] bg-primary/15 rounded-full blur-[100px]" />
          <div className="absolute -bottom-20 -left-20 w-[250px] h-[250px] bg-primary/10 rounded-full blur-[80px]" />
        </div>
        <div className="container py-12 relative z-10">
          <Breadcrumbs items={breadcrumbs} className="[&_a]:text-white/60 [&_span]:text-white/40" />
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-bold text-white mt-6">{categoryName} in {locationName}</motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-xl text-white/80 mt-4 max-w-2xl">{seoContent?.content || `Find verified ${categoryName.toLowerCase()} agencies in ${locationName}.`}</motion.p>
        </div>
      </section>
      <div className="container py-8">
        <Section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Available Agencies</h2>
            <Badge variant="outline">{agencies?.length || 0}</Badge>
          </div>
          {agenciesLoading ? <div className="grid gap-6 md:grid-cols-3">{[1,2,3].map(i => <Skeleton key={i} className="h-64 rounded-xl" />)}</div> : agencies && agencies.length > 0 ? <div className="grid gap-6 md:grid-cols-3">{agencies.map((a: any) => <Card key={a.id}><CardContent className="p-6"><div className="flex justify-between"><h3 className="font-semibold">{a.name}</h3>{a.rating && <Star className="w-4 h-4 fill-yellow-400" />}</div><Link to={`/agency/${a.slug}`}><Button size="sm" className="mt-4">View</Button></Link></CardContent></Card>)}</div> : <div className="text-center py-12"><Users className="w-12 h-12 mx-auto text-muted" /><p className="mt-4">No agencies found</p></div>}
        </Section>
        <Section className="mt-12">
          <div className="flex gap-4">
            <Link to={`/categories/${categorySlug}`} className="text-primary hover:underline flex items-center gap-2"><ArrowRight className="w-4 h-4 rotate-180" />All {categoryName}</Link>
            <Link to={`/fostering-agencies/${locationSlug}`} className="text-primary hover:underline">All in {locationName}</Link>
          </div>
        </Section>
        {nearbyLocations && <Section className="mt-12"><h3 className="font-bold mb-4">Nearby</h3><div className="flex flex-wrap gap-2">{nearbyLocations.map((l: any) => <Link key={l.id} to={`/fostering-agencies/${l.slug}/${categorySlug}`}><Badge>{l.name}</Badge></Link>)}</div></Section>}
        <Section className="mt-12">
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
            <CardContent className="p-8 text-center text-white">
              <h2 className="text-2xl font-bold">Ready to Start?</h2>
              <div className="mt-4 flex gap-4 justify-center">
                <Link to="/search"><Button size="lg">Find Agencies</Button></Link>
                <Link to="/become-foster-carer"><Button size="lg" variant="outline">Become Carer</Button></Link>
              </div>
            </CardContent>
          </Card>
        </Section>
      </div>
    </PageLayout>
  );
};

export default FosteringCategoryLocationPage;