import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { getLetterAvatarUrl } from "@/hooks/useProfiles";
import { SEOHead } from "@/components/seo/SEOHead";
import { StructuredData } from "@/components/seo/StructuredData";
import { 
  Search, Shield, Star, Users, MapPin, ArrowRight, 
  Heart, Baby, Calendar, Home, HandHeart, GraduationCap, Award, CheckCircle,
  ChevronRight, ThumbsUp, Wallet, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageLayout } from "@/components/layout/PageLayout";
import { Section } from "@/components/layout/Section";
import { useRealCounts } from "@/hooks/useRealCounts";
import { POPULAR_CITIES } from "@/lib/constants/activeRegions";

const fosteringServices = [
  { name: "Emergency Fostering", slug: "emergency-fostering", icon: Baby, description: "Immediate placements for children in crisis", color: "bg-red-500" },
  { name: "Short-Term", slug: "short-term-fostering", icon: Calendar, description: "Temporary care from weeks to months", color: "bg-blue-500" },
  { name: "Long-Term", slug: "long-term-fostering", icon: Home, description: "Permanent placements for children", color: "bg-green-500" },
  { name: "Respite", slug: "respite-fostering", icon: HandHeart, description: "Temporary breaks for families", color: "bg-purple-500" },
  { name: "Therapeutic", slug: "therapeutic-fostering", icon: GraduationCap, description: "Specialist support for complex needs", color: "bg-amber-500" },
  { name: "Parent & Child", slug: "parent-and-child-fostering", icon: Heart, description: "Support for parent and child together", color: "bg-pink-500" },
];

const testimonials = [
  { name: "Sarah M.", location: "London", text: "We found our perfect agency through FosterCare UK. The support has been incredible throughout our journey.", rating: 5 },
  { name: "James & Claire T.", location: "Manchester", text: "The reviews helped us choose the right agency. Best decision we made for our family.", rating: 5 },
  { name: "Priya K.", location: "Birmingham", text: "As a first-time foster carrier, I felt supported every step of the way.", rating: 5 },
  { name: "Michael R.", location: "Leeds", text: "Excellent directory with verified agencies. Made the process so much easier.", rating: 5 },
];

const trustCredentials = [
  { label: "Ofsted Registered", description: "All agencies verified against Ofsted records" },
  { label: "DBS Checked", description: "Agencies meet safeguarding standards" },
  { label: "Data Protection", description: "ICO-registered, GDPR compliant" },
  { label: "Verified Reviews", description: "Real feedback from foster carers" },
  { label: "Free Service", description: "100% free for prospective carers" },
];

const trustBadges = [
  { icon: Award, title: "Ofsted Registered", desc: "All agencies inspected" },
  { icon: ThumbsUp, title: "Verified Reviews", desc: "Real foster carrier feedback" },
  { icon: Clock, title: "24/7 Support", desc: "Round the clock help" },
  { icon: Wallet, title: "Competitive Rates", desc: "Fair allowances" },
];

function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { counts } = useRealCounts();

  // Fetch real agencies from database - try no filters first
  const { data: dbAgencies, error: agenciesError } = useQuery({
    queryKey: ['featured-agencies'],
    queryFn: async () => {
      // Try agencies table first
      const { data, error } = await supabase
        .from('agencies')
        .select('id, name, slug, rating, review_count, is_verified, city, state, main_image_url, cover_image_url')
        .order('rating', { ascending: false })
        .limit(10);
      
      if (error) console.error('HomePage agencies error:', error.message);
      
      return data || [];
    },
  });

  // Fetch real cities from database
  const { data: dbCities, error: citiesError } = useQuery({
    queryKey: ['cities-with-agency-counts'],
    queryFn: async () => {
      // Try cities table
      const { data, error } = await supabase
        .from('cities')
        .select('id, name, slug, states!inner(abbreviation)')
        .order('name')
        .limit(15);
      
      if (error) {
        console.error('HomePage cities error:', error.message);
        // Try with different query
        const { data: altData } = await supabase
          .from('cities')
          .select('id, name, slug')
          .order('name')
          .limit(15);
        return altData || [];
      }
      return data || [];
    },
  });

  useEffect(() => {
    window.prerenderReady = true;
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  // Use real agencies from DB, fallback to sample data
  const featuredAgencies = dbAgencies || [];
  const totalAgencies = counts?.agencies || 500;
  const totalCities = counts?.cities || 50;

  // Use DB cities or fallback to POPULAR_CITIES constant
  const displayCities = (dbCities || []).length > 0
    ? dbCities
    : POPULAR_CITIES.map(c => ({ id: c.slug, name: c.name, slug: c.slug }));

  return (
    <>
      <SEOHead
        title="Find Fostering Agencies in UK | Foster Care Directory"
        description="Browse verified Ofsted-registered fostering agencies across England, Scotland, Wales, and Northern Ireland. Compare ratings, read reviews, and connect with agencies."
        canonical="/"
        keywords={['fostering agencies UK', 'foster care directory', 'become foster carrier', 'Ofsted registered agencies', 'UK fostering', 'foster agencies near me']}
      />
      <StructuredData type="organization" />
      <PageLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[600px] flex items-center">
        <div className="absolute inset-0 pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1581579186916-5ac1fad4c010?w=1600&q=80"
            alt="Family spending time together"
            className="w-full h-full object-cover"
            loading="eager"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-teal-950/95 via-slate-900/95 to-teal-950/95 pointer-events-none" />
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-teal-500/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px]" />
          </div>
        </div>

        <div className="container relative z-10 px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 mb-6"
            >
              <Shield className="h-4 w-4 text-teal-400" />
              <span className="text-sm font-medium text-white">UK's Leading Fostering Directory</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight"
            >
              Find Trusted <span className="text-teal-400">Fostering Agencies</span> UK
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.2 }}
              className="text-base md:text-lg text-white/70 mb-6 md:mb-8 max-w-2xl mx-auto"
            >
              Connect with {totalAgencies}+ Ofsted-registered fostering agencies across England, Scotland, Wales, and Northern Ireland. Compare ratings, read reviews, and find your perfect match.
            </motion.p>

            {/* Stats Cards */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.3 }}
              className="flex flex-wrap justify-center gap-4 mb-10"
            >
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-5 py-3">
                <Users className="h-5 w-5 text-teal-400" />
                <div className="text-left">
                  <p className="text-xl font-bold text-white">{totalAgencies}+</p>
                  <p className="text-xs text-white/60">Agencies</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-5 py-3">
                <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                <div className="text-left">
                  <p className="text-xl font-bold text-white">4.8</p>
                  <p className="text-xs text-white/60">Avg Rating</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-5 py-3">
                <MapPin className="h-5 w-5 text-teal-400" />
                <div className="text-left">
                  <p className="text-xl font-bold text-white">{totalCities}+</p>
                  <p className="text-xs text-white/60">Cities</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-5 py-3">
                <Shield className="h-5 w-5 text-teal-400" />
                <div className="text-left">
                  <p className="text-xl font-bold text-white">100%</p>
                  <p className="text-xs text-white/60">Ofsted Rated</p>
                </div>
              </div>
            </motion.div>

            {/* Search Box */}
            <motion.form 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.4 }}
              onSubmit={handleSearch}
              className="max-w-xl mx-auto px-2"
            >
              <div className="flex flex-col sm:flex-row shadow-2xl">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by city, service, or agency..."
                  className="flex-1 px-4 py-3 md:px-6 md:py-4 text-base text-gray-900 rounded-t-xl sm:rounded-l-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <Button type="submit" size="lg" className="px-6 py-3 md:px-8 md:py-4 bg-teal-500 hover:bg-teal-600 text-slate-900 font-semibold rounded-b-xl sm:rounded-r-xl mt-2 sm:mt-0">
                  <Search className="h-5 w-5 mr-2" />
                  <span className="hidden sm:inline">Search</span>
                </Button>
              </div>
            </motion.form>

            {/* Quick Links */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.5 }}
              className="flex flex-wrap justify-center gap-3 mt-6"
            >
              <Link to="/categories" className="text-white/60 hover:text-teal-400 text-sm transition-colors">
                Browse Services →
              </Link>
              <Link to="/fostering-agencies/london" className="text-white/60 hover:text-teal-400 text-sm transition-colors">
                London Agencies →
              </Link>
              <Link to="/become-foster-carer" className="text-white/60 hover:text-teal-400 text-sm transition-colors">
                Become a Foster Carer →
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" className="w-full h-16 md:h-24" preserveAspectRatio="none">
            <path d="M0 80V40C240 10 480 0 720 20C960 40 1200 50 1440 30V80H0Z" className="fill-background" />
          </svg>
        </div>
      </section>

      {/* Trust Badges Section - Dark Background */}
      <Section size="md" className="bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-subtle-dots opacity-30 pointer-events-none" />
        <div className="relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trustBadges.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}>
                <Card className="text-center py-6 bg-slate-800/50 border-slate-700 hover:border-teal-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/5 hover:-translate-y-1">
                  <CardContent className="p-0">
                    <div className="w-14 h-14 rounded-full bg-teal-500/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-teal-500/20 transition-colors">
                      <item.icon className="h-7 w-7 text-teal-400" />
                    </div>
                    <h3 className="font-bold text-white">{item.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* Fostering Types Section - Dark Background */}
      <div className="bg-section-divider-top relative">
      <Section size="lg" className="bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-subtle-grid opacity-20 pointer-events-none" />
        <div>
          <div className="text-center mb-10">
            <Badge className="mb-3 bg-teal-500/20 text-teal-400 border-teal-500/30">Types of Fostering</Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Find the Right Fostering Type</h2>
            <p className="text-slate-400 mt-2">Explore different types of fostering to find what suits your family</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
            {fosteringServices.map((service, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
                <Link to={`/categories/${service.slug}/`}>
                  <Card className="group bg-slate-800/50 border-slate-700 hover:border-teal-500/50 hover:bg-teal-500/10 transition-all duration-300 cursor-pointer h-full">
                    <CardContent className="p-5 flex flex-col items-center text-center">
                      <div className={`w-14 h-14 rounded-full ${service.color}/20 flex items-center justify-center mb-3 group-hover:${service.color}/30 transition-colors`}>
                        <service.icon className="h-7 w-7 text-teal-400" />
                      </div>
                      <h3 className="font-bold text-white group-hover:text-teal-400 transition-colors">{service.name}</h3>
                      <p className="text-sm text-slate-400 mt-1">{service.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" size="lg" className="border-teal-500 text-teal-400 hover:bg-teal-500/20" asChild>
              <Link to="/categories">
                View All Services
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </Section></div>

      {/* Browse by City Section - Dark Background */}
      <Section size="lg" className="bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-subtle-dots opacity-20 pointer-events-none" />
        <div>
          <div className="text-center mb-10">
            <Badge className="mb-3 bg-teal-500/20 text-teal-400 border-teal-500/30">Popular Locations</Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Browse Agencies by City</h2>
            <p className="text-slate-400 mt-2">Find fostering agencies in major UK cities and towns</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
            {displayCities.map((city: any, i: number) => (
              <motion.div key={city.id || i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
                <Link to={`/fostering-agencies/${city.slug}/`}>
                  <Card className="group bg-slate-800/50 border-slate-700 hover:border-teal-500/50 hover:bg-teal-500/10 transition-all duration-300 cursor-pointer">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-white group-hover:text-teal-400 transition-colors">{city.name}</h3>
                        <p className="text-xs text-slate-400">Agencies</p>
                      </div>
                      <div className="flex items-center gap-1 text-teal-400">
                        <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" size="lg" className="border-teal-500 text-teal-400 hover:bg-teal-500/20" asChild>
              <Link to="/fostering-agencies">
                View All Locations
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
</Section>

      {/* Featured Agencies - Auto-scrolling Carousel with Images */}
      <div className="bg-section-divider-top relative">
      <Section size="lg" className="bg-slate-900 overflow-hidden relative">
        <div className="absolute inset-0 bg-subtle-grid opacity-10 pointer-events-none" />
        <div>
          <div className="text-center mb-10">
            <Badge className="mb-3 bg-teal-500/20 text-teal-400 border-teal-500/30">Top Rated</Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Featured Fostering Agencies</h2>
            <p className="text-slate-400 mt-2">Top-rated fostering agencies from each UK city</p>
          </div>

          <div className="relative overflow-hidden">
            {featuredAgencies.length > 0 ? (
              <div className="flex animate-scroll gap-6" style={{ animation: 'scroll 40s linear infinite' }}>
                {[...featuredAgencies, ...featuredAgencies, ...featuredAgencies].map((agency: any, i: number) => (
                  <Link key={`${agency.id}-${i}`} to={`/agency/${agency.slug}/`} className="shrink-0 w-80">
                    <Card className="group bg-slate-800/50 border-slate-700 hover:border-teal-500/50 hover:shadow-xl hover:shadow-teal-500/10 transition-all duration-300 cursor-pointer overflow-hidden">
                      <div className="aspect-video relative overflow-hidden bg-slate-700">
                        <img 
                          src={agency.main_image_url || agency.cover_image_url || getLetterAvatarUrl(agency.name)}
                          alt={agency.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                          onError={(e: any) => { 
                            e.currentTarget.src = getLetterAvatarUrl(agency.name); 
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />
                        <div className="absolute top-3 right-3">
                          {agency.is_verified && (
                            <Badge className="bg-teal-500 text-white text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                          <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg">
                            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                            <span className="text-sm font-bold text-white">{agency.rating}</span>
                          </div>
                          <span className="text-xs text-white/70 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-lg">
                            {agency.review_count} reviews
                          </span>
                        </div>
                      </div>
                      <CardContent className="p-4 bg-slate-800/50">
                        <h3 className="font-bold text-lg text-white group-hover:text-teal-400 transition-colors truncate">{agency.name}</h3>
                        <p className="text-sm text-slate-400 flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3 shrink-0 text-teal-400" />
                          <span className="truncate">{agency.city}, {agency.state}</span>
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-400 text-lg mb-4">No featured agencies yet</p>
                <p className="text-slate-500 text-sm">Check back soon for our top-rated fostering agencies</p>
              </div>
            )}
          </div>

          {featuredAgencies.length > 0 && (
            <div className="text-center mt-8">
              <Button variant="outline" size="lg" className="border-teal-500 text-teal-400 hover:bg-teal-500/20" asChild>
                <Link to="/search">
                  View All Agencies
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </Section></div>

      {/* Testimonials Section */}
      <section className="relative overflow-hidden bg-slate-950 py-20">
        <div className="absolute inset-0 bg-subtle-dots-lg opacity-20 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-500/20 to-transparent" />
        <div className="container relative px-4">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 text-xs font-bold uppercase tracking-wider mb-4">
              <Star className="h-3.5 w-3.5" /> Success Stories
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Trusted by Foster Carers Across the UK</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Hear from real carers who found their perfect agency through our directory</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6 hover:border-teal-500/30 hover:shadow-xl hover:shadow-teal-500/5 transition-all duration-300 relative group"
              >
                <div className="absolute top-4 right-4 text-4xl text-teal-500/10 font-serif leading-none select-none">"</div>
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, r) => (
                    <Star key={r} className="h-4 w-4 text-amber-500 fill-amber-500" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-4 relative z-10">"{t.text}"</p>
                <div className="border-t border-slate-700/50 pt-3 mt-auto">
                  <p className="font-bold text-white text-sm">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.location}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Credentials Bar */}
      <section className="relative bg-slate-950 border-t border-slate-800/50">
        <div className="container px-4 py-8">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
            {trustCredentials.map((cred, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`flex items-center gap-2 ${cred.label === "Ofsted Registered" ? "trust-badge-ofsted px-3 py-1.5 rounded-full" : ""}`}
              >
                <Shield className={`h-4 w-4 shrink-0 ${cred.label === "Ofsted Registered" ? "text-primary" : "text-teal-400"}`} />
                <div>
                  <span className={`text-sm font-bold ${cred.label === "Ofsted Registered" ? "text-primary" : "text-white"}`}>{cred.label}</span>
                  <span className="text-xs text-slate-500 ml-2 hidden sm:inline">{cred.description}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SEO Content Section - About Fostering */}
      <Section size="lg" className="bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-subtle-grid opacity-10 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-500/15 to-transparent" />
        <div>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <Badge className="mb-3 bg-teal-500/20 text-teal-400 border-teal-500/30">Why Foster Care UK?</Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-white">Find Your Perfect Fostering Agency</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { icon: Shield, title: "Ofsted Registered Agencies", desc: "All fostering agencies on our platform are Ofsted-registered and verified. We help you find trusted foster care services across England, Scotland, Wales, and Northern Ireland." },
                { icon: Star, title: "Honest Reviews & Ratings", desc: "Read genuine reviews from foster carers. Our directory features ratings and feedback to help you choose the best fostering agency for your family." },
                { icon: MapPin, title: "Local Fostering Agencies", desc: "Find fostering agencies near you. We list local foster care providers in every UK city and region, making it easy to find support in your community." },
                { icon: Heart, title: "Support Every Step", desc: "From your first enquiry to becoming a foster carer, find agencies that provide comprehensive support, training, and allowance guidance." },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="bg-slate-900/60 border-slate-800/80 hover:border-teal-500/30 transition-all duration-300 group card-depth">
                    <CardContent className="p-6 md:p-7">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center shrink-0 group-hover:bg-teal-500/20 transition-colors">
                          <item.icon className="h-6 w-6 text-teal-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white group-hover:text-teal-400 transition-colors mb-2">{item.title}</h3>
                          <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-950 via-slate-900 to-teal-950">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-teal-500/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px]" />
        </div>
        
        <Section size="lg">
          <div className="relative z-10 px-4">
            <div className="max-w-3xl mx-auto text-center">
              <Badge className="mb-4 bg-teal-500 text-white">Get Started</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Foster?</h2>
              <p className="text-lg text-white/70 mb-8">
                Take the first step towards becoming a foster carrier. Our directory makes it easy to find the right agency for your family.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" className="h-14 px-8 text-base font-semibold bg-teal-500 hover:bg-teal-600 text-slate-900 rounded-xl" asChild>
                  <Link to="/search">
                    <Search className="mr-2 h-5 w-5" />
                    Find Agencies
                  </Link>
                </Button>
                <Button size="lg" className="h-14 px-8 text-base font-semibold border-2 border-white/40 bg-white/10 text-white hover:bg-white/20 rounded-xl backdrop-blur-sm" asChild>
                  <Link to="/become-foster-carer">
                    Learn More
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
               </div>
               </div>
             </div>
           </Section>
         </section>
       </PageLayout>
      </>  
    );
}

export default HomePage;