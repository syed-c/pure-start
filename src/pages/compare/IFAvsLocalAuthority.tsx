import { Link } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Section } from "@/components/layout/Section";
import { SEOHead } from "@/components/seo/SEOHead";
import { StructuredData } from "@/components/seo/StructuredData";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Shield, Star, Users, Wallet, ArrowRight, CheckCircle, XCircle } from "lucide-react";

export default function IFAvsLocalAuthorityPage() {
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Compare", href: "/compare" },
    { label: "IFA vs Local Authority" },
  ];

  const faqs = [
    { question: "What is the difference between an IFA and a local authority?", answer: "Independent Fostering Agencies (IFAs) are privately run and often offer higher allowances. Local authorities are government-run councils that provide fostering through their social services." },
    { question: "Which type pays more?", answer: "IFAs typically pay 15-30% more than local authorities, but this varies by region and the child's needs." },
    { question: "Can I transfer between agencies?", answer: "Yes, foster carers can transfer between agencies, though this usually happens after completing at least one placement." },
    { question: "Which has better support?", answer: "Support varies by agency. IFAs often have smaller caseloads and more dedicated support workers. Both must meet Ofsted standards." },
  ];

  return (
    <PageLayout>
      <SEOHead
        title="IFA vs Local Authority Fostering | Complete Comparison Guide"
        description="Compare Independent Fostering Agencies (IFAs) vs local authority fostering. Learn about allowances, support, requirements, and which is right for you."
        canonical="/compare/ifa-vs-local-authority"
        keywords={["IFA vs local authority fostering", "independent fostering agency vs council", "fostering agency comparison", "which fostering agency"]}
      />
      <StructuredData type="faq" questions={faqs} />

      <Section size="md">
        <div className="container px-4">
          <Breadcrumbs items={breadcrumbs} className="mb-6" />
          
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">Comparison Guide</Badge>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                IFA vs Local Authority <span className="text-primary">Fostering</span>
              </h1>
              <p className="text-muted-foreground text-lg">
                Understand the differences between Independent Fostering Agencies and council-run fostering services
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <Card className="border-primary/20">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <Badge>Independent</Badge>
                  </div>
                  <CardTitle>Independent Fostering Agencies (IFAs)</CardTitle>
                  <CardDescription>Privately run agencies</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-2">
                    <Wallet className="h-4 w-4 text-green-600 shrink-0 mt-1" />
                    <div>
                      <p className="font-medium">Higher Allowances</p>
                      <p className="text-sm text-muted-foreground">Typically £150-£500+ per week</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Users className="h-4 w-4 text-primary shrink-0 mt-1" />
                    <div>
                      <p className="font-medium">Smaller Caseloads</p>
                      <p className="text-sm text-muted-foreground">More 1-on-1 support</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Star className="h-4 w-4 text-amber-500 shrink-0 mt-1" />
                    <div>
                      <p className="font-medium">Flexible Hours</p>
                      <p className="text-sm text-muted-foreground">24/7 support available</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Search className="h-4 w-4 text-primary shrink-0 mt-1" />
                    <div>
                      <p className="font-medium">Specialist Types</p>
                      <p className="text-sm text-muted-foreground">More placement options</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-5 w-5" />
                    <Badge variant="outline">Government</Badge>
                  </div>
                  <CardTitle>Local Authority</CardTitle>
                  <CardDescription>Council-run services</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-2">
                    <Wallet className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                    <div>
                      <p className="font-medium">Standard Allowances</p>
                      <p className="text-sm text-muted-foreground">National minimum rates</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Users className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                    <div>
                      <p className="font-medium">Larger Caseloads</p>
                      <p className="text-sm text-muted-foreground">Busy social workers</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 shrink-0 mt-1" />
                    <div>
                      <p className="font-medium">Direct Council Links</p>
                      <p className="text-sm text-muted-foreground">Local resources access</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 shrink-0 mt-1" />
                    <div>
                      <p className="font-medium">Kinship Priority</p>
                      <p className="text-sm text-muted-foreground">Family placement focus</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-12">
              <CardHeader>
                <CardTitle>Side-by-Side Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Factor</TableHead>
                      <TableHead>IFA</TableHead>
                      <TableHead>Local Authority</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Weekly Allowance</TableCell>
                      <TableCell><span className="text-green-600 font-medium">£150-£500+</span></TableCell>
                      <TableCell>£132-£250</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Training</TableCell>
                      <TableCell><CheckCircle className="h-4 w-4 text-green-600" /></TableCell>
                      <TableCell><CheckCircle className="h-4 w-4 text-green-600" /></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>24/7 Support</TableCell>
                      <TableCell><CheckCircle className="h-4 w-4 text-green-600" /></TableCell>
                      <TableCell><XCircle className="h-4 w-4 text-muted-foreground" /></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Choice of Location</TableCell>
                      <TableCell><CheckCircle className="h-4 w-4 text-green-600" /></TableCell>
                      <TableCell>Limited</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Ofsted Regulated</TableCell>
                      <TableCell><CheckCircle className="h-4 w-4 text-green-600" /></TableCell>
                      <TableCell><CheckCircle className="h-4 w-4 text-green-600" /></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Holiday Pay</TableCell>
                      <TableCell><CheckCircle className="h-4 w-4 text-green-600" /></TableCell>
                      <TableCell><CheckCircle className="h-4 w-4 text-green-600" /></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="mb-12 bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle>Which is Right for You?</CardTitle>
                <CardDescription>Consider your situation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Choose an IFA if:</p>
                      <p className="text-sm text-muted-foreground">You want higher allowances, flexible hours, specialist support, or want to work with specific age groups or fostering types.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Choose Local Authority if:</p>
                      <p className="text-sm text-muted-foreground">You prefer working directly with council social workers, want to keep children in their local area, or are interested in kinship fostering.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <Button asChild size="lg">
                <Link to="/search">
                  Find Agencies <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Section>
    </PageLayout>
  );
}

function Building2({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4" />
      <path d="M10 18h4" />
      <path d="M4 22h16" />
    </svg>
  );
}