import { ArrowRight, Shield, Heart, Search, MapPin, Star, Users, ChevronRight, Sparkles, CheckCircle, Phone, BookOpen, Award, Building2, Globe, HeartHandshake } from "lucide-react";
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
import { useRealCounts } from "@/hooks/useRealCounts";

import londonImg from "@/assets/regions/london.jpg";
import birminghamImg from "@/assets/regions/birmingham.jpg";
import manchesterImg from "@/assets/regions/manchester.jpg";
import leedsImg from "@/assets/regions/leeds.jpg";
import liverpoolImg from "@/assets/regions/liverpool.jpg";
import bristolImg from "@/assets/regions/bristol.jpg";
import sheffieldImg from "@/assets/regions/sheffield.jpg";
import longTermImg from "@/assets/fostering-types/long-term-fostering.jpg";
import therapeuticImg from "@/assets/fostering-types/therapeutic-fostering.jpg";
import emergencyImg from "@/assets/fostering-types/emergency-fostering.jpg";
import parentChildImg from "@/assets/fostering-types/parent-child-fostering.jpg";
import respiteImg from "@/assets/fostering-types/respite-fostering.jpg";
import shortTermImg from "@/assets/fostering-types/short-term-fostering.jpg";
import disabilityImg from "@/assets/fostering-types/disability-fostering.jpg";
import independentImg from "@/assets/fostering-types/independent-agency.jpg";

const cityImages: Record<string, string> = {
  london: londonImg, birmingham: birminghamImg, manchester: manchesterImg,
  leeds: leedsImg, liverpool: liverpoolImg, bristol: bristolImg, sheffield: sheffieldImg,
};

const fosteringImages: Record<string, string> = {
  'long-term-fostering': longTermImg,
  'therapeutic-fostering': therapeuticImg,
  'emergency-fostering': emergencyImg,
  'parent-and-child-fostering': parentChildImg,
  'respite-fostering': respiteImg,
  'short-term-fostering': shortTermImg,
  'disability-complex-needs-fostering': disabilityImg,
  'independent-fostering-agency': independentImg,
  'local-authority-fostering': independentImg,
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
  { icon: Shield, title: "Ofsted Verified", description: "Every agency is registered and inspected by Ofsted for your peace of mind." },
  { icon: HeartHandshake, title: "Dedicated Support", description: "24/7 guidance from enquiry to approval and beyond. We're here to help." },
  { icon: Star, title: "Genuine Reviews", description: "Real stories from real foster families. Make an informed choice." },
  { icon: Globe, title: "UK-Wide Coverage", description: "From London to Edinburgh, find agencies serving your community." },
];

const testimonials = [
  { name: "Sarah M.", location: "London", text: "The team helped us find the perfect agency. Within weeks we had our first placement. The support has been incredible from day one.", rating: 5 },
  { name: "James & Claire T.", location: "Manchester", text: "After months of research, Foster Care made it simple. We read honest reviews and felt confident in our choice.", rating: 5 },
  { name: "Priya K.", location: "Birmingham", text: "As a first-time foster carer, I was nervous. The directory helped me understand my options and find an agency that felt right.", rating: 5 },
];

const popularCities = POPULAR_CITIES.slice(0, 7);

const ukFaqs = [
  { q: "How do I find a fostering agency near me?", a: "Use our search to find agencies by city, county, or region across England. Filter by fostering type and agency type." },
  { q: "What is the difference between an IFA and a local authority?", a: "Independent fostering agencies (IFAs) are privately run and often provide more specialised support. Local authority fostering is run by your local council." },
  { q: "What types of fostering are available?", a: "There are several types including short-term, long-term, emergency, respite, parent & child, therapeutic, and specialist fostering." },
  { q: "Do I need experience to become a foster carrier?", a: "No prior experience is required. Agencies provide full training and ongoing support. You need to be over 21 and have a spare bedroom." },
  { q: "How long does it take to become a foster carrier?", a: "The assessment process typically takes 4–6 months, including training, home visits, interviews, and background checks." },
];

const headingFont = "'DM Sans', 'Quicksand', system-ui, sans-serif";

const Index = () => {
  const { data: seoContent } = useSeoPageContent("/");
  const { data: counts } = useRealCounts();

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={seoContent?.meta_title || "Find Fostering Agencies in England & UK | Foster Care"}
        description={seoContent?.meta_description || "Search Ofsted-rated fostering agencies across England. Compare reviews, explore fostering types & connect with agencies near you."}
        canonical="/"
        keywords={['fostering agencies UK', 'foster care England', 'independent fostering agency', 'become a foster carrier', 'fostering agencies near me']}
      />
      <StructuredData type="organization" />
      <Navbar />

      {/* ==============================
          HERO SECTION — Dark Modern Gradient
          ============================== */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
        {/* Geometric patterns */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[200px]" />
          
          {/* Grid pattern */}
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </div>

        {/* Floating cards decoration */}
        <div className="absolute top-20 left-[10%] hidden lg:block">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 shadow-xl">
            <Shield className="h-8 w-8 text-teal-400" />
          </div>
        </div>
        <div className="absolute bottom-32 right-[15%] hidden lg:block">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 shadow-xl">
            <Heart className="h-8 w-8 text-rose-400" />
          </div>
        </div>

        <div className="container relative z-10 py-20 md:py-28 lg:py-32 px-5 md:px-8">
          <div className="max-w-5xl mx-auto text-center">
            {/* Trust badges */}
            <div
              className="animate-fade-in-up flex flex-wrap gap-3 mb-8 justify-center"
            >
              <span className="inline-flex items-center gap-2 bg-teal-500/20 backdrop-blur-md border border-teal-500/30 rounded-full px-5 py-2.5">
                <Shield className="h-4 w-4 text-teal-400" />
                <span className="text-sm font-semibold text-white">Ofsted Verified</span>
              </span>
              <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-2.5">
                <Heart className="h-4 w-4 text-rose-400 fill-rose-400" />
                <span className="text-sm font-semibold text-white">2,000+ Families</span>
              </span>
            </div>

            {/* Main heading */}
            <h1
              className="animate-fade-in-up mb-6"
              style={{ fontFamily: headingFont, animationDelay: '0.1s' }}
            >
              <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight">
                Find Your Perfect
              </span>
              <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent mt-1">
                Fostering Agency
              </span>
            </h1>

            {/* Subheading with typewriter */}
            <div className="animate-fade-in mb-6" style={{ animationDelay: '0.3s' }}>
              <span className="text-lg md:text-xl font-medium text-slate-400">
                Discover trusted agencies for{" "}
                <TypewriterText texts={heroTexts} className="text-teal-400 font-bold" />
              </span>
            </div>

            {/* Description */}
            <p
              className="animate-fade-in-up text-base md:text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
              style={{ animationDelay: '0.4s' }}
            >
              Connect with Ofsted-rated fostering agencies across England. Read genuine reviews from foster families and find the right match for your journey.
            </p>

            {/* Search box */}
            <div
              className="animate-fade-in-up max-w-3xl mx-auto mb-12"
              style={{ animationDelay: '0.5s' }}
            >
              <SearchBox variant="hero" />
            </div>

{/* Stats */}
            <div
              className="animate-fade-in-up grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto"
              style={{ animationDelay: '0.6s' }}
            >
              {[
                { value: counts?.agencies?.toLocaleString() || "500+", label: "Agencies" },
                { value: counts?.cities?.toLocaleString() || "100+", label: "Cities" },
                { value: "4.8★", label: "Rating" },
                { value: "Free", label: "Search" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white" style={{ fontFamily: headingFont }}>{stat.value}</div>
                  <div className="text-sm font-medium text-slate-500 mt-2">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" fill="none" className="w-full h-20 md:h-24" preserveAspectRatio="none">
            <path d="M0 100V50C240 20 480 0 720 30C960 60 1200 70 1440 40V100H0Z" className="fill-background" />
          </svg>
        </div>
      </section>

      {/* ==============================
          FOSTERING TYPES — Image Cards
          ============================== */}
      <section className="py-20 md:py-28 bg-background relative">
        <div className="container px-5 md:px-8">
          <div
            className="animate-fade-in-up text-center mb-12 md:mb-16"
          >
            <span className="inline-flex items-center gap-2 bg-teal-500/10 rounded-full px-5 py-2.5 mb-5">
              <Heart className="h-4 w-4 text-teal-600" />
              <span className="text-sm font-semibold text-teal-700">Explore Fostering Types</span>
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground" style={{ fontFamily: headingFont }}>
              Find the Right <span className="text-teal-600">Type of Care</span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-base md:text-lg">
              Every child has unique needs. Discover which fostering type suits your family and lifestyle.
            </p>
          </div>

          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {FOSTERING_CATEGORIES.slice(0, 6).map((cat, i) => (
              <div key={cat.slug} className="animate-fade-in-up" style={{ animationDelay: `${0.08 * i}s` }}>
                <Link
                  to={`/services/${cat.slug}`}
                  className="group block bg-card rounded-2xl overflow-hidden border border-border hover:border-teal-500/40 hover:shadow-2xl hover:shadow-teal-500/10 transition-all duration-300"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={fosteringImages[cat.slug] || longTermImg}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-5 left-5 right-5">
                      <h3 className="text-xl font-bold text-white">
                        {cat.name}
                      </h3>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {getFosteringDescription(cat.slug)}
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-teal-600 font-semibold text-sm mt-4 group-hover:gap-2.5 transition-all">
                      Learn more <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button asChild variant="outline-white" className="rounded-full font-semibold px-8">
              <Link to="/categories">View All Fostering Types <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ==============================
          BROWSE BY CITY — Premium Grid
          ============================== */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-muted/20 via-background to-background relative">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/2 right-1/4 w-80 h-80 bg-gold-500/5 rounded-full blur-3xl" />
        </div>
        
        <div className="container px-5 md:px-8 relative z-10">
          <div
            className="animate-fade-in-up text-center mb-12 md:mb-16"
          >
            <span className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-5 py-2.5 mb-5">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Browse by City</span>
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground" style={{ fontFamily: headingFont }}>
              Find Agencies in Your <span className="text-primary">Area</span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-lg mx-auto text-base md:text-lg">
              Select your city to discover Ofsted-rated fostering agencies near you.
            </p>
          </div>

          <style>{`@keyframes marquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-50%); } }`}</style>
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
            <div className="overflow-hidden py-4">
              <div
                className="flex gap-8"
                style={{ animation: 'marquee 35s linear infinite' }}
              >
                {[...popularCities, ...popularCities].map((city, idx) => (
                  <Link
                    key={`${city.slug}-${idx}`}
                    to={`/fostering-agencies/${city.slug}`}
                    className="group flex flex-col items-center gap-3 text-center shrink-0"
                  >
                    <div className="h-28 w-28 md:h-32 md:w-32 rounded-full border-2 border-teal-500/30 overflow-hidden group-hover:scale-110 group-hover:border-teal-500 group-hover:shadow-xl group-hover:shadow-teal-500/20 transition-all duration-300 relative">
                      <img
                        src={cityImages[city.slug] || londonImg}
                        alt={`${city.name} fostering agencies`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>
                    <span className="font-semibold text-sm md:text-base text-foreground group-hover:text-teal-600 transition-colors whitespace-nowrap">
                      {city.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==============================
          WHY CHOOSE US — Dark Section
          ============================== */}
      <section className="py-20 md:py-28 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-[15%] w-64 h-64 bg-teal-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-20 left-[10%] w-56 h-56 bg-emerald-500/8 rounded-full blur-[100px]" />
        </div>
        
        <div className="container relative z-10 px-5 md:px-8">
          <div
            className="animate-fade-in-up text-center mb-12 md:mb-16"
          >
            <span className="inline-flex items-center gap-2 bg-teal-500/20 rounded-full px-5 py-2.5 mb-5 border border-teal-500/30">
              <Award className="h-4 w-4 text-teal-400" />
              <span className="text-sm font-semibold text-teal-400">Why Foster Care</span>
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white" style={{ fontFamily: headingFont }}>
              The UK's Leading{" "}
              <span className="text-teal-400">Fostering Directory</span>
            </h2>
            <p className="text-slate-400 mt-4 max-w-xl mx-auto text-base md:text-lg">
              Trusted by thousands of families across England to find their perfect match.
            </p>
          </div>

          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {benefits.map((benefit, i) => (
              <div key={i} className="animate-fade-in-up" style={{ animationDelay: `${0.08 * i}s` }}>
                <div className="group bg-white/[0.05] backdrop-blur-sm rounded-2xl p-7 text-center border border-white/10 hover:border-teal-500/40 hover:bg-white/[0.08] transition-all duration-300 h-full">
                  <div className="inline-flex items-center justify w-14 h-14 rounded-2xl bg-teal-500/20 mb-5 group-hover:scale-110 transition-transform duration-300">
                    <benefit.icon className="h-7 w-7 text-teal-400" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold mb-3 text-white group-hover:text-teal-400 transition-colors">
                    {benefit.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==============================
          TESTIMONIALS
          ============================== */}
      <section className="py-20 md:py-28 bg-background relative">
        <div className="container px-5 md:px-8">
          <div
            className="animate-fade-in-up text-center mb-12 md:mb-16"
          >
            <span className="inline-flex items-center gap-2 bg-amber-500/10 rounded-full px-5 py-2.5 mb-5">
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              <span className="text-sm font-semibold text-amber-700">Carer Reviews</span>
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground" style={{ fontFamily: headingFont }}>
              Loved by <span className="text-teal-600">Foster Families</span>
            </h2>
          </div>

          <div
            className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto"
          >
            {testimonials.map((t, i) => (
              <div key={i} className="animate-fade-in-up" style={{ animationDelay: `${0.08 * i}s` }}>
                <div className="bg-card rounded-2xl p-7 border border-border hover:border-teal-500/30 hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 text-amber-500 fill-amber-500" />
                    ))}
                  </div>
                  <p className="text-foreground/80 text-sm leading-relaxed flex-1 italic">"{t.text}"</p>
                  <div className="mt-5 pt-4 border-t border-border">
                    <p className="font-bold text-sm text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" /> {t.location}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==============================
          HOW IT WORKS
          ============================== */}
      <section className="py-20 md:py-28 bg-muted/20 relative overflow-hidden">
        <div className="container relative z-10 px-5 md:px-8">
          <div
            className="animate-fade-in-up max-w-3xl mx-auto text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 bg-teal-500/10 rounded-full px-5 py-2.5 mb-5">
              <Sparkles className="h-4 w-4 text-teal-600" />
              <span className="text-sm font-semibold text-teal-700">Simple Process</span>
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4" style={{ fontFamily: headingFont }}>
              How It <span className="text-teal-600">Works</span>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
              Finding the right fostering agency in three simple steps.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div
              className="grid md:grid-cols-3 gap-8"
            >
              {[
                { step: 1, icon: Search, title: "Search", desc: "Enter your location or browse agencies by city. Filter by type, Ofsted rating, and services." },
                { step: 2, icon: CheckCircle, title: "Compare", desc: "Read reviews, view profiles, and compare what each agency offers to find your match." },
                { step: 3, icon: Phone, title: "Connect", desc: "Contact your chosen agencies directly for information or to start your assessment." },
              ].map((item, i) => (
                <div key={item.step} className="animate-fade-in-up" style={{ animationDelay: `${0.08 * i}s` }}>
                  <div className="group bg-card rounded-2xl p-8 border border-border hover:border-teal-500/30 hover:shadow-lg transition-all duration-300 h-full text-center">
                    <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center mx-auto mb-5 text-lg font-bold">
                      {item.step}
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center mx-auto mb-5 group-hover:scale-105 transition-transform">
                      <item.icon className="h-6 w-6 text-teal-600" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==============================
          FAQ SECTION
          ============================== */}
      <section className="py-20 md:py-28 bg-background relative">
        <div className="container px-5 md:px-8">
          <div
            className="animate-fade-in-up max-w-3xl mx-auto text-center mb-12"
          >
            <span className="inline-flex items-center gap-2 bg-teal-500/10 rounded-full px-5 py-2.5 mb-5">
              <BookOpen className="h-4 w-4 text-teal-600" />
              <span className="text-sm font-semibold text-teal-700">Fostering FAQ</span>
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground" style={{ fontFamily: headingFont }}>
              Common <span className="text-teal-600">Questions</span>
            </h2>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-3">
            {ukFaqs.map((faq, i) => (
              <details
                key={i}
                className="animate-fade-in-up group bg-card border border-border rounded-xl overflow-hidden"
                style={{ animationDelay: `${0.04 * i}s` }}
              >
                <summary className="flex items-center justify-between cursor-pointer px-6 py-5 font-semibold text-foreground hover:text-teal-600 transition-colors text-sm md:text-base">
                  {faq.q}
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-open:rotate-90 transition-transform shrink-0 ml-4" />
                </summary>
                <div className="px-6 pb-5 text-muted-foreground text-sm leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <Button asChild variant="outline" className="rounded-full font-semibold px-8">
              <Link to="/faq">View All FAQs <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ==============================
          FINAL CTA
          ============================== */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-teal-500/15 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[250px] bg-emerald-500/10 rounded-full blur-[120px]" />
        </div>

        <div className="container relative z-10 px-5 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-fade-in-up">
              <span className="inline-flex items-center gap-2.5 bg-teal-500/20 backdrop-blur-sm rounded-full px-5 py-2.5 mb-8 border border-teal-500/30">
                <Heart className="h-4 w-4 text-teal-400 fill-teal-400 animate-pulse" />
                <span className="text-sm font-semibold text-teal-400">Every Child Deserves a Home</span>
              </span>

              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight" style={{ fontFamily: headingFont }}>
                Ready to Start Your
                <span className="block text-teal-400 mt-2">Fostering Journey?</span>
              </h2>

              <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                Join thousands of families across England who've found their perfect agency. Your support can transform a child's life.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button asChild size="lg" className="rounded-full font-semibold px-10 h-12 text-base bg-teal-600 hover:bg-teal-700">
                  <Link to="/search">
                    Find an Agency <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full font-semibold px-10 h-12 text-base border-2 border-white/30 bg-transparent text-white hover:bg-white/10">
                  <Link to="/list-your-agency">
                    <Building2 className="mr-2 h-5 w-5" /> List Your Agency
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

function getFosteringDescription(slug: string): string {
  const descriptions: Record<string, string> = {
    'independent-fostering-agency': 'Privately run agencies regulated by Ofsted, offering comprehensive support and training for foster carriers.',
    'local-authority-fostering': 'Council-run services managed by local authorities across England, providing fostering opportunities in your area.',
    'emergency-fostering': 'Urgent placements for children needing immediate care, often available at short notice 24/7.',
    'respite-fostering': 'Planned short breaks to support existing foster carriers or birth families, typically for a few days or weeks.',
    'parent-and-child-fostering': 'Placements where a parent and child are fostered together, providing assessment and support.',
    'therapeutic-fostering': 'Specialist care for children with complex emotional, behavioural, or developmental needs.',
    'long-term-fostering': 'Stable, permanent placements for children who cannot return to their birth families.',
    'short-term-fostering': 'Temporary placements lasting from weeks to months while longer-term plans are arranged.',
    'disability-complex-needs-fostering': 'Specialist care for children with physical disabilities, learning difficulties, or complex health needs.',
  };
  return descriptions[slug] || 'Explore this fostering type to learn more about how you can make a difference.';
}

export default Index;
