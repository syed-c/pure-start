import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronDown, 
  ChevronUp, 
  X,
  Filter,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface AgencyFilters {
  search: string;
  city: string;
  county: string;
  region: string;
  postcodeArea: string;
  agencyType: string;
  ofstedRating: string;
  fosteringTypes: string[];
  has24_7Support: boolean | null;
  trainingProvided: boolean | null;
  acceptingNewCarers: boolean | null;
  acceptingReferrals: boolean | null;
  onlineEnquiry: boolean | null;
}

interface AgencyFiltersProps {
  filters: AgencyFilters;
  onChange: (filters: AgencyFilters) => void;
  cities?: { name: string; slug: string }[];
  regions?: { name: string; slug: string }[];
  counts?: {
    total: number;
    byType: Record<string, number>;
    byService: Record<string, number>;
  };
}

const FOSTERING_TYPES = [
  { id: "short_term", label: "Short-Term Fostering" },
  { id: "long_term", label: "Long-Term Fostering" },
  { id: "emergency", label: "Emergency Fostering" },
  { id: "parent_child", label: "Parent & Child Fostering" },
  { id: "therapeutic", label: "Therapeutic Fostering" },
  { id: "respite", label: "Respite Fostering" },
  { id: "sibling", label: "Sibling Fostering" },
  { id: "teenage", label: "Teenage Fostering" },
  { id: "disability", label: "Disability Fostering" },
];

const AGENCY_TYPES = [
  { id: "independent", label: "Independent Fostering Agency" },
  { id: "local_authority", label: "Local Authority" },
  { id: "combined", label: "Both IFA & Local Authority" },
];

const OFSTED_RATINGS = [
  { id: "Outstanding", label: "Outstanding" },
  { id: "Good", label: "Good" },
  { id: "Requires Improvement", label: "Requires Improvement" },
];

const FEATURE_FILTERS = [
  { id: "has_24_7_support", label: "24/7 Support Available" },
  { id: "training_provided", label: "Training Provided" },
  { id: "accepting_new_carers", label: "Accepting New Carers" },
  { id: "accepting_referrals", label: "Accepting Placement Referrals" },
  { id: "online_enquiry", label: "Online Enquiry Available" },
];

export function AgencyFilters({ 
  filters, 
  onChange, 
  cities = [], 
  regions = [],
  counts 
}: AgencyFiltersProps) {
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(["location", "type", "services"])
  );

  const toggleSection = (section: string) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const activeFilterCount = [
    filters.city,
    filters.county,
    filters.region,
    filters.postcodeArea,
    filters.agencyType,
    filters.ofstedRating,
    filters.has24_7Support !== null,
    filters.trainingProvided !== null,
    filters.acceptingNewCarers !== null,
    filters.acceptingReferrals !== null,
    filters.onlineEnquiry !== null,
    filters.fosteringTypes.length > 0,
  ].filter(Boolean).length;

  const clearFilter = (key: keyof AgencyFilters) => {
    if (key === "fosteringTypes") {
      onChange({ ...filters, fosteringTypes: [] });
    } else if (key === "has24_7Support") {
      onChange({ ...filters, has24_7Support: null });
    } else if (key === "trainingProvided") {
      onChange({ ...filters, trainingProvided: null });
    } else if (key === "acceptingNewCarers") {
      onChange({ ...filters, acceptingNewCarers: null });
    } else if (key === "acceptingReferrals") {
      onChange({ ...filters, acceptingReferrals: null });
    } else if (key === "onlineEnquiry") {
      onChange({ ...filters, onlineEnquiry: null });
    } else {
      onChange({ ...filters, [key]: "" });
    }
  };

  const clearAllFilters = () => {
    onChange({
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
    });
  };

  return (
    <div className="bg-card rounded-xl border p-4 space-y-4">
      {/* Header with active filter count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          <span className="font-semibold">Filters</span>
          {activeFilterCount > 0 && (
            <Badge variant="secondary">{activeFilterCount}</Badge>
          )}
        </div>
        {activeFilterCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearAllFilters}
            className="text-muted-foreground"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search agencies by name..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="pl-9"
        />
      </div>

      {/* Location Section */}
      <Collapsible
        open={openSections.has("location")}
        onOpenChange={() => toggleSection("location")}
      >
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-medium">
          <span>Location</span>
          {openSections.has("location") ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-2">
          <div className="space-y-2">
            <Label className="text-sm">Region</Label>
            <Select 
              value={filters.region} 
              onValueChange={(v) => onChange({ ...filters, region: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All regions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All regions</SelectItem>
                {regions.map(r => (
                  <SelectItem key={r.slug} value={r.slug}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">City</Label>
            <Select 
              value={filters.city} 
              onValueChange={(v) => onChange({ ...filters, city: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All cities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All cities</SelectItem>
                {cities.map(c => (
                  <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Postcode Area</Label>
            <Input
              placeholder="e.g. SW1, M1"
              value={filters.postcodeArea}
              onChange={(e) => onChange({ ...filters, postcodeArea: e.target.value.toUpperCase() })}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Agency Type Section */}
      <Collapsible
        open={openSections.has("type")}
        onOpenChange={() => toggleSection("type")}
      >
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-medium">
          <span>Agency Type</span>
          {openSections.has("type") ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-2">
          <Select 
            value={filters.agencyType} 
            onValueChange={(v) => onChange({ ...filters, agencyType: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All agency types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All agency types</SelectItem>
              {AGENCY_TYPES.map(t => (
                <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select 
            value={filters.ofstedRating} 
            onValueChange={(v) => onChange({ ...filters, ofstedRating: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any Ofsted rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any Ofsted rating</SelectItem>
              {OFSTED_RATINGS.map(r => (
                <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CollapsibleContent>
      </Collapsible>

      {/* Fostering Types Section */}
      <Collapsible
        open={openSections.has("services")}
        onOpenChange={() => toggleSection("services")}
      >
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-medium">
          <span>Fostering Types</span>
          {openSections.has("services") ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          {FOSTERING_TYPES.map(type => (
            <div key={type.id} className="flex items-center gap-2">
              <Checkbox
                id={type.id}
                checked={filters.fosteringTypes.includes(type.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onChange({ 
                      ...filters, 
                      fosteringTypes: [...filters.fosteringTypes, type.id] 
                    });
                  } else {
                    onChange({ 
                      ...filters, 
                      fosteringTypes: filters.fosteringTypes.filter(t => t !== type.id) 
                    });
                  }
                }}
              />
              <Label htmlFor={type.id} className="text-sm cursor-pointer">
                {type.label}
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Support Features Section */}
      <Collapsible
        open={openSections.has("features")}
        onOpenChange={() => toggleSection("features")}
      >
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-medium">
          <span>Support Features</span>
          {openSections.has("features") ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          {FEATURE_FILTERS.map(feature => {
            const filterKey = feature.id as keyof AgencyFilters;
            let currentValue: boolean | null = null;
            
            if (feature.id === "has_24_7_support") currentValue = filters.has24_7Support;
            else if (feature.id === "training_provided") currentValue = filters.trainingProvided;
            else if (feature.id === "accepting_new_carers") currentValue = filters.acceptingNewCarers;
            else if (feature.id === "accepting_referrals") currentValue = filters.acceptingReferrals;
            else if (feature.id === "online_enquiry") currentValue = filters.onlineEnquiry;

            return (
              <div key={feature.id} className="flex items-center gap-2">
                <Checkbox
                  id={feature.id}
                  checked={currentValue === true}
                  onCheckedChange={(checked) => {
                    const keyMap: Record<string, keyof AgencyFilters> = {
                      "has_24_7_support": "has24_7Support",
                      "training_provided": "trainingProvided",
                      "accepting_new_carers": "acceptingNewCarers",
                      "accepting_referrals": "acceptingReferrals",
                      "online_enquiry": "onlineEnquiry",
                    };
                    const filterKey = keyMap[feature.id];
                    onChange({ ...filters, [filterKey]: checked ? true : null });
                  }}
                />
                <Label htmlFor={feature.id} className="text-sm cursor-pointer">
                  {feature.label}
                </Label>
              </div>
            );
          })}
        </CollapsibleContent>
      </Collapsible>

      {/* Active Filter Tags */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 pt-4 border-t">
          {filters.fosteringTypes.map(type => (
            <Badge key={type} variant="secondary" className="gap-1">
              {FOSTERING_TYPES.find(t => t.id === type)?.label || type}
              <button onClick={() => onChange({ 
                ...filters, 
                fosteringTypes: filters.fosteringTypes.filter(t => t !== type) 
              })}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {filters.agencyType && (
            <Badge variant="secondary" className="gap-1">
              {AGENCY_TYPES.find(t => t.id === filters.agencyType)?.label}
              <button onClick={() => clearFilter("agencyType")}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.ofstedRating && (
            <Badge variant="secondary" className="gap-1">
              {filters.ofstedRating}
              <button onClick={() => clearFilter("ofstedRating")}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.city && (
            <Badge variant="secondary" className="gap-1">
              {filters.city}
              <button onClick={() => clearFilter("city")}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

export default AgencyFilters;