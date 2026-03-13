import { Link } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo/SEOHead";
import { useRealCounts } from "@/hooks/useRealCounts";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useSeoPageContent } from "@/hooks/useSeoPageContent";
import {
  Target,
  Heart,
  Shield,
  Users,
  Award,
  CheckCircle,
  ArrowRight,
  Building2,
  Sparkles,
  Globe,
  TrendingUp,
  Star
} from "lucide-react";

const AboutPage = () => {
  const { data: counts } = useRealCounts();
  const { data: siteSettings } = useSiteSettings();
  const { data: seoContent } = useSeoPageContent("about");

  const values = [
    { icon: Heart, title: "Children First", description: "Every decision we make prioritises the welfare and safety of children in care.", color: "from-coral/20 to-pink/10" },
    { icon: Shield, title: "Trust & Transparency", description: "We verify every fostering agency to ensure quality and Ofsted compliance.", color: "from-primary/20 to-teal/10" },
    { icon: Target, title: "Excellence", description: "We partner only with agencies that meet the highest standards of foster care.", color: "from-gold/20 to-amber-500/10" },
    { icon: Users, title: "Community", description: "Building connections between prospective foster carers and trusted agencies.", color: "from-purple/20 to-indigo-500/10" },
  ];

  const stats = [
    { value: counts?.clinics?.toLocaleString() || "500+", label: "Fostering Agencies", icon: Building2 },
    { value: counts?.cities?.toLocaleString() || "100+", label: "Cities Covered", icon: Globe },
    { value: "4", label: "UK Nations", icon: Star },
    { value: "4.8", label: "Average Rating", icon: Star },
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

      {/* Dark Hero Section */}
      <section className="relative bg-dark-section text-dark-section-foreground overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.1),transparent_50%)]" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple/10 rounded-full blur-3xl" />
        
        <div className="container relative py-20 md:py-28">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-primary">About Us</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
              Making Fostering{" "}
              <span className="text-gradient">Accessible</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-dark-section-foreground/70 max-w-2xl mx-auto mb-8">
              The UK's trusted platform connecting prospective foster carers with verified fostering agencies. Every child deserves a safe home.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="rounded-2xl font-bold shadow-glow">
                <Link to="/search">
                  Find an Agency
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-2xl font-bold border-white/40 text-white bg-white/10 hover:bg-white/20">
                <Link to="/list-your-practice">List Your Agency</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <Section variant="primary" size="sm" className="-mt-1">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary-foreground/10 mb-3">
                <stat.icon className="h-6 w-6" />
              </div>
              <p className="font-display text-3xl md:text-4xl font-bold">{stat.value}</p>
              <p className="text-primary-foreground/80 font-medium mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Mission Section */}
      <Section size="lg">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-primary text-sm font-bold uppercase tracking-wider">Our Mission</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-2 mb-6">
              Connecting Carers with <span className="text-primary">Trusted Agencies</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              We believe every child deserves a safe and loving home. Foster Connect was founded with a simple mission: 
              to connect prospective foster carers across the UK with trusted, Ofsted-verified fostering agencies.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Through our platform, prospective carers can easily find, compare, and enquire with agencies that meet 
              our rigorous standards. We're not just a directory — we're a trusted partner in your fostering journey.
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {["Ofsted Registered Agencies", "Verified Agency Information", "Real Carer Reviews", "Free to Use"].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-3xl overflow-hidden shadow-elevated">
              <img
                src="https://images.unsplash.com/photo-1536640712-4d4c36ff0e4e?auto=format&fit=crop&q=80&w=800"
                alt="Foster family spending time together"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-primary/10 rounded-3xl blur-2xl" />
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-purple/10 rounded-3xl blur-2xl" />
            
            <div className="absolute -bottom-4 -right-4 card-modern p-4 shadow-elevated">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{counts?.clinics?.toLocaleString() || "500+"}</p>
                  <p className="text-sm text-muted-foreground">Agencies Listed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Values */}
      <Section variant="muted" size="lg">
        <SectionHeader
          label="What We Stand For"
          title="Our Core"
          highlight="Values"
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, i) => (
            <div key={i} className="card-modern p-6 text-center card-hover">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${value.color} flex items-center justify-center mx-auto mb-4`}>
                <value.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-display text-lg font-bold mb-2">{value.title}</h3>
              <p className="text-sm text-muted-foreground">{value.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Timeline */}
      <Section size="lg">
        <SectionHeader
          label="Our Journey"
          title="Building the UK's"
          highlight="Fostering Directory"
        />
        <div className="max-w-3xl mx-auto">
          <div className="space-y-8">
            {milestones.map((milestone, i) => (
              <div key={i} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-display font-bold text-lg shrink-0">
                    {milestone.year}
                  </div>
                  {i < milestones.length - 1 && <div className="w-0.5 h-full bg-border mt-2" />}
                </div>
                <div className="card-modern p-6 flex-1">
                  <h3 className="font-display text-xl font-bold mb-2">{milestone.title}</h3>
                  <p className="text-muted-foreground">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section variant="dark" size="lg">
        <div className="text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-dark-section-foreground">
            Ready to start your fostering journey?
          </h2>
          <p className="text-dark-section-foreground/70 mb-8 max-w-xl mx-auto">
            Join hundreds of families who've found their ideal fostering agency through Foster Connect.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="rounded-2xl font-bold shadow-glow">
              <Link to="/search">
                Find an Agency
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-2xl font-bold border-white/40 text-white bg-white/10 hover:bg-white/20">
              <Link to="/list-your-practice">List Your Agency</Link>
            </Button>
          </div>
        </div>
      </Section>
    </PageLayout>
  );
};

export default AboutPage;