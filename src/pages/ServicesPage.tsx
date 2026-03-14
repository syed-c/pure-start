import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageLayout } from "@/components/layout/PageLayout";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { SEOHead } from "@/components/seo/SEOHead";
import { ArrowRight, Sparkles, Shield, Heart, Building2 } from "lucide-react";
import { useRealCounts } from "@/hooks/useRealCounts";
import { useSeoPageContent } from "@/hooks/useSeoPageContent";

const ServicesPage = () => {
  const { data: treatments, isLoading } = useQuery({
    queryKey: ["all-treatments"],
    queryFn: async () => {
      const { data } = await supabase
        .from("treatments")
        .select("*")
        .eq("is_active", true)
        .order("display_order");
      return data || [];
    },
  });

  const { data: states } = useQuery({
    queryKey: ["states-for-services"],
    queryFn: async () => {
      const { data } = await supabase
        .from("states")
        .select("*")
        .eq("is_active", true)
        .order("display_order");
      return data || [];
    },
  });

  const popularTreatments = treatments?.slice(0, 8) || [];
  const allTreatments = treatments || [];
  
  const { data: realCounts } = useRealCounts();
  const { data: seoContent } = useSeoPageContent("services");

  const breadcrumbs = [{ label: "Home", href: "/" }, { label: "Fostering Categories" }];

  return (
    <PageLayout>
      <SEOHead
        title={seoContent?.meta_title || "Fostering Categories — All Types of Foster Care | Foster Connect"}
        description={seoContent?.meta_description || "Explore all types of fostering — from emergency and respite care to long-term and therapeutic placements. Find the right agency for your fostering journey across the UK."}
        canonical="/categories/"
        keywords={['fostering types', 'types of foster care', 'emergency fostering', 'therapeutic fostering', 'respite care', 'long-term fostering']}
      />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[40vh] flex items-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[120px]" />
          <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-gold/10 rounded-full blur-[100px]" />
        </div>
        
        <div className="container relative z-10 py-16 md:py-20 px-5 md:px-8">
          <Breadcrumbs items={breadcrumbs} className="mb-6 [&_a]:text-white/60 [&_span]:text-white/40 [&_svg]:text-white/30" />
          
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="rounded-full px-4 py-2 text-sm font-bold mb-6 bg-primary/15 text-primary border-primary/30 backdrop-blur-md">
              <Sparkles className="h-4 w-4 mr-2" />
              All Fostering Types
            </Badge>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
              <span className="text-white">Fostering</span>
              <span className="block text-primary">Categories</span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto mb-8">
              Explore all types of fostering placements. Find the right match for your family and connect with trusted agencies across the UK.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 bg-white/[0.06] backdrop-blur-md border border-white/10 rounded-2xl px-5 py-3">
                <Heart className="h-5 w-5 text-primary" />
                <span className="font-bold text-white">{allTreatments.length}+ Fostering Types</span>
              </div>
              <div className="flex items-center gap-2 bg-white/[0.06] backdrop-blur-md border border-white/10 rounded-2xl px-5 py-3">
                <Building2 className="h-5 w-5 text-primary" />
                <span className="font-bold text-white">{realCounts?.clinics?.toLocaleString() || '500'}+ Agencies</span>
              </div>
              <div className="flex items-center gap-2 bg-white/[0.06] backdrop-blur-md border border-white/10 rounded-2xl px-5 py-3">
                <Shield className="h-5 w-5 text-primary" />
                <span className="font-bold text-white">Ofsted Registered</span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" className="w-full h-12 md:h-16" preserveAspectRatio="none">
            <path d="M0 80V40C240 10 480 0 720 20C960 40 1200 50 1440 30V80H0Z" className="fill-background" />
          </svg>
        </div>
      </section>

      {/* Popular Categories */}
      <Section size="lg">
        <SectionHeader
          label="Most Popular"
          title="Popular Fostering"
          highlight="Categories"
        />

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularTreatments.map((treatment, i) => (
              <Link
                key={treatment.id}
                to={`/categories/${treatment.slug}`}
                className="group bg-card border border-border rounded-2xl p-6 hover:border-primary hover:shadow-xl transition-all animate-fade-in-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors mb-2">
                  {treatment.name}
                </h3>
                {treatment.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {treatment.description}
                  </p>
                )}
                <span className="text-sm font-bold text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  View Agencies <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            ))}
          </div>
        )}
      </Section>

      {/* All Categories - Dark Section */}
      <section className="section-dark py-20">
        <div className="container">
          <div className="text-center mb-10">
            <p className="text-micro text-primary mb-2">Full Directory</p>
            <h2 className="text-section text-3xl md:text-4xl text-white">
              All Fostering <span className="text-primary">Types</span>
            </h2>
          </div>

          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {allTreatments.map((treatment, i) => (
              <Link
                key={treatment.id}
                to={`/categories/${treatment.slug}`}
                className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3 font-bold text-white hover:border-primary hover:text-primary hover:bg-white/10 transition-all animate-fade-in-up"
                style={{ animationDelay: `${i * 0.03}s` }}
              >
                {treatment.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* By Region - Interlinking */}
      <Section size="lg">
        <SectionHeader
          label="By Region"
          title="Find Agencies"
          highlight="By Region"
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {states?.map((state, i) => (
            <Link
              key={state.id}
              to={`/${state.slug}`}
              className="group bg-card border border-border rounded-2xl p-6 hover:border-primary hover:shadow-lg transition-all animate-fade-in-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors mb-1">
                {state.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Browse fostering agencies in {state.name}
              </p>
              <span className="text-sm font-bold text-primary flex items-center gap-1">
                Explore <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <section className="bg-primary py-16 md:py-20">
        <div className="container text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-primary-foreground">
            Not sure which type of fostering is right for you?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Browse our agency directory and talk to agencies who can help you find the right fostering path for your family.
          </p>
          <Button asChild size="lg" variant="secondary" className="rounded-2xl font-bold">
            <Link to="/search">
              Find an Agency
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </PageLayout>
  );
};

export default ServicesPage;
