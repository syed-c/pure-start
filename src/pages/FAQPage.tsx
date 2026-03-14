import { Link } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo/SEOHead";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useSeoPageContent } from "@/hooks/useSeoPageContent";
import { useRealCounts } from "@/hooks/useRealCounts";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { MessageSquare, ArrowRight, Search, Building2, HelpCircle, Users, Shield, Phone } from "lucide-react";

const FAQPage = () => {
  const { data: siteSettings } = useSiteSettings();
  const { data: counts } = useRealCounts();
  const { data: seoContent } = useSeoPageContent("faq");
  const supportEmail = siteSettings?.contactDetails?.support_email || 'support@fosterconnect.co.uk';
  const supportPhone = siteSettings?.contactDetails?.support_phone || '+44 20 1234 5678';

  const categories = [
    {
      icon: Users,
      title: "For Prospective Foster Carers",
      faqs: [
        { q: "How do I find an Ofsted-registered fostering agency?", a: "Use our search feature to filter by region, city, or fostering type. All agencies on Foster Connect are registered with Ofsted." },
        { q: "What are the requirements to become a foster carer?", a: "You need to be over 21, have a spare bedroom, and be a UK resident. You don't need to be married, own your home, or have previous experience with children." },
        { q: "How long does the fostering assessment take?", a: "The assessment process typically takes 4-6 months from initial enquiry to approval. This includes training, home visits, DBS checks, and a panel review." },
        { q: "What fostering allowance will I receive?", a: "The national minimum allowance ranges from £132-£187 per week depending on the child's age. Many independent agencies offer enhanced rates." },
        { q: "Is Foster Connect free for prospective carers?", a: "Yes, completely free. Search, read reviews, compare services, and submit enquiries without any charges." },
      ]
    },
    {
      icon: Building2,
      title: "For Fostering Agencies",
      faqs: [
        { q: "How do I list my agency on Foster Connect?", a: "Visit our 'List Your Agency' page and fill out the registration form with your Ofsted registration number. Our team will verify your details within 24-48 hours." },
        { q: "What are the benefits of a verified profile?", a: "Verified profiles receive an Ofsted badge, higher search ranking, priority placement, analytics dashboard access, and the ability to respond to reviews." },
        { q: "Can I manage multiple agency locations?", a: "Yes, you can manage multiple locations under one account. Each location has its own profile page." },
      ]
    },
    {
      icon: HelpCircle,
      title: "UK Fostering",
      faqs: [
        { q: "What is the difference between IFAs and local authority fostering?", a: "Independent Fostering Agencies (IFAs) are private organisations approved by Ofsted. Local authority teams are run directly by your local council. Both provide Ofsted-regulated placements." },
        { q: "What does an Ofsted rating mean?", a: "Ofsted rates agencies as Outstanding, Good, Requires Improvement, or Inadequate. The rating reflects the quality of care, leadership, and outcomes for children." },
        { q: "What types of fostering are there?", a: "Emergency, respite, short-term, long-term, parent & child, therapeutic, and disability/complex needs fostering." },
        { q: "How do I report incorrect information?", a: `Contact us at ${supportEmail}. We take data accuracy seriously and will investigate promptly.` },
      ]
    }
  ];

  return (
    <PageLayout>
      <SEOHead
        title={seoContent?.meta_title || "FAQ | Fostering Questions Answered | Foster Connect"}
        description={seoContent?.meta_description || "Find answers about fostering in the UK — Ofsted-registered agencies, fostering allowances, assessment process, and how to become a foster carer."}
        canonical="/faq/"
        keywords={['fostering FAQ UK', 'become foster carer questions', 'Ofsted fostering agency', 'fostering allowance']}
      />

      {/* Hero */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">Help Centre</p>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-foreground">
              Frequently Asked <span className="text-primary">Questions</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Find answers about fostering in the UK — from Ofsted registration to allowances and the assessment process.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto space-y-8">
            {categories.map((category, catIndex) => (
              <div key={catIndex}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <category.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-extrabold">{category.title}</h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                  {category.faqs.map((faq, faqIndex) => (
                    <AccordionItem key={faqIndex} value={`${catIndex}-${faqIndex}`} className="border-border">
                      <AccordionTrigger className="text-left font-semibold hover:text-primary py-4 text-[15px]">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="py-14 bg-muted/30">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <MessageSquare className="h-8 w-8 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-extrabold mb-3">Still Have Questions?</h2>
            <p className="text-muted-foreground mb-6">Our UK-based support team is here to help.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Button asChild size="lg" className="rounded-lg font-semibold h-11">
                <Link to="/contact">Contact Support <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-lg font-semibold h-11">
                <a href={`tel:${supportPhone.replace(/[^\d+]/g, '')}`}>
                  <Phone className="mr-2 h-4 w-4" /> Call Us
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-14">
        <div className="container text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-primary-foreground mb-4">
            Ready to start your fostering journey?
          </h2>
          <p className="text-primary-foreground/70 mb-8 max-w-xl mx-auto">
            Find verified fostering agencies across the UK.
          </p>
          <Button asChild size="lg" variant="secondary" className="rounded-lg font-semibold h-11">
            <Link to="/search"><Search className="mr-2 h-4 w-4" /> Find an Agency</Link>
          </Button>
        </div>
      </section>
    </PageLayout>
  );
};

export default FAQPage;
