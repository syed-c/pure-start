import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageLayout } from "@/components/layout/PageLayout";
import { Section } from "@/components/layout/Section";
import { SEOHead } from "@/components/seo/SEOHead";
import { StructuredData } from "@/components/seo/StructuredData";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { SearchBox } from "@/components/SearchBox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { TrendingUp, MapPin, Shield, BarChart3, Heart } from "lucide-react";

const ServicePricePage = () => {
  const { serviceSlug } = useParams();
  const slug = serviceSlug || "";

  const { data: fosteringType } = useQuery({
    queryKey: ["fostering-type", slug],
    queryFn: async () => {
      const { data } = await supabase
        .from("treatments")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      return data;
    },
  });

  const { data: agencyCounts, isLoading } = useQuery({
    queryKey: ["fostering-type-agencies", slug],
    queryFn: async () => {
      const { data: agencies } = await supabase
        .from("clinics")
        .select("id, name, slug, city:cities(name, state:states(name))")
        .contains("fostering_types", [slug])
        .eq("is_active", true)
        .order("average_rating", { ascending: false })
        .limit(50);
      return agencies || [];
    },
  });

  const treatmentName = fosteringType?.name || slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  const totalAgencies = agencyCounts?.length || 0;
  const citiesCovered = [...new Set(agencyCounts?.map(a => a.city?.name).filter(Boolean))].length;

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Fostering Types", href: "/services" },
    { label: treatmentName, href: `/services/${slug}` },
    { label: "Agencies" },
  ];

  const faqs = [
    { q: `How do I find ${treatmentName.toLowerCase()} agencies in England?`, a: `Our directory features ${totalAgencies}+ Ofsted-rated agencies offering ${treatmentName.toLowerCase()} across England. Browse our directory above to compare ratings and connect directly with agencies.` },
    { q: `What is ${treatmentName.toLowerCase()}?`, a: `${treatmentName} is a specialised form of fostering care for children with specific needs. Each agency has their own approach and specialisation - contact them directly to learn more.` },
    { q: `How much does fostering pay?`, a: `The national minimum fostering allowance ranges from £132-£187 per week depending on the child's age. Many independent agencies offer enhanced rates above the minimum, plus additional support packages.` },
    { q: `Do I need experience to become a foster carer?`, a: `No prior experience is required. Agencies provide full training and ongoing support. You need to be over 21 and have a spare bedroom in your home.` },
    { q: `How long does the assessment process take?`, a: `The assessment process typically takes 4-6 months, including training, home visits, interviews, and background checks. Agencies will support you through every step.` },
  ];

  return (
    <PageLayout>
      <SEOHead
        title={`${treatmentName} Agencies in England - Find Ofsted Rated Providers`}
        description={`Find ${totalAgencies}+ verified ${treatmentName.toLowerCase()} agencies across England. Compare Ofsted ratings, read reviews, and connect with agencies near you.`}
        canonical={`/services/${slug}/agencies`}
        keywords={[...(`${treatmentName} agencies UK`).split(' '), ...(`${treatmentName} fostering England`).split(' '), `find ${treatmentName} agency`, `Ofsted rated ${treatmentName}`]}
      />
      <StructuredData type="faq" questions={faqs.map((f) => ({ question: f.q, answer: f.a }))} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-8 pb-14">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[120px]" />
          <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-teal/10 rounded-full blur-[100px]" />
        </div>
        <div className="container relative z-10 px-4">
          <Breadcrumbs items={breadcrumbs} className="mb-6 [&_a]:text-white/60 [&_span]:text-white/40 [&_svg]:text-white/30" />
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="rounded-full px-4 py-2 text-sm font-bold mb-5 bg-primary/15 text-primary border-primary/30">
              <BarChart3 className="h-4 w-4 mr-2" /> Agency Directory
            </Badge>

            <h1
              className="animate-fade-in-up text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4"
            >
              {treatmentName} <span className="text-primary">Agencies</span> in England
            </h1>

            <p
              className="animate-fade-in text-white/60 text-sm md:text-base max-w-2xl mx-auto mb-8"
              style={{ animationDelay: '0.1s' }}
            >
              Find {totalAgencies}+ Ofsted-rated {treatmentName.toLowerCase()} agencies across England. Compare ratings, read reviews from current foster carers, and connect directly.
            </p>

            <div
              className="animate-fade-in-up max-w-xl mx-auto"
              style={{ animationDelay: '0.2s' }}
            >
              <SearchBox variant="hero" defaultTreatment={slug} />
            </div>

            <div
              className="animate-fade-in flex flex-wrap justify-center gap-4 mt-8"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="bg-white/[0.06] backdrop-blur-md border border-white/10 rounded-xl px-4 py-3">
                <div className="text-2xl font-bold text-primary">{totalAgencies}+</div>
                <div className="text-xs text-white/60">Agencies</div>
              </div>
              <div className="bg-white/[0.06] backdrop-blur-md border border-white/10 rounded-xl px-4 py-3">
                <div className="text-2xl font-bold text-primary">{citiesCovered}</div>
                <div className="text-xs text-white/60">Cities Covered</div>
              </div>
              <div className="bg-white/[0.06] backdrop-blur-md border border-white/10 rounded-xl px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-teal" />
                  <span className="text-sm font-bold text-white">Ofsted Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Agency Listings */}
      <Section size="lg">
        <div className="container px-4">
          <div className="max-w-5xl mx-auto">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-xl" />
                ))}
              </div>
            ) : agencyCounts && agencyCounts.length > 0 ? (
              <div className="space-y-4">
                {agencyCounts.map((agency: any) => (
                  <Link
                    key={agency.id}
                    to={`/agency/${agency.slug || agency.id}/`}
                    className="block bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-foreground hover:text-primary transition-colors">{agency.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {agency.city?.name}, {agency.city?.state?.name}
                        </p>
                      </div>
                      <Badge variant="secondary" className="shrink-0">
                        <Heart className="h-3 w-3 mr-1" /> View Profile
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No {treatmentName.toLowerCase()} agencies found. Check back soon as we're adding new agencies daily.
                </p>
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* FAQ */}
      <Section size="lg" className="bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Frequently Asked <span className="text-primary">Questions</span>
            </h2>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="bg-card border border-border rounded-2xl px-5 data-[state=open]:border-primary/30"
              >
                <AccordionTrigger className="text-left font-bold hover:no-underline py-4">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Section>
    </PageLayout>
  );
};

export default ServicePricePage;
