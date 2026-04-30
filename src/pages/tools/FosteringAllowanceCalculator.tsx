import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageLayout } from "@/components/layout/PageLayout";
import { Section } from "@/components/layout/Section";
import { SEOHead } from "@/components/seo/SEOHead";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from "react-router-dom";
import { Calculator, Heart, Shield, Star, MapPin, Users } from "lucide-react";
import { motion } from "framer-motion";

const FOSTERING_TYPES = [
  { id: "emergency-fostering", name: "Emergency Fostering" },
  { id: "short-term-fostering", name: "Short-Term Fostering" },
  { id: "long-term-fostering", name: "Long-Term Fostering" },
  { id: "respite-fostering", name: "Respite Fostering" },
  { id: "parent-and-child-fostering", name: "Parent & Child" },
  { id: "therapeutic-fostering", name: "Therapeutic Fostering" },
  { id: "disability-complex-needs-fostering", name: "Disability & Complex Needs" },
];

const AGE_GROUPS = [
  { value: "0-4", label: "0-4 years" },
  { value: "5-10", label: "5-10 years" },
  { value: "11-15", label: "11-15 years" },
  { value: "16-17", label: "16-17 years" },
];

const UK_REGIONS = [
  { value: "greater-london", label: "Greater London" },
  { value: "west-midlands", label: "West Midlands" },
  { value: "greater-manchester", label: "Greater Manchester" },
  { value: "west-yorkshire", label: "West Yorkshire" },
  { value: "hampshire", label: "Hampshire" },
  { value: "kent", label: "Kent" },
  { value: "essex", label: "Essex" },
  { value: "surrey", label: "Surrey" },
];

export default function FosteringAllowanceCalculator() {
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedAge, setSelectedAge] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<string>("");

  const { data: agencies } = useQuery({
    queryKey: ["allowance-agencies", selectedType, selectedRegion],
    queryFn: async () => {
      if (!selectedType && !selectedRegion) return [];
      
      let query = supabase
        .from("clinics")
        .select("id, name, slug, average_rating, total_reviews, ofsted_rating, fostering_types, city:cities(name)")
        .eq("is_active", true);

      if (selectedType) {
        query = query.contains("fostering_types", [selectedType]);
      }

      if (selectedRegion) {
        const { data: cities } = await supabase
          .from("cities")
          .select("id")
          .eq("slug", selectedRegion);
        
        if (cities?.length) {
          query = query.in("city_id", cities.map(c => c.id));
        }
      }

      const { data } = await query.order("average_rating", { ascending: false }).limit(10);
      return data || [];
    },
    enabled: !!selectedType || !!selectedRegion,
  });

  const minAllowance = selectedAge ? (selectedAge === "0-4" ? 175 : selectedAge === "16-17" ? 187 : 152) : 152;
  const maxAllowance = selectedAge ? (selectedAge === "0-4" ? 220 : selectedAge === "16-17" ? 250 : 200) : 200;

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Tools", href: "/tools" },
    { label: "Fostering Allowance Calculator" },
  ];

  return (
    <PageLayout>
      <SEOHead
        title="Fostering Allowance Calculator UK | Estimate Your Weekly Allowance"
        description="Calculate your potential fostering allowance based on fostering type, child's age, and location. Compare rates across UK agencies."
        canonical="/tools/fostering-allowance-calculator"
        keywords={["fostering allowance calculator", "foster care pay UK", "foster carer weekly rate", "Ofsted foster allowance"]}
      />

      <Section size="md">
        <div className="container px-4">
          <Breadcrumbs items={breadcrumbs} className="mb-6" />
          
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <Badge variant="secondary" className="mb-4">
                <Calculator className="h-4 w-4 mr-2" /> Free Tool
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Fostering Allowance <span className="text-primary">Calculator</span>
              </h1>
              <p className="text-muted-foreground">
                Estimate your potential weekly fostering allowance based on fostering type and child's age
              </p>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Calculate Your Allowance
                </CardTitle>
                <CardDescription>
                  Select your fostering type and the child's age group to estimate your allowance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>Fostering Type</Label>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {FOSTERING_TYPES.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Child's Age Group</Label>
                    <Select value={selectedAge} onValueChange={setSelectedAge}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select age" />
                      </SelectTrigger>
                      <SelectContent>
                        {AGE_GROUPS.map((age) => (
                          <SelectItem key={age.value} value={age.value}>
                            {age.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Region</Label>
                    <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        {UK_REGIONS.map((region) => (
                          <SelectItem key={region.value} value={region.value}>
                            {region.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {(selectedType || selectedAge) && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 p-6 bg-primary/5 rounded-xl border border-primary/20"
                  >
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Estimated Weekly Allowance</p>
                      <p className="text-4xl font-bold text-primary">
                        £{minAllowance} - £{maxAllowance}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        * Based on national minimum rates. Independent agencies often offer higher rates.
                      </p>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            {agencies && agencies.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Recommended Agencies
                  </CardTitle>
                  <CardDescription>
                    Ofsted-rated agencies matching your criteria
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Agency</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Ofsted</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {agencies.map((agency: any) => (
                        <TableRow key={agency.id}>
                          <TableCell className="font-medium">{agency.name}</TableCell>
                          <TableCell>{agency.city?.name || "N/A"}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-gold fill-gold" />
                              {agency.average_rating?.toFixed(1) || "N/A"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={agency.ofsted_rating === "Good" || agency.ofsted_rating === "Outstanding" ? "default" : "secondary"}>
                              {agency.ofsted_rating || "Not rated"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Link to={`/agency/${agency.slug}`} className="text-primary hover:underline text-sm">
                              View Profile
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            <Card className="mt-8">
              <CardHeader>
                <CardTitle>About Fostering Allowances</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Heart className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">National Minimum Allowance</p>
                    <p className="text-sm text-muted-foreground">
                      The national minimum ranges from £132-£187 per week depending on the child's age. This is the minimum that must be paid by local authorities.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Enhanced Rates</p>
                    <p className="text-sm text-muted-foreground">
                      Independent Fostering Agencies (IFAs) often offer enhanced rates above the national minimum, ranging from £150-£500+ per week depending on the child's needs.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Additional Support</p>
                    <p className="text-sm text-muted-foreground">
                      Many agencies offer additional benefits including tax relief, holiday payments, respite care, and training support.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Section>
    </PageLayout>
  );
}
