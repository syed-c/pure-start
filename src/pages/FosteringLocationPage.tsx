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

          <div className="container relative z-10 px-4 py-16 md:py-24">
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Fostering Agencies", href: "/fostering-agencies" }]} />
            
            <div className="max-w-4xl mx-auto text-center">
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 mb-6"
              >
                <Shield className="h-4 w-4 text-teal-400" />
                <span className="text-sm font-medium text-white">UK's Leading Fostering Directory</span>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.1 }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight"
              >
                Find Trusted <span className="text-teal-400">Fostering Agencies</span> UK
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.2 }}
                className="text-base md:text-lg text-white/70 mb-6 md:mb-8 max-w-2xl mx-auto"
              >
                Connect with Ofsted-registered fostering agencies across England, Scotland, Wales, and Northern Ireland. Compare ratings, read reviews, and find your perfect match.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.3 }}
                className="flex flex-wrap justify-center gap-4"
              >
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-5 py-3">
                  <Users className="h-5 w-5 text-teal-400" />
                  <div className="text-left">
                    <p className="text-xl font-bold text-white">500+</p>
                    <p className="text-xs text-white/60">Agencies</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-5 py-3">
                  <MapPin className="h-5 w-5 text-teal-400" />
                  <div className="text-left">
                    <p className="text-xl font-bold text-white">100+</p>
                    <p className="text-xs text-white/60">Cities</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-5 py-3">
                  <Shield className="h-5 w-5 text-teal-400" />
                  <div className="text-left">
                    <p className="text-xl font-bold text-white">100%</p>
                    <p className="text-xs text-white/60">Ofsted Rated</p>
                  </div>
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
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-20 left-10 w-72 h-72 bg-teal-500/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px]" />
          </div>
        </div>

        <div className="container relative z-10 px-4 py-16 md:py-24">
          <Breadcrumbs items={breadcrumbs} />
          
          <div className="max-w-4xl mx-auto text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 mb-6"
            >
              <Shield className="h-4 w-4 text-teal-400" />
              <span className="text-sm font-medium text-white">Fostering Agencies in {locationName}</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight"
            >
              Find Trusted <span className="text-teal-400">Fostering Agencies</span> in {locationName}
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.2 }}
              className="text-base md:text-lg text-white/70 mb-6 md:mb-8 max-w-2xl mx-auto"
            >
              Connect with {agencies?.length || 0} Ofsted-registered fostering agencies in {locationName}. Compare ratings, read reviews, and find your perfect match.
            </motion.p>

            {/* Stats Cards */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.3 }}
              className="flex flex-wrap justify-center gap-4 mb-10"
            >
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-5 py-3">
                <Users className="h-5 w-5 text-teal-400" />
                <div className="text-left">
                  <p className="text-xl font-bold text-white">{agencies?.length || 0}</p>
                  <p className="text-xs text-white/60">Agencies</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-5 py-3">
                <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                <div className="text-left">
                  <p className="text-xl font-bold text-white">4.8</p>
                  <p className="text-xs text-white/60">Avg Rating</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-5 py-3">
                <MapPin className="h-5 w-5 text-teal-400" />
                <div className="text-left">
                  <p className="text-xl font-bold text-white">{locationName}</p>
                  <p className="text-xs text-white/60">Location</p>
                </div>
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

        {/* Agencies - Horizontal Line Format */}
        <Section className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Available Fostering Agencies</h2>
          
          {agenciesLoading ? (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-32 w-72 shrink-0 rounded-xl" />
              ))}
            </div>
          ) : agencies && agencies.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {agencies.map((agency: any) => (
                <Card key={agency.id} className="hover:shadow-lg transition-shadow shrink-0 w-72">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">{agency.name}</h3>
                        <div className="flex items-center mt-1 text-sm text-gray-500">
                          <MapPin className="w-4 h-4 mr-1 shrink-0" />
                          <span className="truncate">{agency.city || locationName}</span>
                        </div>
                      </div>
                      {agency.rating && (
                        <div className="flex items-center shrink-0 ml-2">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                          <span className="font-medium">{agency.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Link to={`/agency/${agency.slug}`}>
                        <Button size="sm">View Profile</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-gray-400" />
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                          <span className="font-medium">{agency.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Link to={`/agency/${agency.slug}`}>
                        <Button size="sm">View Profile</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-gray-400" />
              <h3 className="mt-4 text-lg font-medium">No agencies found</h3>
              <p className="mt-2 text-gray-600">
                No agencies currently available in {locationName}.
              </p>
            </div>
          )}
        </Section>

        <Section className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Fostering in {locationName}</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <Shield className="w-8 h-8 text-blue-600" />
                <h3 className="font-semibold mt-4">Local Support</h3>
                <p className="mt-2 text-gray-600">
                  Agencies in {locationName} provide 24/7 support, training, and access to local social services.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <Heart className="w-8 h-8 text-red-600" />
                <h3 className="font-semibold mt-4">Allowances</h3>
                <p className="mt-2 text-gray-600">
                  Foster carers receive weekly allowances, holiday pay, and support with expenses.
                </p>
              </CardContent>
            </Card>
          </div>
        </Section>

        {nearbyLocations && nearbyLocations.length > 0 && (
          <Section className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Nearby Locations</h2>
            <div className="flex flex-wrap gap-3">
              {nearbyLocations.map((loc: any) => (
                <Link key={loc.id} to={`/fostering-agencies/${loc.slug}`}>
                  <Badge variant="outline" className="cursor-pointer hover:bg-gray-100 py-2 px-4">
                    {loc.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </Section>
        )}

        <Section className="mt-12">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold">Ready to Start Your Fostering Journey?</h2>
              <p className="mt-2 text-gray-600">
                Contact agencies directly or learn more about becoming a foster carers.
              </p>
              <div className="mt-6 flex gap-4 justify-center">
                <Link to="/search">
                  <Button size="lg">
                    <Search className="w-4 h-4 mr-2" />
                    Find Agencies
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
};

export default FosteringLocationPage;