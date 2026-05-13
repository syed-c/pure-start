import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageLayout } from "@/components/layout/PageLayout";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { SEOHead } from "@/components/seo/SEOHead";
import { StructuredData } from "@/components/seo/StructuredData";
import { AgencyCard } from "@/components/fostering/AgencyCard";
import { AgencyFilters, type AgencyFilters as AgencyFiltersType } from "@/components/fostering/AgencyFilters";
import { AgencyComparisonWidget, useAgencyComparison } from "@/components/fostering/AgencyComparison";
import { POPULAR_CITIES } from "@/lib/constants/activeRegions";
import { Search, MapPin, ArrowRight, Globe } from "lucide-react";

const defaultFilters: AgencyFiltersType = {
  search: "",
  city: "",
  county: "",
  region: "",
  postcodeArea: "",
  agencyType: "",
  ofstedRating: "",
  fosteringTypes: [],
  has24_7Support: null,
  trainingProvided: null,
  acceptingNewCarers: null,
  acceptingReferrals: null,
  onlineEnquiry: null,
};

const AgencyDirectoryByCityPage = () => {
  const { citySlug } = useParams();
  const [filters, setFilters] = useState<AgencyFiltersType>({
    ...defaultFilters,
    city: citySlug || "",
  });
  const { agencies: compareList, addAgency: addToCompare, removeAgency: removeFromCompare } = useAgencyComparison();

  const { data: cityData, isLoading: cityLoading } = useQuery({
    queryKey: ["city-by-slug", citySlug],
    queryFn: async () => {
      const { data } = await supabase
        .from("cities")
        .select("id, name, slug, state:states(name, slug)")
        .eq("slug", citySlug || "")
        .maybeSingle();
      return data;
    },
    enabled: !!citySlug,
  });

  const { data: agencies, isLoading } = useQuery({
    queryKey: ["agencies-by-city", citySlug, filters],
    queryFn: async () => {
      let query = supabase
        .from("agencies")
        .select(`
          id, name, slug, description, logo_url, cover_image_url,
          address, city, postcode, phone, email, website,
          rating:average_rating, review_count:total_reviews,
          is_verified:verification_status,
          ofsted_rating, agency_type, fostering_types,
          has_24_7_support, training_provided, accepting_new_carers, accepting_referrals
        `)
        .eq("seo_visible", true)
        .eq("is_suspended", false)
        .order("rank_score", { ascending: false })
        .limit(100);

      if (citySlug) {
        query = query.ilike("city", `%${citySlug}%`);
      }
      if (filters.search) {
        query = query.ilike("name", `%${filters.search}%`);
      }
      if (filters.agencyType) {
        query = query.eq("agency_type", filters.agencyType);
      }
      if (filters.ofstedRating) {
        query = query.eq("ofsted_rating", filters.ofstedRating);
      }
      if (filters.fosteringTypes.length > 0) {
        query = query.overlaps("fostering_types", filters.fosteringTypes);
      }
      if (filters.has24_7Support !== null) {
        query = query.eq("has_24_7_support", filters.has24_7Support);
      }
      if (filters.trainingProvided !== null) {
        query = query.eq("training_provided", filters.trainingProvided);
      }
      if (filters.acceptingNewCarers !== null) {
        query = query.eq("accepting_new_carers", filters.acceptingNewCarers);
      }

      const { data } = await query;
      return data || [];
    },
    enabled: true,
  });

  const handleCompareToggle = (agency: any) => {
    if (compareList.find(a => a.id === agency.id)) {
      removeFromCompare(agency.id);
    } else {
      addToCompare(agency);
    }
  };

  const cityName = cityData?.name || citySlug?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || "this location";

  const faqs = [
    { q: `How do I find fostering agencies in ${cityName}?`, a: "Search our directory of Ofsted-rated fostering agencies. Compare ratings, read reviews, and contact agencies directly." },
    { q: "What types of fostering are available?", a: "Agencies offer various types including short-term, long-term, emergency, therapeutic, parent & child, and respite fostering." },
    { q: "Do agencies in my area offer 24/7 support?", a: "Many agencies provide round-the-clock support. Use our filters to find agencies offering 24/7 support." },
  ];

  return (
    <PageLayout>
      <SEOHead
        title={`Fostering Agencies in ${cityName} | UK Foster Care Directory`}
        description={`Find Ofsted-rated fostering agencies in ${cityName}. Compare ratings, fostering types, and connect with agencies near you.`}
        canonical={`/agencies/${citySlug}`}
        keywords={[`fostering agencies ${cityName}`, "UK foster care", "find foster agency"]}
      />
      <StructuredData type="faq" questions={faqs.map(f => ({ question: f.q, answer: f.a }))} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-12 md:py-16">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[400px] bg-primary/10 rounded-full blur-[150px]" />
        </div>
        
        <div className="container relative z-10 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 text-white/70 mb-4">
              <Link to="/agencies" className="hover:text-primary">All Agencies</Link>
              <span>/</span>
              <span className="text-white">{cityName}</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Fostering Agencies in <span className="text-primary">{cityName}</span>
            </h1>
            <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
              Browse Ofsted-rated fostering agencies in {cityName}. 
              Compare ratings, read reviews, and find the right match for your family.
            </p>

            <div className="max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search agencies..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="h-14 pl-12 pr-4 text-lg bg-white border-0 rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters & Results */}
      <Section size="lg">
        <div className="container px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <AgencyFilters
                filters={filters}
                onChange={setFilters}
              />
            </div>

            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-4">
                <p className="text-muted-foreground">
                  {isLoading ? "Loading..." : `${agencies?.length || 0} agencies in ${cityName}`}
                </p>
                {compareList.length > 0 && (
                  <Button asChild variant="outline" size="sm">
                    <Link to="/compare">
                      <Globe className="w-4 h-4 mr-2" />
                      Compare ({compareList.length})
                    </Link>
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                {agencies?.map((agency: any) => (
                  <AgencyCard
                    key={agency.id}
                    agency={agency}
                    onCompare={handleCompareToggle}
                    isComparing={compareList.some(a => a.id === agency.id)}
                  />
                ))}
              </div>

              {agencies?.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No agencies found in {cityName}.</p>
                  <Button variant="outline" onClick={() => setFilters(defaultFilters)}>
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Section>

      {/* Other Cities */}
      <Section size="md" className="bg-muted/30">
        <div className="container px-4">
          <h2 className="text-2xl font-bold text-center mb-8">Other Cities</h2>
          <div className="flex flex-wrap gap-2 justify-center">
            {POPULAR_CITIES.filter(c => c.slug !== citySlug).slice(0, 8).map((city) => (
              <Button key={city.slug} variant="outline" className="rounded-full" asChild>
                <Link to={`/agencies/${city.slug}`}>
                  <MapPin className="h-4 w-4 mr-2" />
                  {city.name}
                </Link>
              </Button>
            ))}
            <Button variant="outline" className="rounded-full" asChild>
              <Link to="/agencies">
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </Section>

      <AgencyComparisonWidget />
    </PageLayout>
  );
};

export default AgencyDirectoryByCityPage;