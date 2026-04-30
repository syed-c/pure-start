import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageLayout } from "@/components/layout/PageLayout";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SEOHead } from "@/components/seo/SEOHead";
import { 
  Search, 
  MapPin, 
  Shield, 
  Star, 
  ArrowRight,
  ChevronRight,
  Filter,
  Grid,
  List
} from "lucide-react";
import { AgencyCard, Agency } from "@/components/fostering/AgencyCard";
import { AgencyFilters, type AgencyFilters as AgencyFiltersType } from "@/components/fostering/AgencyFilters";

const FOSTERING_TYPES: Record<string, { label: string; description: string; slug: string }> = {
  // Primary Types
  "short-term": { label: "Short-Term Fostering", description: "Temporary care for children for a few days to several weeks", slug: "short-term" },
  "long-term": { label: "Long-Term Fostering", description: "Permanent placement for children until adulthood", slug: "long-term" },
  "emergency": { label: "Emergency Fostering", description: "Immediate, urgent care for children in crisis", slug: "emergency" },
  "respite": { label: "Respite Fostering", description: "Short breaks for existing foster families", slug: "respite" },
  // Specialised Types
  "parent-child": { label: "Parent & Child Fostering", description: "Support for parents and their children together", slug: "parent-child" },
  "therapeutic": { label: "Therapeutic Fostering", description: "Specialised care for children with complex needs", slug: "therapeutic" },
  "sibling": { label: "Sibling Fostering", description: "Keeping brothers and sisters together", slug: "sibling" },
  "teenage": { label: "Teenage Fostering", description: "Support for adolescents in care", slug: "teenage" },
  "disability": { label: "Disability Fostering", description: "Care for children with additional needs", slug: "disability" },
  // Additional Types
  "kinship": { label: "Kinship Fostering", description: "Care by family members or close connections", slug: "kinship" },
  "remand": { label: "Remand Fostering", description: "Care for young people on legal remand", slug: "remand" },
  "specialist": { label: "Specialist Fostering", description: "Highly specialised support for complex cases", slug: "specialist" },
  "uasc": { label: "UASC Fostering", description: "Unaccompanied asylum-seeking children", slug: "uasc" },
  "solo": { label: "Solo Placement Fostering", description: "Care for single children or sibling groups", slug: "solo" },
  "bridging": { label: "Bridging Fostering", description: "Temporary placement while long-term plan is finalised", slug: "bridging" },
  "step-down": { label: "Step-Down Fostering", description: "Moving from residential care to family-based care", slug: "step-down" },
};

export default function FosteringTypePage() {
  const { typeSlug } = useParams();
  const fosteringType = FOSTERING_TYPES[typeSlug || ""];
  
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [filters, setFilters] = useState<AgencyFiltersType>({
    search: "",
    city: "",
    county: "",
    region: "",
    postcodeArea: "",
    agencyType: "",
    ofstedRating: "",
    fosteringTypes: [typeSlug || ""],
    has24_7Support: null,
    trainingProvided: null,
    acceptingNewCarers: null,
    acceptingReferrals: null,
    onlineEnquiry: null,
  });

  const { data: agencies, isLoading } = useQuery({
    queryKey: ["agencies", typeSlug, filters],
    queryFn: async () => {
      let query = supabase
        .from("agencies")
        .select("*")
        .contains("fostering_types", [typeSlug])
        .order("rating", { ascending: false })
        .limit(50);

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
      if (filters.acceptingNewCarers) {
        query = query.eq("accepting_new_carers", true);
      }
      if (filters.has24_7Support) {
        query = query.eq("has_24_7_support", true);
      }

      const { data } = await query;
      return (data || []) as Agency[];
    },
    enabled: !!typeSlug,
  });

  if (!fosteringType) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-2">Fostering Type Not Found</h1>
          <Button asChild>
            <Link to="/agencies">Browse All Agencies</Link>
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <SEOHead
        title={`${fosteringType.label} Agencies in the UK | Find Fostering Agencies`}
        description={`Find agencies offering ${fosteringType.label.toLowerCase()}. ${fosteringType.description} Browse Ofsted-rated agencies across the UK.`}
        canonical={`/fostering/${typeSlug}`}
        keywords={[fosteringType.label, "fostering agencies UK", "find foster agency", `agencies offering ${fosteringType.label.toLowerCase()}`]}
      />
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/agencies" className="hover:text-foreground">Fostering Agencies</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground font-medium">{fosteringType.label}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{fosteringType.label} Agencies</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          {fosteringType.description}. Find approved agencies offering this type of fostering near you.
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search agencies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12"
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="w-5 h-5" />
          </Button>
          <Button 
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <AgencyFilters 
              filters={filters}
              onChange={setFilters}
              counts={{ 
                total: agencies?.length || 0,
                byType: {},
                byService: {} 
              }}
            />
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <p className="text-muted-foreground">
              {isLoading ? "Loading..." : `${agencies?.length || 0} agencies found`}
            </p>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : agencies?.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No agencies found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or search in a different area.
              </p>
              <Button variant="outline" onClick={() => setFilters({
                search: "",
                city: "",
                county: "",
                region: "",
                postcodeArea: "",
                agencyType: "",
                ofstedRating: "",
                fosteringTypes: [typeSlug || ""],
                has24_7Support: null,
                trainingProvided: null,
                acceptingNewCarers: null,
                acceptingReferrals: null,
                onlineEnquiry: null,
              })}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className={viewMode === "grid" ? "grid md:grid-cols-2 gap-4" : "space-y-4"}>
              {agencies?.map(agency => (
                <AgencyCard 
                  key={agency.id} 
                  agency={agency}
                  variant={viewMode === "grid" ? "default" : "compact"}
                />
              ))}
            </div>
          )}

          {/* SEO Content */}
          <div className="mt-12 prose prose-sm max-w-none">
            <h2>About {fosteringType.label}</h2>
            <p>
              {fosteringType.description} When looking for a fostering agency, it's important to consider 
              their Ofsted rating, the training and support they provide, and whether they're currently 
              accepting new foster carers.
            </p>
            <h3>How to Choose an Agency</h3>
            <ul>
              <li>Check their Ofsted inspection rating</li>
              <li>Read reviews from current foster carers</li>
              <li>Ask about the training programme</li>
              <li>Find out what 24/7 support looks like</li>
              <li>Ask about allowances and fees</li>
            </ul>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}