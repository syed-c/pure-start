import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo/SEOHead";
import { useRealCounts } from "@/hooks/useRealCounts";
import {
  Search, UserCheck, Calendar, Star, ArrowRight, CheckCircle,
  Building2, TrendingUp, Shield, Phone, Sparkles, Heart,
  HandHeart, MessageSquare, Award, Users, ChevronRight, Eye
} from "lucide-react";

import howItWorksImg from "@/assets/how-it-works-illustration.png";

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
  transition: { duration: 0.45, delay: i * 0.12 },
});

const HowItWorksPage = () => {
  const { data: counts } = useRealCounts();

  const carerSteps = [
    { step: 1, icon: Search, title: "Search & Discover", description: "Enter your location and the type of fostering you're interested in. Browse through Ofsted-registered agencies in your area with detailed profiles.", accent: "from-emerald-500 to-teal-500" },
    { step: 2, icon: UserCheck, title: "Compare & Choose", description: "Review agency profiles, check Ofsted ratings, read genuine carer reviews, and compare agencies side-by-side to find the right fit for you.", accent: "from-blue-500 to-indigo-500" },
    { step: 3, icon: Calendar, title: "Enquire & Connect", description: "Submit an enquiry directly through the platform — it's fast, free, and secure. The agency will contact you to discuss next steps in your journey.", accent: "from-amber-500 to-orange-500" },
    { step: 4, icon: Star, title: "Review & Share", description: "After working with an agency, share your honest experience to help other prospective foster carers make informed decisions.", accent: "from-rose-500 to-pink-500" },
  ];

  const agencySteps = [
    { step: 1, icon: Building2, title: "Create Your Profile", description: "List your agency for free or claim an existing listing. Add your services, Ofsted rating, fostering types, and team details." },
    { step: 2, icon: Shield, title: "Get Verified", description: "Complete our verification process to earn the trusted verified badge and boost your visibility in search results." },
    { step: 3, icon: Phone, title: "Receive Enquiries", description: "Get direct enquiries from prospective foster carers actively searching for agencies in your area." },
    { step: 4, icon: TrendingUp, title: "Grow & Succeed", description: "Build your reputation with genuine reviews, track performance with analytics, and attract more foster carers." },
  ];

  const carerBenefits = ["Ofsted-registered agencies only", "Real carer reviews", "Easy online enquiry forms", "Compare by fostering type", "Find any fostering need", "100% free forever"];
  const agencyBenefits = ["Free basic listing", "Reach prospective carers", "Verified badge", "Higher search visibility", "Manage & respond to reviews", "Analytics & insights dashboard"];

  return (
    <PageLayout>
      <SEOHead
        title="How It Works | Find Fostering Agencies or List Your Agency"
        description="Learn how Foster Connect works. Search, compare, and enquire with fostering agencies. Agencies can list their services and reach more carers."
        canonical="/how-it-works/"
        keywords={['how to find fostering agency', 'become foster carer', 'list fostering agency']}
      />

      {/* ───── Hero ───── */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-background to-muted/30" />
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary/[0.06] rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-accent/[0.08] rounded-full blur-3xl" />

        <div className="container relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeUp}>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-6">
                <Sparkles className="h-3.5 w-3.5" /> Simple & Easy
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-foreground leading-tight">
                How{" "}
                <span className="text-primary">Foster Connect</span>{" "}
                Works
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg leading-relaxed mb-8">
                Whether you're looking to foster or an agency wanting to recruit carers, we make the journey simple, transparent, and completely free.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" className="rounded-xl font-semibold h-12 px-7 shadow-lg shadow-primary/20">
                  <Link to="/search">Start Searching <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-xl font-semibold h-12 px-7">
                  <Link to="/list-your-agency">I'm an Agency</Link>
                </Button>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              whileInView={{ opacity: 1, scale: 1 }} 
              viewport={{ once: true }} 
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex justify-center"
            >
              <img src={howItWorksImg} alt="How Foster Connect works" className="w-full max-w-md drop-shadow-xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ───── For Carers Steps ───── */}
      <section className="py-20 md:py-28">
        <div className="container">
          <motion.div {...fadeUp} className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4">
              <Heart className="h-3.5 w-3.5" /> For Prospective Carers
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold">Find Your Ideal Agency in 4 Steps</h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              From your first search to writing a review — we guide you through every step of finding the perfect fostering agency.
            </p>
          </motion.div>

          {/* Timeline steps */}
          <div className="max-w-4xl mx-auto space-y-6">
            {carerSteps.map((item, i) => (
              <motion.div key={i} {...stagger(i)} className="group relative">
                <div className="flex gap-6 items-start">
                  {/* Step number & line */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.accent} text-white flex items-center justify-center font-bold text-lg shadow-lg`}>
                      {item.step}
                    </div>
                    {i < carerSteps.length - 1 && <div className="w-px h-full min-h-[40px] bg-border mt-3" />}
                  </div>

                  {/* Content card */}
                  <div className="bg-card border border-border rounded-2xl p-6 md:p-8 flex-1 group-hover:border-primary/20 group-hover:shadow-lg transition-all duration-300 mb-2">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
                        <item.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Carer benefits */}
          <motion.div {...fadeUp} className="mt-14 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-primary/[0.04] to-muted/30 border border-border rounded-3xl p-8 md:p-10">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-xl font-bold mb-5 text-foreground">Why Carers Love Foster Connect</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {carerBenefits.map((benefit, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm font-medium">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-extrabold text-primary mb-1">{counts?.clinics?.toLocaleString() || "500+"}</p>
                  <p className="text-sm text-muted-foreground mb-5">Agencies to discover</p>
                  <Button asChild size="lg" className="rounded-xl font-semibold h-12 px-8 shadow-lg shadow-primary/20">
                    <Link to="/search">Find an Agency <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ───── For Agencies ───── */}
      <section className="bg-foreground text-background py-20 md:py-28">
        <div className="container">
          <motion.div {...fadeUp} className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-4">
              <Building2 className="h-3.5 w-3.5" /> For Agencies
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-background">Grow Your Agency with Foster Connect</h2>
            <p className="text-background/50 mt-4 max-w-2xl mx-auto">
              Reach prospective foster carers actively searching for agencies in your area. It's free to get started.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto mb-14">
            {agencySteps.map((item, i) => (
              <motion.div key={i} {...stagger(i)} className="bg-background/5 border border-background/10 rounded-2xl p-6 text-center hover:bg-background/8 transition-colors">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <div className="w-12 h-12 rounded-xl bg-background/8 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-base font-bold text-background mb-2">{item.title}</h3>
                <p className="text-sm text-background/50 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Agency benefits */}
          <motion.div {...fadeUp} className="max-w-4xl mx-auto">
            <div className="bg-background/5 border border-background/10 rounded-3xl p-8 md:p-10">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-xl font-bold text-background mb-5">Agency Benefits</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {agencyBenefits.map((benefit, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-background/70">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-center">
                  <Button asChild size="lg" className="rounded-xl font-semibold h-12 px-8">
                    <Link to="/list-your-agency">List Your Agency <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ───── Comparison Section ───── */}
      <section className="py-20 md:py-28">
        <div className="container">
          <motion.div {...fadeUp} className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4">
              <Eye className="h-3.5 w-3.5" /> Why Us
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold">Why Choose Foster Connect?</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Shield, title: "Ofsted Verified", desc: "Every agency is cross-referenced with official Ofsted data. You'll never find an unregistered provider on our platform.", stat: "100%", statLabel: "Verified" },
              { icon: HandHeart, title: "Completely Free", desc: "No hidden fees. No subscriptions. Search, compare, and enquire at zero cost to prospective carers.", stat: "£0", statLabel: "Always Free" },
              { icon: Award, title: "Trusted Reviews", desc: "Read real experiences from foster carers. Every review is moderated to ensure authenticity and helpfulness.", stat: "4.8★", statLabel: "Avg Rating" },
            ].map((item, i) => (
              <motion.div key={i} {...stagger(i)} className="group bg-card border border-border rounded-2xl p-7 hover:shadow-xl hover:border-primary/30 hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                  <item.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed mb-5">{item.desc}</p>
                <div className="pt-4 border-t border-border">
                  <p className="text-2xl font-extrabold text-primary">{item.stat}</p>
                  <p className="text-xs text-muted-foreground">{item.statLabel}</p>
                </div>
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
              Ready to Get Started?
            </h2>
            <p className="text-primary-foreground/70 mb-8 max-w-xl mx-auto text-lg">
              Join thousands of prospective carers and agencies already using Foster Connect.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" variant="secondary" className="rounded-xl font-semibold h-12 px-8 shadow-lg">
                <Link to="/search">Find an Agency <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl font-semibold h-12 px-8 border-primary-foreground/30 text-primary-foreground bg-primary-foreground/10 hover:bg-primary-foreground/20">
                <Link to="/list-your-agency">List Your Agency</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </PageLayout>
  );
};

export default HowItWorksPage;
