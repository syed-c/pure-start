import { useState, useCallback, useMemo, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Search, MapPin, Star, Shield, ChevronRight,
  Filter, X, Building2, Loader2, Home,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SEOHead } from "@/components/seo/SEOHead";
import { StructuredData } from "@/components/seo/StructuredData";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

import { getLetterAvatarUrl } from "@/hooks/useProfiles";

// ── Types ──────────────────────────────────────────────────
interface SearchFilters {
  query: string;
  regionId: string;
  cityId: string;
  fosteringTypeId: string;
  agencyType: string;
  minRating: number;
  verifiedOnly: boolean;
  sortBy: string;
}

interface SearchResultItem {
  id: string;
  name: string;
  slug: string;
  type: "agency";
  title?: string;
  rating: number;
  reviewCount: number;
  image?: string;
  isVerified: boolean;
  agencyName?: string;
  agencySlug?: string;
  regionName?: string;
  cityName?: string;
  fosteringTypes?: string[];
}

const ITEMS_PER_PAGE = 24;

const AGENCY_TYPE_OPTIONS = [
  { label: "All", value: "" },
  { label: "Independent", value: "independent" },
  { label: "Local Authority", value: "local-authority" },
];

const RATING_OPTIONS = [
  { label: "Any Rating", value: 0 },
  { label: "3+ Stars", value: 3 },
  { label: "4+ Stars", value: 4 },
  { label: "4.5+ Stars", value: 4.5 },
];

const SORT_OPTIONS = [
  { label: "Highest Rated", value: "rating" },
  { label: "Most Reviewed", value: "reviews" },
  { label: "Name A-Z", value: "name" },
];

// ── Data hooks ─────────────────────────────────────────────
function useRegions() {
  return useQuery({
    queryKey: ["search-regions"],
    queryFn: async () => {
      const { data } = await supabase
        .from("states")
        .select("id, name, slug")
        .eq("is_active", true)
        .order("name");
      return data || [];
    },
    staleTime: 1000 * 60 * 30,
  });
}

function useCities(regionId: string) {
  return useQuery({
    queryKey: ["search-cities", regionId],
    queryFn: async () => {
      if (!regionId) return [];
      const { data: cities } = await supabase
        .from("cities")
        .select("id, name, slug")
        .eq("state_id", regionId)
        .eq("is_active", true)
        .order("name");
      return cities || [];
    },
    enabled: !!regionId,
    staleTime: 1000 * 60 * 30,
  });
}

function useFosteringTypes() {
  return useQuery({
    queryKey: ["search-fostering-types"],
    queryFn: async () => {
      const { data } = await supabase
        .from("treatments")
        .select("id, name, slug")
        .eq("is_active", true)
        .order("name");
      return data || [];
    },
    staleTime: 1000 * 60 * 30,
  });
}

// ── Main search query ──────────────────────────────────────
function useSearchResults(filters: SearchFilters, page: number) {
  return useQuery({
    queryKey: ["search-results", filters, page],
    queryFn: async () => {
      const results: SearchResultItem[] = [];
      let eligibleAgencyIds: Set<string> | null = null;

      if (filters.cityId) {
        const { data: agencies } = await supabase.from("clinics").select("id").eq("city_id", filters.cityId).eq("is_active", true);
        eligibleAgencyIds = new Set((agencies || []).map((c) => c.id));
        if (eligibleAgencyIds.size === 0) return { results: [], total: 0 };
      } else if (filters.regionId) {
        const { data: cities } = await supabase.from("cities").select("id").eq("state_id", filters.regionId).eq("is_active", true);
        const cityIds = (cities || []).map((c) => c.id);
        if (cityIds.length === 0) return { results: [], total: 0 };
        const { data: agencies } = await supabase.from("clinics").select("id").in("city_id", cityIds).eq("is_active", true);
        eligibleAgencyIds = new Set((agencies || []).map((c) => c.id));
        if (eligibleAgencyIds.size === 0) return { results: [], total: 0 };
      }

      if (filters.fosteringTypeId) {
        const { data: ct } = await supabase.from("clinic_treatments").select("clinic_id").eq("treatment_id", filters.fosteringTypeId);
        const typeAgencyIds = new Set((ct || []).map((c) => c.clinic_id));
        if (typeAgencyIds.size > 0) {
          eligibleAgencyIds = eligibleAgencyIds
            ? new Set([...eligibleAgencyIds].filter((id) => typeAgencyIds.has(id)))
            : typeAgencyIds;
        }
      }

      const agencyIdArray = eligibleAgencyIds ? [...eligibleAgencyIds] : null;

      let agencyQuery = supabase
        .from("clinics")
        .select(`id, name, slug, cover_image_url, rating, review_count, verification_status, claim_status, city:cities(name, slug, state_id, state:states(name, slug)), area:areas(name, slug)`)
        .eq("is_active", true);

      if (agencyIdArray && agencyIdArray.length > 0) {
        agencyQuery = agencyQuery.in("id", agencyIdArray);
      } else if (agencyIdArray && agencyIdArray.length === 0) {
        agencyQuery = agencyQuery.eq("id", "impossible-match");
      }
      if (filters.minRating > 0) agencyQuery = agencyQuery.gte("rating", filters.minRating);
      if (filters.query) agencyQuery = agencyQuery.ilike("name", `%${filters.query}%`);

      if (filters.sortBy === "reviews") agencyQuery = agencyQuery.order("review_count", { ascending: false });
      else if (filters.sortBy === "name") agencyQuery = agencyQuery.order("name", { ascending: true });
      else agencyQuery = agencyQuery.order("rating", { ascending: false });

      const { data: agencies } = await agencyQuery;

      if (agencies) {
        for (const a of agencies) {
          const isVerified = a.claim_status === "claimed" && a.verification_status === "verified";
          if (filters.verifiedOnly && !isVerified) continue;
          results.push({
            id: a.id, name: a.name, slug: a.slug, type: "agency", title: "Fostering Agency",
            rating: Number(a.rating) || 0, reviewCount: a.review_count || 0,
            image: a.cover_image_url || undefined, isVerified,
            agencyName: a.name, agencySlug: a.slug,
            regionName: (a.city as any)?.state?.name, cityName: (a.area as any)?.name || (a.city as any)?.name,
          });
        }
      }

      if (filters.sortBy === "reviews") results.sort((a, b) => b.reviewCount - a.reviewCount);
      else if (filters.sortBy === "name") results.sort((a, b) => a.name.localeCompare(b.name));
      else results.sort((a, b) => b.rating - a.rating);

      const total = results.length;
      const start = (page - 1) * ITEMS_PER_PAGE;
      return { results: results.slice(start, start + ITEMS_PER_PAGE), total };
    },
  });
}

// ── Page Component ─────────────────────────────────────────
export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams.get("q") || "",
    regionId: searchParams.get("region") || "",
    cityId: searchParams.get("city") || "",
    fosteringTypeId: searchParams.get("type") || "",
    agencyType: searchParams.get("agencyType") || "",
    minRating: Number(searchParams.get("rating")) || 0,
    verifiedOnly: searchParams.get("verified") === "true",
    sortBy: searchParams.get("sort") || "rating",
  });

  const { data: regions } = useRegions();
  const { data: cities } = useCities(filters.regionId);
  const { data: fosteringTypes } = useFosteringTypes();
  const { data: searchData, isLoading } = useSearchResults(filters, page);

  useEffect(() => { setFilters((prev) => ({ ...prev, cityId: "" })); }, [filters.regionId]);
  useEffect(() => { setPage(1); }, [filters]);

  const updateFilter = useCallback((key: keyof SearchFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ query: "", regionId: "", cityId: "", fosteringTypeId: "", agencyType: "", minRating: 0, verifiedOnly: false, sortBy: "rating" });
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.regionId) count++;
    if (filters.cityId) count++;
    if (filters.fosteringTypeId) count++;
    if (filters.agencyType) count++;
    if (filters.minRating > 0) count++;
    if (filters.verifiedOnly) count++;
    return count;
  }, [filters]);

  const totalPages = Math.ceil((searchData?.total || 0) / ITEMS_PER_PAGE);

  const FilterSidebar = () => (
    <div className="space-y-6">
      <FilterSection title="Region" icon={<MapPin className="h-4 w-4" />}>
        <Select value={filters.regionId} onValueChange={(v) => updateFilter("regionId", v === "all" ? "" : v)}>
          <SelectTrigger className="w-full rounded-xl"><SelectValue placeholder="All Regions" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            {regions?.map((r) => (<SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>))}
          </SelectContent>
        </Select>
      </FilterSection>

      {filters.regionId && cities && cities.length > 0 && (
        <FilterSection title="City" icon={<MapPin className="h-4 w-4" />}>
          <Select value={filters.cityId} onValueChange={(v) => updateFilter("cityId", v === "all" ? "" : v)}>
            <SelectTrigger className="w-full rounded-xl"><SelectValue placeholder="All Cities" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cities.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
            </SelectContent>
          </Select>
        </FilterSection>
      )}

      <FilterSection title="Fostering Type" icon={<Home className="h-4 w-4" />}>
        <Select value={filters.fosteringTypeId} onValueChange={(v) => updateFilter("fosteringTypeId", v === "all" ? "" : v)}>
          <SelectTrigger className="w-full rounded-xl"><SelectValue placeholder="All Types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {fosteringTypes?.map((t) => (<SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>))}
          </SelectContent>
        </Select>
      </FilterSection>

      <FilterSection title="Agency Type" icon={<Building2 className="h-4 w-4" />}>
        <div className="flex flex-wrap gap-2">
          {AGENCY_TYPE_OPTIONS.map((opt) => (
            <Button key={opt.value} variant={filters.agencyType === opt.value ? "default" : "outline"} size="sm"
              onClick={() => updateFilter("agencyType", opt.value)} className="rounded-full text-xs font-semibold">
              {opt.label}
            </Button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Minimum Rating" icon={<Star className="h-4 w-4" />}>
        <div className="flex flex-wrap gap-2">
          {RATING_OPTIONS.map((opt) => (
            <Button key={opt.value} variant={filters.minRating === opt.value ? "default" : "outline"} size="sm"
              onClick={() => updateFilter("minRating", opt.value)} className="rounded-full text-xs font-semibold">
              {opt.value > 0 && <Star className="h-3 w-3 mr-1 fill-current" />}{opt.label}
            </Button>
          ))}
        </div>
      </FilterSection>

      <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-muted/40 border border-border/40">
        <Checkbox id="verified-only" checked={filters.verifiedOnly} onCheckedChange={(checked) => updateFilter("verifiedOnly", !!checked)} />
        <label htmlFor="verified-only" className="text-sm font-semibold cursor-pointer flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5 text-primary" /> Verified Only
        </label>
      </div>

      {activeFilterCount > 0 && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4 mr-2" /> Clear All ({activeFilterCount})
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead title="Find Fostering Agencies in England & UK | Foster Connect"
        description="Search and compare Ofsted-rated fostering agencies across England. Filter by region, city, fostering type, and agency rating."
        canonical="/search/" keywords={["fostering agencies UK", "find fostering agency", "foster care agencies England", "Ofsted rated agencies"]} />
      <StructuredData type="breadcrumb" items={[{ name: "Home", url: "/" }, { name: "Search Agencies", url: "/search/" }]} />
      <Navbar />

      {/* Search Header */}
      <div className="bg-gradient-to-b from-primary/[0.04] to-background border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-10">
          <h1 className="text-2xl md:text-3xl font-black text-foreground mb-5" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Find a Fostering Agency
          </h1>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={filters.query} onChange={(e) => updateFilter("query", e.target.value)}
                placeholder="Search by agency name, city, or fostering type..."
                className="pl-11 h-12 rounded-xl bg-card border-border/50 shadow-sm" />
            </div>
            <div className="md:hidden">
              <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="h-12 rounded-xl relative shadow-sm">
                    <Filter className="h-4 w-4" />
                    {activeFilterCount > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-[10px]">{activeFilterCount}</Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] overflow-y-auto">
                  <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
                  <div className="mt-6"><FilterSidebar /></div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <div className="flex gap-7">
          <aside className="hidden md:block w-[260px] shrink-0">
            <div className="sticky top-24">
              <h2 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                <Filter className="h-3.5 w-3.5" /> Filters
                {activeFilterCount > 0 && <Badge variant="secondary" className="text-[10px] ml-1">{activeFilterCount}</Badge>}
              </h2>
              <FilterSidebar />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-muted-foreground font-medium">
                {isLoading ? "Searching..." : <>{searchData?.total || 0} agencies found</>}
              </p>
              <Select value={filters.sortBy} onValueChange={(v) => updateFilter("sortBy", v)}>
                <SelectTrigger className="w-[160px] h-9 text-xs rounded-lg"><SelectValue /></SelectTrigger>
                <SelectContent>{SORT_OPTIONS.map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}</SelectContent>
              </Select>
            </div>

            {isLoading && (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            {!isLoading && searchData?.results.length === 0 && (
              <div className="text-center py-24">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <Search className="h-7 w-7 text-muted-foreground/40" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">No agencies found</h3>
                <p className="text-sm text-muted-foreground mb-5">Try adjusting your filters or search query.</p>
                <Button variant="outline" onClick={clearFilters} className="rounded-xl">Clear All Filters</Button>
              </div>
            )}

            {!isLoading && searchData && searchData.results.length > 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchData.results.map((item) => (<ResultCard key={`${item.type}-${item.id}`} item={item} />))}
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 mt-10">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg font-semibold">Previous</Button>
                    <span className="text-sm text-muted-foreground px-3 font-medium">Page {page} of {totalPages}</span>
                    <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-lg font-semibold">Next</Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function FilterSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11px] font-black text-muted-foreground uppercase tracking-widest mb-2.5 flex items-center gap-1.5">{icon} {title}</label>
      {children}
    </div>
  );
}

function ResultCard({ item }: { item: SearchResultItem }) {
  const linkTo = `/agency/${item.slug}`;
  const avatarUrl = item.image || getLetterAvatarUrl(item.name);

  return (
    <Link to={linkTo} className="group block bg-card border border-border/50 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300">
      <div className="aspect-[16/10] bg-muted relative overflow-hidden">
        <img src={avatarUrl} alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy" onError={(e) => { (e.target as HTMLImageElement).src = getLetterAvatarUrl(item.name); }} />
        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
          {item.isVerified && (
            <Badge className="bg-primary text-primary-foreground text-[10px] rounded-full gap-1 font-bold shadow-sm">
              <Shield className="h-3 w-3" /> Verified
            </Badge>
          )}
        </div>
        {item.rating > 0 && (
          <div className="absolute top-2.5 right-2.5 bg-card/95 backdrop-blur-sm rounded-lg px-2.5 py-1 flex items-center gap-1 shadow-sm">
            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
            <span className="text-xs font-bold">{item.rating.toFixed(1)}</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-[15px] text-foreground truncate group-hover:text-primary transition-colors">{item.name}</h3>
        {item.title && <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.title}</p>}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
          <MapPin className="h-3 w-3 shrink-0 text-primary/50" />
          <span className="truncate">{[item.cityName, item.regionName].filter(Boolean).join(", ") || "England"}</span>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/40">
          <span className="text-[11px] text-muted-foreground font-medium">{item.reviewCount} review{item.reviewCount !== 1 ? "s" : ""}</span>
          <span className="text-xs font-bold text-primary flex items-center gap-1">View <ChevronRight className="h-3 w-3" /></span>
        </div>
      </div>
    </Link>
  );
}
