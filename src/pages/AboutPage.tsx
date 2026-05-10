import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo/SEOHead";
import { useRealCounts } from "@/hooks/useRealCounts";
import { useSeoPageContent } from "@/hooks/useSeoPageContent";
import {
  Target, Heart, Shield, Users, Award, CheckCircle, ArrowRight,
  Building2, Globe, TrendingUp, Star, Sparkles, BookOpen, HandHeart,
  Eye, Lightbulb
} from "lucide-react";

import aboutHeroImg from "@/assets/about-hero-illustration.png";
import missionImg from "@/assets/about-mission-illustration.png";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const stagger = (i: number) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.45, delay: i * 0.1 },
});

const AboutPage = () => {
  const { data: counts } = useRealCounts();
  const { data: seoContent } = useSeoPageContent("about");

  const values = [
    { icon: Heart, title: "Children First", description: "Every decision we make prioritises the welfare and safety of children in care across the UK.", color: "from-rose-500/20 to-rose-500/5" },
    { icon: Shield, title: "Trust & Transparency", description: "We verify every fostering agency to ensure quality, Ofsted compliance, and data accuracy.", color: "from-blue-500/20 to-blue-500/5" },
    { icon: Target, title: "Excellence", description: "We partner only with agencies that meet the highest standards of foster care provision.", color: "from-amber-500/20 to-amber-500/5" },
    { icon: Users, title: "Community", description: "Building meaningful connections between prospective foster carers and trusted agencies.", color: "from-emerald-500/20 to-emerald-500/5" },
  ];

  const stats = [
    { value: counts?.agencies?.toLocaleString() || "500+", label: "Verified Agencies", icon: Building2 },
    { value: counts?.cities?.toLocaleString() || "100+", label: "Cities Covered", icon: Globe },
    { value: "4", label: "UK Nations", icon: Star },
    { value: "4.8", label: "Avg Rating", icon: Award },
  ];

  const timeline = [
    { year: "2023", title: "Founded", description: "Foster Care was born from a simple idea — make finding a fostering agency as easy as searching online." },
    { year: "2024", title: "500+ Agencies", description: "Reached a milestone of listing over 500 Ofsted-registered fostering agencies across England." },
    { year: "2025", title: "UK-Wide Expansion", description: "Expanded coverage to include agencies across all four UK nations with verified profiles." },
    { year: "Future", title: "AI-Powered Matching", description: "Building intelligent matching to connect the right carers with the right agencies automatically." },
  ];

  return (
    <PageLayout>
      <SEOHead
        title={seoContent?.meta_title || "About Foster Care | UK's Trusted Fostering Agency Directory"}
        description={seoContent?.meta_description || "Learn about Foster Care, the UK's trusted platform connecting prospective foster carers with verified fostering agencies across England."}
        canonical="/about/"
        keywords={['about foster connect', 'fostering directory', 'find fostering agency', 'foster care platform']}
      />

      {/* ───── Hero ───── */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-background to-muted/30" />
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary/[0.06] rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-accent/[0.08] rounded-full blur-3xl" />
        
        <div className="container relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeUp}>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-6">
                <Sparkles className="h-3.5 w-3.5" /> About Us
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-foreground leading-tight">
                Making Fostering{" "}
                <span className="text-primary relative">
                  Accessible
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                    <path d="M2 8 C50 2, 150 2, 198 8" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
                  </svg>
                </span>{" "}
                For Everyone
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg mb-8 leading-relaxed">
                The UK's most trusted platform connecting prospective foster carers with verified, Ofsted-registered fostering agencies. Because every child deserves a safe, loving home.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" className="rounded-xl font-semibold h-12 px-7 shadow-lg shadow-primary/20">
                  <Link to="/search">Find an Agency <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-xl font-semibold h-12 px-7">
                  <Link to="/list-your-agency">List Your Agency</Link>
                </Button>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              whileInView={{ opacity: 1, scale: 1 }} 
              viewport={{ once: true }} 
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative flex justify-center"
            >
              <img src={aboutHeroImg} alt="Welcoming foster home" className="w-full max-w-md drop-shadow-2xl" />
              {/* Floating stat card */}
              <div className="absolute -bottom-4 -left-4 bg-card border border-border rounded-2xl p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-foreground">{counts?.agencies?.toLocaleString() || "500+"}</p>
                    <p className="text-xs text-muted-foreground">Agencies Listed</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ───── Stats Bar ───── */}
      <section className="border-y border-border bg-muted/20 py-10">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div key={i} {...stagger(i)} className="text-center">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="text-3xl md:text-4xl font-extrabold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Mission ───── */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div {...fadeUp} className="order-2 lg:order-1">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-5">
                <Lightbulb className="h-3.5 w-3.5" /> Our Mission
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-6 text-foreground">
                Connecting Carers with{" "}
                <span className="text-primary">Trusted Agencies</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                We believe every child deserves a safe and loving home. Foster Care was founded to bridge the gap between prospective foster carers and trusted, Ofsted-verified fostering agencies across the UK. Our platform makes it simple to search, compare, and connect — all for free.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                With over {counts?.agencies?.toLocaleString() || "500"} agencies listed across {counts?.cities?.toLocaleString() || "100"} cities, we're the UK's most comprehensive fostering directory. Every agency on our platform is verified against Ofsted records to ensure you're connecting with legitimate, registered providers.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {["Ofsted Registered Agencies", "Verified Agency Profiles", "Real Carer Reviews", "100% Free to Use", "All Fostering Types", "UK-Wide Coverage"].map((item, i) => (
                  <motion.div key={i} {...stagger(i)} className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/50 border border-border">
                    <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="font-medium text-sm">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 30 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true }} 
              transition={{ duration: 0.6 }}
              className="order-1 lg:order-2 flex justify-center"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl blur-2xl scale-110" />
                <img src={missionImg} alt="Foster care mission" className="relative w-full max-w-sm drop-shadow-xl" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ───── Our Story Timeline ───── */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container">
          <motion.div {...fadeUp} className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4">
              <BookOpen className="h-3.5 w-3.5" /> Our Journey
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold">The Foster Care Story</h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              From a small idea to the UK's leading fostering directory — here's how we got here.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            {timeline.map((item, i) => (
              <motion.div key={i} {...stagger(i)} className="flex gap-6 mb-8 last:mb-0">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shrink-0">
                    {item.year}
                  </div>
                  {i < timeline.length - 1 && <div className="w-px flex-1 bg-border mt-3" />}
                </div>
                <div className="pb-8">
                  <h3 className="text-lg font-bold text-foreground mb-1">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Values ───── */}
      <section className="py-20 md:py-28">
        <div className="container">
          <motion.div {...fadeUp} className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4">
              <Eye className="h-3.5 w-3.5" /> What We Stand For
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold">Our Core Values</h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              These values guide every decision we make and every feature we build.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((value, i) => (
              <motion.div key={i} {...stagger(i)} className="group relative bg-card border border-border rounded-2xl p-7 text-center hover:shadow-xl hover:border-primary/30 hover:-translate-y-1 transition-all duration-300">
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${value.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-primary/20 transition-colors">
                    <value.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Why Choose Us ───── */}
      <section className="py-20 md:py-28 bg-foreground text-background">
        <div className="container">
          <motion.div {...fadeUp} className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-4">
              <Award className="h-3.5 w-3.5" /> Why Foster Care
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-background">
              The UK's Most Trusted Fostering Directory
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Shield, title: "Ofsted Verified", description: "Every agency is cross-referenced with Ofsted records. You can trust that the information is accurate and up-to-date." },
              { icon: HandHeart, title: "Completely Free", description: "No hidden costs, no subscriptions. Search, compare, and enquire with agencies at no charge whatsoever." },
              { icon: Star, title: "Real Reviews", description: "Read genuine reviews from foster carers who have worked with agencies. Make informed decisions with real experiences." },
            ].map((item, i) => (
              <motion.div key={i} {...stagger(i)} className="bg-background/5 border border-background/10 rounded-2xl p-7 hover:bg-background/8 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-5">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-background mb-2">{item.title}</h3>
                <p className="text-background/60 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── CTA ───── */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80" />
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
        <div className="container relative text-center">
          <motion.div {...fadeUp}>
            <h2 className="text-2xl md:text-4xl font-extrabold text-primary-foreground mb-4">
              Ready to Start Your Fostering Journey?
            </h2>
            <p className="text-primary-foreground/70 mb-8 max-w-xl mx-auto text-lg">
              Join thousands of prospective carers who've found their ideal fostering agency through Foster Care.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" variant="secondary" className="rounded-xl font-semibold h-12 px-8 shadow-lg">
                <Link to="/search">Find an Agency <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl font-semibold h-12 px-8 border-primary-foreground/30 text-primary-foreground bg-primary-foreground/10 hover:bg-primary-foreground/20">
                <Link to="/how-it-works">How It Works</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </PageLayout>
  );
};

export default AboutPage;
