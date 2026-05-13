import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageLayout } from "@/components/layout/PageLayout";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SEOHead } from "@/components/seo/SEOHead";
import { StructuredData } from "@/components/seo/StructuredData";
import { POPULAR_CITIES, FOSTERING_CATEGORIES, ENGLAND_COUNTIES } from "@/lib/constants/activeRegions";
import { AgencyCard } from "@/components/fostering/AgencyCard";
import { AgencyFilters, type AgencyFilters as AgencyFiltersType } from "@/components/fostering/AgencyFilters";
import { AgencyComparisonWidget, useAgencyComparison } from "@/components/fostering/AgencyComparison";
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

const AgenciesDirectoryPage = () => {
  const { citySlug } = useParams();
  const [filters, setFilters] = useState<AgencyFiltersType>({
    ...defaultFilters,
    city: citySlug || "",
  });
  const { agencies: compareList, addAgency: addToCompare, removeAgency: removeFromCompare } = useAgencyComparison();

  const { data: agencies, isLoading } = useQuery({
    queryKey: ["agencies-directory", filters],
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

      if (filters.search) {
        query = query.ilike("name", `%${filters.search}%`);
      }
      if (filters.city) {
        query = query.ilike("city", `%${filters.city}%`);
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
      if (filters.postcodeArea) {
        query = query.ilike("postcode", `${filters.postcodeArea}%`);
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

  const popularCities = POPULAR_CITIES.slice(0, 8);
  const cityName = citySlug ? citySlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : null;
  const isCityPage = !!citySlug;
  const shouldNoIndex = !isLoading && (!agencies || agencies.length === 0);

  const faqs = [
    { q: "How do I choose a fostering agency?", a: "Look for Ofsted ratings, read reviews from current foster carers, consider the fostering types they offer, and check their training and support packages." },
    { q: "What's the difference between an IFA and local authority?", a: "Independent Fostering Agencies (IFAs) are privately run and often offer higher allowances and more specialist support. Local authorities run their own fostering services through the council." },
    { q: "Can I change agencies after becoming a foster carer?", a: "Yes, you can transfer between agencies, though this typically happens after completing at least one placement. Your new agency will support the transition." },
    { q: "Do agencies charge families to use their services?", a: "No. Reputable agencies do not charge families for being matched with foster carers. Their fees are paid by the local authorities who place children." },
  ];

  return (
    <PageLayout>
      <SEOHead
        title={isCityPage 
          ? `Fostering Agencies in ${cityName} | UK Foster Care Directory`
          : "Find Fostering Agencies in England | UK Foster Care Directory"}
        description={isCityPage
          ? `Browse Ofsted-rated fostering agencies in ${cityName}. Compare ratings, fostering types, and connect with agencies near you.`
          : "Browse Ofsted-rated fostering agencies across England. Compare ratings, fostering types, and connect with agencies near you."}
        canonical={isCityPage ? `/agencies/${citySlug}` : "/agencies"}
        keywords={isCityPage 
          ? [`fostering agencies ${cityName}`, "UK foster care agencies", "find foster agency"]
          : ["fostering agencies England", "UK foster care agencies", "find foster agency", "Ofsted rated fostering"]}
        noIndex={shouldNoIndex}
      />
      <StructuredData type="breadcrumb" items={[
        { name: "Home", url: "https://fostercareuk.com/" },
        { name: "Agencies", url: "https://fostercareuk.com/agencies" },
        ...(isCityPage ? [{ name: cityName!, url: `https://fostercareuk.com/agencies/${citySlug}` }] : []),
      ]} />
      <StructuredData type="organization" />
      <StructuredData type="localBusiness" name="Foster Care UK" url="https://fostercareuk.com" areaServed="England" />
      <StructuredData type="faq" questions={faqs.map(f => ({ question: f.q, answer: f.a }))} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-16 md:py-20">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[400px] bg-primary/10 rounded-full blur-[150px]" />
        </div>
        
        <div className="container relative z-10 px-4">
          <div className="max-w-4xl mx-auto text-center">
            {isCityPage && (
              <div className="flex items-center justify-center gap-2 text-white/70 mb-4">
                <Link to="/agencies" className="hover:text-primary">All Agencies</Link>
                <span>/</span>
                <span className="text-white">{cityName}</span>
              </div>
            )}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              {isCityPage 
                ? <>Fostering Agencies in <span className="text-primary">{cityName}</span></>
                : <>Find a <span className="text-primary">Fostering Agency</span> Near You</>
              }
            </h1>
            <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
              {isCityPage 
                ? `Browse Ofsted-rated fostering agencies in ${cityName}. Compare ratings, read reviews, and find the right match for your family.`
                : `Browse Ofsted-rated fostering agencies across England. Compare ratings, read reviews, and find the right match for your family.`
              }
            </p>

            {/* Search */}
            <div className="max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search agencies by name or location..."
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
            {/* Sidebar Filters */}
            <div className="lg:col-span-1">
              <AgencyFilters
                filters={filters}
                onChange={setFilters}
              />
            </div>

            {/* Results */}
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-4">
                <p className="text-muted-foreground">
                  {isLoading ? "Loading..." : isCityPage 
                    ? `Agencies in ${cityName}`
                    : `Agencies found`}
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
                  <p className="text-muted-foreground mb-4">No agencies found matching your criteria.</p>
                  <Button variant="outline" onClick={() => setFilters(defaultFilters)}>
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Section>

      {/* Popular Cities */}
      <Section size="md" className="bg-muted/30">
        <div className="container px-4">
          <h2 className="text-2xl font-bold text-center mb-8">
            {isCityPage ? "Other Cities" : "Popular Cities"}
          </h2>
          <div className="flex flex-wrap gap-2 justify-center">
            {isCityPage && (
              <Button variant="outline" className="rounded-full" asChild>
                <Link to="/agencies">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            )}
            {popularCities.filter(c => c.slug !== citySlug).slice(0, 8).map((city) => (
              <Button key={city.slug} variant="outline" className="rounded-full" asChild>
                <Link to={`/agencies/${city.slug}`}>
                  <MapPin className="h-4 w-4 mr-2" />
                  {city.name}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section size="lg">
        <div className="container px-4">
          <Card className="bg-gradient-to-br from-primary/10 to-teal/10 border-primary/20">
            <CardContent className="p-8 md:p-12 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Become a Foster Carer?</h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Find the perfect agency for your family. All agencies listed provide full training, 
                ongoing support, and competitive allowances.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button size="lg" className="rounded-full" asChild>
                  <Link to="/search">
                    Search Agencies
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="rounded-full" asChild>
                  <Link to="/faq">
                    Learn More
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Section>

      <AgencyComparisonWidget />
    </PageLayout>
  );
};

export default AgenciesDirectoryPage;
