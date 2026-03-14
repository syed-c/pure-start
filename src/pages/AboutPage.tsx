import { Link } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo/SEOHead";
import { useRealCounts } from "@/hooks/useRealCounts";
import { useSeoPageContent } from "@/hooks/useSeoPageContent";
import {
  Target, Heart, Shield, Users, Award, CheckCircle, ArrowRight,
  Building2, Globe, TrendingUp, Star
} from "lucide-react";

const AboutPage = () => {
  const { data: counts } = useRealCounts();
  const { data: seoContent } = useSeoPageContent("about");

  const values = [
    { icon: Heart, title: "Children First", description: "Every decision we make prioritises the welfare and safety of children in care." },
    { icon: Shield, title: "Trust & Transparency", description: "We verify every fostering agency to ensure quality and Ofsted compliance." },
    { icon: Target, title: "Excellence", description: "We partner only with agencies that meet the highest standards of foster care." },
    { icon: Users, title: "Community", description: "Building connections between prospective foster carers and trusted agencies." },
  ];

  const stats = [
    { value: counts?.clinics?.toLocaleString() || "500+", label: "Agencies", icon: Building2 },
    { value: counts?.cities?.toLocaleString() || "100+", label: "Cities", icon: Globe },
    { value: "4", label: "UK Nations", icon: Star },
    { value: "4.8", label: "Avg Rating", icon: Award },
  ];

  return (
    <PageLayout>
      <SEOHead
        title={seoContent?.meta_title || "About Foster Connect | UK's Trusted Fostering Agency Directory"}
        description={seoContent?.meta_description || "Learn about Foster Connect, the UK's trusted platform connecting prospective foster carers with verified fostering agencies across England."}
        canonical="/about/"
        keywords={['about foster connect', 'fostering directory', 'find fostering agency', 'foster care platform']}
      />

      {/* Hero */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">About Us</p>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-foreground">
              Making Fostering <span className="text-primary">Accessible</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
              The UK's trusted platform connecting prospective foster carers with verified fostering agencies. Every child deserves a safe home.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="rounded-lg font-semibold h-11 px-6">
                <Link to="/search">Find an Agency <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-lg font-semibold h-11 px-6">
                <Link to="/list-your-agency">List Your Agency</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border py-10">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <stat.icon className="h-5 w-5 mx-auto mb-2 text-primary" />
                <p className="text-3xl font-extrabold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">Our Mission</p>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-6 text-foreground">
                Connecting Carers with <span className="text-primary">Trusted Agencies</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                We believe every child deserves a safe and loving home. Foster Connect was founded to connect prospective foster carers across the UK with trusted, Ofsted-verified fostering agencies.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {["Ofsted Registered Agencies", "Verified Agency Information", "Real Carer Reviews", "Free to Use"].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 p-3 rounded-lg bg-muted border border-border">
                    <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="font-medium text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] rounded-xl overflow-hidden border border-border">
                <img
                  src="https://images.unsplash.com/photo-1536640712-4d4c36ff0e4e?auto=format&fit=crop&q=80&w=800"
                  alt="Foster family spending time together"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-card border border-border rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xl font-extrabold">{counts?.clinics?.toLocaleString() || "500+"}</p>
                    <p className="text-xs text-muted-foreground">Agencies Listed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">Values</p>
            <h2 className="text-3xl md:text-4xl font-extrabold">Our Core Values</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {values.map((value, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-md hover:border-primary/20 transition-all">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-base font-bold mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-14">
        <div className="container text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-primary-foreground mb-4">
            Ready to start your fostering journey?
          </h2>
          <p className="text-primary-foreground/70 mb-8 max-w-xl mx-auto">
            Join families who've found their ideal fostering agency through Foster Connect.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" variant="secondary" className="rounded-lg font-semibold h-11">
              <Link to="/search">Find an Agency <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default AboutPage;
