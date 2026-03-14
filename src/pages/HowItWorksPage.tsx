import { Link } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo/SEOHead";
import { useRealCounts } from "@/hooks/useRealCounts";
import {
  Search, UserCheck, Calendar, Star, ArrowRight, CheckCircle,
  Building2, TrendingUp, Shield, Phone
} from "lucide-react";

const HowItWorksPage = () => {
  const { data: counts } = useRealCounts();

  const carerSteps = [
    { step: 1, icon: Search, title: "Search", description: "Enter your location and the type of fostering you're interested in. Browse through Ofsted-registered agencies in your area." },
    { step: 2, icon: UserCheck, title: "Compare", description: "Review agency profiles, check Ofsted ratings, read carer reviews, and compare agencies to find the right fit." },
    { step: 3, icon: Calendar, title: "Enquire", description: "Submit an enquiry directly through the platform. The agency will contact you to discuss next steps." },
    { step: 4, icon: Star, title: "Review", description: "After working with an agency, share your experience to help other prospective foster carers." },
  ];

  const agencySteps = [
    { step: 1, icon: Building2, title: "Create Profile", description: "List your agency for free or claim an existing profile. Add your services, Ofsted rating, and fostering types." },
    { step: 2, icon: Shield, title: "Get Verified", description: "Complete our verification process to earn the verified badge and boost visibility." },
    { step: 3, icon: Phone, title: "Receive Enquiries", description: "Get enquiries from prospective foster carers searching for agencies in your area." },
    { step: 4, icon: TrendingUp, title: "Grow", description: "Build your reputation with reviews and attract more foster carers." },
  ];

  return (
    <PageLayout>
      <SEOHead
        title="How It Works | Find Fostering Agencies or List Your Agency"
        description="Learn how Foster Connect works. Search, compare, and enquire with fostering agencies. Agencies can list their services and reach more carers."
        canonical="/how-it-works/"
        keywords={['how to find fostering agency', 'become foster carer', 'list fostering agency']}
      />

      {/* Hero */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">Simple & Easy</p>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-foreground">
              How <span className="text-primary">Foster Connect</span> Works
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Whether you're looking to foster or an agency wanting to recruit carers, we make it easy.
            </p>
          </div>
        </div>
      </section>

      {/* For Carers */}
      <section className="py-20 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">For Prospective Carers</p>
            <h2 className="text-3xl md:text-4xl font-extrabold">Find Your Ideal Agency</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-4 mb-12 max-w-5xl mx-auto">
            {carerSteps.map((item, i) => (
              <div key={i} className="relative">
                <div className="bg-card border border-border rounded-xl p-5 text-center h-full hover:border-primary/20 hover:shadow-sm transition-all">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm mx-auto mb-3">
                    {item.step}
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center mx-auto mb-3">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-base font-bold mb-1.5">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
                {i < carerSteps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-2.5 w-5 h-px bg-border" />
                )}
              </div>
            ))}
          </div>

          <div className="bg-card border border-border rounded-xl p-6 md:p-8 max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div>
                <h3 className="text-xl font-bold mb-4">Carer Benefits</h3>
                <div className="grid sm:grid-cols-2 gap-2">
                  {["Ofsted-registered agencies", "Real carer reviews", "Easy online enquiry", "Compare by fostering type", "Find any fostering need", "100% free"].map((benefit, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-center md:text-right">
                <Button asChild size="lg" className="rounded-lg font-semibold h-11 px-6">
                  <Link to="/search">Find an Agency <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Agencies */}
      <section className="bg-foreground text-background py-20 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">For Agencies</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-background">Grow Your Agency</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-4 mb-12 max-w-5xl mx-auto">
            {agencySteps.map((item, i) => (
              <div key={i} className="bg-background/5 border border-background/10 rounded-xl p-5 text-center hover:bg-background/8 transition-colors">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm mx-auto mb-3">
                  {item.step}
                </div>
                <div className="w-12 h-12 rounded-xl bg-background/8 flex items-center justify-center mx-auto mb-3">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-base font-bold text-background mb-1.5">{item.title}</h3>
                <p className="text-sm text-background/50 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="bg-background/5 border border-background/10 rounded-xl p-6 md:p-8 max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div>
                <h3 className="text-xl font-bold text-background mb-4">Agency Benefits</h3>
                <div className="grid sm:grid-cols-2 gap-2">
                  {["Free basic listing", "Reach prospective carers", "Verified badge", "Higher search visibility", "Manage reviews", "Analytics & insights"].map((benefit, i) => (
                    <div key={i} className="flex items-center gap-2 text-background/70">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-center md:text-right">
                <Button asChild size="lg" className="rounded-lg font-semibold h-11 px-6">
                  <Link to="/list-your-agency">List Your Agency <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-14">
        <div className="container text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-primary-foreground mb-4">Ready to get started?</h2>
          <p className="text-primary-foreground/70 mb-8 max-w-xl mx-auto">
            Join agencies and prospective foster carers already using Foster Connect.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" variant="secondary" className="rounded-lg font-semibold h-11">
              <Link to="/search">Find an Agency</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-lg font-semibold h-11 border-primary-foreground/30 text-primary-foreground bg-primary-foreground/10 hover:bg-primary-foreground/20">
              <Link to="/list-your-agency">List Your Agency</Link>
            </Button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default HowItWorksPage;
