import { useState } from "react";
import { SEOHead } from "@/components/seo/SEOHead";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { PageLayout } from "@/components/layout/PageLayout";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useStates } from "@/hooks/useLocations";
import { useTreatments } from "@/hooks/useTreatments";
import { SmartCitySearch } from "@/components/geo/SmartCitySearch";
import { PromotionBanner } from "@/components/subscription/PromotionBanner";
import { z } from "zod";
import {
  Building2,
  User,
  MapPin,
  Phone,
  Mail,
  Globe,
  CheckCircle,
  ArrowRight,
  Shield,
  TrendingUp,
  Star,
  BadgeCheck,
  Loader2,
} from "lucide-react";

// UK Phone formatting helper
const formatUKPhone = (value: string) => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.startsWith('44')) {
    const rest = cleaned.slice(2);
    if (rest.length <= 4) return `+44 ${rest}`;
    return `+44 ${rest.slice(0, 4)} ${rest.slice(4, 10)}`;
  }
  if (cleaned.startsWith('0')) {
    if (cleaned.length <= 5) return cleaned;
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5, 11)}`;
  }
  return cleaned;
};

const formSchema = z.object({
  clinicName: z.string().trim().min(2, "Agency name must be at least 2 characters").max(100, "Agency name must be less than 100 characters"),
  dentistName: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  phone: z.string().trim().min(10, "Please enter a valid UK phone number").max(20, "Phone number must be less than 20 characters"),
  streetAddress: z.string().trim().max(500, "Address must be less than 500 characters").optional(),
  website: z.string().trim().url("Invalid website URL").max(255, "Website must be less than 255 characters").optional().or(z.literal("")),
  description: z.string().trim().max(2000, "Description must be less than 2000 characters").optional(),
});

const ListYourPracticePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: treatments = [] } = useTreatments();
  
  const [listingMethod, setListingMethod] = useState<'gmb' | 'manual' | null>(null);
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{
    stateId: string;
    cityId: string;
    stateName: string;
    cityName: string;
    isNewCity?: boolean;
  } | null>(null);
  const [formData, setFormData] = useState({
    clinicName: "",
    dentistName: "",
    email: user?.email || "",
    phone: "",
    streetAddress: "",
    website: "",
    description: "",
    agreeTerms: false,
  });

  const handleGoogleSignIn = async () => {
    setIsConnectingGoogle(true);
    try {
      localStorage.setItem('gmb_listing_flow', 'true');
      const redirectTo = `${window.location.origin}/auth/callback?listing=true`;

      const { error } = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: redirectTo,
        extraParams: {
          scope: 'openid email profile https://www.googleapis.com/auth/business.manage',
          access_type: 'offline',
          prompt: 'consent',
        },
      });

      if (error) {
        localStorage.removeItem('gmb_listing_flow');
        throw error;
      }
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect with Google",
        variant: "destructive",
      });
      setIsConnectingGoogle(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      const formatted = formatUKPhone(value);
      setFormData(prev => ({ ...prev, phone: formatted }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const validateStep = (currentStep: number) => {
    const stepFields: Record<number, string[]> = {
      1: ["clinicName", "dentistName"],
      2: ["email", "phone"],
      3: [],
    };

    if (currentStep === 1 && !selectedLocation) {
      setErrors(prev => ({ ...prev, location: "Please select a city" }));
      return false;
    }

    const fieldsToValidate = stepFields[currentStep];
    const partialData: Record<string, any> = {};
    fieldsToValidate.forEach(field => {
      partialData[field] = (formData as any)[field];
    });

    try {
      const partialSchema = z.object(
        Object.fromEntries(
          fieldsToValidate.map(field => [field, (formSchema.shape as any)[field]])
        )
      );
      partialSchema.parse(partialData);
      setErrors(prev => ({ ...prev, location: "" }));
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 3) as 1 | 2 | 3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agreeTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the terms and conditions.",
        variant: "destructive",
      });
      return;
    }

    try {
      formSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
        toast({
          title: "Validation Error",
          description: "Please check the form for errors.",
          variant: "destructive",
        });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const selectedServiceNames = treatments
        .filter((t: any) => selectedServices.includes(t.id))
        .map((t: any) => t.name);

      const { error } = await supabase.from("leads").insert({
        patient_name: formData.dentistName,
        patient_email: formData.email,
        patient_phone: formData.phone,
        message: JSON.stringify({
          type: 'agency_listing',
          agencyName: formData.clinicName,
          contactName: formData.dentistName,
          state: selectedLocation?.stateName || '',
          stateId: selectedLocation?.stateId || '',
          city: selectedLocation?.cityName || '',
          cityId: selectedLocation?.cityId || '',
          isNewCity: selectedLocation?.isNewCity || false,
          streetAddress: formData.streetAddress,
          website: formData.website,
          services: selectedServiceNames,
          serviceIds: selectedServices,
          description: formData.description,
        }),
        source: "list-your-agency",
        status: "new",
      });

      if (error) throw error;

      try {
        await supabase.functions.invoke('send-listing-confirmation', {
          body: {
            email: formData.email,
            clinicName: formData.clinicName,
            dentistName: formData.dentistName,
          },
        });
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
      }

      toast({
        title: "Submission Received!",
        description: "Our team will review your listing and contact you within 24-48 hours.",
      });

      navigate("/list-your-practice/success");
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your listing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    { icon: Shield, title: "Free Listing", description: "List your agency for free and reach prospective foster carers" },
    { icon: BadgeCheck, title: "Get Verified", description: "Verify your Ofsted registration to stand out and build trust" },
    { icon: TrendingUp, title: "Grow Your Agency", description: "Attract new foster carers actively searching for agencies" },
    { icon: Star, title: "Build Reputation", description: "Collect reviews and showcase your expertise" },
  ];

  return (
    <PageLayout>
      <SEOHead
        title="List Your Fostering Agency | Join Foster Care Directory"
        description="List your fostering agency for free on Foster Care. Reach prospective foster carers, get verified, collect reviews, and grow your agency."
        canonical="/list-your-agency/"
        keywords={['list fostering agency', 'fostering directory listing', 'agency marketing', 'fostering agency growth']}
      />
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-teal/5 border-b relative">
        <div className="absolute inset-0 bg-subtle-grid opacity-20 pointer-events-none" />
        <div className="container py-12 md:py-16 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-6">
              <PromotionBanner variant="inline" />
            </div>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
              <Building2 className="h-4 w-4" />
              For Fostering Agencies
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
              List Your <span className="text-primary">Agency</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Join the UK's leading fostering directory. Connect with prospective foster carers actively searching for agencies in your area.
            </p>
          </div>
        </div>
      </div>

      <Section size="lg">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              <div className="card-modern p-6 md:p-8">
                {!listingMethod && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h2 className="font-display text-2xl font-bold mb-2">How would you like to list?</h2>
                      <p className="text-muted-foreground">Choose the fastest way to get started</p>
                    </div>

                    <Card 
                      className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-teal/5 cursor-pointer hover:border-primary/50 transition-all"
                      onClick={handleGoogleSignIn}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="h-14 w-14 rounded-2xl bg-white shadow-md flex items-center justify-center flex-shrink-0">
                            {isConnectingGoogle ? (
                              <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            ) : (
                              <img 
                                src="https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png" 
                                alt="Google" 
                                className="h-8 w-8"
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-lg">Continue with Google</h3>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-teal/20 text-teal font-medium">Recommended</span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              Import your business info, photos, and reviews from Google Business Profile
                            </p>
                          </div>
                          <ArrowRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-3 text-muted-foreground">Or</span>
                      </div>
                    </div>

                    <Card 
                      className="border border-border cursor-pointer hover:border-primary/30 transition-all"
                      onClick={() => setListingMethod('manual')}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center flex-shrink-0">
                            <Building2 className="h-7 w-7 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg mb-1">Fill Out Manually</h3>
                            <p className="text-sm text-muted-foreground">
                              Enter your agency details manually. Connect Google later.
                            </p>
                          </div>
                          <ArrowRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>

                    <p className="text-xs text-center text-muted-foreground">
                      By continuing, you agree to our <Link to="/terms" className="text-primary hover:underline">Terms</Link> and <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                    </p>
                  </div>
                )}

                {listingMethod === 'manual' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setListingMethod(null)}
                      className="text-sm text-muted-foreground hover:text-foreground mb-6"
                    >
                      ← Back to options
                    </button>

                    <div className="flex items-center gap-2 mb-8">
                      {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center gap-2 flex-1">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                          }`}>
                            {step > s ? <CheckCircle className="h-5 w-5" /> : s}
                          </div>
                          {s < 3 && (
                            <div className={`h-1 flex-1 rounded-full ${step > s ? "bg-primary" : "bg-muted"}`} />
                          )}
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleSubmit}>
                      {step === 1 && (
                        <div className="space-y-6">
                          <h3 className="font-display text-xl font-bold">Agency Details</h3>
                          <div className="space-y-2">
                            <Label htmlFor="clinicName">Agency Name *</Label>
                            <div className="relative">
                              <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input id="clinicName" name="clinicName" value={formData.clinicName} onChange={handleChange} placeholder="e.g. ABC Fostering Services" className="pl-10" />
                            </div>
                            {errors.clinicName && <p className="text-sm text-destructive">{errors.clinicName}</p>}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="dentistName">Your Name *</Label>
                            <div className="relative">
                              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input id="dentistName" name="dentistName" value={formData.dentistName} onChange={handleChange} placeholder="Full name" className="pl-10" />
                            </div>
                            {errors.dentistName && <p className="text-sm text-destructive">{errors.dentistName}</p>}
                          </div>
                          <div className="space-y-2">
                            <Label>Location *</Label>
                            <SmartCitySearch value={selectedLocation} onChange={setSelectedLocation} />
                            {errors.location && <p className="text-sm text-destructive">{errors.location}</p>}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="streetAddress">Street Address</Label>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input id="streetAddress" name="streetAddress" value={formData.streetAddress} onChange={handleChange} placeholder="Street address" className="pl-10" />
                            </div>
                          </div>
                          <Button type="button" className="w-full rounded-xl font-bold" onClick={handleNext}>
                            Continue <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      )}

                      {step === 2 && (
                        <div className="space-y-6">
                          <h3 className="font-display text-xl font-bold">Contact Information</h3>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email Address *</Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="agency@example.co.uk" className="pl-10" />
                            </div>
                            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number *</Label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="01234 567890" className="pl-10" />
                            </div>
                            {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="website">Website (Optional)</Label>
                            <div className="relative">
                              <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input id="website" name="website" value={formData.website} onChange={handleChange} placeholder="https://www.example.co.uk" className="pl-10" />
                            </div>
                            {errors.website && <p className="text-sm text-destructive">{errors.website}</p>}
                          </div>
                          <div className="flex gap-3">
                            <Button type="button" variant="outline" className="flex-1 rounded-xl font-bold" onClick={() => setStep(1)}>Back</Button>
                            <Button type="button" className="flex-1 rounded-xl font-bold" onClick={handleNext}>
                              Continue <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}

                      {step === 3 && (
                        <div className="space-y-6">
                          <h3 className="font-display text-xl font-bold">Fostering Services</h3>
                          <div className="space-y-2">
                            <Label>Select the fostering types you offer</Label>
                            <div className="grid grid-cols-2 gap-2">
                              {treatments.map((t: any) => (
                                <label
                                  key={t.id}
                                  className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                                    selectedServices.includes(t.id) ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                                  }`}
                                >
                                  <Checkbox
                                    checked={selectedServices.includes(t.id)}
                                    onCheckedChange={() => handleServiceToggle(t.id)}
                                  />
                                  <span className="text-sm font-medium">{t.name}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="description">About Your Agency (Optional)</Label>
                            <Textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Tell us about your agency, experience, and approach to fostering..." rows={4} />
                          </div>
                          <div className="flex items-start gap-2">
                            <Checkbox
                              id="agreeTerms"
                              checked={formData.agreeTerms}
                              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, agreeTerms: !!checked }))}
                            />
                            <Label htmlFor="agreeTerms" className="text-sm text-muted-foreground leading-tight">
                              I agree to the <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                            </Label>
                          </div>
                          <div className="flex gap-3">
                            <Button type="button" variant="outline" className="flex-1 rounded-xl font-bold" onClick={() => setStep(2)}>Back</Button>
                            <Button type="submit" className="flex-1 rounded-xl font-bold" disabled={isSubmitting}>
                              {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Submitting...</> : 'Submit Listing'}
                            </Button>
                          </div>
                        </div>
                      )}
                    </form>
                  </>
                )}
              </div>
            </div>

            {/* Benefits Sidebar */}
            <div className="lg:col-span-2">
              <div className="card-depth p-6 sticky top-24">
                <h3 className="font-display text-lg font-bold mb-6">Why List on Foster Care?</h3>
                <div className="space-y-5">
                  {benefits.map((benefit, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <benefit.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-bold">{benefit.title}</h4>
                        <p className="text-sm text-muted-foreground">{benefit.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </PageLayout>
  );
};

export default ListYourPracticePage;
