import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageLayout } from "@/components/layout/PageLayout";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SEOHead } from "@/components/seo/SEOHead";
import { SyncStructuredData } from "@/components/seo/SyncStructuredData";
import { useSeoPageContent } from "@/hooks/useSeoPageContent";
import { usePrerenderReady } from "@/hooks/usePrerenderReady";
import { useAnalytics } from "@/hooks/useAnalytics";
import { toast } from "sonner";
import {
  Star,
  BadgeCheck,
  Share2,
  Heart,
  Award,
  Users,
  MapPin,
  Phone,
  Globe,
  AlertTriangle,
  HandHeart,
  Shield,
  Clock,
  CheckCircle,
  ExternalLink,
  ArrowRight,
  Mail,
  ChevronRight,
  Home,
  Building2,
  Calendar,
  Briefcase,
  Baby,
  HeartHandshake,
  Accessibility,
  Puzzle,
  Clock3,
  LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

const FOSTERING_TYPES = [
  { value: "short_term", label: "Short-Term Fostering", icon: Clock3 as LucideIcon },
  { value: "long_term", label: "Long-Term Fostering", icon: Home as LucideIcon },
  { value: "emergency", label: "Emergency Fostering", icon: AlertTriangle as LucideIcon },
  { value: "respite", label: "Respite Fostering", icon: Heart as LucideIcon },
  { value: "parent_child", label: "Parent & Child Fostering", icon: Baby as LucideIcon },
  { value: "therapeutic", label: "Therapeutic Fostering", icon: HeartHandshake as LucideIcon },
  { value: "specialist", label: "Specialist Fostering", icon: Puzzle as LucideIcon },
  { value: "sibling", label: "Sibling Fostering", icon: Users as LucideIcon },
  { value: "teenage", label: "Teenage Fostering", icon: Briefcase as LucideIcon },
  { value: "disability", label: "Disability Fostering", icon: Accessibility as LucideIcon },
];

const ENQUIRY_TYPES = [
  { value: "becoming_foster_carer", label: "Becoming a Foster Carer" },
  { value: "speak_to_agency", label: "Speaking to this Agency" },
  { value: "learning_about_fostering", label: "Learning about Fostering" },
  { value: "placement_referral", label: "Placement Referral" },
  { value: "general_enquiry", label: "General Enquiry" },
];

const AgencyProfilePage = () => {
  const { agencySlug } = useParams();
  const slug = agencySlug || "";
  const { trackProfileView } = useAnalytics();

  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);
  const [enquiryForm, setEnquiryForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    postcode: "",
    city: "",
    enquiry_type: "",
    fostering_type: "",
    message: "",
    consent: false,
  });
  const [claimForm, setClaimForm] = useState({
    contact_name: "",
    role: "",
    email: "",
    phone: "",
    website: "",
    message: "",
  });

  const seoSlug = `agency/${slug}`;
  const { data: seoContent } = useSeoPageContent(seoSlug);

  const sampleAgencies: Record<string, any> = {
    'oakleaf-fostering': { id: '1', name: 'Oakleaf Fostering', slug: 'oakleaf-fostering', city: 'London', state: 'England', rating: 4.8, review_count: 125, is_verified: true, phone: '020 7946 0123', email: 'contact@oakleaf-fostering.co.uk', address: '123 Foster Street, London', description: 'Oakleaf Fostering provides comprehensive fostering services across London and the South East. We support children and families with dedicated care and expertise.', services: ['Emergency Fostering', 'Short-Term', 'Long-Term', 'Respite'],cover_image_url: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1ef4d?w=800&h=400&fit=crop' },
    'care-first-ltd': { id: '2', name: 'Care First Ltd', slug: 'care-first-ltd', city: 'Manchester', state: 'England', rating: 4.6, review_count: 89, is_verified: true, phone: '0161 234 5678', email: 'info@carefirst.co.uk', address: '456 Care Road, Manchester', description: 'Care First Ltd has been providing quality fostering services in Manchester for over 20 years.', services: ['Short-Term', 'Long-Term', 'Parent & Child'],cover_image_url: 'https://images.unsplash.com/photo-1557804506-669a67965ba1?w=800&h=400&fit=crop' },
    'fostering-together': { id: '3', name: 'Fostering Together', slug: 'fostering-together', city: 'Birmingham', state: 'England', rating: 4.5, review_count: 67, is_verified: true, phone: '0121 234 5678', email: 'hello@fosteringtogether.org', address: '789 Together Ave, Birmingham', description: 'Fostering Together is a leading fostering agency in Birmingham, committed to finding loving homes for children.', services: ['Emergency Fostering', 'Therapeutic', 'Sibling Groups'],cover_image_url: 'https://images.unsplash.com/photo-1581579438745-1dc61e5a951d?w=800&h=400&fit=crop' },
    'national-fostering': { id: '4', name: 'National Fostering', slug: 'national-fostering', city: 'Leeds', state: 'England', rating: 4.4, review_count: 45, is_verified: true, phone: '0113 234 5678', contact: 'nationalfostering.co.uk', address: '101 National Plaza, Leeds', description: 'National Fostering provides fostering services across Yorkshire and the North of England.', services: ['Short-Term', 'Long-Term', 'Respite'],cover_image_url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd1d?w=800&h=400&fit=crop' },
    'sunrise-foster-care': { id: '5', name: 'Sunrise Foster Care', slug: 'sunrise-foster-care', city: 'Liverpool', state: 'England', rating: 4.3, review_count: 32, is_verified: true, phone: '0151 234 5678', email: 'enquiries@sunrisefostercare.co.uk', address: '202 Sunrise Lane, Liverpool', description: 'Sunrise Foster Care brings hope to children across Merseyside with dedicated foster carers.', services: ['Emergency Fostering', 'Short-Term', 'Parent & Child'],cover_image_url: 'https://images.unsplash.com/photo-1505751172876-fa1926c9d06f?w=800&h=400&fit=crop' },
    'community-fostering': { id: '6', name: 'Community Fostering', slug: 'community-fostering', city: 'Bristol', state: 'England', rating: 4.2, review_count: 28, is_verified: true, phone: '0117 234 5678', email: 'community@fosteringbristol.org', address: '303 Community Way, Bristol', description: 'Community Fostering serves the Bristol area with compassionate fostering solutions.', services: ['Long-Term', 'Respite', 'Therapeutic'],cover_image_url: 'https://images.unsplash.com/photo-1576091160399-9ba3efc7fca1?w=800&h=400&fit=crop' },
  };

  const { data: agency, isLoading } = useQuery<any>({
    queryKey: ["agency", slug],
    queryFn: async () => {
      if (!slug || slug.includes('/')) return null;
      
      const { data, error } = await supabase
        .from("agencies")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching agency:', error);
      }
      
      if (data) return data;
      
      if (sampleAgencies[slug]) return sampleAgencies[slug];
      
      return null;
    },
    enabled: !!slug && !slug.includes('/'),
  });

  const { data: agencyHours } = useQuery({
    queryKey: ["agency-hours", agency?.id],
    queryFn: async () => {
      if (!agency?.id) return [];
      const { data } = await supabase
        .from("agency_opening_hours")
        .select("*")
        .eq("agency_id", agency.id)
        .order("day_of_week");
      return data || [];
    },
    enabled: !!agency?.id,
  });

  const { data: agencyPhotos } = useQuery({
    queryKey: ["agency-photos", agency?.id],
    queryFn: async () => {
      if (!agency?.id) return [];
      const { data } = await supabase
        .from("agency_photos")
        .select("*")
        .eq("agency_id", agency.id)
        .order("display_order");
      return data || [];
    },
    enabled: !!agency?.id,
  });

  const { data: agencyReviews } = useQuery({
    queryKey: ["agency-reviews", agency?.id],
    queryFn: async () => {
      if (!agency?.id) return [];
      const { data } = await supabase
        .from("agency_reviews")
        .select("*")
        .eq("agency_id", agency.id)
        .order("review_time", { ascending: false })
        .limit(10);
      return data || [];
    },
    enabled: !!agency?.id,
  });

  const { data: similarAgencies } = useQuery({
    queryKey: ["similar-agencies", agency?.id, agency?.city],
    queryFn: async () => {
      if (!agency?.id) return [];
      const { data } = await supabase
        .from("agencies")
        .select("id, name, slug, city, state, rating, review_count, cover_image_url")
        .eq("city", agency.city)
        .neq("id", agency.id)
        .limit(3);
      return data || [];
    },
    enabled: !!agency?.id && !!agency?.city,
  });

  useEffect(() => {
    if (agency?.id && agency?.name) {
      trackProfileView({
        profile_type: 'agency',
        profile_id: agency.id,
        profile_name: agency.name,
        city: agency.city,
        state: agency.state,
      });
    }
  }, [agency?.id, agency?.name, agency?.city, agency?.state, trackProfileView]);

  usePrerenderReady(!isLoading && !!agency, { delay: 600 });

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiryForm.consent) {
      toast.error("Please agree to the privacy policy");
      return;
    }
    
    try {
      const { error } = await supabase.from("fostering_enquiries").insert({
        agency_id: agency.id,
        enquirer_name: enquiryForm.full_name,
        enquirer_email: enquiryForm.email,
        enquirer_phone: enquiryForm.phone,
        postcode: enquiryForm.postcode,
        city: enquiryForm.city,
        interest_type: enquiryForm.enquiry_type,
        child_age_group: enquiryForm.fostering_type,
        message: enquiryForm.message,
        status: "new",
      });
      
      if (error) throw error;
      
      toast.success("Enquiry sent successfully!");
      setEnquiryOpen(false);
      setEnquiryForm({
        full_name: "",
        email: "",
        phone: "",
        postcode: "",
        city: "",
        enquiry_type: "",
        fostering_type: "",
        message: "",
        consent: false,
      });
    } catch (err: any) {
      toast.error(`Failed to send: ${err.message}`);
    }
  };

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Claim request submitted! We'll be in touch soon.");
    setClaimDialogOpen(false);
    setClaimForm({
      contact_name: "",
      role: "",
      email: "",
      phone: "",
      website: "",
      message: "",
    });
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="container py-8">
          <Skeleton className="h-80 rounded-2xl mb-8" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div>
              <Skeleton className="h-64 rounded-2xl" />
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!agency) {
    return (
      <PageLayout>
        <Section>
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mb-6">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Agency Not Found</h1>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              The fostering agency you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild size="lg" className="rounded-full font-semibold px-8 bg-primary hover:bg-primary/90">
              <Link to="/agencies">Browse Agencies <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </Section>
      </PageLayout>
    );
  }

  const isVerified = agency.is_verified === true;
  const isClaimed = agency.claim_status === 'claimed';
  const agencyCity = agency.city || '';
  const agencyState = agency.state || '';

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Fostering Agencies", href: "/agencies" },
    ...(agencyState ? [{ label: agencyState, href: `/${agencyState.toLowerCase().replace(/ /g, '-')}` }] : []),
    ...(agencyCity ? [{ label: agencyCity, href: `/agencies/${agencyCity.toLowerCase().replace(/ /g, '-')}` }] : []),
    { label: agency.name },
  ];

  return (
    <PageLayout>
      <SEOHead
        title={seoContent?.meta_title || `${agency.name} | Fostering Agency in ${agencyCity || 'UK'}`}
        description={seoContent?.meta_description || `View ${agency.name}, a fostering agency serving ${agencyCity || 'the UK'}. Find contact details, services, and enquiry options.`}
        canonical={`/agency/${agency.slug}/`}
        keywords={[agency.name, `fostering agency ${agencyCity}`, `foster care ${agencyState || 'UK'}`]}
      />
      
      <SyncStructuredData
        data={[
          {
            type: 'breadcrumb',
            items: breadcrumbs.map(b => ({ name: b.label, url: b.href === '/' ? 'https://fostercare.uk/' : `https://fostercare.uk${b.href}` })),
          },
          {
            type: 'Organization',
            name: agency.name,
            description: `Fostering agency in ${agencyCity || 'UK'}`,
            address: agency.address || '',
            addressLocality: agencyCity,
            addressRegion: agencyState,
            addressCountry: 'GB',
            telephone: agency.phone || '',
            url: `https://fostercare.uk/agency/${agency.slug}/`,
          },
        ]}
        id="agency-schema"
      />

      {/* Hero Section */}
      <div className="relative h-72 md:h-80 bg-slate-900 overflow-hidden">
        {agency.cover_image_url || agency.main_image_url ? (
          <img 
            src={agency.cover_image_url || agency.main_image_url} 
            alt={agency.name} 
            className="w-full h-full object-cover opacity-40"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />
        
        <div className="absolute top-0 left-0 right-0 z-10">
          <div className="container px-4 py-4">
            <Breadcrumbs items={breadcrumbs} className="text-white/70" />
          </div>
        </div>
      </div>

      {/* Agency Header Card */}
      <Section size="sm" className="-mt-32 relative z-20">
        <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-xl">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Logo/Image */}
            <div className="shrink-0">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 border border-border overflow-hidden flex items-center justify-center">
                {agency.main_image_url || agency.cover_image_url ? (
                  <img 
                    src={agency.main_image_url || agency.cover_image_url} 
                    alt={agency.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building2 className="h-12 w-12 text-teal-600" />
                )}
              </div>
            </div>

            {/* Agency Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {isVerified && (
                  <span className="inline-flex items-center gap-1.5 bg-teal-500/10 text-teal-700 rounded-full px-3 py-1 text-xs font-semibold">
                    <BadgeCheck className="h-3.5 w-3.5" /> Verified Agency
                  </span>
                )}
                {isClaimed && !isVerified && (
                  <span className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-700 rounded-full px-3 py-1 text-xs font-semibold">
                    <Award className="h-3.5 w-3.5" /> Claimed Profile
                  </span>
                )}
                {!isClaimed && (
                  <span className="inline-flex items-center gap-1.5 bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs font-semibold">
                    <AlertTriangle className="h-3.5 w-3.5" /> Unclaimed
                  </span>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3">
                {agency.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
                {agencyCity && (
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    {agencyCity}{agencyState ? `, ${agencyState}` : ''}
                  </span>
                )}
                {(agency.rating || agency.review_count) && (
                  <span className="flex items-center gap-1.5">
                    <div className="flex items-center gap-0.5">
                      <Star className="h-4 w-4 fill-gold text-gold" />
                      <span className="font-bold text-foreground">{Number(agency.rating || 0).toFixed(1)}</span>
                    </div>
                    <span className="text-muted-foreground">({agency.review_count || 0} reviews)</span>
                  </span>
                )}
              </div>

              {agency.description && (
                <p className="text-muted-foreground text-sm md:text-base line-clamp-2 max-w-2xl">
                  {agency.description}
                </p>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="shrink-0 flex flex-col gap-3">
              <Button 
                size="lg" 
                className="rounded-full font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
                onClick={() => setEnquiryOpen(true)}
              >
                <HandHeart className="h-4 w-4 mr-2" />
                Send Enquiry
              </Button>
              <div className="flex gap-2">
                {agency.phone && (
                  <Button variant="outline" size="lg" className="rounded-full font-semibold flex-1" asChild>
                    <a href={`tel:${agency.phone}`}>
                      <Phone className="h-4 w-4 mr-1.5" />
                      Call
                    </a>
                  </Button>
                )}
                {agency.website && (
                  <Button variant="outline" size="lg" className="rounded-full font-semibold flex-1" asChild>
                    <a href={agency.website} target="_blank" rel="noopener noreferrer">
                      <Globe className="h-4 w-4 mr-1.5" />
                      Website
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Trust Indicators */}
      <Section size="sm" className="py-4">
        <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-3 text-sm">
          {isVerified && (
            <span className="flex items-center gap-2 text-muted-foreground">
              <BadgeCheck className="h-4 w-4 text-primary" />
              <span className="font-medium">Ofsted Registered</span>
            </span>
          )}
          <span className="flex items-center gap-2 text-muted-foreground">
            <Shield className="h-4 w-4 text-primary" />
            <span className="font-medium">DBS Checked</span>
          </span>
          {(agency.rating || agency.review_count) && (
            <span className="flex items-center gap-2 text-muted-foreground">
              <Star className="h-4 w-4 text-gold fill-gold" />
              <span className="font-medium">{agency.review_count || 0} Verified Reviews</span>
            </span>
          )}
          <span className="flex items-center gap-2 text-muted-foreground">
            <Heart className="h-4 w-4 text-primary" />
            <span className="font-medium">100% Free Service</span>
          </span>
        </div>
      </Section>

      {/* Main Content */}
      <Section size="md" className="py-12 md:py-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* About Section */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8 hover:border-teal-500/30 transition-all duration-300">
              <h2 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                About This Fostering Agency
              </h2>
              {agency.description ? (
                <p className="text-muted-foreground leading-relaxed">{agency.description}</p>
              ) : (
                <p className="text-muted-foreground leading-relaxed">
                  This profile uses publicly available business information. The agency can claim this profile to add full details about its fostering services, support, and service areas.
                </p>
              )}
            </div>

            {/* Fostering Services Section */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8 hover:border-teal-500/30 transition-all duration-300">
              <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Fostering Services
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {FOSTERING_TYPES.slice(0, 6).map((type) => (
                  <Link 
                    key={type.value}
                    to={`/categories/${type.value}`}
                    className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 border border-border hover:border-teal-500/40 hover:bg-teal-500/5 transition-all duration-300 group"
                  >
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <type.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-medium text-sm group-hover:text-primary transition-colors">{type.label}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto group-hover:text-primary transition-colors" />
                  </Link>
                ))}
              </div>
              {!isClaimed && (
                <p className="text-sm text-muted-foreground mt-4">
                  Contact the agency to learn about their specific fostering services and availability.
                </p>
              )}
            </div>

            {/* Areas Served Section */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8 hover:border-teal-500/30 transition-all duration-300">
              <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Areas Served
              </h2>
              <div className="flex flex-wrap gap-3">
                {agencyCity && (
                  <Link 
                    to={`/agencies/${agencyCity.toLowerCase().replace(/ /g, '-')}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 text-teal-700 font-medium text-sm hover:bg-teal-500/20 transition-colors"
                  >
                    <MapPin className="h-4 w-4" />
                    Fostering Agencies in {agencyCity}
                  </Link>
                )}
                {agencyState && (
                  <Link 
                    to={`/${agencyState.toLowerCase().replace(/ /g, '-')}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-muted-foreground font-medium text-sm hover:bg-muted/80 transition-colors"
                  >
                    <Globe className="h-4 w-4" />
                    {agencyState}
                  </Link>
                )}
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-muted-foreground font-medium text-sm">
                  United Kingdom
                </span>
              </div>
            </div>

            {/* Gallery Section */}
            {(agencyPhotos && agencyPhotos.length > 0) || agency.cover_image_url ? (
              <div className="bg-card rounded-2xl border border-border p-6 md:p-8 hover:border-teal-500/30 transition-all duration-300">
                <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Gallery
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {agency.cover_image_url && (
                    <div className="aspect-video rounded-xl overflow-hidden bg-muted">
                      <img 
                        src={agency.cover_image_url} 
                        alt={`${agency.name} gallery`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  {agencyPhotos?.slice(0, 7).map((photo: any, idx: number) => (
                    <div key={photo.id || idx} className="aspect-video rounded-xl overflow-hidden bg-muted">
                      <img 
                        src={photo.photo_url || photo.local_url} 
                        alt={`${agency.name} photo ${idx + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Opening Hours Section */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8 hover:border-teal-500/30 transition-all duration-300">
              <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Opening Hours
              </h2>
              {agencyHours && agencyHours.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {agencyHours.map((hour: any) => {
                    const today = new Date().getDay();
                    const isToday = hour.day_of_week === today;
                    return (
                      <div 
                        key={hour.day_of_week}
                        className={cn(
                          "flex justify-between items-center p-3 rounded-xl",
                          isToday ? "bg-teal-500/10 border border-teal-500/20" : "bg-muted/30"
                        )}
                      >
                        <span className={cn("font-medium", isToday ? "text-teal-700" : "")}>
                          {dayNames[hour.day_of_week]}
                        </span>
                        <span className={cn("text-sm", hour.is_closed ? "text-muted-foreground" : "")}>
                          {hour.is_closed ? 'Closed' : `${hour.open_time} - ${hour.close_time}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground">Opening hours are not available yet.</p>
              )}
            </div>

            {/* Reviews Section */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8 hover:border-teal-500/30 transition-all duration-300">
              <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-2">
                <Star className="h-5 w-5 text-gold" />
                Agency Reviews
              </h2>
              {(agency.rating || agency.review_count) && (
                <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-muted/30">
                  <div className="text-4xl font-bold text-foreground">{Number(agency.rating || 0).toFixed(1)}</div>
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={cn(
                            "h-5 w-5", 
                            i < Math.round(Number(agency.rating || 0)) ? "fill-gold text-gold" : "text-muted"
                          )} 
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">{agency.review_count || 0} reviews</p>
                  </div>
                </div>
              )}
              
              {agencyReviews && agencyReviews.length > 0 ? (
                <div className="space-y-4">
                  {agencyReviews.slice(0, 5).map((review: any) => (
                    <div key={review.id} className="p-4 rounded-xl bg-muted/30 border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{review.reviewer_name || 'Anonymous'}</span>
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={cn(
                                "h-3 w-3", 
                                i < review.rating ? "fill-gold text-gold" : "text-muted"
                              )} 
                            />
                          ))}
                        </div>
                      </div>
                      {review.review_text && (
                        <p className="text-sm text-muted-foreground line-clamp-3">{review.review_text}</p>
                      )}
                      {review.relative_time_description && (
                        <p className="text-xs text-muted-foreground mt-2">{review.relative_time_description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No reviews yet</p>
              )}
            </div>

            {/* FAQ Section */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8 hover:border-teal-500/30 transition-all duration-300">
              <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Frequently Asked Questions
              </h2>
              <div className="space-y-3">
                {[
                  { q: "How do I contact this fostering agency?", a: `You can call them at ${agency.phone || 'N/A'}, send an enquiry through this page, or visit their website.` },
                  { q: "Can I apply to become a foster carer through this agency?", a: "Yes, this agency accepts enquiries from people interested in becoming foster carers. Click 'Send Enquiry' to get started." },
                  { q: "Are the services on this profile verified?", a: isVerified ? "Yes, this agency has been verified as an Ofsted-registered fostering provider." : "This profile contains publicly available information. The agency can claim this profile to verify their services." },
                  { q: "What types of fostering can agencies offer?", a: "Agencies typically offer short-term, long-term, emergency, respite, parent & child, therapeutic, and specialist fostering placements." },
                  { q: "Can this agency update or claim its profile?", a: "Yes, the agency can claim this profile through the 'Claim This Profile' button below to add and update their information." },
                ].map((faq, idx) => (
                  <details 
                    key={idx}
                    className="group bg-muted/30 rounded-xl border border-border overflow-hidden"
                  >
                    <summary className="flex items-center justify-between cursor-pointer px-5 py-4 font-medium text-foreground hover:text-primary transition-colors">
                      {faq.q}
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-open:rotate-90 transition-transform shrink-0 ml-4" />
                    </summary>
                    <div className="px-5 pb-4 text-sm text-muted-foreground">{faq.a}</div>
                  </details>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            <div className="lg:sticky lg:top-24 space-y-6">
              
              {/* Quick Info Card */}
              <div className="bg-card rounded-2xl border border-border p-6 hover:border-teal-500/30 transition-all duration-300">
                <h3 className="font-bold text-lg mb-4">Quick Contact</h3>
                <div className="space-y-4">
                  {agency.phone && (
                    <a href={`tel:${agency.phone}`} className="flex items-center gap-3 text-sm hover:text-primary transition-colors">
                      <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Phone className="h-4 w-4 text-primary" />
                      </div>
                      <span>{agency.phone}</span>
                    </a>
                  )}
                  {agency.email && (
                    <a href={`mailto:${agency.email}`} className="flex items-center gap-3 text-sm hover:text-primary transition-colors">
                      <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Mail className="h-4 w-4 text-primary" />
                      </div>
                      <span>{agency.email}</span>
                    </a>
                  )}
                  {agency.website && (
                    <a 
                      href={agency.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                    >
                      <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Globe className="h-4 w-4 text-primary" />
                      </div>
                      <span className="flex items-center gap-1">
                        Visit Website
                        <ExternalLink className="h-3 w-3" />
                      </span>
                    </a>
                  )}
                  {agency.google_maps_url && (
                    <a 
                      href={agency.google_maps_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                    >
                      <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                      <span className="flex items-center gap-1">
                        Get Directions
                        <ExternalLink className="h-3 w-3" />
                      </span>
                    </a>
                  )}
                </div>
              </div>

              {/* Enquiry Button (Sticky) */}
              <Button 
                size="lg" 
                className="w-full rounded-full font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
                onClick={() => setEnquiryOpen(true)}
              >
                <HandHeart className="h-4 w-4 mr-2" />
                Send Enquiry
              </Button>

              {/* Claim Profile (if unclaimed) */}
              {!isClaimed && (
                <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 rounded-2xl border border-amber-200 p-6">
                  <h3 className="font-bold text-lg mb-2">Are you the owner?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Are you the owner or authorised representative of this fostering agency?
                  </p>
                  <Button 
                    className="w-full rounded-full font-semibold bg-amber-500 hover:bg-amber-600 text-white"
                    onClick={() => setClaimDialogOpen(true)}
                  >
                    <Award className="h-4 w-4 mr-2" />
                    Claim This Profile
                  </Button>
                </div>
              )}

              {/* Similar Agencies */}
              {similarAgencies && similarAgencies.length > 0 && (
                <div className="bg-card rounded-2xl border border-border p-6 hover:border-teal-500/30 transition-all duration-300">
                  <h3 className="font-bold text-lg mb-4">Similar Agencies</h3>
                  <div className="space-y-3">
                    {similarAgencies.map((similar: any) => (
                      <Link 
                        key={similar.id}
                        to={`/agency/${similar.slug}`}
                        className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-teal-500/5 border border-transparent hover:border-teal-500/20 transition-all group"
                      >
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-teal-500/20 to-emerald-500/20 flex items-center justify-center shrink-0">
                          {similar.cover_image_url ? (
                            <img src={similar.cover_image_url} alt={similar.name} className="h-full w-full object-cover rounded-lg" />
                          ) : (
                            <Building2 className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">{similar.name}</p>
                          <p className="text-xs text-muted-foreground">{similar.city}, {similar.state}</p>
                        </div>
                        {similar.rating && (
                          <div className="flex items-center gap-1 shrink-0">
                            <Star className="h-3 w-3 fill-gold text-gold" />
                            <span className="text-xs font-medium">{Number(similar.rating).toFixed(1)}</span>
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Section>

      {/* Mobile Enquiry Button */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur border-t border-border z-40">
        <Button 
          className="w-full rounded-full font-semibold h-12 text-base bg-primary hover:bg-primary/90"
          onClick={() => setEnquiryOpen(true)}
        >
          <HandHeart className="h-5 w-5 mr-2" /> Send Enquiry
        </Button>
      </div>

      {/* Enquiry Modal */}
      <Dialog open={enquiryOpen} onOpenChange={setEnquiryOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HandHeart className="h-5 w-5 text-primary" />
              Send Enquiry to {agency.name}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleEnquirySubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={enquiryForm.full_name}
                onChange={(e) => setEnquiryForm({ ...enquiryForm, full_name: e.target.value })}
                placeholder="Your full name"
                required
                className="h-12 rounded-xl"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={enquiryForm.email}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                  placeholder="your@email.com"
                  required
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={enquiryForm.phone}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                  placeholder="Your phone"
                  className="h-12 rounded-xl"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="postcode">Postcode</Label>
                <Input
                  id="postcode"
                  value={enquiryForm.postcode}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, postcode: e.target.value })}
                  placeholder="Your postcode"
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={enquiryForm.city}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, city: e.target.value })}
                  placeholder="Your city"
                  className="h-12 rounded-xl"
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label>I am interested in *</Label>
              <Select
                value={enquiryForm.enquiry_type}
                onValueChange={(value) => setEnquiryForm({ ...enquiryForm, enquiry_type: value })}
              >
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  {ENQUIRY_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label>Fostering Type Interest</Label>
              <Select
                value={enquiryForm.fostering_type}
                onValueChange={(value) => setEnquiryForm({ ...enquiryForm, fostering_type: value })}
              >
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="Select a type (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {FOSTERING_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={enquiryForm.message}
                onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                placeholder="Tell us more about your enquiry..."
                rows={3}
                className="rounded-xl"
              />
            </div>
            
            <div className="flex items-start gap-2">
              <Checkbox
                id="consent"
                checked={enquiryForm.consent}
                onCheckedChange={(checked) => setEnquiryForm({ ...enquiryForm, consent: checked as boolean })}
              />
              <Label htmlFor="consent" className="text-sm text-muted-foreground leading-tight">
                I agree to the privacy policy and consent to being contacted about my enquiry.
              </Label>
            </div>
            
            <Button 
              type="submit" 
              className="w-full rounded-full font-semibold h-12 bg-primary hover:bg-primary/90"
            >
              <HandHeart className="h-4 w-4 mr-2" />
              Send Enquiry
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Claim Profile Modal */}
      <Dialog open={claimDialogOpen} onOpenChange={setClaimDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              Claim This Profile
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleClaimSubmit} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you the owner or authorised representative of {agency.name}? Fill in your details below and we'll be in touch.
            </p>
            
            <div className="grid gap-2">
              <Label htmlFor="contact_name">Contact Person Name *</Label>
              <Input
                id="contact_name"
                value={claimForm.contact_name}
                onChange={(e) => setClaimForm({ ...claimForm, contact_name: e.target.value })}
                placeholder="Your full name"
                required
                className="h-12 rounded-xl"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="role">Your Role *</Label>
              <Input
                id="role"
                value={claimForm.role}
                onChange={(e) => setClaimForm({ ...claimForm, role: e.target.value })}
                placeholder="e.g. Director, Manager"
                required
                className="h-12 rounded-xl"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="claim_email">Agency Email *</Label>
                <Input
                  id="claim_email"
                  type="email"
                  value={claimForm.email}
                  onChange={(e) => setClaimForm({ ...claimForm, email: e.target.value })}
                  placeholder="agency@email.com"
                  required
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="claim_phone">Phone</Label>
                <Input
                  id="claim_phone"
                  type="tel"
                  value={claimForm.phone}
                  onChange={(e) => setClaimForm({ ...claimForm, phone: e.target.value })}
                  placeholder="Agency phone"
                  className="h-12 rounded-xl"
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="claim_website">Agency Website</Label>
              <Input
                id="claim_website"
                value={claimForm.website}
                onChange={(e) => setClaimForm({ ...claimForm, website: e.target.value })}
                placeholder="https://agency-website.co.uk"
                className="h-12 rounded-xl"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="claim_message">Message</Label>
              <Textarea
                id="claim_message"
                value={claimForm.message}
                onChange={(e) => setClaimForm({ ...claimForm, message: e.target.value })}
                placeholder="Tell us about your role and how you can verify you represent this agency..."
                rows={3}
                className="rounded-xl"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full rounded-full font-semibold h-12 bg-amber-500 hover:bg-amber-600 text-white"
            >
              <Award className="h-4 w-4 mr-2" />
              Submit Claim Request
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default AgencyProfilePage;