import { Link } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo/SEOHead";
import { useRealCounts } from "@/hooks/useRealCounts";
import { useSeoPageContent } from "@/hooks/useSeoPageContent";
import {
  Target, Heart, Shield, Users, Award, CheckCircle, ArrowRight,
  Building2, Globe, TrendingUp, Star, Sparkles
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
    { value: counts?.clinics?.toLocaleString() || "500+", label: "Fostering Agencies", icon: Building2 },
    { value: counts?.cities?.toLocaleString() || "100+", label: "Cities Covered", icon: Globe },
    { value: "4", label: "UK Nations", icon: Star },
    { value: "4.8", label: "Average Rating", icon: Award },
  ];

  const milestones = [
    { year: "2025", title: "Founded", description: "Foster Connect was launched to help prospective foster carers find trusted agencies across England and the UK." },
    { year: "2025", title: "England Coverage", description: "Expanded to cover all major cities across England with Ofsted-rated agency listings." },
    { year: "2026", title: "UK Leader", description: "Becoming the UK's most trusted fostering agency directory with comprehensive coverage." },
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
      <section className="relative bg-gradient-to-b from-primary/[0.04] to-background overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.08),transparent_60%)]" />
        <div className="container relative py-20 md:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/15 mb-6">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-bold text-primary uppercase tracking-wider">About Us</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black mb-6 text-foreground" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Making Fostering{" "}
              <span className="text-primary">Accessible</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              The UK's trusted platform connecting prospective foster carers with verified fostering agencies. Every child deserves a safe home.
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="rounded-xl font-bold shadow-md shadow-primary/20 h-12 px-6">
                <Link to="/search">
                  Find an Agency <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl font-bold h-12 px-6">
                <Link to="/list-your-agency">List Your Agency</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary text-primary-foreground py-10">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <stat.icon className="h-6 w-6 mx-auto mb-2 opacity-70" />
                <p className="text-3xl md:text-4xl font-black" style={{ fontFamily: "'Outfit', sans-serif" }}>{stat.value}</p>
                <p className="text-primary-foreground/70 text-sm font-medium mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-primary text-sm font-bold uppercase tracking-wider mb-3">Our Mission</p>
              <h2 className="text-3xl md:text-4xl font-black mb-6 text-foreground" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Connecting Carers with <span className="text-primary">Trusted Agencies</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                We believe every child deserves a safe and loving home. Foster Connect was founded with a simple mission:
                to connect prospective foster carers across the UK with trusted, Ofsted-verified fostering agencies.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Through our platform, prospective carers can easily find, compare, and enquire with agencies that meet
                our rigorous standards. We're not just a directory — we're a trusted partner in your fostering journey.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {["Ofsted Registered Agencies", "Verified Agency Information", "Real Carer Reviews", "Free to Use"].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl bg-muted/50 border border-border/50">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="font-semibold text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden border border-border/50 shadow-2xl shadow-primary/5">
                <img
                  src="https://images.unsplash.com/photo-1536640712-4d4c36ff0e4e?auto=format&fit=crop&q=80&w=800"
                  alt="Foster family spending time together"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-5 -right-5 bg-card border border-border rounded-2xl p-5 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-black" style={{ fontFamily: "'Outfit', sans-serif" }}>{counts?.clinics?.toLocaleString() || "500+"}</p>
                    <p className="text-xs text-muted-foreground font-medium">Agencies Listed</p>
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
          <div className="text-center mb-14">
            <p className="text-primary text-sm font-bold uppercase tracking-wider mb-3">What We Stand For</p>
            <h2 className="text-3xl md:text-4xl font-black" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Our Core <span className="text-primary">Values</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((value, i) => (
              <div key={i} className="bg-card border border-border/50 rounded-2xl p-7 text-center hover:shadow-lg hover:border-primary/20 transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <value.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>{value.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="text-center mb-14">
            <p className="text-primary text-sm font-bold uppercase tracking-wider mb-3">Our Journey</p>
            <h2 className="text-3xl md:text-4xl font-black" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Building the UK's <span className="text-primary">Fostering Directory</span>
            </h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-6">
            {milestones.map((milestone, i) => (
              <div key={i} className="flex gap-5">
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-black text-sm shrink-0 shadow-md shadow-primary/20">
                    {milestone.year}
                  </div>
                  {i < milestones.length - 1 && <div className="w-0.5 h-full bg-border mt-3" />}
                </div>
                <div className="bg-card border border-border/50 rounded-2xl p-6 flex-1 mb-2">
                  <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>{milestone.title}</h3>
                  <p className="text-muted-foreground">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Ready to start your fostering journey?
          </h2>
          <p className="text-primary-foreground/70 mb-8 max-w-xl mx-auto">
            Join hundreds of families who've found their ideal fostering agency through Foster Connect.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" variant="secondary" className="rounded-xl font-bold h-12">
              <Link to="/search">
                Find an Agency <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
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

export default AboutPage;
