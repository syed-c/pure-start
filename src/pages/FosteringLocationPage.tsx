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
import { POPULAR_CITIES, FOSTERING_CATEGORIES, ACTIVE_REGIONS } from "@/lib/constants/activeRegions";
import { Heart, Shield, Users, MapPin, Star, ArrowRight, Search, UserPlus } from "lucide-react";

const FosteringLocationPage = () => {
  const { locationSlug } = useParams();
  const locationSlugLower = locationSlug?.toLowerCase() || '';
  const isIndexPage = !locationSlug;

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
    'devon': 'Devon',
    'norfolk': 'Norfolk',
    'suffolk': 'Suffolk',
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
    'rochester': 'Rochester',
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
    'bracknell': 'Bracknell',
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
    'welwyn-garden-city': 'Welwyn Garden City',
    'bishop-stortford': 'Bishop Stortford',
    'borehamwood': 'Borehamwood',
    // London Boroughs
    'croydon': 'Croydon',
    'bromley': 'Bromley',
    'enfield': 'Enfield',
    'barnet': 'Barnet',
    'ealing': 'Ealing',
    'harrow': 'Harrow',
    'hillingdon': 'Hillingdon',
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
    'durham': 'Durham',
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
    'inverness': 'Inverness',
    'swansea': 'Swansea',
    'newport': 'Newport',
    'wrexham': 'Wrexham',
    'derry': 'Derry',
    // Additional Cities from POPULAR_CITIES
    'leicester': 'Leicester',
    'coventry': 'Coventry',
    'plymouth': 'Plymouth',
    'norwich': 'Norwich',
    'portsmouth': 'Portsmouth',
    'milton-keynes': 'Milton Keynes',
    'walsall': 'Walsall',
    'oldham': 'Oldham',
    'wigan': 'Wigan',
    'salford': 'Salford',
    'blackpool': 'Blackpool',
    'exeter': 'Exeter',
    'stirling': 'Stirling',
    'paisley': 'Paisley',
    'barry': 'Barry',
    'lisburn': 'Lisburn',
    'newry': 'Newry',
  };

  const fallbackLocation = locationNameMap[locationSlugLower]
    ? { 
        id: `fallback-${locationSlugLower}`, 
        name: locationNameMap[locationSlugLower], 
        slug: locationSlugLower, 
        type: locationSlugLower.length > 2 ? "city" as const : "state" as const 
      }
    : null;

  const { data: location, isLoading: locationLoading } = useQuery({
    queryKey: ["location-by-slug", locationSlug],
    queryFn: async () => {
      if (fallbackLocation) return fallbackLocation;
      
      const { data: cityData } = await supabase
        .from("cities")
        .select("id, name, slug, state_id, country")
        .eq("slug", locationSlugLower)
        .eq("is_active", true)
        .maybeSingle();
      
      if (cityData) return { ...cityData, type: "city" as const };
      
      const { data: stateData } = await supabase
        .from("states")
        .select("id, name, slug, abbreviation")
        .eq("slug", locationSlugLower)
        .eq("is_active", true)
        .maybeSingle();
      
      if (stateData) return { ...stateData, type: "state" as const };
      
      return fallbackLocation;
    },
    enabled: !!locationSlug,
  });

  // Fetch SEO content from database
  const { data: seoContent } = useSeoPageContent(locationSlug ? `fostering-agencies/${locationSlug}` : 'fostering-agencies');

  const { data: treatments } = useQuery({
    queryKey: ["active-treatments"],
    queryFn: async () => {
      const { data } = await supabase
        .from("treatments")
        .select("id, name, slug")
        .eq("is_active", true)
        .order("display_order", { ascending: true })
        .limit(10);
      return data || [];
    },
  });

  const { data: agencies, isLoading: agenciesLoading } = useQuery({
    queryKey: ["location-agencies", location?.slug],
    queryFn: async () => {
      if (!location) return [];

      // Strategy 1: Try relational query via agency_locations junction table + city_id
      try {
        const { data: cityData } = await supabaseAdmin
          .from("cities")
          .select("id")
          .eq("slug", location.slug)
          .eq("is_active", true)
          .maybeSingle();

        if (cityData?.id) {
          const { data: relationalAgencies } = await supabaseAdmin
            .from("agency_locations")
            .select("agency:agencies(id, name, slug, rating, review_count, is_verified, city, state, main_image_url, cover_image_url, description)")
            .eq("location_id", cityData.id)
            .limit(30);

          if (relationalAgencies && relationalAgencies.length > 0) {
            const mapped = relationalAgencies
              .map((row: any) => row.agency)
              .filter(Boolean)
              .filter((a: any) => !a.is_duplicate);
            if (mapped.length > 0) return mapped;
          }
        }
      } catch (_e) {
        // Fallback to text search if relational query fails
      }

      // Strategy 2: Fallback to text-based city/state matching
      const { data } = await supabaseAdmin
        .from("agencies")
        .select("id, name, slug, rating, review_count, is_verified, city, state, main_image_url, cover_image_url, description")
        .or(`city.ilike.%${location.name}%,state.ilike.%${location.name}%`)
        .eq("is_duplicate", false)
        .order("rating", { ascending: false })
        .limit(30);
      return (data || []) as any[];
    },
    enabled: !!location,
  });

  const { data: nearbyLocations } = useQuery({
    queryKey: ["nearby-locations", locationSlug, location?.type],
    queryFn: async () => {
      if (!location) return [];

      // Get current city's state_id for sibling cities
      const { data: currentCity } = await supabase
        .from("cities")
        .select("state_id")
        .eq("slug", locationSlug)
        .eq("is_active", true)
        .maybeSingle();

      // If we have a state_id, show sibling cities in same nation
      if (currentCity?.state_id) {
        const { data: siblings } = await supabase
          .from("cities")
          .select("id, name, slug")
          .eq("state_id", currentCity.state_id)
          .eq("is_active", true)
          .neq("slug", locationSlug)
          .order("name")
          .limit(8);
        return siblings || [];
      }

      // Fallback: show other active cities
      const { data } = await supabase
        .from("cities")
        .select("id, name, slug")
        .eq("is_active", true)
        .neq("slug", locationSlug)
        .order("name")
        .limit(8);
      return data || [];
    },
    enabled: !!locationSlug && !!location,
  });

  const isLoading = locationLoading || agenciesLoading;
  usePrerenderReady(!isLoading);

  // INDEX PAGE: /fostering-agencies (no location slug)
  if (isIndexPage) {
    return (
      <PageLayout>
        <SEOHead
          title="Find Fostering Agencies UK | Directory"
          description="Browse all UK fostering agencies. Find rated agencies by location, compare services, and contact them directly."
          canonical="https://www.foster-care.co.uk/fostering-agencies"
        />

        {/* Hero Section - Homepage Style */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-950 via-slate-900 to-teal-950 pointer-events-none">
            <div className="absolute inset-0 opacity-30 pointer-events-none">
              <div className="absolute top-20 left-10 w-72 h-72 bg-teal-500/20 rounded-full blur-[100px]" />
              <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px]" />
            </div>
          </div>

          <div className="container relative z-10 px-4 py-12 md:py-16">
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Fostering Agencies", href: "/fostering-agencies" }]} />
            
            <div className="max-w-3xl mx-auto text-center">
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1.5 mb-4"
              >
                <Shield className="h-3.5 w-3.5 text-teal-400" />
                <span className="text-xs font-medium text-white">UK's Leading Fostering Directory</span>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.1 }}
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 leading-tight"
              >
                Find Trusted <span className="text-teal-400">Fostering Agencies</span> UK
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.2 }}
                className="text-sm text-white/70 mb-5 max-w-lg mx-auto"
              >
                Connect with Ofsted-registered fostering agencies across the UK.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.3 }}
                className="flex justify-center gap-5"
              >
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-teal-400" />
                  <span className="text-sm font-semibold text-white">500+</span>
                  <span className="text-xs text-white/60">Agencies</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-teal-400" />
                  <span className="text-sm font-semibold text-white">100+</span>
                  <span className="text-xs text-white/60">Cities</span>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <div className="container py-8">
          <Section className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Browse by Location</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {POPULAR_CITIES.slice(0, 20).map((city: any) => (
                <Link key={city.slug} to={`/fostering-agencies/${city.slug}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-4 text-center">
                      <MapPin className="w-5 h-5 mx-auto text-teal-600 mb-2" />
                      <h3 className="font-semibold">{city.name}</h3>
                      <p className="text-sm text-gray-500">{city.region}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Button variant="outline" asChild>
                <Link to="/locations">View All Locations</Link>
              </Button>
            </div>
          </Section>

          <Section className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Browse by Fostering Type</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {FOSTERING_CATEGORIES.slice(0, 6).map((cat: any) => (
                <Link key={cat.slug} to={`/categories/${cat.slug}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-4 text-center">
                      <h3 className="font-semibold">{cat.name}</h3>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Button variant="outline" asChild>
                <Link to="/categories">View All Services</Link>
              </Button>
            </div>
          </Section>

          <Section className="relative overflow-hidden mt-12">
            <div className="absolute inset-0 bg-subtle-grid opacity-20 pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-4">Find Fostering Agencies Across the UK</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl">
                Browse our comprehensive directory of fostering agencies organised by UK nation and region. 
                Select your area below to find Ofsted-rated agencies near you.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {ACTIVE_REGIONS.map((region) => (
                  <Link key={region.slug} to={`/fostering-agencies/${region.slug}`}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardContent className="p-4 text-center">
                        <h3 className="font-semibold">{region.name}</h3>
                        <p className="text-sm text-gray-500">View agencies →</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </Section>

          <Section className="mt-12">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold">Ready to Find Your Perfect Agency?</h2>
                <p className="mt-2 text-gray-600">
                  Search and compare fostering agencies across the UK.
                </p>
                <div className="mt-6 flex gap-4 justify-center">
                  <Button size="lg" asChild>
                    <Link to="/search">
                      <Search className="w-4 h-4 mr-2" />
                      Search Agencies
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/become-foster-carer">
                      Become a Foster Carer
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Section>
        </div>
      </PageLayout>
    );
  }

  if (isLoading) {
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

  if (!location) {
    return (
      <PageLayout>
        <div className="container py-20">
          <h1 className="text-2xl font-bold">Page Not Found</h1>
          <p className="mt-2 text-gray-600">
            The location you're looking for doesn't exist.
          </p>
          <Button className="mt-4" asChild>
            <Link to="/">Go Home</Link>
          </Button>
        </div>
      </PageLayout>
    );
  }

  const locationName = location.name;
  const pageTitle = `Fostering Agencies in ${locationName} | Find Foster Care`;
  const pageDescription = `Find rated fostering agencies in ${locationName}. Browse verified agencies, compare services, and contact them directly.`;
  const canonicalUrl = `https://www.foster-care.co.uk/fostering-agencies/${locationSlug}/`;

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Fostering Agencies", href: "/fostering-agencies" },
    { label: locationName, href: canonicalUrl },
  ];

const shouldNoIndex = !isIndexPage && (!agencies || agencies.length === 0);

  // Get agencies length for noIndex calculation
  const agencyCount = agencies?.length || 0;
  const needsNoIndex = !isIndexPage && agencyCount === 0;

  return (
    <PageLayout>
      <SEOHead
        title={seoContent?.meta_title || pageTitle}
        description={seoContent?.meta_description || pageDescription}
        canonical={canonicalUrl}
        keywords={[`fostering agencies ${locationName}`, `foster care ${locationName}`, `Ofsted registered fostering ${locationName}`, `foster care ${locationName}`]}
        noIndex={shouldNoIndex}
        openGraph={{
          title: seoContent?.meta_title || pageTitle,
          description: seoContent?.meta_description || pageDescription,
          url: canonicalUrl,
          type: 'website',
        }}
      />
      
      {/* Structured Data for LocalBusiness */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": `Fostering Agencies in ${locationName}`,
            "description": pageDescription,
            "url": canonicalUrl,
            "publisher": {
              "@type": "Organization",
              "name": "Foster Care UK",
            },
          }),
        }}
      />
      {/* BreadcrumbList Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://fostercareuk.com/" },
              { "@type": "ListItem", "position": 2, "name": "Fostering Agencies", "item": "https://fostercareuk.com/fostering-agencies" },
              { "@type": "ListItem", "position": 3, "name": locationName, "item": canonicalUrl },
            ],
          }),
        }}
      />
      {/* Organization Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Foster Care UK",
            "url": "https://fostercareuk.com",
            "logo": "https://fostercareuk.com/logo.png",
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+44-800-123-4567",
              "contactType": "customer service",
              "areaServed": "GB",
            },
          }),
        }}
      />
{/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              { "@type": "Question", "name": `How do I find fostering agencies in ${locationName}?`, "acceptedAnswer": { "@type": "Answer", "text": `Browse our directory of verified fostering agencies in ${locationName}.` } },
              { "@type": "Question", "name": `What types of fostering are available?`, "acceptedAnswer": { "@type": "Answer", "text": "Various types including short-term, long-term, emergency, and specialist fostering." } },
              { "@type": "Question", "name": "How do I become a foster carrier?", "acceptedAnswer": { "@type": "Answer", "text": "Contact any agency directly to begin your journey as a foster carrier." } },
            ],
          }),
        }}
      />

      {/* Hero Section - Homepage Style */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-950 via-slate-900 to-teal-950 pointer-events-none">
          <div className="absolute inset-0 opacity-40 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/30 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-amber-500/20 rounded-full blur-[100px]" />
          </div>
        </div>

        <div className="container relative z-10 px-4 py-16 md:py-20">
          <Breadcrumbs items={breadcrumbs} />
          
          <div className="max-w-3xl mx-auto text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-2 mb-5"
            >
              <Shield className="h-4 w-4 text-teal-400" />
              <span className="text-xs font-semibold text-white">Fostering Agencies in {locationName}</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight"
            >
              {seoContent?.h1 || `Find Trusted Fostering Agencies in ${locationName}`}
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.2 }}
              className="text-base md:text-lg text-white/80 mb-8 max-w-xl mx-auto"
            >
              {seoContent?.meta_description || `Find verified fostering agencies in ${locationName}.`}
            </motion.p>

            {/* Modern Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.3 }}
              className="flex justify-center gap-4"
            >
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-2.5">
                <Users className="h-5 w-5 text-teal-400" />
                <span className="text-base font-bold text-white">Verified Agencies</span>
                <span className="text-xs text-white/60">Agencies</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-2.5">
                <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                <span className="text-base font-bold text-white">4.8</span>
                <span className="text-xs text-white/60">Avg Rating</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="container py-8">
        {/* Fostering Services */}
        {treatments && treatments.length > 0 && (
          <Section className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Fostering Services in {locationName}</h2>
            <div className="flex flex-wrap gap-3">
              {treatments.map((treatment: any) => (
                <Link key={treatment.id} to={`/fostering-agencies/${locationSlug}/${treatment.slug}`}>
                  <Badge variant="outline" className="cursor-pointer hover:bg-gray-100 py-2 px-4">
                    {treatment.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </Section>
        )}

        {/* Agencies - Grid Format with Images */}
        <Section className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Available Fostering Agencies</h2>
          
          {agenciesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-64 w-full rounded-xl" />
              ))}
            </div>
          ) : agencies && agencies.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {agencies.slice(0, 12).map((agency: any) => {
                const agencyImage = agency.main_image_url || agency.cover_image_url;
                return (
                  <Link key={agency.id} to={`/agency/${agency.slug}`} className="group">
                    <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-teal-500/50">
                      {/* Image */}
                      <div className="relative h-40 bg-gradient-to-br from-teal-500/20 to-amber-500/20 overflow-hidden">
                        {agencyImage ? (
                          <img 
                            src={agencyImage} 
                            alt={agency.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-600 to-slate-800">
                            <span className="text-4xl font-bold text-white/30">{agency.name?.charAt(0)}</span>
                          </div>
                        )}
                        {agency.is_verified && (
                          <Badge className="absolute top-3 left-3 bg-teal-500 text-white text-xs">
                            <Shield className="w-3 h-3 mr-1" /> Verified
                          </Badge>
                        )}
                      </div>
                      
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-foreground group-hover:text-teal-600 transition-colors line-clamp-1">
                          {agency.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                          {agency.city || locationName}
                        </p>
                        {agency.rating && (
                          <div className="flex items-center gap-1 mt-2">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{agency.rating.toFixed(1)}</span>
                            <span className="text-xs text-muted-foreground">({agency.review_count || 0})</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-xl">
              <Users className="w-12 h-12 mx-auto text-muted-foreground/40" />
              <h3 className="mt-3 text-lg font-medium">No agencies found in {locationName}</h3>
              <p className="text-sm text-muted-foreground mt-1">We're still adding agencies for this location.</p>
            </div>
          )}
        </Section>

        {/* View More */}
        {agencies && agencies.length > 12 && (
          <div className="py-6 text-center">
            <Button size="lg" variant="outline" className="border-teal-500 text-teal-600 hover:bg-teal-500/10" asChild>
              <Link to={`/search?location=${locationSlug}`}>
                View All {agencies.length} Agencies in {locationName}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}

        {/* Nearby Locations - Enhanced */}
        {nearbyLocations && nearbyLocations.length > 0 && (
          <Section className="py-6 bg-slate-900/30 -mx-4 px-4 rounded-xl">
            <h2 className="text-lg font-bold text-white mb-3">Nearby Locations</h2>
            <p className="text-sm text-white/60 mb-4">Explore agencies in nearby cities</p>
            <div className="flex flex-wrap gap-2">
              {nearbyLocations.slice(0, 8).map((loc: any) => (
                <Link key={loc.id} to={`/fostering-agencies/${loc.slug}`}>
                  <Badge className="cursor-pointer bg-slate-800 border-slate-700 hover:bg-teal-600 hover:border-teal-500 hover:text-white text-slate-300 py-2 px-4 text-sm transition-all">
                    {loc.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </Section>
        )}

        {/* Services in Location */}
        {treatments && treatments.length > 0 && (
          <Section className="py-6">
            <h2 className="text-lg font-bold text-foreground mb-3">Fostering Services in {locationName}</h2>
            <p className="text-sm text-muted-foreground mb-4">Find agencies by service type</p>
            <div className="flex flex-wrap gap-2">
              {treatments.slice(0, 6).map((treatment: any) => (
                <Link key={treatment.id} to={`/fostering-agencies/${locationSlug}/${treatment.slug}`}>
                  <Badge className="cursor-pointer bg-teal-500/10 border-teal-500/30 hover:bg-teal-500 hover:text-white text-teal-400 py-2 px-4 text-sm transition-all">
                    {treatment.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </Section>
        )}

        {/* Content Section - From Page Manager - Styled */}
        {seoContent?.content ? (
          <Section className="py-8 bg-slate-900 rounded-xl -mx-4 px-4">
            <Card className="bg-transparent border-0 shadow-none">
              <CardContent className="p-0">
                <h2 className="text-xl font-bold text-white mb-4">{seoContent.title || `About Fostering in ${locationName}`}</h2>
                <div className="text-sm text-white/70 leading-relaxed whitespace-pre-line" 
                  dangerouslySetInnerHTML={{ __html: seoContent.content.replace(/\n/g, '<br>') }} />
              </CardContent>
            </Card>
          </Section>
        ) : (
          <Section className="py-8 bg-slate-900 rounded-xl -mx-4 px-4">
            <Card className="bg-transparent border-0 shadow-none">
              <CardContent className="p-0">
                <h2 className="text-xl font-bold text-white mb-3">About Fostering in {locationName}</h2>
                <p className="text-sm text-white/70 leading-relaxed">
                  {locationName} has several Ofsted-registered fostering agencies. Find verified agencies offering emergency, short-term, long-term, and specialist placements. Browse our directory to compare services, ratings, and connect directly with agencies in your area.
                </p>
              </CardContent>
            </Card>
          </Section>
        )}

        {/* CTA Section - Enhanced */}
        <Section className="py-10">
          <Card className="bg-gradient-to-r from-teal-900 via-slate-900 to-amber-900/30 border-teal-800/50 shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-64 h-64 bg-teal-500/30 rounded-full blur-[80px]" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-amber-500/20 rounded-full blur-[80px]" />
            </div>
            <CardContent className="p-8 text-center relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Ready to Find Your Perfect Agency?</h2>
              <p className="text-base text-white/70 mb-6 max-w-xl mx-auto">Connect with verified fostering agencies in {locationName} today. Start your journey to becoming a foster carer.</p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button size="xl" className="bg-teal-500 hover:bg-teal-600 text-white font-bold px-8 h-14 text-base rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all" asChild>
                  <Link to="/search">
                    <Search className="mr-2 h-5 w-5" />
                    Find Agencies
                  </Link>
                </Button>
                <Button size="xl" variant="outline" className="border-2 border-white/40 bg-white/10 hover:bg-white/20 text-white font-bold px-8 h-14 text-base rounded-xl backdrop-blur-sm transition-all" asChild>
                  <Link to="/become-foster-carer">
                    <UserPlus className="mr-2 h-5 w-5" />
                    Become a Carer
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </Section>
      </div>
    </PageLayout>
  );
};

export default FosteringLocationPage;