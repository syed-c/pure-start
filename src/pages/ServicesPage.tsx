import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageLayout } from "@/components/layout/PageLayout";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { SEOHead } from "@/components/seo/SEOHead";
import { StructuredData } from "@/components/seo/StructuredData";
import { ArrowRight, Shield, Heart, Building2 } from "lucide-react";
import { useRealCounts } from "@/hooks/useRealCounts";
import { useSeoPageContent } from "@/hooks/useSeoPageContent";

const ServicesPage = () => {
  const { data: treatments, isLoading } = useQuery({
    queryKey: ["all-treatments"],
    queryFn: async () => {
      const { data } = await supabase.from("treatments").select("*").eq("is_active", true).order("display_order");
      return data || [];
    },
  });

  // Fallback categories if database is empty
  const fallbackTreatments = [
    { 
      id: '1', 
      name: 'Short-Term Fostering', 
      slug: 'short-term-fostering', 
      description: 'Temporary care for children from weeks to several months. Ideal for those who want to help without long-term commitment.',
      duration: 'Weeks to months',
      requirements: 'Flexible schedule, spare room',
      suitable_for: 'Working families, students, retirees'
    },
    { 
      id: '2', 
      name: 'Long-Term Fostering', 
      slug: 'long-term-fostering', 
      description: 'Permanent care arrangements for children who cannot return to their birth family. Building lasting relationships.',
      duration: 'Ongoing (years)',
      requirements: 'Stable home, long-term commitment',
      suitable_for: 'Couples, single carers, experienced fosterers'
    },
    { 
      id: '3', 
      name: 'Emergency Fostering', 
      slug: 'emergency-fostering', 
      description: 'Immediate, 24-hour placements for children in crisis. Often needed at night or on weekends.',
      duration: 'Immediate to short-term',
      requirements: 'Quick response, flexible hours',
      suitable_for: 'Experienced carers, those with flexible schedules'
    },
    { 
      id: '4', 
      name: 'Therapeutic Fostering', 
      slug: 'therapeutic-fostering', 
      description: 'Specialist care for children with complex needs, trauma, or mental health challenges. Additional training required.',
      duration: 'Medium to long-term',
      requirements: 'Specialist training, high patience',
      suitable_for: 'Trained professionals, experienced carers'
    },
    { 
      id: '5', 
      name: 'Respite Fostering', 
      slug: 'respite-fostering', 
      description: 'Short breaks for other foster families. Typically weekends or school holidays. Great for beginners.',
      duration: 'Weekends, holidays',
      requirements: 'Flexible occasional availability',
      suitable_for: 'Anyone with occasional availability'
    },
    { 
      id: '6', 
      name: 'Parent & Child Fostering', 
      slug: 'parent-and-child-fostering', 
      description: 'Support for a parent and their child together. Helps young parents develop parenting skills.',
      duration: '3-12 months',
      requirements: 'Large home, teaching skills',
      suitable_for: 'Experienced parents, teachers'
    },
    { 
      id: '7', 
      name: 'Disability Fostering', 
      slug: 'disability-fostering', 
      description: 'Care for children with physical or learning disabilities. Medical training may be required.',
      duration: 'Varies',
      requirements: 'Medical training (some roles)',
      suitable_for: 'Healthcare professionals, trained carers'
    },
    { 
      id: '8', 
      name: 'Kinship Fostering', 
      slug: 'kinship-fostering', 
      description: 'Care by family members or close connections when parents cannot care for children. Priority given to relatives.',
      duration: 'Varies',
      requirements: 'Family connection',
      suitable_for: 'Family members, close friends'
    },
  ];

  const displayTreatments = (treatments && treatments.length > 0) ? treatments : fallbackTreatments;

  const { data: states } = useQuery({
    queryKey: ["states-for-services"],
    queryFn: async () => {
      const { data } = await supabase.from("states").select("*").eq("is_active", true).order("display_order");
      return data || [];
    },
  });

  const popularTreatments = displayTreatments.slice(0, 8);
  const allTreatments = displayTreatments;
  const { data: realCounts } = useRealCounts();
  const { data: seoContent } = useSeoPageContent("services");

  const breadcrumbs = [{ label: "Home", href: "/" }, { label: "Fostering Categories" }];

  return (
    <PageLayout>
      <SEOHead
        title={seoContent?.meta_title || "Fostering Categories — All Types of Foster Care | Foster Care"}
        description={seoContent?.meta_description || "Explore all types of fostering — from emergency and respite care to long-term and therapeutic placements."}
        canonical="/categories/"
        keywords={['fostering types', 'types of foster care', 'emergency fostering', 'therapeutic fostering']}
      />
      <StructuredData type="organization" />
      
      {/* Hero */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1600&q=80"
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-teal-950/95 via-slate-950/95 to-slate-900/95 pointer-events-none" />
          <div className="absolute inset-0 bg-subtle-grid opacity-20 pointer-events-none" />
        </div>
        <div className="container">
          <Breadcrumbs items={breadcrumbs} className="mb-6" />
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">All Types</p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">
              Fostering <span className="text-primary">Categories</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Explore all types of fostering placements and find the right match for your family.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-2">
                <Heart className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">{allTreatments.length}+ Types</span>
              </div>
              <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-2">
                <Building2 className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">{realCounts?.agencies?.toLocaleString() || '500'}+ Agencies</span>
              </div>
              <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">Ofsted Registered</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular */}
      <Section size="lg" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-subtle-dots opacity-10 pointer-events-none" />
        <SectionHeader label="Most Popular" title="Popular Fostering" highlight="Categories" />
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {popularTreatments.map((treatment) => (
              <Link key={treatment.id} to={`/categories/${treatment.slug}`}
                className="group bg-card border border-border rounded-xl p-5 hover:border-primary/30 hover:shadow-sm transition-all">
                <h3 className="font-bold text-foreground group-hover:text-primary transition-colors mb-1.5">{treatment.name}</h3>
                {treatment.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{treatment.description}</p>
                )}
                {treatment.duration && (
                  <div className="text-xs text-muted-foreground mb-1">
                    <span className="font-medium">Duration:</span> {treatment.duration}
                  </div>
                )}
                <span className="text-sm font-semibold text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  View Agencies <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            ))}
          </div>
        )}
      </Section>

      {/* All */}
      <section className="bg-foreground py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-subtle-grid opacity-[0.03] pointer-events-none" />
        <div className="container">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Full Directory</p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-background">
              All Fostering <span className="text-primary">Types</span>
            </h2>
          </div>
          <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
            {allTreatments.map((treatment) => (
              <Link key={treatment.id} to={`/categories/${treatment.slug}`}
                className="bg-background/5 border border-background/10 rounded-lg px-4 py-2.5 text-sm font-semibold text-background hover:border-primary hover:text-primary transition-all">
                {treatment.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* By Region */}
      <Section size="lg" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-subtle-dots opacity-10 pointer-events-none" />
        <SectionHeader label="By Region" title="Find Agencies" highlight="By Region" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl mx-auto">
          {states?.map((state) => (
            <Link key={state.id} to={`/${state.slug}`}
              className="group bg-card border border-border rounded-xl p-5 hover:border-primary/20 hover:shadow-sm transition-all">
              <h3 className="font-bold text-foreground group-hover:text-primary transition-colors mb-1">{state.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">Browse fostering agencies in {state.name}</p>
              <span className="text-sm font-semibold text-primary flex items-center gap-1">
                Explore <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <section className="bg-primary py-14">
        <div className="container text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-primary-foreground mb-4">
            Not sure which type is right for you?
          </h2>
          <p className="text-primary-foreground/70 mb-8 max-w-xl mx-auto">
            Browse our directory and talk to agencies who can help you find the right fostering path.
          </p>
          <Button asChild size="lg" variant="secondary" className="rounded-lg font-semibold">
            <Link to="/search">Find an Agency <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </PageLayout>
  );
};

export default ServicesPage;
