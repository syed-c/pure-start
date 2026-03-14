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
        { q: "How do I find an Ofsted-registered fostering agency?", a: "Use our search feature to filter by region, city, or fostering type. All agencies on Foster Connect are registered with Ofsted. Agencies with the 'Verified' badge have completed our additional verification process." },
        { q: "What are the requirements to become a foster carer?", a: "You need to be over 21, have a spare bedroom, and be a UK resident. You don't need to be married, own your home, or have previous experience with children. Agencies provide full training and ongoing support throughout your fostering journey." },
        { q: "How long does the fostering assessment take?", a: "The assessment process typically takes 4-6 months from initial enquiry to approval. This includes training sessions (Skills to Foster), home visits, background checks (DBS), and a panel review. Some agencies offer fast-track assessments." },
        { q: "What fostering allowance will I receive?", a: "Foster carers receive a weekly fostering allowance that varies by local authority and agency. The national minimum allowance ranges from £132-£187 per week depending on the child's age. Many independent agencies offer enhanced rates. Contact agencies through Foster Connect for specific rates." },
        { q: "Can I foster if I work full-time?", a: "It depends on the type of fostering. Some placements, particularly for school-age children, can be compatible with part-time work. Many agencies offer flexible arrangements and support. Discuss your situation with agencies during the initial enquiry." },
        { q: "Is Foster Connect free for prospective carers?", a: "Yes, Foster Connect is completely free for prospective foster carers. You can search for agencies, read reviews, compare services, and submit enquiries without any charges." },
      ]
    },
    {
      icon: Building2,
      title: "For Fostering Agencies",
      faqs: [
        { q: "How do I list my agency on Foster Connect?", a: "Visit our 'List Your Agency' page and fill out the registration form with your Ofsted registration number. Our team will verify your details and contact you within 24-48 hours. Basic listings are free." },
        { q: "What are the benefits of a verified profile?", a: "Verified profiles receive an Ofsted verification badge, higher search ranking, priority placement in results, access to analytics dashboard, the ability to respond to reviews, and increased visibility to prospective foster carers." },
        { q: "How do I claim an existing agency profile?", a: "If your agency is already listed, visit our 'Claim Profile' page. Search for your agency, verify ownership through email or phone, and gain control of your profile to update information and respond to reviews." },
        { q: "Can I manage multiple agency locations?", a: "Yes, you can manage multiple locations under one account. Each location will have its own profile page, and you can manage them all from a single dashboard." },
      ]
    },
    {
      icon: HelpCircle,
      title: "UK Fostering",
      faqs: [
        { q: "What is the difference between independent fostering agencies and local authority fostering?", a: "Independent Fostering Agencies (IFAs) are private organisations approved by Ofsted to recruit, train and support foster carers. Local authority fostering teams are run directly by your local council. Both provide Ofsted-regulated placements. IFAs often offer higher allowances and more personalised support." },
        { q: "What areas does Foster Connect cover?", a: "Foster Connect covers fostering agencies across England, Scotland, Wales, and Northern Ireland. We list agencies in all major cities including London, Birmingham, Manchester, Leeds, Liverpool, Bristol, Sheffield, Newcastle, and many more." },
        { q: "What does an Ofsted rating mean for fostering agencies?", a: "Ofsted inspects all fostering agencies in England and rates them as Outstanding, Good, Requires Improvement, or Inadequate. The rating reflects the quality of care, leadership, and outcomes for children. Foster Connect displays each agency's current Ofsted rating on their profile." },
        { q: "What types of fostering are there?", a: "There are several types of fostering: emergency fostering (short-notice placements), respite fostering (short breaks), short-term fostering (temporary care), long-term fostering (permanent home), parent & child fostering, therapeutic fostering, and disability/complex needs fostering." },
        { q: "How do I report incorrect information?", a: `If you find incorrect information on any listing, please contact us at ${supportEmail}. We take data accuracy seriously and will investigate and correct any errors promptly.` },
      ]
    }
  ];

  return (
    <PageLayout>
      <SEOHead
        title={seoContent?.meta_title || "FAQ | Fostering Questions Answered | Foster Connect"}
        description={seoContent?.meta_description || "Find answers about fostering in the UK — Ofsted-registered agencies, fostering allowances, assessment process, and how to become a foster carer."}
        canonical="/faq/"
        keywords={['fostering FAQ UK', 'become foster carer questions', 'Ofsted fostering agency', 'fostering allowance', 'UK fostering process']}
      />

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-primary/[0.04] to-background overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.06),transparent_60%)]" />
        <div className="container relative py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/15 mb-6">
              <HelpCircle className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Help Centre</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black mb-6 text-foreground" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Frequently Asked <span className="text-primary">Questions</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
              Find answers about fostering in the UK — from Ofsted registration to allowances and the assessment process.
            </p>

            <div className="flex flex-wrap justify-center gap-3 text-sm">
              {[
                { icon: Building2, text: `${counts?.clinics?.toLocaleString() || "500+"}+ Agencies` },
                { icon: Shield, text: "Ofsted Registered" },
                { icon: Users, text: "Free for Carers" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50">
                  <item.icon className="h-3.5 w-3.5 text-primary" />
                  <span className="font-medium text-foreground/70">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto space-y-8">
            {categories.map((category, catIndex) => (
              <div key={catIndex} className="bg-card border border-border/50 rounded-2xl p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <category.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-black" style={{ fontFamily: "'Outfit', sans-serif" }}>{category.title}</h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                  {category.faqs.map((faq, faqIndex) => (
                    <AccordionItem key={faqIndex} value={`${catIndex}-${faqIndex}`} className="border-border/40">
                      <AccordionTrigger className="text-left font-bold hover:text-primary py-5 text-[15px]">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
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
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Still Have Questions?
            </h2>
            <p className="text-muted-foreground mb-8">
              Can't find what you're looking for? Our UK-based support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Button asChild size="lg" className="rounded-xl font-bold h-12">
                <Link to="/contact">Contact Support <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl font-bold h-12">
                <a href={`tel:${supportPhone.replace(/[^\d+]/g, '')}`}>
                  <Phone className="mr-2 h-4 w-4" /> Call Us
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground py-14">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Ready to start your fostering journey?
          </h2>
          <p className="text-primary-foreground/70 mb-8 max-w-xl mx-auto">
            Join hundreds of foster carers across the UK who've found their ideal agency through Foster Connect.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" variant="secondary" className="rounded-xl font-bold h-12">
              <Link to="/search"><Search className="mr-2 h-4 w-4" /> Find an Agency</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-xl font-bold h-12 border-primary-foreground/30 text-primary-foreground bg-primary-foreground/10 hover:bg-primary-foreground/20">
              <Link to="/list-your-agency">List Your Agency</Link>
            </Button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default FAQPage;
