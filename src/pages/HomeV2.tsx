import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SEOHead } from "@/components/seo/SEOHead";
import { useSeoPageContent } from "@/hooks/useSeoPageContent";
import { useRealCounts } from "@/hooks/useRealCounts";
import { 
  Heart, Shield, Star, MapPin, ArrowRight, 
  Sparkles, Search, Baby, HeartHandshake, CheckCircle,
  Award, Building2, Users, ArrowDown
} from "lucide-react";
import { useState } from "react";

const HomeV2 = () => {
  const { data: counts } = useRealCounts();
  const [searchQuery, setSearchQuery] = useState("");

  const fosteringTypes = [
    { name: "Short-Term", slug: "short-term-fostering", icon: Baby, color: "bg-amber-500", count: 25 },
    { name: "Long-Term", slug: "long-term-fostering", icon: Heart, color: "bg-pink-500", count: 30 },
    { name: "Emergency", slug: "emergency-fostering", icon: Shield, color: "bg-red-500", count: 15 },
    { name: "Therapeutic", slug: "therapeutic-fostering", icon: Sparkles, color: "bg-purple-500", count: 20 },
    { name: "Respite", slug: "respite-fostering", icon: HeartHandshake, color: "bg-green-500", count: 18 },
    { name: "Parent & Child", slug: "parent-and-child-fostering", icon: Users, color: "bg-blue-500", count: 12 },
    { name: "Disability", slug: "disability-fostering", icon: Award, color: "bg-orange-500", count: 10 },
    { name: "Kinship", slug: "kinship-fostering", icon: Building2, color: "bg-teal-500", count: 8 },
  ];

  const cities = [
    { name: "London", slug: "london", count: 45 },
    { name: "Birmingham", slug: "birmingham", count: 28 },
    { name: "Manchester", slug: "manchester", count: 22 },
    { name: "Leeds", slug: "leeds", count: 18 },
    { name: "Glasgow", slug: "glasgow", count: 15 },
    { name: "Liverpool", slug: "liverpool", count: 14 },
    { name: "Bristol", slug: "bristol", count: 12 },
    { name: "Sheffield", slug: "sheffield", count: 10 },
    { name: "Cardiff", slug: "cardiff", count: 8 },
    { name: "Belfast", slug: "belfast", count: 6 },
  ];

  const featuredAgencies = [
    { name: "Oakleaf Fostering", slug: "oakleaf-fostering", rating: 4.8, reviews: 125, location: "London" },
    { name: "Care First Ltd", slug: "care-first-ltd", rating: 4.6, reviews: 89, location: "Manchester" },
    { name: "Fostering Together", slug: "fostering-together", rating: 4.5, reviews: 67, location: "Birmingham" },
    { name: "National Fostering", slug: "national-fostering", rating: 4.4, reviews: 45, location: "Leeds" },
    { name: "Sunrise Foster Care", slug: "sunrise-foster-care", rating: 4.3, reviews: 32, location: "Liverpool" },
  ];

  const howItWorks = [
    { step: 1, title: "Search Agencies", desc: "Browse by location or service type" },
    { step: 2, title: "Compare & Research", desc: "View ratings and reviews" },
    { step: 3, title: "Contact Agencies", desc: "Send enquiries directly" },
    { step: 4, title: "Start Journey", desc: "Begin your fostering pathway" },
  ];

  const faqs = [
    { q: "How do I find fostering agencies?", a: "Search by location or service type on our directory." },
    { q: "What types of fostering exist?", a: "Short-term, long-term, emergency, respite, therapeutic, and more." },
    { q: "How do I become a foster carer?", a: "Contact an agency directly - they provide training and support." },
    { q: "Are agencies verified?", a: "Look for verified badges on agency profiles." },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <SEOHead title="Find Fostering Agencies in UK | Foster Care" description="Find verified fostering agencies across the UK" />
      <Navbar />

      {/* HERO SECTION - New Clean Design */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-[#0a0a0f]">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </div>

        {/* Floating shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/15 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[150px]" />
        </div>

        <div className="container relative z-10 px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Top Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Badge className="bg-white/10 backdrop-blur-md border-white/20 text-white px-5 py-2">
                <Star className="w-4 h-4 mr-2 text-yellow-400 fill-yellow-400" />
                Trusted by 10,000+ Families
              </Badge>
            </motion.div>

            {/* Main Heading */}
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold text-white leading-[1.1]"
            >
              Find Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-pink-400">
                Perfect Foster
              </span>
              {" "}Agency
            </motion.h1>

            {/* Subtitle */}
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-slate-400 mt-6 max-w-2xl mx-auto"
            >
              Connect with verified fostering agencies across England, Scotland, Wales & Northern Ireland. 
              Your journey to becoming a foster family starts here.
            </motion.p>

            {/* Search Box */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-10"
            >
              <form onSubmit={handleSearch} className="max-w-xl mx-auto">
                <div className="relative">
                  <div className="flex bg-[#151520] border border-white/10 rounded-2xl overflow-hidden">
                    <div className="flex items-center pl-5">
                      <Search className="w-5 h-5 text-slate-500" />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search location, agency or service..."
                      className="flex-1 bg-transparent text-white placeholder-slate-500 px-4 py-5 text-base focus:outline-none"
                    />
                    <Button 
                      type="submit"
                      className="bg-primary hover:bg-primary/90 text-white px-8 rounded-xl font-semibold m-1.5"
                    >
                      Search
                    </Button>
                  </div>
                </div>
              </form>
            </motion.div>

            {/* Quick Stats */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap justify-center gap-6 mt-8"
            >
              <div className="flex items-center gap-2 text-slate-400">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>{counts?.agencies || "150+"} Verified Agencies</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>50+ UK Locations</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>4.8 Avg Rating</span>
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap justify-center gap-3 mt-8"
            >
              {fosteringTypes.slice(0, 4).map((type) => (
                <Link 
                  key={type.slug}
                  to={`/categories/${type.slug}`}
                  className="text-sm text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-full transition-all"
                >
                  {type.name}
                </Link>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* FOSTERING TYPES */}
      <section className="py-20 bg-[#0f0f18]">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Explore Fostering Types</h2>
            <p className="text-slate-400 mt-3">Find the right care for your family</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {fosteringTypes.map((type, i) => (
              <motion.div
                key={type.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Link to={`/categories/${type.slug}`}>
                  <Card className="bg-[#151520] border-white/10 hover:border-primary/50 hover:bg-[#1a1a28] transition-all cursor-pointer group">
                    <CardContent className="p-6 text-center">
                      <div className={`w-14 h-14 ${type.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                        <type.icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="font-bold text-white">{type.name}</h3>
                      <p className="text-xs text-slate-500 mt-1">{type.count} agencies</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CITIES */}
      <section className="py-20 bg-[#0a0a0f]">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Browse by City</h2>
            <p className="text-slate-400 mt-3">Find agencies in your area</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {cities.map((city, i) => (
              <motion.div
                key={city.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
              >
                <Link to={`/fostering-agencies/${city.slug}`}>
                  <Card className="bg-[#151520] border-white/10 hover:border-primary/50 hover:bg-[#1a1a28] transition-all cursor-pointer group">
                    <CardContent className="p-4 text-center">
                      <MapPin className="w-5 h-5 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                      <h3 className="font-medium text-white text-sm">{city.name}</h3>
                      <p className="text-xs text-slate-500">{city.count} agencies</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link to="/locations/england" className="inline-flex items-center gap-2 text-primary hover:underline">
              View all locations <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURED AGENCIES - Horizontal Scroll */}
      <section className="py-20 bg-[#0f0f18]">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Featured Fostering Agencies</h2>
            <p className="text-slate-400 mt-3">Connect with top-rated agencies across the UK</p>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
            {featuredAgencies.map((agency, i) => (
              <motion.div
                key={agency.slug}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="snap-start"
              >
                <Link to={`/agencies/${agency.slug}`}>
                  <Card className="bg-[#151520] border-white/10 hover:border-primary/50 hover:bg-[#1a1a28] transition-all cursor-pointer min-w-[280px]">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                          <Heart className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white">{agency.name}</h3>
                          <p className="text-xs text-slate-500">{agency.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-white font-medium">{agency.rating}</span>
                          <span className="text-slate-500 text-sm">({agency.reviews})</span>
                        </div>
                        <Badge className="bg-green-500/20 text-green-400 text-xs">Verified</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link to="/search" className="inline-flex items-center gap-2 text-primary hover:underline">
              View all agencies <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 bg-[#0a0a0f]">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white">How It Works</h2>
            <p className="text-slate-400 mt-3">Find your perfect agency in 4 simple steps</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {howItWorks.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">{item.step}</span>
                </div>
                <h3 className="font-bold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* E-E-A-T TRUST */}
      <section className="py-20 bg-[#0f0f18]">
        <div className="container px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-bold text-white mb-2">UK-Wide Coverage</h3>
              <p className="text-slate-400 text-sm">Agencies across England, Scotland, Wales & NI</p>
            </div>
            <div className="text-center p-6">
              <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-bold text-white mb-2">Verified Listings</h3>
              <p className="text-slate-400 text-sm">Agency profiles with ratings & reviews</p>
            </div>
            <div className="text-center p-6">
              <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-bold text-white mb-2">Dedicated Support</h3>
              <p className="text-slate-400 text-sm">Focus on finding the right match</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-[#0a0a0f]">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Frequently Asked Questions</h2>
          </div>
          
          <div className="max-w-2xl mx-auto space-y-3">
            {faqs.map((faq, i) => (
              <details key={i} className="group bg-[#151520] border border-white/10 rounded-xl">
                <summary className="flex items-center justify-between p-4 cursor-pointer">
                  <span className="font-medium text-white">{faq.q}</span>
                  <ArrowDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-4 pb-4">
                  <p className="text-slate-400">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary to-pink-600">
        <div className="container px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Start Your Journey?</h2>
          <p className="text-white/80 max-w-xl mx-auto mb-8">Find the perfect fostering agency for your family today.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/search">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 px-8">
                <Search className="w-5 h-5 mr-2" />
                Find Agencies
              </Button>
            </Link>
            <Link to="/become-foster-carer">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8">
                Become a Foster Carer
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomeV2;