import { useState } from "react";
import { 
  ArrowRight, Shield, Star, MapPin, 
  Heart, Search, Building2, Calendar,
  ChevronRight, BadgeCheck, Users,
  Quote, CheckCircle
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
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4 },
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
    { name: "Sarah T.", location: "London", text: "Foster Connect helped us find the perfect agency. The whole process was straightforward and we felt supported throughout.", rating: 5 },
    { name: "James R.", location: "Birmingham", text: "We were nervous about fostering but the agency we found through Foster Connect provided amazing training and support.", rating: 5 },
    { name: "Maria K.", location: "Manchester", text: "The reviews and agency profiles were super helpful. Found a great therapeutic fostering agency near us!", rating: 5 },
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

      {/* ══════════ HERO ══════════ */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-background to-teal-light/30 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/[0.04] rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
        
        <div className="container relative z-10 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div {...fadeUp} className="inline-flex items-center gap-2 bg-primary/10 border border-primary/15 rounded-full px-4 py-1.5 mb-6">
              <BadgeCheck className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-primary">UK's Trusted Fostering Directory</span>
            </motion.div>

            <motion.h1 {...fadeUp} transition={{ delay: 0.05 }} className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-foreground leading-[1.1] mb-5">
              Find the Right{" "}
              <span className="text-primary">Fostering Agency</span>{" "}
              for Your Family
            </motion.h1>

            <motion.p {...fadeUp} transition={{ delay: 0.1 }} className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl mx-auto">
              Compare Ofsted-rated agencies, read carer reviews, and start your fostering journey — completely free.
            </motion.p>

            <motion.div {...fadeUp} transition={{ delay: 0.15 }} className="max-w-2xl mx-auto mb-8">
              <SearchBox variant="hero" />
            </motion.div>

            <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {[
                { icon: Shield, text: "Ofsted Rated" },
                { icon: Star, text: "4.8 Avg Rating" },
                { icon: Building2, text: `${realCounts?.clinics?.toLocaleString() || '500+'} Agencies` },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-1.5 text-muted-foreground">
                  <item.icon className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{item.text}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <section className="py-16 md:py-20 border-t border-border">
        <div className="container px-4">
          <motion.div {...fadeUp} className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">How It Works</p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">
              Three Simple Steps
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { step: "1", title: "Search", description: "Select your region and the type of fostering you're interested in.", icon: Search, color: "bg-primary/10 text-primary" },
              { step: "2", title: "Compare", description: "Browse profiles, Ofsted ratings, and genuine carer reviews.", icon: Star, color: "bg-gold/10 text-gold" },
              { step: "3", title: "Enquire", description: "Contact your chosen agency and begin your fostering journey.", icon: Calendar, color: "bg-blue-custom/10 text-blue-custom" },
            ].map((item, i) => (
              <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.1 }} className="relative text-center">
                <div className="bg-card border border-border rounded-xl p-6 h-full">
                  <div className={`h-12 w-12 rounded-xl ${item.color} flex items-center justify-center mx-auto mb-4`}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div className="text-xs font-bold text-primary mb-1">Step {item.step}</div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ WHY CHOOSE US ══════════ */}
      <section className="py-16 md:py-20 bg-muted/50">
        <div className="container px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <motion.div {...fadeUp}>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Why Foster Connect</p>
              <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-6">
                Trusted by Families Across the UK
              </h2>
              <div className="space-y-4">
                {[
                  { icon: Shield, title: "Ofsted Verified", desc: "Every agency is registered and rated by Ofsted or the relevant authority." },
                  { icon: Star, title: "Real Reviews", desc: "Authentic reviews from foster carers who've worked with these agencies." },
                  { icon: Heart, title: "All Fostering Types", desc: "Emergency, respite, long-term, therapeutic — find the right match." },
                  { icon: Users, title: "Free to Use", desc: "Completely free for prospective foster carers. No hidden fees." },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <item.icon className="h-4.5 w-4.5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground mb-0.5">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
              <div className="bg-card border border-border rounded-xl p-8 text-center">
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-extrabold mb-1">Foster Connect</h3>
                <p className="text-sm text-muted-foreground mb-6">UK's #1 Fostering Directory</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-muted rounded-lg p-3">
                    <p className="font-extrabold text-lg">{realCounts?.clinics?.toLocaleString() || '500'}+</p>
                    <p className="text-xs text-muted-foreground">Agencies</p>
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <p className="font-extrabold text-lg">{realCounts?.cities?.toLocaleString() || '100'}+</p>
                    <p className="text-xs text-muted-foreground">Cities</p>
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <p className="font-extrabold text-lg">4.8</p>
                    <p className="text-xs text-muted-foreground">Rating</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════ BROWSE BY REGION ══════════ */}
      <section className="py-16 md:py-20 border-t border-border">
        <div className="container px-4">
          <motion.div {...fadeUp} className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Browse by Region</p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">
              Agencies Across the UK
            </h2>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
            {ACTIVE_STATES.map((region) => (
              <Link
                key={region.slug}
                to={`/${region.slug}`}
                className="bg-card border border-border rounded-lg px-4 py-2.5 text-sm font-medium text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
              >
                <MapPin className="inline h-3.5 w-3.5 mr-1.5 opacity-40" />
                {region.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ FOSTERING CATEGORIES ══════════ */}
      {popularTreatments.length > 0 && (
        <section className="py-16 md:py-20 bg-muted/50">
          <div className="container px-4">
            <motion.div {...fadeUp} className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Explore</p>
                <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">Fostering Categories</h2>
              </div>
              <Link to="/categories" className="hidden md:inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {popularTreatments.map((treatment, i) => (
                <motion.div key={treatment.id} {...fadeUp} transition={{ delay: i * 0.03 }}>
                  <Link to={`/categories/${treatment.slug}`} className="group flex items-center justify-between bg-card border border-border rounded-lg p-4 hover:border-primary/30 hover:shadow-sm transition-all">
                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{treatment.name}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </Link>
                </motion.div>
              ))}
            </div>
            <div className="md:hidden text-center mt-6">
              <Link to="/categories" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                View All Categories <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ══════════ TESTIMONIALS ══════════ */}
      <section className="py-16 md:py-20 border-t border-border">
        <div className="container px-4">
          <motion.div {...fadeUp} className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Testimonials</p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">What Carers Say</h2>
          </motion.div>

          <div className="max-w-2xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div key={activeTestimonial} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="bg-card border border-border rounded-xl p-6 md:p-8">
                <Quote className="h-8 w-8 text-primary/15 mb-4" />
                <p className="text-base md:text-lg text-foreground leading-relaxed mb-5">"{testimonials[activeTestimonial].text}"</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-foreground">{testimonials[activeTestimonial].name}</p>
                    <p className="text-xs text-muted-foreground">{testimonials[activeTestimonial].location}</p>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: testimonials[activeTestimonial].rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-gold fill-gold" />
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="flex justify-center gap-2 mt-4">
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setActiveTestimonial(i)} className={`h-2 rounded-full transition-all ${i === activeTestimonial ? 'bg-primary w-6' : 'bg-border w-2 hover:bg-muted-foreground/30'}`} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ AGENCY CAROUSEL ══════════ */}
      {carouselProfiles.length > 0 && (
        <section className="py-16 md:py-20 bg-muted/50">
          <div className="container px-4">
            <motion.div {...fadeUp} className="text-center mb-10">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Featured</p>
              <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">Top-Rated Agencies</h2>
            </motion.div>
            <AutoScrollCarousel doctors={carouselProfiles} autoScrollSpeed={25} />
            <div className="text-center mt-8">
              <Button variant="outline" className="rounded-lg font-medium" asChild>
                <Link to="/search">View Full Directory <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* ══════════ FOR AGENCIES ══════════ */}
      <section className="py-16 md:py-20 border-t border-border">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-foreground text-background rounded-xl p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">For Agencies</p>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-background mb-4">
                    Grow Your Agency
                  </h2>
                  <p className="text-background/60 text-sm mb-6 leading-relaxed">
                    Join the UK's leading fostering directory and connect with prospective carers.
                  </p>
                  <div className="space-y-2 mb-6">
                    {["Free agency listing", "Showcase Ofsted rating", "Manage enquiries", "Build your reputation"].map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-sm text-background/70">{item}</span>
                      </div>
                    ))}
                  </div>
                  <Button className="rounded-lg bg-primary text-primary-foreground font-semibold" asChild>
                    <Link to="/list-your-agency">
                      List Your Agency <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <div className="flex justify-center">
                  <div className="w-48 h-48 rounded-xl bg-background/10 flex items-center justify-center">
                    <Building2 className="h-20 w-20 text-primary/40" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ FAQ ══════════ */}
      <section className="py-16 md:py-20 bg-muted/50">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div {...fadeUp} className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">
                Frequently Asked Questions
              </h2>
            </motion.div>
            <div className="space-y-3">
              {[
                { q: "How do I find a fostering agency near me?", a: "Use our search to select your region and city. Browse verified agency profiles with Ofsted ratings, carer reviews, and fostering types." },
                { q: "Is Foster Connect free to use?", a: "Yes, completely free for prospective foster carers. Search, compare, and enquire with agencies at no cost." },
                { q: "Are agencies verified?", a: "All agencies are registered with Ofsted or the relevant regulatory body. Look for the verified badge." },
                { q: "What types of fostering are available?", a: "Emergency, respite, long-term, short-term, therapeutic, parent & child fostering, and specialist placements." },
              ].map((faq, i) => (
                <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.04 }} className="bg-card border border-border rounded-lg p-5">
                  <h3 className="text-sm font-bold text-foreground mb-1.5">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-6">
              <Link to="/faq/" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                View all FAQs <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ FINAL CTA ══════════ */}
      <section className="py-16 md:py-20 bg-primary">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-extrabold text-primary-foreground mb-4">
              Ready to Start Your Fostering Journey?
            </h2>
            <p className="text-primary-foreground/70 mb-8 max-w-lg mx-auto">
              Join families across the UK who've found their ideal fostering agency through our platform.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button size="lg" variant="secondary" className="rounded-lg font-semibold h-11 px-6" asChild>
                <Link to="/search">
                  Find an Agency <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-lg font-semibold h-11 px-6 border-primary-foreground/30 text-primary-foreground bg-primary-foreground/10 hover:bg-primary-foreground/20" asChild>
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
