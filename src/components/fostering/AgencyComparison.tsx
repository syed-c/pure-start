import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  X, 
  CheckCircle, 
  XCircle, 
  Minus,
  Globe,
  Trash2,
  ArrowRight,
  Star,
  Award,
  Clock,
  Users,
  MapPin
} from "lucide-react";
import { Agency } from "./AgencyCard";
import { cn } from "@/lib/utils";

interface AgencyComparisonProps {
  onRemove?: (agency: Agency) => void;
}

const STORAGE_KEY = "fostercare_compare";

export function useAgencyComparison() {
  const [agencies, setAgencies] = useState<Agency[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setAgencies(JSON.parse(stored));
      } catch {
        setAgencies([]);
      }
    }
  }, []);

  const addAgency = (agency: Agency) => {
    if (agencies.length >= 3) return;
    if (agencies.find(a => a.id === agency.id)) return;
    
    const newAgencies = [...agencies, agency];
    setAgencies(newAgencies);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newAgencies));
  };

  const removeAgency = (agencyId: string) => {
    const newAgencies = agencies.filter(a => a.id !== agencyId);
    setAgencies(newAgencies);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newAgencies));
  };

  const clearAll = () => {
    setAgencies([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { agencies, addAgency, removeAgency, clearAll };
}

export function AgencyComparisonWidget({ onRemove }: AgencyComparisonProps) {
  const { agencies, removeAgency } = useAgencyComparison();

  if (agencies.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-card border-t shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        <span className="text-sm font-medium shrink-0">Comparing ({agencies.length}/3):</span>
        
        <div className="flex-1 flex gap-2 overflow-x-auto">
          {agencies.map(agency => (
            <div 
              key={agency.id}
              className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg shrink-0"
            >
              <span className="font-medium text-sm truncate max-w-[150px]">
                {agency.name}
              </span>
              <button 
                onClick={() => removeAgency(agency.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 shrink-0">
          {agencies.length >= 2 && (
            <Button asChild size="sm">
              <Link to="/compare">Compare Now</Link>
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => localStorage.removeItem(STORAGE_KEY)}>
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AgencyComparisonDialog({ 
  trigger 
}: { 
  trigger?: React.ReactNode 
}) {
  const { agencies, removeAgency } = useAgencyComparison();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Globe className="w-4 h-4 mr-2" />
            Compare ({agencies.length})
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Compare Fostering Agencies</DialogTitle>
        </DialogHeader>
        
        {agencies.length < 2 ? (
          <div className="text-center py-8">
            <Globe className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Add at least 2 agencies to compare them side by side.
            </p>
            <Button variant="outline" className="mt-4" onClick={() => setOpen(false)}>
              <Link to="/agencies">Browse Agencies</Link>
            </Button>
          </div>
        ) : (
          <ComparisonTable agencies={agencies} onRemove={removeAgency} />
        )}
        
        {agencies.length >= 2 && (
          <DialogFooter>
            <Button asChild className="w-full">
              <Link to="/compare" onClick={() => setOpen(false)}>
                View Full Comparison
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ComparisonTable({ 
  agencies, 
  onRemove 
}: { 
  agencies: Agency[]; 
  onRemove: (id: string) => void;
}) {
  const comparisonRows = [
    { label: "Location", key: "city", render: (a: Agency) => a.city || a.address || "-" },
    { label: "Agency Type", key: "type", render: (a: Agency) => 
      a.agency_type === 'independent' ? 'Independent' : 'Local Authority' 
    },
    { label: "Ofsted Rating", key: "ofsted", render: (a: Agency) => 
      a.ofsted_rating || "-"
    },
    { label: "Rating", key: "rating", render: (a: Agency) => 
      a.rating ? (
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span>{a.rating.toFixed(1)}</span>
        </div>
      ) : "-"
    },
    { label: "24/7 Support", key: "support", render: (a: Agency) => 
      renderBool(a.has_24_7_support) 
    },
    { label: "Training", key: "training", render: (a: Agency) => 
      renderBool(a.training_provided) 
    },
    { label: "Accepting Carers", key: "carers", render: (a: Agency) => 
      renderBool(a.accepting_new_carers) 
    },
    { label: "Accepts Referrals", key: "referrals", render: (a: Agency) => 
      renderBool(a.accepting_referrals) 
    },
    { label: "Fostering Types", key: "types", render: (a: Agency) => 
      a.fostering_types?.slice(0, 3).join(", ") || "-"
    },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2 font-medium w-32"></th>
            {agencies.map(agency => (
              <th key={agency.id} className="p-2 font-medium text-center min-w-[150px]">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    {agency.logo_url ? (
                      <img src={agency.logo_url} alt="" className="w-8 h-8 object-contain" />
                    ) : (
                      <Award className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <span className="text-xs">{agency.name}</span>
                  <button 
                    onClick={() => onRemove(agency.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {comparisonRows.map(row => (
            <tr key={row.key} className="border-b">
              <td className="p-2 font-medium text-muted-foreground">{row.label}</td>
              {agencies.map(agency => (
                <td key={agency.id} className="p-2 text-center">
                  {row.render(agency)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderBool(value: boolean | null | undefined) {
  if (value === true) return <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />;
  if (value === false) return <XCircle className="w-5 h-5 text-red-400 mx-auto" />;
  return <Minus className="w-5 h-5 text-muted-foreground mx-auto" />;
}

// Full comparison page
export function AgencyComparePage() {
  const { agencies, clearAll } = useAgencyComparison();

  if (agencies.length < 2) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <Globe className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">No Agencies to Compare</h1>
          <p className="text-muted-foreground mb-6">
            Add agencies to compare by clicking the "Compare" button on their listings.
          </p>
          <Button asChild>
            <Link to="/agencies">Browse Agencies</Link>
          </Button>
        </div>
      </div>
    );
  }

  const comparisonRows = [
    { label: "Location", key: "city", render: (a: Agency) => (
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-muted-foreground" />
        {a.city || a.address || "-"}
      </div>
    )},
    { label: "Agency Type", key: "type", render: (a: Agency) => (
      <Badge variant="outline">
        {a.agency_type === 'independent' ? 'Independent Fostering Agency' : 'Local Authority'}
      </Badge>
    )},
    { label: "Ofsted Rating", key: "ofsted", render: (a: Agency) => a.ofsted_rating ? (
      <Badge className={cn(
        "text-white",
        a.ofsted_rating === "Outstanding" ? "bg-green-500" :
        a.ofsted_rating === "Good" ? "bg-blue-500" :
        a.ofsted_rating === "Requires Improvement" ? "bg-amber-500" : "bg-red-500"
      )}>
        <Award className="w-3 h-3 mr-1" />
        {a.ofsted_rating}
      </Badge>
    ) : "-"},
    { label: "Rating", key: "rating", render: (a: Agency) => a.rating ? (
      <div className="flex items-center gap-2">
        <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
        <span className="font-semibold">{a.rating.toFixed(1)}</span>
        {a.review_count && <span className="text-muted-foreground">({a.review_count})</span>}
      </div>
    ) : "-"},
    { label: "24/7 Support", key: "support", render: (a: Agency) => (
      <div className="flex items-center gap-2">
        {renderBool(a.has_24_7_support)}
        <span>{a.has_24_7_support ? "Yes" : "No"}</span>
      </div>
    )},
    { label: "Training Provided", key: "training", render: (a: Agency) => (
      <div className="flex items-center gap-2">
        {renderBool(a.training_provided)}
        <span>{a.training_provided ? "Yes" : "No"}</span>
      </div>
    )},
    { label: "Therapeutic Team", key: "therapeutic", render: (a: Agency) => (
      <div className="flex items-center gap-2">
        {renderBool(a.has_therapeutic_team)}
        <span>{a.has_therapeutic_team ? "Yes" : "No"}</span>
      </div>
    )},
    { label: "Accepting Carers", key: "carers", render: (a: Agency) => (
      <div className="flex items-center gap-2">
        {renderBool(a.accepting_new_carers)}
        <span>{a.accepting_new_carers ? "Yes" : "No"}</span>
      </div>
    )},
    { label: "Accepts Referrals", key: "referrals", render: (a: Agency) => (
      <div className="flex items-center gap-2">
        {renderBool(a.accepting_referrals)}
        <span>{a.accepting_referrals ? "Yes" : "No"}</span>
      </div>
    )},
    { label: "Online Enquiry", key: "online", render: (a: Agency) => (
      <div className="flex items-center gap-2">
        {renderBool(a.online_enquiry)}
        <span>{a.online_enquiry ? "Yes" : "No"}</span>
      </div>
    )},
    { label: "Fostering Types", key: "types", render: (a: Agency) => (
      <div className="flex flex-wrap gap-1">
        {a.fostering_types?.map(type => (
          <Badge key={type} variant="secondary" className="text-xs">
            {type.replace("_", " ")}
          </Badge>
        )) || "-"}
      </div>
    )},
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Compare Fostering Agencies</h1>
          <p className="text-muted-foreground mt-1">
            Comparing {agencies.length} agencies side by side
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={clearAll}>Clear All</Button>
          <Button asChild>
            <Link to="/agencies">Add More</Link>
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left p-4 font-medium w-40 bg-muted/30"></th>
              {agencies.map(agency => (
                <th key={agency.id} className="p-4 font-medium text-center min-w-[200px] bg-muted/30">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-xl bg-white shadow-sm flex items-center justify-center p-2">
                      {agency.logo_url ? (
                        <img src={agency.logo_url} alt="" className="max-h-full object-contain" />
                      ) : (
                        <Award className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <Link 
                        to={`/agency/${agency.slug}`} 
                        className="font-semibold hover:text-primary"
                      >
                        {agency.name}
                      </Link>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" asChild>
                        <Link to={`/agency/${agency.slug}`}>View Profile</Link>
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/agency/${agency.slug}/enquiry`}>Enquire</Link>
                      </Button>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparisonRows.map(row => (
              <tr key={row.key} className="border-b hover:bg-muted/20">
                <td className="p-4 font-medium">{row.label}</td>
                {agencies.map(agency => (
                  <td key={agency.id} className="p-4 text-center">
                    {row.render(agency)}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-b">
              <td className="p-4 font-medium">Description</td>
              {agencies.map(agency => (
                <td key={agency.id} className="p-4 text-left text-muted-foreground text-sm">
                  {agency.description?.slice(0, 150) || "No description"}...
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AgencyComparisonWidget;