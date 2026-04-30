import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, ChevronDown, ChevronUp, Phone, Star, MapPin, Globe, ExternalLink, HandHeart, Home, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAnalytics } from "@/hooks/useAnalytics";

interface AgencyHour {
  day_of_week: number;
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean;
  weekday_text?: string;
}

interface AgencyStickyContactProps {
  agencyId: string;
  agencyName: string;
  agencyPhone?: string | null;
  agencyRating?: number | null;
  agencyReviewCount?: number;
  agencyArea?: string | null;
  agencyLatitude?: number;
  agencyLongitude?: number;
  agencyAddress?: string;
  agencyWebsite?: string | null;
  agencyGoogleMapsUrl?: string | null;
  hours?: AgencyHour[];
  isClaimed?: boolean;
  className?: string;
}

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function AgencyStickyContact({
  agencyId,
  agencyName,
  agencyPhone,
  agencyRating,
  agencyReviewCount = 0,
  agencyArea,
  agencyLatitude,
  agencyLongitude,
  agencyAddress,
  agencyWebsite,
  agencyGoogleMapsUrl,
  hours = [],
  isClaimed = false,
  className,
}: AgencyStickyContactProps) {
  const [showHours, setShowHours] = useState(false);
  const { trackPhoneClick } = useAnalytics();
  
  const today = new Date().getDay();
  const todayHours = hours.find(h => h.day_of_week === today);
  
  const isOpenNow = () => {
    if (!todayHours || todayHours.is_closed) return false;
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    return todayHours.open_time && todayHours.close_time && 
           currentTime >= todayHours.open_time && 
           currentTime <= todayHours.close_time;
  };

  const openStatus = isOpenNow();

  return (
    <div className={cn("space-y-4 max-w-full overflow-hidden", className)}>
      {/* Agency Contact Card */}
      <div className="card-modern overflow-hidden max-w-full">
        {/* Header */}
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between mb-2 gap-2">
            <h3 className="font-display font-bold text-base truncate flex-1 min-w-0">📍 {agencyName}</h3>
          </div>
          
          {/* Quick Info */}
          <div className="flex flex-wrap gap-2">
            {agencyRating && agencyRating > 0 && (
              <Badge variant="secondary" className="rounded-full text-xs">
                <Star className="h-3 w-3 mr-1 fill-gold text-gold" />
                {agencyRating.toFixed(1)} ({agencyReviewCount})
              </Badge>
            )}
            {agencyArea && (
              <Badge variant="secondary" className="rounded-full text-xs">
                <MapPin className="h-3 w-3 mr-1" />
                {agencyArea}
              </Badge>
            )}
            {todayHours && (
              <Badge 
                variant={openStatus ? "default" : "secondary"} 
                className={cn(
                  "rounded-full text-xs",
                  openStatus ? "bg-emerald text-white" : ""
                )}
              >
                <Clock className="h-3 w-3 mr-1" />
                {todayHours.is_closed 
                  ? "Closed today" 
                  : openStatus 
                    ? "Open now" 
                    : `Opens ${todayHours.open_time}`
                }
              </Badge>
            )}
          </div>
        </div>

        {/* CTAs */}
        <div className="p-4 space-y-3">
          <Button 
            className="w-full rounded-xl font-bold bg-teal hover:bg-teal/90"
          >
            <a href="/contact">
              <HandHeart className="h-4 w-4 mr-2" />
              Make an Enquiry
            </a>
          </Button>
          
          <Button 
            variant="outline"
            className="w-full rounded-xl font-bold"
            asChild
          >
            <Link to="/become-foster-carer">
              <Home className="h-4 w-4 mr-2" />
              Become a Foster Carer
            </Link>
          </Button>
        </div>

        {/* Contact Info */}
        {(agencyPhone || agencyWebsite) && isClaimed && (
          <div className="p-4 border-t border-border/50 space-y-2">
            {agencyPhone && (
              <a 
                href={`tel:${agencyPhone}`}
                className="flex items-center gap-2 text-sm text-primary hover:underline"
                onClick={() => trackPhoneClick({ clinic_id: agencyId, clinic_name: agencyName, phone_number: agencyPhone })}
              >
                <Phone className="h-4 w-4" />
                {agencyPhone}
              </a>
            )}
            {agencyWebsite && (
              <a 
                href={agencyWebsite} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Globe className="h-4 w-4" />
                Visit Website
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {agencyGoogleMapsUrl && (
              <a 
                href={agencyGoogleMapsUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
              >
                <MapPin className="h-4 w-4" />
                Get Directions
              </a>
            )}
          </div>
        )}

        {/* Hours Accordion */}
        {hours.length > 0 && (
          <div className="border-t border-border/50">
            <button
              onClick={() => setShowHours(!showHours)}
              className="w-full p-3 flex items-center justify-between text-sm hover:bg-muted/50 transition-colors"
            >
              <span className="font-medium text-xs">Opening Hours</span>
              {showHours ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            
            {showHours && (
              <div className="px-4 pb-4 space-y-1 animate-fade-in-up">
                {hours.map((h) => (
                  <div 
                    key={h.day_of_week} 
                    className={cn(
                      "flex justify-between text-xs py-1 px-2 rounded-lg",
                      h.day_of_week === today && "bg-primary/5 font-medium"
                    )}
                  >
                    <span>{dayNames[h.day_of_week]}</span>
                    <span className={h.is_closed ? "text-muted-foreground" : ""}>
                      {h.is_closed ? 'Closed' : `${h.open_time} - ${h.close_time}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}