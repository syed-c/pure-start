import { useState } from "react";
import { 
  ArrowRight, Shield, Star, MapPin, 
  Heart, Search, Building2, Calendar,
  ChevronRight, BadgeCheck, Users,
  Quote, CheckCircle, Sparkles, Play
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SearchBox } from "@/components/SearchBox";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { SEOHead } from "@/components/seo/SEOHead";
import { useSeoPageContent } from "@/hooks/useSeoPageContent";
import { useStatesWithClinics } from "@/hooks/useLocations";
import { useRealCounts } from "@/hooks/useRealCounts";
import { useTreatments } from "@/hooks/useTreatments";
import { useTopDentistsPerLocation } from "@/hooks/useProfiles";
import { AutoScrollCarousel } from "@/components/AutoScrollCarousel";
import { ACTIVE_STATES } from "@/lib/constants/activeStates";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, ease: "easeOut" },
};

const stagger = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const HomeV2 = () => {
  const navigate = useNavigate();
  const { data: _states } = useStatesWithClinics();
  const { data: realCounts } = useRealCounts();
  const { data: treatments } = useTreatments();
  const { data: profiles } = useTopDentistsPerLocation(30);
  const { data: seoContent } = useSeoPageContent("/");
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const testimonials = [
    { name: "Sarah Thompson", location: "London", text: "Foster Connect helped us find the perfect agency. The whole process was straightforward and we felt supported throughout our fostering journey.", rating: 5, avatar: "ST" },
    { name: "James Richardson", location: "Birmingham", text: "We were nervous about fostering but the agency we found through Foster Connect provided amazing training and 24/7 support.", rating: 5, avatar: "JR" },
    { name: "Maria Khan", location: "Manchester", text: "The reviews and agency profiles were incredibly helpful. Found a brilliant therapeutic fostering agency near us within days!", rating: 5, avatar: "MK" },
  ];

  const popularTreatments = treatments?.slice(0, 8) || [];

  const carouselProfiles = profiles?.map(p => ({
    name: p.name,
    specialty: p.specialty || 'Fostering Agency',
    location: p.location || 'UK',
    rating: p.rating,
    image: p.image || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
    slug: p.slug,
    type: p.type,
  })) || [];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={seoContent?.meta_title || "Find Fostering Agencies in England & UK | Foster Connect"}
        description={seoContent?.meta_description || "Find Ofsted-rated fostering agencies across England. Compare reviews, explore fostering types & connect with agencies near you."}
        canonical="/"
      />
      <Navbar />

      {/* ══════════ HERO — Split Layout ══════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-background to-accent/20 pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary/[0.05] rounded-full blur-[120px]" />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-accent/20 rounded-full blur-[100px]" />
        
        <div className="container relative z-10 px-4 py-16 md:py-24 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left — Copy */}
            <div className="max-w-xl">
              <motion.div {...fadeUp} className="inline-flex items-center gap-2 bg-primary/8 border border-primary/12 rounded-full px-4 py-1.5 mb-6">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-bold text-primary tracking-wide">UK's #1 Fostering Directory</span>
              </motion.div>

              <motion.h1 {...fadeUp} transition={{ delay: 0.05 }} className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-foreground leading-[1.08] mb-6 tracking-tight">
                Every Child Deserves a{" "}
                <span className="relative inline-block">
                  <span className="text-primary">Loving Home</span>
                  <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 8" fill="none">
                    <path d="M2 6C50 2 150 2 198 6" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" opacity="0.3"/>
                  </svg>
                </span>
              </motion.h1>

              <motion.p {...fadeUp} transition={{ delay: 0.1 }} className="text-lg text-muted-foreground leading-relaxed mb-8">
                Compare Ofsted-rated fostering agencies, read real carer reviews, and take the first step on your fostering journey — completely free.
              </motion.p>

              <motion.div {...fadeUp} transition={{ delay: 0.15 }} className="mb-8">
                <SearchBox variant="hero" />
              </motion.div>

              <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="flex flex-wrap items-center gap-6">
                {[
                  { icon: Shield, text: "Ofsted Verified" },
                  { icon: Star, text: "4.8★ Average" },
                  { icon: Building2, text: `${realCounts?.clinics?.toLocaleString() || '500+'} Agencies` },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-muted-foreground">
                    <item.icon className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold">{item.text}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right — Visual Card Stack */}
            <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="hidden lg:block relative">
              <div className="relative">
                {/* Main card */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-xl relative z-10">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Heart className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-lg">Foster Connect</h3>
                      <p className="text-xs text-muted-foreground">Trusted by families across the UK</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    <div className="bg-muted/60 rounded-xl p-3 text-center">
                      <p className="font-extrabold text-xl text-foreground">{realCounts?.clinics?.toLocaleString() || '500'}+</p>
                      <p className="text-[11px] text-muted-foreground font-medium">Agencies</p>
                    </div>
                    <div className="bg-muted/60 rounded-xl p-3 text-center">
                      <p className="font-extrabold text-xl text-foreground">{realCounts?.cities?.toLocaleString() || '100'}+</p>
                      <p className="text-[11px] text-muted-foreground font-medium">Cities</p>
                    </div>
                    <div className="bg-muted/60 rounded-xl p-3 text-center">
                      <p className="font-extrabold text-xl text-foreground">4.8</p>
                      <p className="text-[11px] text-muted-foreground font-medium">Avg Rating</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {["Ofsted registered agencies", "Real carer reviews", "Free for everyone"].map((item, i) => (
                      <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-primary/[0.04]">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Decorative cards */}
                <div className="absolute -top-4 -right-4 w-full h-full bg-primary/[0.04] rounded-2xl border border-primary/10 -z-10" />
                <div className="absolute -top-8 -right-8 w-full h-full bg-primary/[0.02] rounded-2xl border border-primary/5 -z-20" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════ TRUST BAR ══════════ */}
      <section className="border-y border-border bg-muted/30 py-4">
        <div className="container px-4">
          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-primary" /> Ofsted Registered</span>
            <span className="flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> DBS Checked</span>
            <span className="flex items-center gap-2"><Star className="h-4 w-4 text-primary" /> Verified Reviews</span>
            <span className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> 100% Free</span>
          </div>
        </div>
      </section>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <section className="py-20 md:py-28">
        <div className="container px-4">
          <motion.div {...fadeUp} className="text-center mb-14">
            <span className="inline-flex items-center gap-2 bg-primary/8 rounded-full px-4 py-1.5 mb-4">
              <Play className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-bold text-primary">How It Works</span>
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground">
              Start Your Journey in <span className="text-primary">3 Steps</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { step: "01", title: "Search", description: "Select your region and the type of fostering you're interested in.", icon: Search, gradient: "from-primary/10 to-teal/10" },
              { step: "02", title: "Compare", description: "Browse profiles, Ofsted ratings, and genuine carer reviews side by side.", icon: Star, gradient: "from-gold/10 to-amber-500/10" },
              { step: "03", title: "Enquire", description: "Contact your chosen agency directly and begin your fostering journey.", icon: Calendar, gradient: "from-blue-custom/10 to-purple/10" },
            ].map((item, i) => (
              <motion.div key={i} {...stagger} transition={{ delay: i * 0.1 }}>
                <div className="group relative bg-card border border-border rounded-2xl p-7 h-full hover:border-primary/20 hover:shadow-lg transition-all duration-300">
                  <div className="absolute top-5 right-5 text-5xl font-extrabold text-muted/60 select-none">{item.step}</div>
                  <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                    <item.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ WHY CHOOSE US ══════════ */}
      <section className="py-20 md:py-28 bg-foreground text-background overflow-hidden">
        <div className="container px-4">
          <div className="grid lg:grid-cols-2 gap-14 items-center max-w-6xl mx-auto">
            <motion.div {...fadeUp}>
              <span className="text-xs font-bold text-primary uppercase tracking-widest mb-3 block">Why Foster Connect</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-background mb-6">
                Trusted by Families <br className="hidden md:block" />Across the UK
              </h2>
              <p className="text-background/60 mb-8 leading-relaxed">
                We make finding the right fostering agency simple, transparent, and completely free.
              </p>
              <div className="space-y-5">
                {[
                  { icon: Shield, title: "Ofsted Verified", desc: "Every agency is registered and rated by Ofsted or the relevant authority." },
                  { icon: Star, title: "Real Carer Reviews", desc: "Authentic reviews from foster carers who've worked with these agencies." },
                  { icon: Heart, title: "All Fostering Types", desc: "Emergency, respite, long-term, therapeutic — find the right match." },
                  { icon: Users, title: "Completely Free", desc: "No hidden fees. Free for prospective foster carers, always." },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="h-11 w-11 rounded-xl bg-background/10 flex items-center justify-center shrink-0">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-background mb-0.5">{item.title}</h3>
                      <p className="text-sm text-background/50">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="mt-8 rounded-xl bg-primary text-primary-foreground font-bold h-12 px-6" asChild>
                <Link to="/search">
                  Find an Agency <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
            <motion.div {...fadeUp} transition={{ delay: 0.15 }} className="relative hidden lg:block">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden border border-background/10">
                <img
                  src="https://images.unsplash.com/photo-1536640712-4d4c36ff0e4e?auto=format&fit=crop&q=80&w=800"
                  alt="Happy foster family spending time together"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-card border border-border rounded-2xl p-5 shadow-xl text-foreground">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <BadgeCheck className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold">{realCounts?.clinics?.toLocaleString() || "500+"}</p>
                    <p className="text-xs text-muted-foreground">Verified Agencies</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════ BROWSE BY REGION ══════════ */}
      <section className="py-20 md:py-28">
        <div className="container px-4">
          <motion.div {...fadeUp} className="text-center mb-12">
            <span className="inline-flex items-center gap-2 bg-primary/8 rounded-full px-4 py-1.5 mb-4">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-bold text-primary">Explore Regions</span>
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground">
              Agencies Across the <span className="text-primary">UK</span>
            </h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
              Browse fostering agencies by region to find one near you.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-w-4xl mx-auto">
            {ACTIVE_STATES.map((region, i) => (
              <motion.div key={region.slug} {...stagger} transition={{ delay: i * 0.03 }}>
                <Link
                  to={`/${region.slug}`}
                  className="group flex items-center gap-2.5 bg-card border border-border rounded-xl px-4 py-3.5 hover:border-primary/30 hover:shadow-md transition-all"
                >
                  <MapPin className="h-4 w-4 text-primary/40 group-hover:text-primary transition-colors shrink-0" />
                  <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">{region.name}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ FOSTERING CATEGORIES ══════════ */}
      {popularTreatments.length > 0 && (
        <section className="py-20 md:py-28 bg-muted/30">
          <div className="container px-4">
            <motion.div {...fadeUp} className="flex items-end justify-between mb-10">
              <div>
                <span className="inline-flex items-center gap-2 bg-primary/8 rounded-full px-4 py-1.5 mb-4">
                  <Heart className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-bold text-primary">Fostering Types</span>
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground">Explore Categories</h2>
              </div>
              <Link to="/categories" className="hidden md:inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline">
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {popularTreatments.map((treatment, i) => (
                <motion.div key={treatment.id} {...stagger} transition={{ delay: i * 0.04 }}>
                  <Link to={`/categories/${treatment.slug}`} className="group flex items-center justify-between bg-card border border-border rounded-xl p-5 hover:border-primary/30 hover:shadow-md transition-all">
                    <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{treatment.name}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </Link>
                </motion.div>
              ))}
            </div>
            <div className="md:hidden text-center mt-8">
              <Link to="/categories" className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline">
                View All Categories <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ══════════ TESTIMONIALS ══════════ */}
      <section className="py-20 md:py-28">
        <div className="container px-4">
          <motion.div {...fadeUp} className="text-center mb-12">
            <span className="inline-flex items-center gap-2 bg-gold/10 rounded-full px-4 py-1.5 mb-4">
              <Star className="h-3.5 w-3.5 text-gold fill-gold" />
              <span className="text-xs font-bold text-gold-foreground">Carer Reviews</span>
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground">What Families Say</h2>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div key={activeTestimonial} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>
                <div className="bg-card border border-border rounded-2xl p-8 md:p-10 relative">
                  <Quote className="h-10 w-10 text-primary/10 absolute top-6 right-6" />
                  <p className="text-lg md:text-xl text-foreground leading-relaxed mb-8 relative z-10">
                    "{testimonials[activeTestimonial].text}"
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {testimonials[activeTestimonial].avatar}
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{testimonials[activeTestimonial].name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{testimonials[activeTestimonial].location}</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: testimonials[activeTestimonial].rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-gold fill-gold" />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="flex justify-center gap-2 mt-5">
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setActiveTestimonial(i)} className={`h-2.5 rounded-full transition-all ${i === activeTestimonial ? 'bg-primary w-8' : 'bg-border w-2.5 hover:bg-muted-foreground/30'}`} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ AGENCY CAROUSEL ══════════ */}
      {carouselProfiles.length > 0 && (
        <section className="py-20 md:py-28 bg-muted/30">
          <div className="container px-4">
            <motion.div {...fadeUp} className="text-center mb-12">
              <span className="inline-flex items-center gap-2 bg-primary/8 rounded-full px-4 py-1.5 mb-4">
                <BadgeCheck className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-bold text-primary">Featured Agencies</span>
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-foreground">Top-Rated Agencies</h2>
            </motion.div>
            <AutoScrollCarousel doctors={carouselProfiles} autoScrollSpeed={25} />
            <div className="text-center mt-10">
              <Button variant="outline" className="rounded-xl font-bold h-11 px-6" asChild>
                <Link to="/search">View Full Directory <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* ══════════ FOR AGENCIES ══════════ */}
      <section className="py-20 md:py-28">
        <div className="container px-4">
          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-primary/8 via-card to-accent/10 border border-primary/15 rounded-3xl p-8 md:p-14">
              <div className="grid md:grid-cols-2 gap-10 items-center">
                <div>
                  <span className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-1.5 mb-4">
                    <Building2 className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-bold text-primary">For Agencies</span>
                  </span>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
                    Grow Your Agency
                  </h2>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Join the UK's leading fostering directory and connect with prospective carers actively searching for agencies.
                  </p>
                  <div className="space-y-3 mb-8">
                    {["Free agency listing", "Showcase Ofsted rating", "Manage enquiries & reviews", "Analytics dashboard"].map((item, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-sm font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                  <Button className="rounded-xl bg-primary text-primary-foreground font-bold h-12 px-6" asChild>
                    <Link to="/list-your-agency">
                      List Your Agency <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <div className="hidden md:flex justify-center">
                  <div className="w-56 h-56 rounded-3xl bg-primary/8 border border-primary/10 flex items-center justify-center">
                    <Building2 className="h-24 w-24 text-primary/20" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ FAQ ══════════ */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div {...fadeUp} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold text-foreground">
                Frequently Asked Questions
              </h2>
              <p className="text-muted-foreground mt-3">Quick answers to help you get started.</p>
            </motion.div>
            <div className="space-y-3">
              {[
                { q: "How do I find a fostering agency near me?", a: "Use our search to select your region and city. Browse verified agency profiles with Ofsted ratings, carer reviews, and fostering types." },
                { q: "Is Foster Connect free to use?", a: "Yes, completely free for prospective foster carers. Search, compare, and enquire with agencies at no cost." },
                { q: "Are agencies verified?", a: "All agencies are registered with Ofsted or the relevant regulatory body. Look for the verified badge for additional verification." },
                { q: "What types of fostering are available?", a: "Emergency, respite, long-term, short-term, therapeutic, parent & child fostering, and specialist placements for children with complex needs." },
              ].map((faq, i) => (
                <motion.div key={i} {...stagger} transition={{ delay: i * 0.05 }}>
                  <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/20 transition-colors">
                    <h3 className="text-[15px] font-bold text-foreground mb-2">{faq.q}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link to="/faq/" className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline">
                View all FAQs <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ FINAL CTA ══════════ */}
      <section className="py-20 md:py-28 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="container px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-primary-foreground mb-5">
              Ready to Start Your Fostering Journey?
            </h2>
            <p className="text-primary-foreground/70 mb-10 max-w-lg mx-auto text-lg">
              Join families across the UK who've found their ideal fostering agency through our platform.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" variant="secondary" className="rounded-xl font-bold h-12 px-8 text-base" asChild>
                <Link to="/search">
                  Find an Agency <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-xl font-bold h-12 px-8 text-base border-primary-foreground/30 text-primary-foreground bg-primary-foreground/10 hover:bg-primary-foreground/20" asChild>
                <Link to="/list-your-agency">
                  <Building2 className="mr-2 h-4 w-4" /> I'm an Agency
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomeV2;
