import { useState, useEffect, useRef } from "react";
import {
  ArrowRight, Shield, Star, MapPin,
  Heart, Search, Building2, Calendar,
  ChevronRight, ChevronLeft, BadgeCheck, Users,
  Quote, CheckCircle, Sparkles, Play,
  Phone, BookOpen, Award, Home, HandHeart,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SearchBox } from "@/components/SearchBox";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { SEOHead } from "@/components/seo/SEOHead";
import { useSeoPageContent } from "@/hooks/useSeoPageContent";
import { useStatesWithClinics } from "@/hooks/useLocations";
import { useRealCounts } from "@/hooks/useRealCounts";
import { useTreatments } from "@/hooks/useTreatments";
import { useTopAgenciesPerLocation } from "@/hooks/useProfiles";
import { ACTIVE_STATES } from "@/lib/constants/activeStates";
import { FOSTERING_CATEGORIES, POPULAR_CITIES } from "@/lib/constants/activeRegions";

import heroIllustration from "@/assets/hero-illustration.png";
import whyFosterImg from "@/assets/why-foster-illustration.png";

/* ───── animation helpers ───── */
const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const stagger = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

/* ───── typing effect texts ───── */
const heroRotatingTexts = [
  "Long-Term Fostering",
  "Emergency Fostering",
  "Therapeutic Care",
  "Respite Fostering",
  "Parent & Child",
  "Short-Term Fostering",
];

/* ───── testimonials ───── */
const testimonials = [
  { name: "Sarah Thompson", location: "London", text: "Foster Care helped us find the perfect agency. The whole process was straightforward and we felt supported throughout our fostering journey.", rating: 5, avatar: "ST" },
  { name: "James Richardson", location: "Birmingham", text: "We were nervous about fostering but the agency we found through Foster Care provided amazing training and 24/7 support.", rating: 5, avatar: "JR" },
  { name: "Maria Khan", location: "Manchester", text: "The reviews and agency profiles were incredibly helpful. Found a brilliant therapeutic fostering agency near us within days!", rating: 5, avatar: "MK" },
  { name: "David & Claire", location: "Leeds", text: "As first-time carers, the directory gave us confidence. We could see Ofsted ratings, real reviews, and compare agencies side by side.", rating: 5, avatar: "DC" },
];

/* ═══════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════ */
const HomeV2 = () => {
  const { data: realCounts } = useRealCounts();
  const { data: treatments } = useTreatments();
  const { data: profiles } = useTopAgenciesPerLocation(30);
  const { data: seoContent } = useSeoPageContent("/");
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [heroTextIdx, setHeroTextIdx] = useState(0);
  const agencyScrollRef = useRef<HTMLDivElement>(null);

  /* rotate hero text */
  useEffect(() => {
    const id = setInterval(() => setHeroTextIdx(i => (i + 1) % heroRotatingTexts.length), 3000);
    return () => clearInterval(id);
  }, []);

  /* auto rotate testimonials */
  useEffect(() => {
    const id = setInterval(() => setActiveTestimonial(i => (i + 1) % testimonials.length), 6000);
    return () => clearInterval(id);
  }, []);

  const popularTreatments = treatments?.slice(0, 8) || [];

  const agencyProfiles = profiles?.map(p => ({
    name: p.name,
    specialty: p.specialty || "Fostering Agency",
    location: p.location || "UK",
    rating: p.rating,
    image: p.image || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400",
    slug: p.slug,
    type: p.type,
  })) || [];

  const scrollAgencies = (dir: "left" | "right") => {
    if (!agencyScrollRef.current) return;
    const amount = agencyScrollRef.current.clientWidth * 0.8;
    agencyScrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={seoContent?.meta_title || "Find Fostering Agencies in England & UK | Foster Care"}
        description={seoContent?.meta_description || "Find Ofsted-rated fostering agencies across England. Compare reviews, explore fostering types & connect with agencies near you."}
        canonical="/"
      />
      <Navbar />

      {/* ══════════════════════════════════════════════════════
          HERO — Full-width centered with illustration + search
          ══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden min-h-[92vh] flex items-center">
        {/* Background decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-background to-accent/10" />

          {/* Large ambient orbs */}
          <motion.div
            className="absolute -top-32 right-[10%] w-[500px] h-[500px] bg-primary/[0.06] rounded-full blur-[120px]"
            animate={{ scale: [1, 1.15, 1], opacity: [0.06, 0.1, 0.06] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-0 left-[5%] w-[400px] h-[400px] bg-gold/[0.08] rounded-full blur-[100px]"
            animate={{ scale: [1, 1.1, 1], opacity: [0.08, 0.12, 0.08] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/[0.03] rounded-full blur-[160px]"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />

          {/* Floating decorative shapes */}
          <motion.div
            className="absolute top-[18%] left-[8%] w-3 h-3 bg-primary/30 rounded-full"
            animate={{ y: [-8, 8, -8] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-[30%] right-[12%] w-5 h-5 border-2 border-primary/20 rounded-full"
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
          <motion.div
            className="absolute bottom-[25%] left-[15%] w-4 h-4 border-2 border-gold/20 rounded-full"
            animate={{ y: [-6, 6, -6] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
          <motion.div
            className="absolute top-[45%] right-[8%] text-primary/10 text-4xl font-bold select-none"
            animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          >
            +
          </motion.div>
          <motion.div
            className="absolute bottom-[35%] right-[25%] text-gold/10 text-3xl font-bold select-none"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          >
            ♥
          </motion.div>

          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage: "linear-gradient(hsl(var(--foreground) / 0.15) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground) / 0.15) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />

          {/* Curved decorative line */}
          <svg className="absolute bottom-0 left-0 w-full opacity-[0.06]" viewBox="0 0 1440 200" preserveAspectRatio="none">
            <path d="M0 120 Q360 60 720 120 T1440 100" stroke="hsl(var(--primary))" strokeWidth="2" fill="none" />
            <path d="M0 150 Q360 90 720 150 T1440 130" stroke="hsl(var(--gold))" strokeWidth="1.5" fill="none" />
          </svg>
        </div>

        <div className="container relative z-10 py-20 md:py-28 lg:py-32 px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-primary/8 border border-primary/15 rounded-full px-5 py-2 mb-8"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-primary">UK's #1 Fostering Agency Directory</span>
            </motion.div>

            {/* Main heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-foreground tracking-tight leading-[1.06] mb-4"
            >
              Every Child Deserves a{" "}
              <span className="relative inline-block">
                <span className="text-primary">Loving Home</span>
                <svg className="absolute -bottom-1.5 left-0 w-full" viewBox="0 0 240 10" fill="none">
                  <path d="M2 8C60 2 180 2 238 8" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" opacity="0.25" />
                </svg>
              </span>
            </motion.h1>

            {/* Rotating text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-4 h-8 flex items-center justify-center"
            >
              <span className="text-muted-foreground text-lg font-medium">
                Explore{" "}
                <AnimatePresence mode="wait">
                  <motion.span
                    key={heroTextIdx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="inline-block text-primary font-bold"
                  >
                    {heroRotatingTexts[heroTextIdx]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Compare Ofsted-rated fostering agencies across England, read real carer reviews, and take the first step on your fostering journey — completely free.
            </motion.p>

            {/* Central illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex justify-center mb-10"
            >
              <img
                src={heroIllustration}
                alt="Happy foster family illustration"
                className="h-40 md:h-56 lg:h-64 w-auto object-contain drop-shadow-lg"
              />
            </motion.div>

            {/* Search Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="max-w-3xl mx-auto"
            >
              <SearchBox variant="hero" />
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap justify-center gap-6 md:gap-10 mt-10"
            >
              {[
                { icon: Building2, value: realCounts?.clinics?.toLocaleString() || "500+", label: "Agencies" },
                { icon: MapPin, value: realCounts?.cities?.toLocaleString() || "100+", label: "Cities" },
                { icon: Star, value: "4.8★", label: "Avg Rating" },
                { icon: Shield, value: "Free", label: "To Use" },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-primary/8 flex items-center justify-center">
                    <stat.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <span className="text-lg font-black text-foreground">{stat.value}</span>
                    <span className="text-xs text-muted-foreground ml-1.5 font-medium">{stat.label}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full h-10 md:h-14" preserveAspectRatio="none">
            <path d="M0 60V30C240 8 480 0 720 15C960 30 1200 40 1440 20V60H0Z" className="fill-muted/30" />
          </svg>
        </div>
      </section>

      {/* ══════════ TRUST BAR ══════════ */}
      <section className="bg-muted/30 border-b border-border py-4">
        <div className="container px-4">
          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-2 text-sm text-muted-foreground">
            {[
              { icon: BadgeCheck, text: "Ofsted Registered" },
              { icon: Shield, text: "DBS Checked" },
              { icon: Star, text: "Verified Reviews" },
              { icon: Users, text: "100% Free" },
            ].map((item, i) => (
              <span key={i} className="flex items-center gap-2">
                <item.icon className="h-4 w-4 text-primary" />
                <span className="font-semibold">{item.text}</span>
              </span>
            ))}
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
              Start Your Journey in <span className="text-primary">3 Simple Steps</span>
            </h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
              Finding the right fostering agency has never been easier.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { step: "01", title: "Search", description: "Select your region and the type of fostering you're interested in.", icon: Search, color: "from-primary/10 to-teal/10" },
              { step: "02", title: "Compare", description: "Browse profiles, Ofsted ratings, and genuine carer reviews side by side.", icon: Star, color: "from-gold/10 to-accent" },
              { step: "03", title: "Enquire", description: "Contact your chosen agency directly and begin your fostering journey.", icon: Phone, color: "from-blue-custom/10 to-primary/5" },
            ].map((item, i) => (
              <motion.div key={i} {...stagger} transition={{ delay: i * 0.1 }}>
                <div className="group relative bg-card border border-border rounded-2xl p-7 h-full hover:border-primary/20 hover:shadow-lg transition-all duration-300">
                  <div className="absolute top-5 right-5 text-5xl font-black text-muted/40 select-none">{item.step}</div>
                  <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
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

      {/* ══════════ FOSTERING TYPES — Text interlinks for SEO ══════════ */}
      <section className="py-20 md:py-28 bg-muted/30 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-10 right-0 w-80 h-80 bg-primary/[0.03] rounded-full blur-[100px] pointer-events-none" />
        <div className="container px-4">
          <motion.div {...fadeUp} className="text-center mb-12">
            <span className="inline-flex items-center gap-2 bg-primary/8 rounded-full px-4 py-1.5 mb-4">
              <Heart className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-bold text-primary">Fostering Types</span>
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground">
              Explore All Types of <span className="text-primary">Foster Care</span>
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Every child's needs are unique. Learn about the different types of fostering to find the right match for your family.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {FOSTERING_CATEGORIES.map((cat, i) => (
                <motion.div key={cat.slug} {...stagger} transition={{ delay: i * 0.05 }}>
                  <Link
                    to={`/services/${cat.slug}/`}
                    className="group flex items-center gap-4 bg-card border border-border rounded-xl px-5 py-4 hover:border-primary/30 hover:shadow-md hover:bg-primary/[0.02] transition-all"
                  >
                    <div className="h-10 w-10 rounded-xl bg-primary/8 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                      <HandHeart className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors block">
                        {cat.name}
                      </span>
                      <span className="text-xs text-muted-foreground">Learn more →</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                  </Link>
                </motion.div>
              ))}
            </div>

            <motion.div {...fadeUp} className="mt-8 text-center">
              <Button variant="outline" className="rounded-xl font-bold h-11 px-6" asChild>
                <Link to="/categories/">
                  View All Categories <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════ WHY FOSTER CONNECT — Split layout with illustration ══════════ */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="container px-4">
          <div className="grid lg:grid-cols-2 gap-14 items-center max-w-6xl mx-auto">
            <motion.div {...fadeUp}>
              <span className="text-xs font-bold text-primary uppercase tracking-widest mb-3 block">Why Foster Care</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-6">
                Trusted by Families Across the UK
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                We make finding the right fostering agency simple, transparent, and completely free. Our platform connects prospective foster carers with Ofsted-rated agencies across England and the wider UK.
              </p>
              <div className="space-y-5">
                {[
                  { icon: Shield, title: "Ofsted Verified", desc: "Every agency listed is registered and rated by Ofsted or the relevant authority." },
                  { icon: Star, title: "Real Carer Reviews", desc: "Authentic reviews from foster carers who've worked with these agencies." },
                  { icon: Heart, title: "All Fostering Types", desc: "Emergency, respite, long-term, therapeutic — find the right match." },
                  { icon: Users, title: "Completely Free", desc: "No hidden fees. Free for prospective foster carers, always." },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="h-11 w-11 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground mb-0.5">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="mt-8 rounded-xl bg-primary text-primary-foreground font-bold h-12 px-6" asChild>
                <Link to="/search/">
                  Find an Agency <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
            <motion.div {...fadeUp} transition={{ delay: 0.15 }} className="hidden lg:flex justify-center">
              <img
                src={whyFosterImg}
                alt="Children playing together — fostering illustration"
                className="w-full max-w-md h-auto object-contain drop-shadow-xl"
                loading="lazy"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════ TOP AGENCIES — Horizontal slider by city ══════════ */}
      {agencyProfiles.length > 0 && (
        <section className="py-20 md:py-28 bg-foreground text-background overflow-hidden">
          <div className="container px-4">
            <motion.div {...fadeUp} className="text-center mb-12">
              <span className="inline-flex items-center gap-2 bg-background/10 rounded-full px-4 py-1.5 mb-4">
                <Award className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-bold text-primary">Top Agencies</span>
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-background">
                Top-Rated Agencies Across the UK
              </h2>
              <p className="text-background/50 mt-3 max-w-lg mx-auto">
                Browse highly-rated fostering agencies from cities across England. Click any agency to view their full profile.
              </p>
            </motion.div>

            {/* Slider controls */}
            <div className="flex justify-end gap-2 mb-5">
              <button
                onClick={() => scrollAgencies("left")}
                className="h-10 w-10 rounded-full border border-background/20 flex items-center justify-center hover:bg-background/10 transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-5 w-5 text-background/70" />
              </button>
              <button
                onClick={() => scrollAgencies("right")}
                className="h-10 w-10 rounded-full border border-background/20 flex items-center justify-center hover:bg-background/10 transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight className="h-5 w-5 text-background/70" />
              </button>
            </div>

            {/* Horizontal scroll */}
            <div
              ref={agencyScrollRef}
              className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {agencyProfiles.map((agency, i) => (
                <Link
                  key={`${agency.slug}-${i}`}
                  to={agency.type === "clinic" ? `/clinic/${agency.slug}/` : `/dentist/${agency.slug}/`}
                  className="group flex-none w-72 snap-start bg-background/5 backdrop-blur-sm border border-background/10 rounded-2xl overflow-hidden hover:bg-background/10 hover:border-background/20 transition-all"
                >
                  <div className="h-40 overflow-hidden">
                    <img
                      src={agency.image}
                      alt={agency.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-background text-base mb-1 truncate group-hover:text-primary transition-colors">
                      {agency.name}
                    </h3>
                    <p className="text-xs text-background/50 mb-2">{agency.specialty}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-background/40" />
                        <span className="text-xs text-background/50">{agency.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-gold fill-gold" />
                        <span className="text-xs text-background/70 font-bold">{agency.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-10">
              <Button variant="outline" className="rounded-xl font-bold h-11 px-6 border-background/20 text-background hover:bg-background/10" asChild>
                <Link to="/search/">View Full Directory <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* ══════════ BROWSE BY REGION — Text anchor interlinks for SEO ══════════ */}
      <section className="py-20 md:py-28">
        <div className="container px-4">
          <motion.div {...fadeUp} className="text-center mb-12">
            <span className="inline-flex items-center gap-2 bg-primary/8 rounded-full px-4 py-1.5 mb-4">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-bold text-primary">Browse by Region</span>
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground">
              Fostering Agencies Across the <span className="text-primary">UK</span>
            </h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
              Find fostering agencies near you. Browse by region to discover local support.
            </p>
          </motion.div>

          {/* Regions as styled text links */}
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {ACTIVE_STATES.map((region, i) => (
                <motion.div key={region.slug} {...stagger} transition={{ delay: i * 0.03 }}>
                  <Link
                    to={`/${region.slug}/`}
                    className="group flex items-center gap-2.5 bg-card border border-border rounded-xl px-4 py-3.5 hover:border-primary/30 hover:shadow-md transition-all"
                  >
                    <MapPin className="h-4 w-4 text-primary/40 group-hover:text-primary transition-colors shrink-0" />
                    <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                      {region.name}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Popular cities as inline text anchors for SEO crawling */}
          <motion.div {...fadeUp} className="max-w-4xl mx-auto mt-10 text-center">
            <h3 className="text-lg font-bold text-foreground mb-4">Popular Cities</h3>
            <div className="flex flex-wrap justify-center gap-x-1 gap-y-1.5 text-sm">
              {POPULAR_CITIES.map((city, i) => (
                <span key={city.slug}>
                  <Link
                    to={`/england/${city.slug}/`}
                    className="text-primary font-semibold hover:underline hover:text-primary/80 transition-colors"
                  >
                    {city.name}
                  </Link>
                  {i < POPULAR_CITIES.length - 1 && (
                    <span className="text-muted-foreground mx-1">·</span>
                  )}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════ TESTIMONIALS ══════════ */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container px-4">
          <motion.div {...fadeUp} className="text-center mb-12">
            <span className="inline-flex items-center gap-2 bg-gold/10 rounded-full px-4 py-1.5 mb-4">
              <Star className="h-3.5 w-3.5 text-gold fill-gold" />
              <span className="text-xs font-bold text-gold-foreground">Carer Reviews</span>
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground">What Families Say</h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
              Real stories from foster carers who found their agency through Foster Care.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
              >
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
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />{testimonials[activeTestimonial].location}
                        </p>
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
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`h-2.5 rounded-full transition-all ${i === activeTestimonial ? "bg-primary w-8" : "bg-border w-2.5 hover:bg-muted-foreground/30"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ ABOUT FOSTERING — Rich text section for SEO ══════════ */}
      <section className="py-20 md:py-28">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div {...fadeUp}>
              <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-6 text-center">
                Understanding <span className="text-primary">Foster Care</span> in the UK
              </h2>

              <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed space-y-5">
                <p>
                  Foster care provides a safe, nurturing home for children who cannot live with their birth families. In the UK, over <strong className="text-foreground">80,000 children</strong> are in the care system, and there is an ongoing need for more foster carers from all backgrounds and walks of life.
                </p>
                <p>
                  Whether you're interested in{" "}
                  <Link to="/services/long-term-fostering/" className="text-primary font-semibold hover:underline">long-term fostering</Link>,{" "}
                  <Link to="/services/short-term-fostering/" className="text-primary font-semibold hover:underline">short-term placements</Link>,{" "}
                  <Link to="/services/emergency-fostering/" className="text-primary font-semibold hover:underline">emergency fostering</Link>, or{" "}
                  <Link to="/services/therapeutic-fostering/" className="text-primary font-semibold hover:underline">therapeutic care</Link>, our directory helps you compare agencies and find the best fit. Every agency listed on Foster Care is registered with{" "}
                  <strong className="text-foreground">Ofsted</strong> or the relevant regulatory body.
                </p>
                <p>
                  Foster carers receive comprehensive training, a{" "}
                  <strong className="text-foreground">fostering allowance</strong> to cover the child's needs, and{" "}
                  <strong className="text-foreground">24/7 support</strong> from their fostering agency. You don't need to own your home, be married, or have prior childcare experience — agencies welcome applicants from all backgrounds.
                </p>
                <p>
                  The assessment process, known as the{" "}
                  <strong className="text-foreground">Form F assessment</strong>, typically takes 4–6 months and includes home visits, training sessions, and background checks including enhanced{" "}
                  <strong className="text-foreground">DBS checks</strong>. Your fostering agency will guide you through every step.
                </p>
              </div>

              {/* Inline interlinks for deep SEO */}
              <div className="mt-10 pt-8 border-t border-border">
                <h3 className="text-base font-bold text-foreground mb-4">Explore fostering by type:</h3>
                <div className="flex flex-wrap gap-x-1 gap-y-1.5 text-sm">
                  {FOSTERING_CATEGORIES.map((cat, i) => (
                    <span key={cat.slug}>
                      <Link
                        to={`/services/${cat.slug}/`}
                        className="text-primary font-semibold hover:underline"
                      >
                        {cat.name}
                      </Link>
                      {i < FOSTERING_CATEGORIES.length - 1 && (
                        <span className="text-muted-foreground mx-1">·</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════ FOR AGENCIES — CTA ══════════ */}
      <section className="py-20 md:py-28 bg-muted/30">
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
                    Join the UK's leading fostering directory and connect with prospective carers actively searching for agencies in their area.
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
                    <Link to="/list-your-agency/">
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
      <section className="py-20 md:py-28">
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
                { q: "How do I find a fostering agency near me?", a: "Use our search to select your region and city. Browse verified agency profiles with Ofsted ratings, carer reviews, and fostering types offered." },
                { q: "Is Foster Care free to use?", a: "Yes, completely free for prospective foster carers. Search, compare, and enquire with agencies at no cost whatsoever." },
                { q: "Are all agencies verified?", a: "All agencies listed on our directory are registered with Ofsted or the relevant regulatory body for their nation. Look for the verified badge for additional checks." },
                { q: "What types of fostering are available?", a: "Emergency, respite, long-term, short-term, therapeutic, parent & child fostering, and specialist placements for children with complex needs or disabilities." },
                { q: "Do I need experience to become a foster carer?", a: "No prior childcare experience is required. Agencies provide comprehensive training and ongoing support. You need to be over 21, have a spare bedroom, and have time and commitment to give." },
                { q: "How long does the assessment process take?", a: "The Form F assessment typically takes 4–6 months, including training, home visits, interviews, and enhanced DBS background checks." },
              ].map((faq, i) => (
                <motion.div key={i} {...stagger} transition={{ delay: i * 0.04 }}>
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
              Join thousands of families across the UK who've found their ideal fostering agency through our platform.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" variant="secondary" className="rounded-xl font-bold h-12 px-8 text-base" asChild>
                <Link to="/search/">
                  Find an Agency <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-xl font-bold h-12 px-8 text-base border-primary-foreground/30 text-primary-foreground bg-primary-foreground/10 hover:bg-primary-foreground/20" asChild>
                <Link to="/list-your-agency/">
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
