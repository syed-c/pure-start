import { useParams, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase, supabaseAdmin } from '@/integrations/supabase/client';
import { CalendarBookingForm } from '@/components/booking/CalendarBookingForm';
import { Skeleton } from '@/components/ui/skeleton';
import { SEOHead } from '@/components/seo/SEOHead';

/**
 * BookDirectPage - Direct booking page for GMB integration
 * 
 * This page is the target of the "Book Appointment" button on Google Business Profiles.
 * It provides a streamlined booking experience without requiring navigation through
 * the full agency page.
 * 
 * URL: /book/:agencyId
 */
export default function BookDirectPage() {
  const { agencyId } = useParams<{ agencyId: string }>();

  const { data: agency, isLoading, error } = useQuery({
    queryKey: ['agency-booking', agencyId],
    queryFn: async () => {
      if (!agencyId) throw new Error('No agency ID');

      const { data, error } = await supabaseAdmin
        .from('agencies')
        .select(`*`)
        .eq('id', agencyId)
        .single();

      if (error) throw error;
      return data as any;
    },
    enabled: !!agencyId,
  });

  // Track page view for analytics
  useQuery({
    queryKey: ['track-booking-view', agencyId],
    queryFn: async () => {
      if (!agencyId) return null;
      
      await supabase.functions.invoke('track-profile-view', {
        body: { 
          clinicId: agencyId, 
          source: 'gmb_booking_link',
          eventType: 'booking_page_view'
        }
      });
      
      return true;
    },
    enabled: !!agencyId,
    staleTime: Infinity, // Only track once per session
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
        <div className="w-full max-w-lg space-y-4">
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !agency) {
    // Redirect to home if agency not found
    return <Navigate to="/" replace />;
  }

  const locationDisplay = [
    (agency.area as any)?.name,
    (agency.city as any)?.name,
  ].filter(Boolean).join(', ');

  return (
    <>
      <SEOHead
        title={`Book Appointment - ${agency.name}`}
        description={`Book an enquiry online with ${agency.name}${locationDisplay ? ` in ${locationDisplay}` : ''}. Quick and easy online scheduling.`}
        noindex={true}
      />
      
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Header */}
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container max-w-lg mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              {agency.cover_image_url ? (
                <img 
                  src={agency.cover_image_url} 
                  alt={agency.name}
                  className="h-12 w-12 rounded-full object-cover border-2 border-primary/20"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">
                    {agency.name.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <h1 className="font-semibold text-foreground">{agency.name}</h1>
                {locationDisplay && (
                  <p className="text-sm text-muted-foreground">{locationDisplay}</p>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Booking Form */}
        <main className="container max-w-lg mx-auto px-4 py-6">
          <div className="bg-card rounded-2xl border shadow-lg overflow-hidden">
            <CalendarBookingForm
              profileId={agency.id}
              profileName={agency.name}
              profileType="agency"
              agencyId={agency.id}
              agencyLatitude={agency.latitude}
              agencyLongitude={agency.longitude}
              agencyAddress={agency.address}
              onClose={() => {
                window.location.href = `/agency/${agency.slug}`;
              }}
            />
          </div>

          {/* Trust indicators */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Powered by Foster Care
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <svg className="h-4 w-4 text-teal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="m9 12 2 2 4-4"/>
                </svg>
                Secure Booking
              </span>
              <span className="flex items-center gap-1">
                <svg className="h-4 w-4 text-teal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                Instant Confirmation
              </span>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
