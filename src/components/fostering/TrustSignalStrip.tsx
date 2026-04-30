import { BadgeCheck, Award, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TrustSignalStripProps {
  isVerified: boolean;
  isClaimed: boolean;
  isGmbConnected?: boolean;
  reviewCount: number;
  rating: number;
  className?: string;
}

export function TrustSignalStrip({
  isVerified,
  isClaimed,
  isGmbConnected,
  reviewCount,
  rating,
  className
}: TrustSignalStripProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {isVerified && (
        <Badge className="bg-green-100 text-green-700 border-green-200 rounded-full text-xs font-medium">
          <BadgeCheck className="h-3 w-3 mr-1" />
          Verified Agency
        </Badge>
      )}
      {isClaimed && !isVerified && (
        <Badge className="bg-gold/10 text-gold border border-gold/20 rounded-full text-xs font-medium">
          <Award className="h-3 w-3 mr-1" />
          Claimed Profile
        </Badge>
      )}
      {isGmbConnected && (
        <Badge variant="outline" className="rounded-full text-xs">
          <img src="https://www.google.com/favicon.ico" alt="Google" className="h-3 w-3 mr-1" />
          Google Synced
        </Badge>
      )}
      {!isClaimed && (
        <Badge variant="outline" className="rounded-full text-xs text-amber-600 border-amber-300">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Unclaimed
        </Badge>
      )}
    </div>
  );
}