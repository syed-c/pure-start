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
import { POPULAR_CITIES, FOSTERING_CATEGORIES } from "@/lib/constants/activeRegions";
import { Heart, Shield, Users, MapPin, Star, ArrowRight, Search } from "lucide-react";

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
    ' Rochester': 'Rochester',
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
    queryKey: ["location-agencies", location?.name],
    queryFn: async () => {
      if (!location) return [];
      const { data } = await supabaseAdmin
        .from("agencies")
        .select("*")
        .ilike("city", `%${location.name}%`)
        .order("rating", { ascending: false })
        .limit(30);
      return (data || []) as any[];
    },
    enabled: !!location,
  });

  const { data: nearbyLocations } = useQuery({
    queryKey: ["nearby-locations", locationSlug],
    queryFn: async () => {
      const { data } = await supabase
        .from("cities")
        .select("id, name, slug")
        .eq("is_active", true)
        .neq("slug", locationSlug)
        .order("name")
        .limit(10);
      return (data || []).slice(0, 8);
    },
    enabled: !!locationSlug,
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
          <div className="absolute inset-0 bg-gradient-to-br from-teal-950 via-slate-900 to-teal-950">
            <div className="absolute inset-0 opacity-30">
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
              <Link to="/locations">
                <Button variant="outline">View All Locations</Button>
              </Link>
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
              <Link to="/categories">
                <Button variant="outline">View All Services</Button>
              </Link>
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
                  <Link to="/search">
                    <Button size="lg">
                      <Search className="w-4 h-4 mr-2" />
                      Search Agencies
                    </Button>
                  </Link>
                  <Link to="/become-foster-carer">
                    <Button size="lg" variant="outline">
                      Become a Foster Carer
                    </Button>
                  </Link>
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
          <Link to="/">
            <Button className="mt-4">Go Home</Button>
          </Link>
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

  return (
    <PageLayout>
      <SEOHead
        title={pageTitle}
        description={pageDescription}
        canonical={canonicalUrl}
      />

      {/* Hero Section - Homepage Style */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-950 via-slate-900 to-teal-950">
          <div className="absolute inset-0 opacity-40">
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
              {seoContent?.meta_description || `${agencies?.length || 0} verified fostering agencies in ${locationName}. Find your perfect match today.`}
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
                <span className="text-base font-bold text-white">{agencies?.length || 0}</span>
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

        {/* Agencies - Horizontal Row Format */}
        <Section className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Available Fostering Agencies</h2>
          
          {agenciesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          ) : agencies && agencies.length > 0 ? (
            <div className="space-y-0 divide-y divide-gray-100">
              {agencies.slice(0, 10).map((agency: any) => (
                <div key={agency.id} className="flex items-center gap-4 py-3 px-3 -mx-3 hover:bg-gray-50 transition-colors rounded-lg">
                  {/* Left: Logo */}
                  <div className="w-12 h-12 shrink-0 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                    <span className="text-lg font-bold text-white">{agency.name?.charAt(0)}</span>
                  </div>
                  
                  {/* Middle: Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold">{agency.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                      <MapPin className="w-3 h-3" />
                      <span>{agency.city || locationName}</span>
                    </div>
                  </div>
                  
                  {/* Right: Rating + CTA */}
                  <div className="flex items-center gap-2 shrink-0">
                    {agency.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{agency.rating.toFixed(1)}</span>
                      </div>
                    )}
                    <Link to={`/agency/${agency.slug}`}>
                      <Button size="sm" variant="outline" className="text-xs">View</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-10 h-10 mx-auto text-gray-400" />
              <h3 className="mt-3 text-base font-medium">No agencies found</h3>
            </div>
          )}
        </Section>

        {/* View More */}
        {agencies && agencies.length > 10 && (
          <div className="mt-4 text-center">
            <Link to="/search">
              <Button variant="outline" size="sm">View All {agencies.length} Agencies</Button>
            </Link>
          </div>
        )}

        {/* Nearby Locations */}
        {nearbyLocations && nearbyLocations.length > 0 && (
          <Section className="mt-8">
            <h2 className="text-xl font-bold mb-3">Nearby Locations</h2>
            <div className="flex flex-wrap gap-2">
              {nearbyLocations.slice(0, 8).map((loc: any) => (
                <Link key={loc.id} to={`/fostering-agencies/${loc.slug}`}>
                  <Badge variant="outline" className="cursor-pointer hover:bg-teal-50 text-xs py-1.5 px-3">
                    {loc.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </Section>
        )}

        {/* Services in Location */}
        {treatments && treatments.length > 0 && (
          <Section className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Explore Fostering Services in {locationName}</h2>
            <p className="text-gray-600 mb-4">Find specific types of fostering agencies in {locationName}:</p>
            <div className="flex flex-wrap gap-3">
              {treatments.slice(0, 5).map((treatment: any) => (
                <Link key={treatment.id} to={`/fostering-agencies/${locationSlug}/${treatment.slug}`}>
                  <Badge className="cursor-pointer bg-teal-100 hover:bg-teal-200 text-teal-800 py-2 px-4">
                    {treatment.name} in {locationName}
                  </Badge>
                </Link>
              ))}
            </div>
          </Section>
        )}

        {/* Content Section - From Page Manager */}
        {seoContent?.content ? (
          <Section className="mt-8">
            <Card>
              <CardContent className="p-5">
                <h2 className="text-lg font-bold mb-3">{seoContent.title || `About Fostering in ${locationName}`}</h2>
                <div className="text-sm text-gray-600 prose prose-sm max-w-none" 
                  dangerouslySetInnerHTML={{ __html: seoContent.content.replace(/\n/g, '<br>') }} />
              </CardContent>
            </Card>
          </Section>
        ) : (
          <Section className="mt-8">
            <Card>
              <CardContent className="p-5">
                <h2 className="text-lg font-bold mb-3">About Fostering in {locationName}</h2>
                <p className="text-sm text-gray-600">
                  {locationName} has several Ofsted-registered fostering agencies. Find verified agencies offering emergency, short-term, long-term, and specialist placements.
                </p>
              </CardContent>
            </Card>
          </Section>
        )}

        {/* CTA Section */}
        <Section className="mt-8">
          <Card className="bg-gradient-to-r from-teal-600 via-teal-500 to-teal-600 border-0 shadow-xl shadow-teal-500/20">
            <CardContent className="p-6 text-center text-white">
              <h2 className="text-xl font-bold">Find the Right Agency in {locationName}</h2>
              <p className="text-sm text-white/70 mt-1 mb-4">Connect with verified fostering agencies today</p>
              <div className="flex gap-3 justify-center">
                <Link to="/search">
                  <Button size="lg" className="bg-white text-teal-700 hover:bg-gray-100 rounded-xl px-6">Find Agencies</Button>
                </Link>
                <Link to="/become-foster-carer">
                  <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10 rounded-xl px-6">Become a Carer</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </Section>
      </div>
    </PageLayout>
  );
};

export default FosteringLocationPage;