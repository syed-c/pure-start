import { Link } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo/SEOHead";
import { useRealCounts } from "@/hooks/useRealCounts";
import {
  Search, UserCheck, Calendar, Star, ArrowRight, CheckCircle,
  Building2, TrendingUp, Shield, Phone, Users, Award, Sparkles
} from "lucide-react";

const HowItWorksPage = () => {
  const { data: counts } = useRealCounts();

  const carerSteps = [
    { step: 1, icon: Search, title: "Search", description: "Enter your location and the type of fostering you're interested in. Browse through Ofsted-registered agencies in your area." },
    { step: 2, icon: UserCheck, title: "Compare", description: "Review agency profiles, check Ofsted ratings, read carer reviews, and compare agencies to find the right fit for you." },
    { step: 3, icon: Calendar, title: "Enquire", description: "Submit an enquiry directly through the platform. The agency will contact you to discuss the next steps in your fostering journey." },
    { step: 4, icon: Star, title: "Review", description: "After working with an agency, share your experience to help other prospective foster carers make informed decisions." },
  ];

  const agencySteps = [
    { step: 1, icon: Building2, title: "Create Profile", description: "List your agency for free or claim an existing profile. Add your services, Ofsted rating, and fostering types." },
    { step: 2, icon: Shield, title: "Get Verified", description: "Complete our verification process to earn the verified badge and boost your visibility in search results." },
    { step: 3, icon: Phone, title: "Receive Enquiries", description: "Get enquiries directly from prospective foster carers searching for agencies in your area." },
    { step: 4, icon: TrendingUp, title: "Grow Your Agency", description: "Build your reputation with carer reviews and attract more foster carers to your agency." },
  ];

  return (
    <PageLayout>
      <SEOHead
        title="How It Works | Find Fostering Agencies or List Your Agency"
        description="Learn how Foster Connect works. Prospective carers can search, compare, and enquire with fostering agencies. Agencies can list their services and reach more carers."
        canonical="/how-it-works/"
        keywords={['how to find fostering agency', 'become foster carer', 'list fostering agency', 'fostering directory']}
      />

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-primary/[0.04] to-background overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(var(--primary)/0.06),transparent_60%)]" />
        <div className="container relative py-20 md:py-28">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/15 mb-6">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Simple & Easy</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black mb-6 text-foreground" style={{ fontFamily: "'Outfit', sans-serif" }}>
              How <span className="text-primary">Foster Connect</span> Works
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Whether you're looking to foster or an agency wanting to recruit carers, we make it easy.
            </p>

            <div className="flex flex-wrap justify-center gap-5 text-sm">
              {[
                { icon: Users, label: `${counts?.clinics?.toLocaleString() || "500+"}+ Agencies` },
                { icon: Award, label: "Ofsted Registered" },
                { icon: Search, label: "Quick Enquiry" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-semibold text-foreground/70">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* For Carers */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/15 mb-4">
              <Users className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-bold text-primary uppercase tracking-wider">For Prospective Carers</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Find Your Ideal <span className="text-primary">Agency</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-5 mb-14">
            {carerSteps.map((item, i) => (
              <div key={i} className="relative">
                <div className="bg-card border border-border/50 rounded-2xl p-6 text-center h-full hover:shadow-lg hover:border-primary/20 transition-all duration-300 hover:-translate-y-1">
                  <div className="w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-black text-lg mx-auto mb-4 shadow-md shadow-primary/20">
                    {item.step}
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-primary/8 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
                {i < carerSteps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-px bg-border" />
                )}
              </div>
            ))}
          </div>

          <div className="bg-card border border-border/50 rounded-2xl p-8 shadow-sm">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-5" style={{ fontFamily: "'Outfit', sans-serif" }}>Carer Benefits</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {["Access to Ofsted-registered agencies", "Real carer reviews and ratings", "Easy online enquiry forms", "Compare agencies by fostering type", "Find agencies for any fostering need", "100% free to use"].map((benefit, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-center md:text-right">
                <Button asChild size="lg" className="rounded-xl font-bold shadow-md shadow-primary/20 h-12 px-6">
                  <Link to="/search">Find an Agency <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Agencies */}
      <section className="bg-foreground text-background py-20 md:py-28">
        <div className="container">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/15 border border-primary/20 mb-4">
              <Building2 className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-bold text-primary uppercase tracking-wider">For Agencies</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-background" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Grow Your <span className="text-primary">Agency</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-5 mb-14">
            {agencySteps.map((item, i) => (
              <div key={i} className="relative">
                <div className="bg-background/5 backdrop-blur-sm border border-background/10 rounded-2xl p-6 text-center h-full hover:bg-background/10 transition-colors">
                  <div className="w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-black text-lg mx-auto mb-4 shadow-md shadow-primary/20">
                    {item.step}
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-background/8 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-background" style={{ fontFamily: "'Outfit', sans-serif" }}>{item.title}</h3>
                  <p className="text-sm text-background/60 leading-relaxed">{item.description}</p>
                </div>
                {i < agencySteps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-px bg-background/15" />
                )}
              </div>
            ))}
          </div>

          <div className="bg-background/5 backdrop-blur-sm border border-background/10 rounded-2xl p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-5 text-background" style={{ fontFamily: "'Outfit', sans-serif" }}>Agency Benefits</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {["Free basic listing", "Reach prospective foster carers", "Verified badge for trust", "Higher search visibility", "Manage reviews and reputation", "Analytics and insights"].map((benefit, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-background/80">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-center md:text-right space-y-3">
                <Button asChild size="lg" className="rounded-xl font-bold shadow-md shadow-primary/20 h-12 px-6">
                  <Link to="/list-your-agency">List Your Agency <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <p className="text-background/50 text-sm">
                  Already listed? <Link to="/claim-profile" className="text-primary hover:underline font-medium">Claim your profile</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground py-14">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>Ready to get started?</h2>
          <p className="text-primary-foreground/70 mb-8 max-w-xl mx-auto">
            Join hundreds of agencies and prospective foster carers already using Foster Connect.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" variant="secondary" className="rounded-xl font-bold h-12">
              <Link to="/search">Find an Agency</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-xl font-bold h-12 border-primary-foreground/30 text-primary-foreground bg-primary-foreground/10 hover:bg-primary-foreground/20">
              <Link to="/list-your-agency">List Your Agency</Link>
            </Button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default HowItWorksPage;
