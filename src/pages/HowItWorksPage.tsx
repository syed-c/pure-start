import { Link } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo/SEOHead";
import { useRealCounts } from "@/hooks/useRealCounts";
import {
  Search,
  UserCheck,
  Calendar,
  Star,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Building2,
  TrendingUp,
  Zap,
  Shield,
  Phone,
  Users,
  Award
} from "lucide-react";

const HowItWorksPage = () => {
  const { data: counts } = useRealCounts();

  const carerSteps = [
    {
      step: 1,
      icon: Search,
      title: "Search",
      description: "Enter your location and the type of fostering you're interested in. Browse through Ofsted-registered agencies in your area.",
      color: "from-primary/20 to-teal/10"
    },
    {
      step: 2,
      icon: UserCheck,
      title: "Compare",
      description: "Review agency profiles, check Ofsted ratings, read carer reviews, and compare agencies to find the right fit for you.",
      color: "from-purple/20 to-indigo-500/10"
    },
    {
      step: 3,
      icon: Calendar,
      title: "Enquire",
      description: "Submit an enquiry directly through the platform. The agency will contact you to discuss the next steps in your fostering journey.",
      color: "from-gold/20 to-amber-500/10"
    },
    {
      step: 4,
      icon: Star,
      title: "Review",
      description: "After working with an agency, share your experience to help other prospective foster carers make informed decisions.",
      color: "from-coral/20 to-pink/10"
    },
  ];

  const agencySteps = [
    {
      step: 1,
      icon: Building2,
      title: "Create Profile",
      description: "List your agency for free or claim an existing profile. Add your services, Ofsted rating, and fostering types."
    },
    {
      step: 2,
      icon: Shield,
      title: "Get Verified",
      description: "Complete our verification process to earn the verified badge and boost your visibility in search results."
    },
    {
      step: 3,
      icon: Phone,
      title: "Receive Enquiries",
      description: "Get enquiries directly from prospective foster carers searching for agencies in your area."
    },
    {
      step: 4,
      icon: TrendingUp,
      title: "Grow Your Agency",
      description: "Build your reputation with carer reviews and attract more foster carers to your agency."
    },
  ];

  const carerBenefits = [
    "Access to Ofsted-registered agencies",
    "Real carer reviews and ratings",
    "Easy online enquiry forms",
    "Compare agencies by fostering type",
    "Find agencies for any fostering need",
    "100% free to use"
  ];

  const agencyBenefits = [
    "Free basic listing",
    "Reach prospective foster carers",
    "Verified badge for trust",
    "Higher search visibility",
    "Manage reviews and reputation",
    "Analytics and insights"
  ];

  return (
    <PageLayout>
      <SEOHead
        title="How It Works | Find Fostering Agencies or List Your Agency"
        description="Learn how Foster Connect works. Prospective carers can search, compare, and enquire with fostering agencies. Agencies can list their services and reach more carers."
        canonical="/how-it-works/"
        keywords={['how to find fostering agency', 'become foster carer', 'list fostering agency', 'fostering directory']}
      />

      {/* Dark Hero Section */}
      <section className="relative bg-dark-section text-dark-section-foreground overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.1),transparent_50%)]" />
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
        
        <div className="container relative py-20 md:py-28">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-primary">Simple & Easy</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
              How{" "}
              <span className="text-gradient">Foster Connect</span>{" "}
              Works
            </h1>
            
            <p className="text-xl md:text-2xl text-dark-section-foreground/70 max-w-2xl mx-auto mb-8">
              Whether you're looking to foster or an agency wanting to recruit carers, we make it easy.
            </p>

            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <span>{counts?.clinics?.toLocaleString() || "500+"}+ Agencies</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gold/20 flex items-center justify-center">
                  <Award className="h-4 w-4 text-gold" />
                </div>
                <span>Ofsted Registered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-coral/20 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-coral" />
                </div>
                <span>Quick Enquiry</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Prospective Carers */}
      <Section size="lg">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold text-primary">For Prospective Carers</span>
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">
            Find Your Ideal <span className="text-primary">Agency</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {carerSteps.map((item, i) => (
            <div key={i} className="relative">
              <div className="card-modern p-6 text-center h-full card-hover">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-display font-bold text-xl mx-auto mb-4 shadow-glow">
                  {item.step}
                </div>
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-4`}>
                  <item.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-display text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              {i < carerSteps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-border" />
              )}
            </div>
          ))}
        </div>

        <div className="card-modern p-8 bg-gradient-to-br from-primary/5 via-transparent to-teal/5 border-primary/20">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="font-display text-2xl font-bold mb-4">Carer Benefits</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {carerBenefits.map((benefit, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center md:text-right">
              <Button asChild size="lg" className="rounded-2xl font-bold shadow-glow">
                <Link to="/search">
                  Find an Agency
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Section>

      {/* For Agencies */}
      <Section variant="dark" size="lg">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Building2 className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold text-primary">For Agencies</span>
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold mt-2 text-dark-section-foreground">
            Grow Your <span className="text-primary">Agency</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {agencySteps.map((item, i) => (
            <div key={i} className="relative">
              <div className="bg-card/10 backdrop-blur-sm border border-white/10 rounded-3xl p-6 text-center h-full hover:bg-card/20 transition-colors">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-display font-bold text-xl mx-auto mb-4 shadow-glow">
                  {item.step}
                </div>
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-display text-lg font-bold mb-2 text-white">{item.title}</h3>
                <p className="text-sm text-white/70">{item.description}</p>
              </div>
              {i < agencySteps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-white/20" />
              )}
            </div>
          ))}
        </div>

        <div className="bg-card/10 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="font-display text-2xl font-bold mb-4 text-white">Agency Benefits</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {agencyBenefits.map((benefit, i) => (
                  <div key={i} className="flex items-center gap-2 text-white/90">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center md:text-right space-y-3">
              <Button asChild size="lg" className="rounded-2xl font-bold shadow-glow">
                <Link to="/list-your-agency">
                  List Your Agency
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <p className="text-white/60 text-sm">
                Already listed? <Link to="/claim-profile" className="text-primary hover:underline">Claim your profile</Link>
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section variant="primary" size="md">
        <div className="text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Ready to get started?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Join hundreds of agencies and prospective foster carers already using Foster Connect.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" variant="secondary" className="rounded-2xl font-bold">
              <Link to="/search">Find an Agency</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-2xl font-bold border-white/40 text-white bg-white/10 hover:bg-white/20">
              <Link to="/list-your-agency">List Your Agency</Link>
            </Button>
          </div>
        </div>
      </Section>
    </PageLayout>
  );
};

export default HowItWorksPage;
