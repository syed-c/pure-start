import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAnalytics } from "@/hooks/useAnalytics";
import { PageLayout } from "@/components/layout/PageLayout";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SEOHead } from "@/components/seo/SEOHead";
import { SyncStructuredData } from "@/components/seo/SyncStructuredData";
import { InterlinkingSection } from "@/components/seo/InterlinkingSection";
import { RelatedClinicsBlock } from "@/components/seo/RelatedClinicsBlock";
import { MultiStepBookingModal } from "@/components/MultiStepBookingModal";
import { useSeoPageContent, parseMarkdownContent, parseFaqFromContent } from "@/hooks/useSeoPageContent";
import { usePrerenderReady } from "@/hooks/usePrerenderReady";
import {
  ClinicStickyBooking,
  ClinicTeamSection,
  ClaimProfileCTA,
  ClinicGallery,
  ClinicReviewsSection,
} from "@/components/clinic";
import {
  Star,
  BadgeCheck,
  Calendar,
  Share2,
  Heart,
  Award,
  Users,
  MapPin,
  Phone,
  Globe,
  AlertTriangle,
  Percent
} from "lucide-react";
import { AIMatchBadge } from "@/components/ai";
import { TrustSignalStrip, AEDPricingDisplay } from "@/components/healthcare";
import { ConversationalQABlock, AIDiscoveryMeta } from "@/components/ai-seo";
import { generateClinicQA } from "@/lib/ai-seo/generateQAContent";

const ClinicPage = () => {
  const { clinicSlug } = useParams();
  const slug = clinicSlug || "";
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedDentistId, setSelectedDentistId] = useState<string | undefined>();
  const { trackProfileView } = useAnalytics();

  const seoSlug = `clinic/${slug}`;
  const { data: seoContent } = useSeoPageContent(seoSlug);
  const parsedContent = seoContent?.content ? parseMarkdownContent(seoContent.content) : null;
  const seoFaqs = seoContent?.faqs && Array.isArray(seoContent.faqs) && seoContent.faqs.length > 0
    ? seoContent.faqs
    : seoContent?.content ? parseFaqFromContent(seoContent.content) : [];

  const { data: clinic, isLoading, error } = useQuery({
    queryKey: ["clinic", slug],
    queryFn: async () => {
      if (!slug || slug.includes('/')) return null;
      const { data, error } = await supabase
        .from("clinics")
        .select("*, city:cities(name, slug, state:states(name, slug, abbreviation)), area:areas(name, slug)")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug && !slug.includes('/'),
  });

  const { data: teamMembers } = useQuery({
    queryKey: ["agency-team", clinic?.id],
    queryFn: async () => {
      if (!clinic?.id) return [];
      const { data } = await supabase
        .from("dentists")
        .select("*")
        .eq("clinic_id", clinic.id)
        .eq("is_active", true)
        .order("is_primary", { ascending: false })
        .order("name");
      return data || [];
    },
    enabled: !!clinic?.id,
  });

  const { data: treatments } = useQuery({
    queryKey: ["agency-services", clinic?.id],
    queryFn: async () => {
      if (!clinic?.id) return [];
      const { data } = await supabase
        .from("clinic_treatments")
        .select("*, treatment:treatments(*)")
        .eq("clinic_id", clinic.id);
      return data || [];
    },
    enabled: !!clinic?.id,
  });

  const { data: reviews } = useQuery({
    queryKey: ["agency-reviews", clinic?.id],
    queryFn: async () => {
      if (!clinic?.id) return [];
      const { data } = await supabase
        .from("review_funnel_events")
        .select("*")
        .eq("clinic_id", clinic.id)
        .eq("event_type", "rating_submitted")
        .order("created_at", { ascending: false })
        .limit(20);
      return (data || []).map((r: any) => ({
        id: r.id,
        patient_name: r.visitor_id || 'Anonymous',
        rating: r.rating || 5,
        content: r.comment || '',
        created_at: r.created_at,
        source: 'internal' as const,
      }));
    },
    enabled: !!clinic?.id,
  });

  const { data: googleReviews } = useQuery({
    queryKey: ["agency-google-reviews", clinic?.id],
    queryFn: async () => {
      if (!clinic?.id) return [];
      const { data } = await supabase
        .from("google_reviews")
        .select("*")
        .eq("clinic_id", clinic.id)
        .order("review_time", { ascending: false })
        .limit(20);
      return data || [];
    },
    enabled: !!clinic?.id && clinic?.gmb_connected,
  });

  const { data: galleryImages } = useQuery({
    queryKey: ["agency-gallery", clinic?.id],
    queryFn: async () => {
      if (!clinic?.id) return [];
      const { data } = await supabase
        .from("clinic_images")
        .select("*")
        .eq("clinic_id", clinic.id)
        .order("display_order");
      return data || [];
    },
    enabled: !!clinic?.id,
  });

  const { data: hours } = useQuery({
    queryKey: ["agency-hours", clinic?.id],
    queryFn: async () => {
      if (!clinic?.id) return [];
      const { data } = await supabase
        .from("clinic_hours")
        .select("*")
        .eq("clinic_id", clinic.id)
        .order("day_of_week");
      return data || [];
    },
    enabled: !!clinic?.id,
  });

  const handleBookClick = (teamMemberId?: string) => {
    setSelectedDentistId(teamMemberId);
    setBookingOpen(true);
  };

  useEffect(() => {
    if (clinic?.id && clinic?.name) {
      trackProfileView({
        profile_type: 'clinic',
        profile_id: clinic.id,
        profile_name: clinic.name,
        city: clinic.city?.name,
        state: clinic.city?.state?.abbreviation,
      });
    }
  }, [clinic?.id, clinic?.name, clinic?.city?.name, clinic?.city?.state?.abbreviation, trackProfileView]);

  const isDataReady = !isLoading && !!clinic && 
    !!treatments && 
    (!!seoContent || !seoSlug);
  usePrerenderReady(isDataReady, { delay: 600 });

  if (isLoading) {
    return (
      <PageLayout>
        <div className="container py-8">
          <Skeleton className="h-80 rounded-3xl mb-8" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div>
              <Skeleton className="h-64 rounded-3xl" />
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!clinic) {
    return (
      <PageLayout>
        <Section>
          <div className="text-center py-20">
            <h1 className="font-display text-3xl font-bold mb-4">Agency Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The fostering agency you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild className="rounded-xl font-bold">
              <Link to="/search">Browse Agencies</Link>
            </Button>
          </div>
        </Section>
      </PageLayout>
    );
  }

  const isClaimed = clinic.claim_status === "claimed";
  const isVerified = clinic.verification_status === "verified" && isClaimed;
  const isGmbConnected = clinic.gmb_connected === true;
  const stateSlug = clinic.city?.state?.slug || '';
  
  const breadcrumbs = [
    { label: "Agencies", href: "/search" },
    ...(clinic.city?.state ? [{ label: clinic.city.state.name, href: `/${clinic.city.state.slug}` }] : []),
    ...(clinic.city ? [{ label: clinic.city.name, href: `/${stateSlug}/${clinic.city.slug}` }] : []),
    { label: clinic.name },
  ];

  return (
    <PageLayout>
      <SEOHead
        title={seoContent?.meta_title || `${clinic.name} - Fostering Agency in ${clinic.city?.name || 'UK'}`}
        description={seoContent?.meta_description || clinic.description || `Learn about ${clinic.name}. ${isVerified ? 'Verified' : ''} fostering agency in ${clinic.city?.name || 'UK'}.`}
        canonical={`/agency/${clinic.slug}/`}
        keywords={[clinic.name, `fostering agency ${clinic.city?.name}`, `foster care ${clinic.city?.state?.abbreviation || 'UK'}`]}
      />
      <SyncStructuredData
        data={[
          {
            type: 'breadcrumb',
            items: [
              { name: 'Home', url: '/' },
              ...(clinic.city?.state?.abbreviation ? [{ name: clinic.city?.state?.name || '', url: `/${clinic.city?.state?.slug}/` }] : []),
              ...(clinic.city ? [{ name: clinic.city.name, url: `/${stateSlug}/${clinic.city.slug}/` }] : []),
              { name: clinic.name },
            ],
          },
          {
            type: 'localBusiness',
            name: clinic.name,
            description: clinic.description || `Fostering agency in ${clinic.city?.name || 'UK'}`,
            address: clinic.address || '',
            city: clinic.city?.name || '',
            state: clinic.city?.state?.abbreviation || '',
            country: 'United Kingdom',
            phone: clinic.phone || '',
            url: `/agency/${clinic.slug}/`,
            geo: clinic.latitude && clinic.longitude ? { lat: Number(clinic.latitude), lng: Number(clinic.longitude) } : undefined,
            rating: clinic.rating ? Number(clinic.rating) : undefined,
            reviewCount: clinic.review_count || undefined,
            services: (treatments || []).slice(0, 10).map(t => t.treatment?.name).filter(Boolean) as string[],
          },
        ]}
        id="agency-schema"
      />

      {/* Hero Cover */}
      <div className="relative h-56 md:h-72 bg-muted">
        {clinic.cover_image_url ? (
          <img src={clinic.cover_image_url} alt={clinic.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-teal/10 to-accent/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute top-4 left-0 right-0">
          <div className="container">
            <Breadcrumbs items={breadcrumbs} className="text-white/80" />
          </div>
        </div>
      </div>

      {/* Agency Header Card */}
      <Section size="sm" className="-mt-20 relative z-10">
        <div className="card-modern p-5 md:p-6">
          <div className="flex flex-col lg:flex-row gap-5">
            <div className="shrink-0">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-card overflow-hidden border-4 border-background shadow-elevated">
                {clinic.cover_image_url ? (
                  <img src={clinic.cover_image_url} alt={clinic.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-teal/20 flex items-center justify-center">
                    <span className="text-2xl font-display font-bold text-primary/50">{clinic.name.charAt(0)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {isVerified && (
                  <Badge className="bg-primary text-primary-foreground rounded-full px-3 py-1 font-bold">
                    <BadgeCheck className="h-3.5 w-3.5 mr-1" /> Verified
                  </Badge>
                )}
                {isClaimed && !isVerified && (
                  <Badge className="bg-gold/10 text-gold border border-gold/20 rounded-full px-3 py-1 font-bold">
                    <Award className="h-3.5 w-3.5 mr-1" /> Claimed
                  </Badge>
                )}
                {isGmbConnected && (
                  <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="h-3 w-3 mr-1" /> GMB Synced
                  </Badge>
                )}
                {!isClaimed && (
                  <Badge variant="outline" className="rounded-full px-3 py-1 text-xs text-amber-600 border-amber-300">
                    <AlertTriangle className="h-3 w-3 mr-1" /> Unclaimed
                  </Badge>
                )}
              </div>

              <TrustSignalStrip
                isVerified={isVerified}
                isClaimed={isClaimed}
                isGmbConnected={isGmbConnected}
                reviewCount={clinic.review_count || 0}
                rating={Number(clinic.rating) || 0}
                dentistCount={teamMembers?.length}
                className="mb-2"
              />

              <h1 className="font-display text-2xl md:text-3xl font-bold mb-2 truncate">{clinic.name}</h1>

              <div className="flex flex-wrap items-center gap-4 text-sm">
                {(Number(clinic.rating) || 0) > 0 && (
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-0.5 text-gold">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="font-bold">{Number(clinic.rating).toFixed(1)}</span>
                    </div>
                    <span className="text-muted-foreground">({clinic.review_count || 0})</span>
                  </div>
                )}
                {(clinic.area || clinic.city) && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{clinic.area?.name || clinic.city?.name}</span>
                  </div>
                )}
                {teamMembers && teamMembers.length > 0 && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{teamMembers.length} Team Members</span>
                  </div>
                )}
              </div>

              {isClaimed && (
                <div className="flex flex-wrap gap-3 mt-3">
                  {clinic.phone && (
                    <a href={`tel:${clinic.phone}`} className="text-sm text-primary hover:underline flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" /> {clinic.phone}
                    </a>
                  )}
                  {clinic.website && (
                    <a href={clinic.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                      <Globe className="h-3.5 w-3.5" /> Website
                    </a>
                  )}
                </div>
              )}
            </div>

            <div className="hidden lg:flex flex-col gap-2 shrink-0">
              <Button size="lg" className="rounded-xl font-bold" onClick={() => handleBookClick()}>
                <Calendar className="h-4 w-4 mr-2" /> Make Enquiry
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="rounded-xl flex-1">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-xl flex-1">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Promotion Banner */}
      <Section size="sm" className="pt-0">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-teal to-emerald p-[2px]">
          <div className="relative rounded-2xl bg-background/95 backdrop-blur-sm px-6 py-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-teal flex items-center justify-center">
                  <Percent className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display font-bold text-lg">🎉 50% OFF All Plans</h3>
                    <Badge className="bg-primary text-primary-foreground border-0 animate-pulse">Limited Time</Badge>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Claim this profile & get 50% off your first month. Verified badge + enhanced listing.
                  </p>
                </div>
              </div>
              <Button asChild className="bg-gradient-to-r from-primary to-teal text-primary-foreground border-0 hover:opacity-90">
                <Link to="/pricing">View Plans</Link>
              </Button>
            </div>
          </div>
        </div>
      </Section>

      {!isClaimed && (
        <Section size="sm" className="pt-0">
          <ClaimProfileCTA clinicId={clinic.id} clinicName={clinic.name} variant="banner" />
        </Section>
      )}

      {/* Main Content Grid */}
      <Section size="md" className="overflow-x-hidden">
        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2 min-w-0 overflow-hidden">
            <Tabs defaultValue="overview" className="w-full">
              <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide touch-manipulation pb-1">
                <TabsList className="inline-flex w-max md:w-full justify-start bg-muted/50 rounded-2xl p-1 mb-4 md:mb-6">
                  <TabsTrigger value="overview" className="rounded-xl font-bold text-xs px-2.5 py-2 md:text-sm md:px-4 whitespace-nowrap">Overview</TabsTrigger>
                  <TabsTrigger value="team" className="rounded-xl font-bold text-xs px-2.5 py-2 md:text-sm md:px-4 whitespace-nowrap">Team</TabsTrigger>
                  <TabsTrigger value="services" className="rounded-xl font-bold text-xs px-2.5 py-2 md:text-sm md:px-4 whitespace-nowrap">Services</TabsTrigger>
                  <TabsTrigger value="reviews" className="rounded-xl font-bold text-xs px-2.5 py-2 md:text-sm md:px-4 whitespace-nowrap">Reviews</TabsTrigger>
                  {galleryImages && galleryImages.length > 0 && (
                    <TabsTrigger value="photos" className="rounded-xl font-bold text-xs px-2.5 py-2 md:text-sm md:px-4 whitespace-nowrap">Photos</TabsTrigger>
                  )}
                </TabsList>
              </div>

              <TabsContent value="overview" className="space-y-6 animate-fade-in-up">
                <AIMatchBadge
                  clinicName={clinic.name}
                  location={clinic.city?.name || ''}
                  rating={Number(clinic.rating) || 0}
                  isVerified={isVerified}
                />

                <div className="card-modern p-4 md:p-6 overflow-hidden">
                  <h2 className="font-display text-lg md:text-xl font-bold mb-4">About This Agency</h2>
                  
                  {parsedContent && parsedContent.intro ? (
                    <div className="space-y-4 overflow-hidden">
                      <p className="text-muted-foreground leading-relaxed text-sm md:text-base break-words">{parsedContent.intro}</p>
                      {parsedContent.sections.filter(s => !s.heading.toLowerCase().includes('faq')).slice(0, 3).map((section, idx) => (
                        <div key={idx} className="mt-6 overflow-hidden">
                          {section.level === 2 ? (
                            <h3 className="font-display text-base md:text-lg font-bold text-foreground mb-3">{section.heading}</h3>
                          ) : (
                            <h4 className="font-semibold text-foreground mb-2 text-sm md:text-base">{section.heading}</h4>
                          )}
                          <div className="text-muted-foreground leading-relaxed prose prose-sm max-w-none text-sm md:text-base break-words overflow-hidden" dangerouslySetInnerHTML={{ __html: section.content.replace(/\n/g, '<br/>') }} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground leading-relaxed text-sm md:text-base break-words">
                      {clinic.description || `${clinic.name} is a fostering agency in ${clinic.area?.name || clinic.city?.name || 'the UK'}${isClaimed ? ', offering comprehensive fostering services with a focus on child welfare and carer support.' : '. More details will be available once the agency claims their profile.'}`}
                    </p>
                  )}
                  
                  {!isClaimed && (
                    <div className="mt-4">
                      <ClaimProfileCTA clinicId={clinic.id} clinicName={clinic.name} variant="inline" />
                    </div>
                  )}
                </div>

                {(() => {
                  const agencyQA = generateClinicQA({
                    name: clinic.name,
                    city: clinic.city?.name,
                    area: clinic.area?.name,
                    rating: clinic.rating || clinic.average_rating,
                    reviewCount: clinic.review_count || clinic.total_reviews,
                    treatments: treatments?.map(t => t.treatment?.name).filter(Boolean) as string[],
                  });
                  const allFaqs = seoFaqs.length > 0
                    ? [...seoFaqs.slice(0, 5).map(f => ({ question: f.question, answer: f.answer })), ...agencyQA.slice(0, 2)]
                    : agencyQA;
                  return (
                    <ConversationalQABlock
                      title={`About ${clinic.name}`}
                      subtitle="Common questions about this agency"
                      items={allFaqs}
                      contextLabel={`agency-${slug}`}
                      className="px-0"
                    />
                  );
                })()}

                {galleryImages && galleryImages.length > 0 && (
                  <div className="card-modern p-4 md:p-6 overflow-hidden">
                    <h2 className="font-display text-lg md:text-xl font-bold mb-4">Photos</h2>
                    <ClinicGallery images={galleryImages.slice(0, 4)} clinicName={clinic.name} />
                  </div>
                )}

                {treatments && treatments.length > 0 && (
                  <div className="card-modern p-4 md:p-6 overflow-hidden">
                    <h2 className="font-display text-lg md:text-xl font-bold mb-4">Fostering Services</h2>
                    <div className="flex flex-wrap gap-2">
                      {treatments.slice(0, 8).map((ct: any) => {
                        const serviceUrl = clinic.city?.state?.slug && clinic.city?.slug
                          ? `/${clinic.city.state.slug}/${clinic.city.slug}/${ct.treatment?.slug}`
                          : `/categories/${ct.treatment?.slug}`;
                        return (
                          <Link key={ct.id} to={serviceUrl} className="px-3 py-2 rounded-xl bg-muted/50 hover:bg-muted hover:text-primary transition-colors max-w-full">
                            <span className="text-sm font-medium truncate">{ct.treatment?.name}</span>
                          </Link>
                        );
                      })}
                      {treatments.length > 8 && (
                        <Badge variant="secondary" className="rounded-xl">+{treatments.length - 8} more</Badge>
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="team" className="animate-fade-in-up">
                <div className="card-modern p-4 md:p-6 overflow-hidden">
                  <h2 className="font-display text-lg md:text-xl font-bold mb-4 md:mb-6">Our Team</h2>
                  <ClinicTeamSection
                    teamMembers={teamMembers || []}
                    clinicName={clinic.name}
                    onBookWithDentist={(id) => handleBookClick(id)}
                  />
                </div>
              </TabsContent>

              <TabsContent value="services" className="animate-fade-in-up">
                <div className="card-modern p-4 md:p-6 overflow-hidden space-y-6">
                  <h2 className="font-display text-lg md:text-xl font-bold">Services Offered</h2>
                  {treatments && treatments.length > 0 ? (
                    <AEDPricingDisplay
                      treatments={treatments.map((ct: any) => ({
                        name: ct.treatment?.name || '',
                        slug: ct.treatment?.slug || '',
                        priceAed: ct.price_aed || null,
                      }))}
                      hasInsurance={isClaimed}
                    />
                  ) : (
                    <p className="text-muted-foreground text-sm md:text-base">
                      {isClaimed ? "Contact the agency for available services." : "Services will be listed once the agency claims their profile."}
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="animate-fade-in-up">
                <div className="card-modern p-4 md:p-6 overflow-hidden">
                  <h2 className="font-display text-lg md:text-xl font-bold mb-4 md:mb-6">Reviews</h2>
                  <ClinicReviewsSection
                    reviews={reviews || []}
                    googleReviews={googleReviews || []}
                    clinicRating={clinic.rating ? Number(clinic.rating) : undefined}
                    clinicReviewCount={clinic.review_count || 0}
                    gmbConnected={isGmbConnected}
                    clinicSlug={clinic.slug}
                    clinicId={clinic.id}
                  />
                </div>
              </TabsContent>

              {galleryImages && galleryImages.length > 0 && (
                <TabsContent value="photos" className="animate-fade-in-up">
                  <div className="card-modern p-4 md:p-6 overflow-hidden">
                    <h2 className="font-display text-lg md:text-xl font-bold mb-4">Gallery ({galleryImages.length} photos)</h2>
                    <ClinicGallery images={galleryImages} clinicName={clinic.name} />
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </div>

          <div className="space-y-6">
            <div className="lg:sticky lg:top-24">
              <ClinicStickyBooking
                clinicId={clinic.id}
                clinicName={clinic.name}
                clinicPhone={clinic.phone}
                clinicRating={clinic.rating ? Number(clinic.rating) : undefined}
                clinicReviewCount={clinic.review_count || 0}
                clinicArea={clinic.area?.name || clinic.city?.name}
                clinicLatitude={clinic.latitude ? Number(clinic.latitude) : undefined}
                clinicLongitude={clinic.longitude ? Number(clinic.longitude) : undefined}
                clinicAddress={clinic.address || undefined}
                hours={hours || []}
                teamMembers={teamMembers || []}
                isClaimed={isClaimed}
              />
              
              {!isClaimed && (
                <div className="mt-6">
                  <ClaimProfileCTA clinicId={clinic.id} clinicName={clinic.name} variant="sidebar" />
                </div>
              )}

              <div className="mt-6">
                <RelatedClinicsBlock
                  clinicId={clinic.id}
                  cityId={clinic.city_id}
                  cityName={clinic.city?.name}
                  citySlug={clinic.city?.slug}
                  stateSlug={clinic.city?.state?.slug}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 max-w-5xl mx-auto px-4">
          <InterlinkingSection
            variant="clinic"
            stateSlug={clinic.city?.state?.slug}
            currentLocationName={clinic.city?.name}
            currentLocationSlug={clinic.city?.slug}
            relatedServices={treatments?.map(t => ({
              name: t.treatment?.name || '',
              slug: t.treatment?.slug || '',
            })).filter(s => s.name) || []}
            nearbyAgencies={[]}
          />
        </div>

        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur border-t border-border z-40">
          <Button className="w-full rounded-xl font-bold h-12 text-base" size="lg" onClick={() => handleBookClick()}>
            <Calendar className="h-5 w-5 mr-2" /> Make Enquiry
          </Button>
        </div>
      </Section>
      
      <AIDiscoveryMeta
        pageTitle={clinic.name}
        aiSummary={`${clinic.name} is a fostering agency${clinic.city?.name ? ` in ${clinic.city.name}` : ""}, UK. ${clinic.rating ? `Rated ${clinic.rating}/5 by ${clinic.review_count || 0} reviewers.` : ""} Find and compare agencies on Foster Care.`}
        entityType="clinic"
        location={{
          city: clinic.city?.name,
          area: clinic.area?.name,
          country: "United Kingdom",
        }}
        url={`/agency/${slug}/`}
        faqs={generateClinicQA({
          name: clinic.name,
          city: clinic.city?.name,
          area: clinic.area?.name,
          rating: clinic.rating || clinic.average_rating,
          reviewCount: clinic.review_count || clinic.total_reviews,
        })}
      />

      <MultiStepBookingModal
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        profileId={selectedDentistId || clinic.id}
        profileName={selectedDentistId 
          ? teamMembers?.find(d => d.id === selectedDentistId)?.name || clinic.name
          : clinic.name
        }
        profileType={selectedDentistId ? "dentist" : "clinic"}
        clinicId={clinic.id}
        clinicLatitude={clinic.latitude ? Number(clinic.latitude) : undefined}
        clinicLongitude={clinic.longitude ? Number(clinic.longitude) : undefined}
        clinicAddress={clinic.address || undefined}
      />
    </PageLayout>
  );
};

export default ClinicPage;
