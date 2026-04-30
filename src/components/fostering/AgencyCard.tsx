import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Shield, 
  Star, 
  Heart, 
  Globe, 
  Phone, 
  Clock,
  Users,
  Award,
  CheckCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface Agency {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  address: string | null;
  city: string | null;
  postcode: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  rating: number | null;
  review_count: number | null;
  is_verified: boolean | null;
  ofsted_rating: string | null;
  agency_type: string | null;
  fostering_types: string[] | null;
  has_24_7_support: boolean | null;
  training_provided: boolean | null;
  accepting_new_carers: boolean | null;
  accepting_referrals: boolean | null;
}

interface AgencyCardProps {
  agency: Agency;
  onCompare?: (agency: Agency) => void;
  isComparing?: boolean;
  onSave?: (agency: Agency) => void;
  isSaved?: boolean;
  variant?: "default" | "compact" | "featured";
}

const FOSTERING_TYPE_LABELS: Record<string, string> = {
  short_term: "Short-Term",
  long_term: "Long-Term",
  emergency: "Emergency",
  parent_child: "Parent & Child",
  therapeutic: "Therapeutic",
  respite: "Respite",
  sibling: "Sibling",
  teenage: "Teenage",
  disability: "Disability",
};

const OFSTED_RATING_COLORS: Record<string, string> = {
  "Outstanding": "bg-green-500",
  "Good": "bg-blue-500",
  "Requires Improvement": "bg-amber-500",
  "Inadequate": "bg-red-500",
};

export function AgencyCard({ 
  agency, 
  onCompare, 
  isComparing, 
  onSave, 
  isSaved,
  variant = "default" 
}: AgencyCardProps) {
  const displayLocation = agency.city || agency.address || agency.postcode || "UK";

  return (
    <Card className={cn(
      "group hover:shadow-lg transition-all duration-300 border-border/50 overflow-hidden",
      variant === "featured" && "ring-2 ring-primary/20"
    )}>
      <div className="flex flex-col md:flex-row">
        {/* Logo */}
        <div className="md:w-48 h-32 md:h-auto relative bg-muted/30 flex items-center justify-center p-4">
          {agency.logo_url ? (
            <img 
              src={agency.logo_url} 
              alt={agency.name} 
              className="max-h-20 max-w-full object-contain"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary/50" />
            </div>
          )}
          
          {/* Verified badge */}
          {agency.is_verified && (
            <Badge className="absolute top-2 left-2 bg-green-500 text-white text-[10px] gap-1">
              <CheckCircle className="w-3 h-3" /> Verified
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <Link 
                to={`/agency/${agency.slug}`} 
                className="text-lg font-semibold hover:text-primary transition-colors line-clamp-1"
              >
                {agency.name}
              </Link>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <MapPin className="w-4 h-4" />
                <span>{displayLocation}</span>
              </div>
            </div>

            {/* Rating */}
            {agency.rating && (
              <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="font-semibold text-amber-700">{agency.rating.toFixed(1)}</span>
                {agency.review_count && (
                  <span className="text-xs text-amber-600">({agency.review_count})</span>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          {agency.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {agency.description}
            </p>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {/* Agency Type */}
            {agency.agency_type && (
              <Badge variant="outline" className="text-xs">
                {agency.agency_type === 'independent' ? 'Independent Agency' : 'Local Authority'}
              </Badge>
            )}

            {/* Ofsted Rating */}
            {agency.ofsted_rating && (
              <Badge className={cn("text-xs text-white", OFSTED_RATING_COLORS[agency.ofsted_rating] || "bg-gray-500")}>
                <Award className="w-3 h-3 mr-1" />
                {agency.ofsted_rating}
              </Badge>
            )}

            {/* Support features */}
            {agency.has_24_7_support && (
              <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                <Clock className="w-3 h-3 mr-1" /> 24/7 Support
              </Badge>
            )}
            {agency.training_provided && (
              <Badge variant="secondary" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                <Users className="w-3 h-3 mr-1" /> Training
              </Badge>
            )}
          </div>

          {/* Fostering Types */}
          {agency.fostering_types && agency.fostering_types.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {agency.fostering_types.slice(0, 4).map((type) => (
                <span 
                  key={type}
                  className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground"
                >
                  {FOSTERING_TYPE_LABELS[type] || type}
                </span>
              ))}
              {agency.fostering_types.length > 4 && (
                <span className="text-xs text-muted-foreground">
                  +{agency.fostering_types.length - 4} more
                </span>
              )}
            </div>
          )}

          {/* Status indicators */}
          <div className="flex items-center gap-3 mb-4">
            {agency.accepting_new_carers ? (
              <span className="flex items-center gap-1 text-xs text-green-600">
                <CheckCircle className="w-3 h-3" /> Accepting new carers
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-amber-600">
                <Clock className="w-3 h-3" /> Not currently recruiting
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" className="flex-1 sm:flex-none">
              <Link to={`/agency/${agency.slug}`}>View Profile</Link>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onCompare?.(agency)}
              disabled={isComparing}
              className={cn(isComparing && "bg-primary/10 border-primary")}
            >
              <Globe className="w-4 h-4 mr-1" />
              Compare
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onSave?.(agency)}
            >
              <Heart className={cn("w-4 h-4", isSaved && "fill-red-500 text-red-500")} />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Compact variant for lists
export function AgencyCardCompact({ 
  agency, 
  onCompare, 
  isComparing,
  onSave,
  isSaved
}: AgencyCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow p-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
          {agency.logo_url ? (
            <img src={agency.logo_url} alt="" className="w-10 h-10 object-contain" />
          ) : (
            <Shield className="w-6 h-6 text-muted-foreground" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <Link to={`/agency/${agency.slug}`} className="font-medium hover:text-primary">
            {agency.name}
          </Link>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-3 h-3" />
            {agency.city || agency.postcode}
            {agency.ofsted_rating && (
              <Badge variant="outline" className="text-[10px] ml-2">
                {agency.ofsted_rating}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {agency.rating && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-sm font-medium">{agency.rating.toFixed(1)}</span>
            </div>
          )}
          <Button variant="ghost" size="icon" onClick={() => onSave?.(agency)}>
            <Heart className={cn("w-4 h-4", isSaved && "fill-red-500 text-red-500")} />
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default AgencyCard;