import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageLayout } from "@/components/layout/PageLayout";
import { Section } from "@/components/layout/Section";
import { SEOHead } from "@/components/seo/SEOHead";
import { StructuredData } from "@/components/seo/StructuredData";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Shield, MapPin, ArrowRight, Phone } from "lucide-react";

interface CityLandingPageProps {
  citySlug: string;
  cityName: string;
  regionSlug: string;
  regionName: string;
  cityDescription: string;
  localAuthority: string;
  whyFosterText: string;
}

export function CityLandingPage({ 
  citySlug, 
  cityName, 
  regionSlug, 
  regionName,
  cityDescription,
  localAuthority,
  whyFosterText 
}: CityLandingPageProps) {
  const { data: agencies, isLoading } = useQuery({
    queryKey: ["city-agencies", citySlug],
    queryFn: async () => {
      const { data } = await supabase
        .from("agencies")
        .select("id, name, slug, city, average_rating, total_reviews, ofsted_rating, phone, fostering_types")
        .ilike("city", `%${cityName}%`)
        .eq("seo_visible", true)
        .eq("is_suspended", false)
        .order("average_rating", { ascending: false })
        .limit(12);
      return data || [];
    },
  });

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: regionName, href: `/${regionSlug}` },
    { label: cityName },
  ];

  const faqs = [
    { question: `How do I become a foster carrier in ${cityName}?`, answer: `Contact any of the ${agencies?.length || 0} agencies in ${cityName} to begin your journey. The assessment process typically takes 4-6 months.` },
    { question: `What is the local authority for ${cityName}?`, answer: `${localAuthority} is the local authority for ${cityName}. They can also provide information about fostering.` },
    { question: `How much do foster carers get paid in ${cityName}?`, answer: "Rates vary by agency and the child's needs, but typically range from £150-£400+ per week." },
  ];

  return (
    <PageLayout>
      <SEOHead
        title={`Fostering Agencies in ${cityName} | Find Foster Carers Near You`}
        description={`Find Ofsted-rated fostering agencies in ${cityName}. ${cityDescription}`}
        canonical={`/${regionSlug}/${citySlug}`}
        keywords={[`fostering agencies ${cityName}`, `foster care ${cityName}`, `become foster carrier ${cityName}`, `foster agency ${cityName}`]}
      />
      <StructuredData type="breadcrumb" items={breadcrumbs.map(b => ({ name: b.label, url: b.href }))} />
      <StructuredData type="faq" questions={faqs} />

      <Section size="md">
        <div className="container px-4">
          <Breadcrumbs items={breadcrumbs} className="mb-6" />
          
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <Badge variant="secondary" className="mb-4">{regionName}</Badge>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Fostering Agencies in <span className="text-primary">{cityName}</span>
              </h1>
              <p className="text-muted-foreground text-lg">{cityDescription}</p>
            </div>

            {isLoading ? (
              <div className="grid md:grid-cols-2 gap-4">
                {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
              </div>
            ) : agencies && agencies.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {agencies.slice(0, 8).map((agency: any) => (
                  <Card key={agency.id} className="hover:border-primary/30 transition-colors">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{agency.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {agency.city}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {agency.average_rating && (
                            <div className="flex items-center">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium ml-1">{agency.average_rating.toFixed(1)}</span>
                            </div>
                          )}
                          {agency.ofsted_rating && (
                            <Badge variant={agency.ofsted_rating === "Outstanding" ? "default" : "secondary"} className="text-xs">
                              {agency.ofsted_rating}
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {agency.phone && (
                            <Button size="sm" variant="ghost" asChild>
                              <a href={`tel:${agency.phone}`}>
                                <Phone className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          <Button size="sm" asChild>
                            <Link to={`/agency/${agency.slug}`}>View</Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-8">
                <CardContent>
                  <p className="text-muted-foreground">No agencies found in {cityName} yet.</p>
                  <Button asChild className="mt-4">
                    <Link to="/search">Search All Agencies</Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card className="mt-10 bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle>Why Foster in {cityName}?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{whyFosterText}</p>
              </CardContent>
            </Card>

            <div className="mt-8 flex justify-center">
              <Button asChild size="lg">
                <Link to={`/search?city=${citySlug}`}>
                  Find Agencies in {cityName} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Section>
    </PageLayout>
  );
}

export default CityLandingPage;