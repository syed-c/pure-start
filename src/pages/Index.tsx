import { ArrowRight, Shield, Heart, Search, Building2, MapPin, Star, Users, ChevronRight, Sparkles, CheckCircle, Home, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SearchBox } from "@/components/SearchBox";
import { TypewriterText } from "@/components/TypewriterText";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { SEOHead } from "@/components/seo/SEOHead";
import { StructuredData } from "@/components/seo/StructuredData";
import { POPULAR_CITIES, FOSTERING_CATEGORIES } from "@/lib/constants/activeRegions";
import { useSeoPageContent } from "@/hooks/useSeoPageContent";

// City landmark images
import londonImg from "@/assets/regions/london.jpg";
import birminghamImg from "@/assets/regions/birmingham.jpg";
import manchesterImg from "@/assets/regions/manchester.jpg";
import leedsImg from "@/assets/regions/leeds.jpg";
import liverpoolImg from "@/assets/regions/liverpool.jpg";
import bristolImg from "@/assets/regions/bristol.jpg";
import sheffieldImg from "@/assets/regions/sheffield.jpg";

const cityImages: Record<string, string> = {
  'london': londonImg,
  'birmingham': birminghamImg,
  'manchester': manchesterImg,
  'leeds': leedsImg,
  'liverpool': liverpoolImg,
  'bristol': bristolImg,
  'sheffield': sheffieldImg,
};

const heroTexts = [
  "Emergency Fostering",
  "Long-Term Fostering",
  "Therapeutic Care",
  "Respite Fostering",
  "Parent & Child",
  "Independent Agencies",
];

const benefits = [
  {
    icon: Shield,
    title: "Ofsted Verified",
    description: "Every agency listed is registered and rated by Ofsted or the relevant regulatory body.",
  },
  {
    icon: Heart,
    title: "Trusted & Supportive",
    description: "We connect prospective foster carers with agencies that provide ongoing training and support.",
  },
  {
    icon: Star,
    title: "Real Reviews",
    description: "Read authentic reviews from foster carers across England to help you choose the right agency.",
  },
  {
    icon: Users,
    title: "All Fostering Types",
    description: "From emergency and respite to long-term and therapeutic — find the right match for your family.",
  },
];

const popularCities = POPULAR_CITIES.slice(0, 7);

const ukFaqs = [
  {
    q: "How do I find a fostering agency near me?",
    a: "Use our search to find agencies by city, county, or region across England. Filter by fostering type and agency type (independent or local authority) to find your best match."
  },
  {
    q: "What is the difference between an independent fostering agency and a local authority?",
    a: "Independent fostering agencies (IFAs) are privately run organisations approved by Ofsted. Local authority fostering services are run by your local council. Both recruit, assess, and support foster carers."
  },
  {
    q: "What types of fostering are available?",
    a: "There are several types including short-term, long-term, emergency, respite, parent & child, therapeutic, and specialist fostering for children with complex needs or disabilities."
  },
  {
    q: "Do I need experience to become a foster carer?",
    a: "No prior experience is required. Agencies provide full training and ongoing support. You need to be over 21, have a spare bedroom, and pass assessments. Your background and life experience are valued."
  },
  {
    q: "How long does it take to become a foster carer?",
    a: "The assessment process typically takes 4–6 months. This includes training, home visits, interviews, and background checks. Some agencies offer fast-track options for experienced carers."
  },
];

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const Index = () => {
  const location = useLocation();
  const { data: seoContent } = useSeoPageContent("/");

  const headingFont = "'Varela Round', 'Quicksand', system-ui, sans-serif";

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={seoContent?.meta_title || "Find Fostering Agencies in England & UK | Foster Connect"}
        description={seoContent?.meta_description || "Search Ofsted-rated fostering agencies across England. Compare reviews, explore fostering types & connect with agencies near you. Your fostering journey starts here."}
        canonical="/"
        keywords={['fostering agencies UK', 'foster care England', 'independent fostering agency', 'become a foster carer', 'fostering agencies near me', 'foster care agencies London']}
      />
      <StructuredData type="organization" />
      <Navbar />

      {/* ══════════════════════════════════════════
          HERO — Full-viewport, warm welcoming design
          ══════════════════════════════════════════ */}
      <section className="relative overflow-hidden min-h-[100svh] flex items-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px]" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-emerald/15 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px]" />
        </div>

        <div className="container relative z-10 py-20 md:py-24 lg:py-28 px-5 md:px-8">
          <div className="max-w-5xl mx-auto">
            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-wrap gap-2.5 mb-8 md:mb-10 justify-center lg:justify-start"
            >
              <span className="inline-flex items-center gap-2 bg-primary/15 backdrop-blur-md border border-primary/30 rounded-full px-4 py-2 shadow-lg">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-xs md:text-sm font-bold text-primary">Ofsted Registered</span>
              </span>
              <span className="inline-flex items-center gap-2 bg-gold/15 backdrop-blur-md border border-gold/30 rounded-full px-4 py-2 shadow-lg">
                <Heart className="h-4 w-4 text-gold fill-gold" />
                <span className="text-xs md:text-sm font-bold text-gold">Trusted by Families</span>
              </span>
              <span className="inline-flex items-center gap-2 bg-emerald/15 backdrop-blur-md border border-emerald/30 rounded-full px-4 py-2 shadow-lg">
                <Users className="h-4 w-4 text-emerald" />
                <span className="text-xs md:text-sm font-bold text-emerald">UK-Wide Coverage</span>
              </span>
            </motion.div>

            <div className="grid lg:grid-cols-[1fr,auto] gap-10 lg:gap-16 items-center">
              {/* Left: Headlines + Search */}
              <div className="text-center lg:text-left">
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="leading-[1.05] mb-5"
                  style={{ fontFamily: headingFont }}
                >
                  <span className="block text-[2.75rem] sm:text-6xl md:text-7xl lg:text-[5rem] xl:text-[5.5rem] font-black text-white tracking-tight">
                    Find Your
                  </span>
                  <span className="block text-[2.75rem] sm:text-6xl md:text-7xl lg:text-[5rem] xl:text-[5.5rem] font-black text-primary tracking-tight mt-1">
                    Fostering Agency
                  </span>
                  <span className="block text-[2.75rem] sm:text-6xl md:text-7xl lg:text-[5rem] xl:text-[5.5rem] font-black text-white/80 tracking-tight mt-1">
                    in the UK
                  </span>
                </motion.h1>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mb-6"
                >
                  <span className="text-lg md:text-xl font-semibold text-white/50">
                    Explore{" "}
                    <TypewriterText texts={heroTexts} className="text-primary font-bold" />
                  </span>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-base md:text-lg text-white/40 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed"
                >
                  Search Ofsted-rated fostering agencies across England. Compare reviews, explore fostering types & start your fostering journey today.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="max-w-2xl mx-auto lg:mx-0"
                >
                  <SearchBox variant="hero" />
                </motion.div>
              </div>

              {/* Right: Stats grid */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="hidden lg:grid grid-cols-2 gap-4 w-[280px]"
              >
                {[
                  { value: "500+", label: "Agencies", icon: Building2 },
                  { value: "100+", label: "Cities", icon: MapPin },
                  { value: "4.8★", label: "Rating", icon: Star },
                  { value: "Free", label: "To Use", icon: Heart },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="bg-white/[0.06] backdrop-blur-md border border-white/10 rounded-3xl p-5 text-center hover:bg-white/10 hover:border-primary/30 transition-all duration-300"
                  >
                    <stat.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-black text-white" style={{ fontFamily: headingFont }}>{stat.value}</div>
                    <div className="text-[11px] font-bold text-white/50 uppercase tracking-widest mt-1">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Mobile stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="lg:hidden grid grid-cols-4 gap-2.5 mt-8"
            >
              {[
                { value: "500+", label: "Agencies" },
                { value: "100+", label: "Cities" },
                { value: "4.8★", label: "Rating" },
                { value: "Free", label: "To Use" },
              ].map((stat, i) => (
                <div key={i} className="bg-white/[0.06] backdrop-blur-md border border-white/10 rounded-2xl p-3 text-center">
                  <div className="text-lg font-black text-white" style={{ fontFamily: headingFont }}>{stat.value}</div>
                  <div className="text-[9px] font-bold text-white/50 uppercase tracking-wider mt-0.5">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" className="w-full h-12 md:h-16" preserveAspectRatio="none">
            <path d="M0 80V40C240 10 480 0 720 20C960 40 1200 50 1440 30V80H0Z" className="fill-background" />
          </svg>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          BROWSE BY CITY — Auto-scrolling circles
          ══════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-background relative overflow-hidden">
        <div className="container px-5 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 md:mb-14"
          >
            <span className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-5 py-2.5 mb-5">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-primary">Browse by City</span>
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-foreground" style={{ fontFamily: headingFont }}>
              Find Agencies in Your{" "}
              <span className="text-primary">Area</span>
            </h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto text-base md:text-lg">
              Select your city to discover Ofsted-rated fostering agencies near you.
            </p>
          </motion.div>

          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
            
            <div className="overflow-hidden">
              <motion.div
                className="flex gap-8 md:gap-10 py-4"
                animate={{ x: ['0%', '-50%'] }}
                transition={{ x: { duration: 30, repeat: Infinity, ease: 'linear' } }}
              >
                {[...popularCities, ...popularCities].map((city, idx) => (
                  <Link
                    key={`${city.slug}-${idx}`}
                    to={`/england/${city.slug}`}
                    className="group flex flex-col items-center gap-3 text-center shrink-0"
                  >
                    <div className="h-24 w-24 md:h-28 md:w-28 rounded-full border-3 border-primary/30 overflow-hidden group-hover:scale-110 group-hover:border-primary group-hover:shadow-xl group-hover:shadow-primary/20 transition-all duration-300 relative">
                      <img
                        src={cityImages[city.slug] || londonImg}
                        alt={`${city.name} fostering agencies`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    </div>
                    <span className="font-bold text-sm md:text-base text-foreground group-hover:text-primary transition-colors whitespace-nowrap" style={{ fontFamily: headingFont }}>
                      {city.name}
                    </span>
                  </Link>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOSTERING CATEGORIES
          ══════════════════════════════════════════ */}
      <section className="py-14 md:py-20 bg-muted/30 relative">
        <div className="container px-5 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-12"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground" style={{ fontFamily: headingFont }}>
              Fostering <span className="text-primary">Categories</span>
            </h2>
            <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
              Explore different types of fostering to find what's right for your family.
            </p>
          </motion.div>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-2 max-w-5xl mx-auto"
          >
            {FOSTERING_CATEGORIES.map((cat) => (
              <motion.span key={cat.slug} variants={staggerItem}>
                <Link
                  to={`/categories/${cat.slug}/`}
                  className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-all"
                >
                  <Home className="h-3 w-3" />
                  {cat.name}
                </Link>
              </motion.span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          WHY CHOOSE US
          ══════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 right-[10%] w-48 h-48 bg-primary/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-10 left-[5%] w-40 h-40 bg-emerald/10 rounded-full blur-[80px]" />
        </div>
        <div className="container relative z-10 max-w-6xl px-5 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 md:mb-14"
          >
            <span className="inline-flex items-center gap-2 bg-primary/20 rounded-full px-5 py-2.5 mb-5 border border-primary/30">
              <Heart className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-primary">Why Foster Connect</span>
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white" style={{ fontFamily: headingFont }}>
              The UK's Trusted{" "}
              <span className="text-primary">Fostering Directory</span>
            </h2>
            <p className="text-white/50 mt-3 max-w-xl mx-auto text-base md:text-lg">
              Helping families across England find the right fostering agency with confidence.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5"
          >
            {benefits.map((benefit, i) => (
              <motion.div key={i} variants={staggerItem}>
                <div className="group bg-white/[0.04] backdrop-blur-sm rounded-3xl p-6 md:p-7 text-center border border-white/10 hover:border-primary/40 hover:bg-white/[0.08] transition-all duration-400 h-full">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/20 mb-5 group-hover:scale-110 transition-transform duration-300">
                    <benefit.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-lg md:text-xl font-black mb-2 text-white group-hover:text-primary transition-colors" style={{ fontFamily: headingFont }}>
                    {benefit.title}
                  </h3>
                  <p className="text-white/45 text-sm leading-relaxed">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FAQ SECTION
          ══════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-muted/20 relative">
        <div className="container px-5 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center mb-10"
          >
            <span className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-5 py-2.5 mb-5">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-primary">Fostering FAQ</span>
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-foreground" style={{ fontFamily: headingFont }}>
              Common <span className="text-primary">Questions</span>
            </h2>
          </motion.div>
          <div className="max-w-3xl mx-auto space-y-3">
            {ukFaqs.map((faq, i) => (
              <motion.details
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="group bg-card border border-border rounded-2xl overflow-hidden"
              >
                <summary className="flex items-center justify-between cursor-pointer px-6 py-5 font-bold text-foreground hover:text-primary transition-colors text-sm md:text-base" style={{ fontFamily: headingFont }}>
                  {faq.q}
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-open:rotate-90 transition-transform shrink-0 ml-4" />
                </summary>
                <div className="px-6 pb-5 text-muted-foreground text-sm leading-relaxed">
                  {faq.a}
                </div>
              </motion.details>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button asChild variant="outline" className="rounded-2xl font-black" style={{ fontFamily: headingFont }}>
              <Link to="/faq">View All FAQs <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS — 3 Steps
          ══════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-background relative overflow-hidden">
        <div className="container relative z-10 px-5 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center mb-14"
          >
            <span className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-5 py-2.5 mb-5">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-primary">Simple 3-Step Process</span>
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-foreground mb-3" style={{ fontFamily: headingFont }}>
              How It <span className="text-primary">Works</span>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
              Finding the right fostering agency has never been easier.
            </p>
          </motion.div>

          <div className="max-w-5xl mx-auto">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid md:grid-cols-3 gap-6 lg:gap-10"
            >
              {[
                { step: 1, icon: Search, title: "Search Your Area", desc: "Enter your city or region to find fostering agencies near you. Filter by type and category." },
                { step: 2, icon: CheckCircle, title: "Compare Agencies", desc: "Browse Ofsted-rated profiles, read reviews from foster carers, and compare agency offerings." },
                { step: 3, icon: Phone, title: "Get in Touch", desc: "Send an enquiry, request information, or book an intro call with agencies you're interested in." },
              ].map((item) => (
                <motion.div key={item.step} variants={staggerItem}>
                  <div className="group bg-card rounded-3xl p-7 md:p-8 border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-400 h-full text-center">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center mx-auto mb-5 text-xl font-black shadow-lg shadow-primary/25 group-hover:scale-110 transition-transform" style={{ fontFamily: headingFont }}>
                      {item.step}
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5 group-hover:scale-105 transition-transform">
                      <item.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-black text-foreground mb-3" style={{ fontFamily: headingFont }}>
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" className="rounded-2xl font-black px-10 h-14 text-base shadow-lg shadow-primary/20" style={{ fontFamily: headingFont }}>
              <Link to="/search">
                Start Your Search <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FINAL CTA
          ══════════════════════════════════════════ */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/15 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-emerald/10 rounded-full blur-[100px]" />
        </div>

        <div className="container relative z-10 px-5 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-flex items-center gap-2.5 bg-primary/20 backdrop-blur-sm rounded-full px-5 py-2.5 mb-8 border border-primary/30">
                <Heart className="h-4 w-4 text-primary fill-primary animate-pulse" />
                <span className="text-sm font-bold text-primary">Every Child Deserves a Home</span>
              </span>

              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-[1.1]" style={{ fontFamily: headingFont }}>
                Ready to Start Your
                <span className="block text-primary mt-2">Fostering Journey?</span>
              </h2>

              <p className="text-lg md:text-xl text-white/45 max-w-2xl mx-auto mb-10 leading-relaxed">
                Join hundreds of families across England who've found the right fostering agency through our directory. Your support can change a child's life.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button asChild size="lg" className="rounded-2xl font-black px-10 h-14 text-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/30" style={{ fontFamily: headingFont }}>
                  <Link to="/search">
                    Find an Agency <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-2xl font-black px-10 h-14 text-lg border-2 border-white/20 text-white bg-white/5 hover:bg-white/10" style={{ fontFamily: headingFont }}>
                  <Link to="/list-your-agency">
                    <Building2 className="mr-2 h-5 w-5" /> List Your Agency
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
