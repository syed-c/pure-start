/**
 * PricingDisplay - Displays service information for fostering agencies.
 * 
 * Shows fostering types and services offered by agencies.
 */

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Banknote, Info, ShieldCheck } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PricingItem {
  name: string;
  slug: string;
  priceAed?: number | null;
}

interface AEDPricingDisplayProps {
  treatments: PricingItem[];
  hasInsurance?: boolean;
  className?: string;
  compact?: boolean;
}

export function AEDPricingDisplay({
  treatments,
  hasInsurance = false,
  className,
  compact = false,
}: AEDPricingDisplayProps) {
  if (!treatments || treatments.length === 0) return null;

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-bold flex items-center gap-2">
          <Banknote className="h-4 w-4 text-primary" />
          Fostering Services
        </h3>
        <Tooltip>
          <TooltipTrigger>
            <Info className="h-3.5 w-3.5 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs text-xs">
            Services and fostering types offered by this agency. Contact the agency for specific details about allowances and support.
          </TooltipContent>
        </Tooltip>
      </div>

      <div className={cn(
        'grid gap-2',
        compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'
      )}>
        {treatments.slice(0, compact ? 5 : 12).map((treatment) => (
          <div
            key={treatment.slug}
            className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border/50 hover:border-primary/20 transition-colors"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{treatment.name}</p>
            </div>
          </div>
        ))}
      </div>

      {treatments.length > (compact ? 5 : 12) && (
        <p className="text-xs text-muted-foreground text-center">
          + {treatments.length - (compact ? 5 : 12)} more services available
        </p>
      )}
    </div>
  );
}

export default AEDPricingDisplay;
