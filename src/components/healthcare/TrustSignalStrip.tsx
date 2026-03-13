/**
 * TrustSignalStrip - Trust badges displayed prominently on profile pages.
 * 
 * Shows Ofsted verification, years active, review count, and safety indicators
 * in a calm, authority visual style.
 */

import { Shield, BadgeCheck, Clock, Users, Award, Heart, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrustSignalStripProps {
  isVerified: boolean;
  isClaimed: boolean;
  isGmbConnected?: boolean;
  reviewCount?: number;
  rating?: number;
  dentistCount?: number;
  yearsExperience?: number;
  className?: string;
}

export function TrustSignalStrip({
  isVerified,
  isClaimed,
  isGmbConnected,
  reviewCount = 0,
  rating = 0,
  dentistCount,
  yearsExperience,
  className,
}: TrustSignalStripProps) {
  const signals = [];

  if (isVerified) {
    signals.push({
      icon: Shield,
      label: 'Ofsted Registered',
      sublabel: 'Verified Agency',
      colorClass: 'text-teal bg-teal/10 border-teal/20',
    });
  }

  if (isClaimed) {
    signals.push({
      icon: BadgeCheck,
      label: 'Claimed Profile',
      sublabel: 'Owner Managed',
      colorClass: 'text-primary bg-primary/10 border-primary/20',
    });
  }

  if (reviewCount > 0 && rating >= 4.0) {
    signals.push({
      icon: Award,
      label: `${rating.toFixed(1)} Rating`,
      sublabel: `${reviewCount} Reviews`,
      colorClass: 'text-gold bg-gold/10 border-gold/20',
    });
  }

  if (dentistCount && dentistCount > 0) {
    signals.push({
      icon: Building2,
      label: `${dentistCount} Staff`,
      sublabel: 'Team Members',
      colorClass: 'text-primary bg-primary/10 border-primary/20',
    });
  }

  if (yearsExperience && yearsExperience > 0) {
    signals.push({
      icon: Clock,
      label: `${yearsExperience}+ Years`,
      sublabel: 'Experience',
      colorClass: 'text-primary bg-primary/10 border-primary/20',
    });
  }

  if (isGmbConnected) {
    signals.push({
      icon: Heart,
      label: 'Google Verified',
      sublabel: 'Live Sync',
      colorClass: 'text-teal bg-teal/10 border-teal/20',
    });
  }

  if (signals.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {signals.slice(0, 4).map((signal, i) => (
        <div
          key={i}
          className={cn(
            'flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-colors',
            signal.colorClass
          )}
        >
          <signal.icon className="h-3.5 w-3.5 shrink-0" />
          <div className="min-w-0">
            <span className="font-bold">{signal.label}</span>
            <span className="hidden sm:inline text-[10px] opacity-70 ml-1">· {signal.sublabel}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default TrustSignalStrip;
