import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageLayout } from "@/components/layout/PageLayout";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SEOHead } from "@/components/seo/SEOHead";
import { 
  MapPin, 
  Phone, 
  Globe, 
  Mail, 
  Shield, 
  Star, 
  Award,
  Clock,
  Users,
  Heart,
  Share2,
  CheckCircle,
  FileText,
  Calendar,
  MessageSquare,
  Download,
  ChevronRight,
  Home,
  Building2,
  ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Agency } from "@/components/fostering/AgencyCard";

const FOSTERING_TYPE_LABELS: Record<string, string> = {
  short_term: "Short-Term Fostering",
  long_term: "Long-Term Fostering",
  emergency: "Emergency Fostering",
  parent_child: "Parent & Child Fostering",
  therapeutic: "Therapeutic Fostering",
  respite: "Respite Fostering",
  sibling: "Sibling Fostering",
  teenage: "Teenage Fostering",
  disability: "Disability Fostering",
};

const OFSTED_RATING_COLORS: Record<string, string> = {
  "Outstanding": "bg-green-500",
  "Good": "bg-blue-500",
  "Requires Improvement": "bg-amber-500",
  "Inadequate": "bg-red-500",
};

export default function AgencyProfilePage() {
  const { agencySlug } = useParams();
  const [isSaved, setIsSaved] = useState(false);
  const [showEnquiryForm, setShowEnquiryForm] = useState(false);
  
  const { data: agency, isLoading } = useQuery({
    queryKey: ["agency", agencySlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agencies")
        .select("*")
        .eq("slug", agencySlug)
        .single();
      if (error) throw error;
      return data as Agency;
    },
    enabled: !!agencySlug,
  });

  if (isLoading) {
    return (
      <PageLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-48 bg-muted rounded-lg" />
          <div className="h-8 bg-muted rounded w-1/2" />
          <div className="h-4 bg-muted rounded w-1/3" />
        </div>
      </PageLayout>
    );
  }

  if (!agency) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-2">Agency Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The agency you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/agencies">Browse All Agencies</Link>
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <SEOHead
        title={`${agency.name} - Fostering Agency in ${agency.city || 'UK'}`}
        description={agency.description || `Find out about ${agency.name}, a ${agency.agency_type === 'independent' ? 'independent fostering agency' : 'local authority'} in ${agency.city || 'UK'}. View services, Ofsted rating, and contact information.`}
        canonical={`/agency/${agency.slug}`}
      />

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/agencies" className="hover:text-foreground">Fostering Agencies</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground font-medium">{agency.name}</span>
      </nav>

      {/* Hero Section */}
      <div className="relative h-64 md:h-80 rounded-xl overflow-hidden mb-8">
        {agency.cover_image_url ? (
          <img 
            src={agency.cover_image_url} 
            alt={`${agency.name} agency cover image`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Logo */}
            <div className="w-24 h-24 rounded-xl bg-white shadow-lg flex items-center justify-center p-2 shrink-0">
              {agency.logo_url ? (
                <img src={agency.logo_url} alt={agency.name} className="max-h-full object-contain" />
              ) : (
                <Shield className="w-12 h-12 text-primary/30" />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold text-white">{agency.name}</h1>
                {agency.is_verified && (
                  <Badge className="bg-green-500 text-white">
                    <CheckCircle className="w-3 h-3 mr-1" /> Verified
                  </Badge>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-white/90">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{agency.city || agency.address || "UK"}</span>
                </div>
                
                {agency.ofsted_rating && (
                  <Badge className={cn("text-white", OFSTED_RATING_COLORS[agency.ofsted_rating] || "bg-gray-500")}>
                    <Award className="w-3 h-3 mr-1" />
                    Ofsted: {agency.ofsted_rating}
                  </Badge>
                )}
                
                {agency.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="font-semibold">{agency.rating.toFixed(1)}</span>
                    {agency.review_count && (
                      <span className="text-white/70">({agency.review_count} reviews)</span>
                    )}
                  </div>
                )}
                
                <Badge variant="outline" className="text-white border-white/30">
                  {agency.agency_type === 'independent' ? 'Independent Agency' : 'Local Authority'}
                </Badge>
              </div>
            </div>
            
            <div className="flex gap-2 shrink-0">
              <Button 
                variant={isSaved ? "default" : "secondary"}
                size="icon"
                onClick={() => setIsSaved(!isSaved)}
              >
                <Heart className={cn("w-5 h-5", isSaved && "fill-current")} />
              </Button>
              <Button variant="secondary" size="icon">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Button asChild className="h-auto py-4">
          <Link to={`/agency/${agency.slug}/enquiry`}>
            <MessageSquare className="w-5 h-5 mr-2" />
            <span className="font-semibold">Apply to Foster</span>
          </Link>
        </Button>
        <Button variant="outline" className="h-auto py-4">
          <Phone className="w-5 h-5 mr-2" />
          <span className="font-semibold">Call Now</span>
        </Button>
        <Button variant="outline" className="h-auto py-4">
          <Calendar className="w-5 h-5 mr-2" />
          <span className="font-semibold">Book a Call</span>
        </Button>
        <Button variant="outline" className="h-auto py-4">
          <Download className="w-5 h-5 mr-2" />
          <span className="font-semibold">Info Pack</span>
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle>About {agency.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {agency.description || "No description available yet. Contact the agency for more information about their services and how they support foster families."}
              </p>
            </CardContent>
          </Card>

          {/* Fostering Types */}
          {agency.fostering_types && agency.fostering_types.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Types of Fostering Offered</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {agency.fostering_types.map(type => (
                    <div key={type} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                      <span className="text-sm font-medium">
                        {FOSTERING_TYPE_LABELS[type] || type}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Support Features */}
          <Card>
            <CardHeader>
              <CardTitle>Support & Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {agency.has_24_7_support && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <Clock className="w-5 h-5 text-green-600" />
                    <span className="font-medium">24/7 Support</span>
                  </div>
                )}
                {agency.training_provided && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Training Provided</span>
                  </div>
                )}
                {agency.accepting_new_carers && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium">Accepting New Carers</span>
                  </div>
                )}
                {agency.accepting_referrals && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Accepts Referrals</span>
                  </div>
                )}
                {agency.has_therapeutic_team && (
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <Users className="w-5 h-5 text-purple-600" />
                    <span className="font-medium">Therapeutic Team</span>
                  </div>
                )}
                {agency.approved_trainer && (
                  <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                    <Award className="w-5 h-5 text-amber-600" />
                    <span className="font-medium">Approved Trainer</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* FAQ Section Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">How do I become a foster carer with this agency?</h4>
                <p className="text-sm text-muted-foreground">
                  Contact the agency directly to begin your enquiry. They'll guide you through the application process.
                </p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">What support do foster carers receive?</h4>
                <p className="text-sm text-muted-foreground">
                  Support varies by agency but typically includes training, 24/7 support, and a dedicated social worker.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Contact Card */}
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {agency.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <a href={`tel:${agency.phone}`} className="hover:text-primary font-medium">
                    {agency.phone}
                  </a>
                </div>
              )}
              {agency.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <a href={`mailto:${agency.email}`} className="hover:text-primary font-medium">
                    {agency.email}
                  </a>
                </div>
              )}
              {agency.website && (
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-muted-foreground" />
                  <a 
                    href={agency.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-primary font-medium truncate"
                  >
                    Visit Website
                  </a>
                </div>
              )}
              {agency.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{agency.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {agency.address}
                      {agency.postcode && <>, {agency.postcode}</>}
                    </p>
                  </div>
                </div>
              )}
              
              <Button className="w-full mt-4" onClick={() => setShowEnquiryForm(true)}>
                <MessageSquare className="w-4 h-4 mr-2" />
                Send Enquiry
              </Button>
            </CardContent>
          </Card>

          {/* Ofsted Info */}
          {agency.ofsted_rating && (
            <Card>
              <CardHeader>
                <CardTitle>Ofsted Registration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">Rating</span>
                  <Badge className={cn("text-white", OFSTED_RATING_COLORS[agency.ofsted_rating] || "bg-gray-500")}>
                    {agency.ofsted_rating}
                  </Badge>
                </div>
                {agency.ofsted_report_url && (
                  <a 
                    href={agency.ofsted_report_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between text-sm text-primary hover:underline"
                  >
                    View Ofsted Report
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </CardContent>
            </Card>
          )}

          {/* Download Info Pack */}
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <FileText className="w-12 h-12 mx-auto text-primary mb-3" />
                <h4 className="font-semibold mb-2">Download Information Pack</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Get comprehensive details about becoming a foster carer
                </p>
                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enquiry Modal would go here */}
    </PageLayout>
  );
}

function ExternalLink({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}