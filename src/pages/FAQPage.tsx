import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo/SEOHead";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useSeoPageContent } from "@/hooks/useSeoPageContent";
import { useRealCounts } from "@/hooks/useRealCounts";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import {
  MessageSquare, ArrowRight, Search, Building2, HelpCircle, Users,
  Shield, Phone, Sparkles, BookOpen, Heart, HandHeart, CheckCircle
} from "lucide-react";

import faqImg from "@/assets/faq-illustration.png";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const stagger = (i: number) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.45, delay: i * 0.08 },
});

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
      description: "Everything you need to know about starting your fostering journey.",
      color: "from-emerald-500/20 to-emerald-500/5",
      faqs: [
        { q: "How do I find an Ofsted-registered fostering agency?", a: "Use our search feature to filter by region, city, or fostering type. All agencies on Foster Connect are registered with Ofsted. You can also compare agencies based on their Ofsted rating, reviews from other carers, and the types of fostering they specialise in." },
        { q: "What are the requirements to become a foster carer?", a: "You need to be over 21, have a spare bedroom, and be a UK resident. You don't need to be married, own your home, or have previous experience with children. Agencies will assess your suitability through a thorough but supportive process." },
        { q: "How long does the fostering assessment take?", a: "The assessment process typically takes 4-6 months from initial enquiry to approval. This includes training, home visits, DBS checks, and a panel review. Some agencies offer a faster-track process for certain fostering types." },
        { q: "What fostering allowance will I receive?", a: "The national minimum allowance ranges from £132-£187 per week depending on the child's age. Many independent agencies offer enhanced rates above the minimum, plus additional support packages." },
        { q: "Is Foster Connect free for prospective carers?", a: "Yes, completely free. Search, read reviews, compare services, and submit enquiries without any charges. We'll never ask you for payment." },
        { q: "Can I foster if I work full-time?", a: "Yes, many foster carers work either full or part-time. However, for certain types of fostering (especially young children), you may need to be available during the day. Your assessing agency will discuss flexible arrangements with you." },
      ]
    },
    {
      icon: Building2,
      title: "For Fostering Agencies",
      description: "Learn how to list and grow your agency on our platform.",
      color: "from-blue-500/20 to-blue-500/5",
      faqs: [
        { q: "How do I list my agency on Foster Connect?", a: "Visit our 'List Your Agency' page and fill out the registration form with your Ofsted registration number. Our team will verify your details within 24-48 hours and your profile will go live." },
        { q: "What are the benefits of a verified profile?", a: "Verified profiles receive an Ofsted badge, higher search ranking, priority placement in search results, access to an analytics dashboard, and the ability to respond to reviews publicly." },
        { q: "Can I manage multiple agency locations?", a: "Yes, you can manage multiple locations under one account. Each location has its own profile page with its own reviews, ratings, and service details." },
        { q: "Is there a cost to list my agency?", a: "Basic listings are free. Premium features including enhanced visibility, priority placement, and advanced analytics are available through our subscription plans." },
      ]
    },
    {
      icon: Shield,
      title: "About UK Fostering",
      description: "General information about fostering in the United Kingdom.",
      color: "from-amber-500/20 to-amber-500/5",
      faqs: [
        { q: "What is the difference between IFAs and local authority fostering?", a: "Independent Fostering Agencies (IFAs) are private organisations approved by Ofsted. Local authority teams are run directly by your local council. Both provide Ofsted-regulated placements, but IFAs often offer additional support packages and higher allowances." },
        { q: "What does an Ofsted rating mean?", a: "Ofsted rates agencies as Outstanding, Good, Requires Improvement, or Inadequate. The rating reflects the quality of care, leadership, management, and outcomes for children. We display these ratings prominently on every agency profile." },
        { q: "What types of fostering are there?", a: "The main types include: Emergency (immediate placements), Respite (short breaks), Short-term (weeks to months), Long-term (until adulthood), Parent & Child (supporting whole families), Therapeutic (specialist mental health support), and Disability/Complex Needs fostering." },
        { q: "How many children need foster care in the UK?", a: "There are approximately 80,000 children in foster care across the UK at any given time, and the number of available foster carers doesn't meet the demand. Your decision to foster could change a child's life." },
        { q: "How do I report incorrect information?", a: `Contact us at ${supportEmail}. We take data accuracy seriously and will investigate and correct any inaccuracies promptly.` },
      ]
    }
  ];

  const quickLinks = [
    { icon: Search, label: "Find an Agency", href: "/search" },
    { icon: Building2, label: "List Your Agency", href: "/list-your-agency" },
    { icon: BookOpen, label: "How It Works", href: "/how-it-works" },
    { icon: Heart, label: "About Us", href: "/about" },
  ];

  return (
    <PageLayout>
      <SEOHead
        title={seoContent?.meta_title || "FAQ | Fostering Questions Answered | Foster Connect"}
        description={seoContent?.meta_description || "Find answers about fostering in the UK — Ofsted-registered agencies, fostering allowances, assessment process, and how to become a foster carer."}
        canonical="/faq/"
        keywords={['fostering FAQ UK', 'become foster carer questions', 'Ofsted fostering agency', 'fostering allowance']}
      />

      {/* ───── Hero ───── */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-background to-muted/30" />
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary/[0.06] rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-accent/[0.08] rounded-full blur-3xl" />

        <div className="container relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeUp}>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-6">
                <HelpCircle className="h-3.5 w-3.5" /> Help Centre
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-foreground leading-tight">
                Frequently Asked{" "}
                <span className="text-primary">Questions</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg leading-relaxed mb-8">
                Find answers about fostering in the UK — from Ofsted registration and allowances to the assessment process and types of fostering available.
              </p>
              {/* Quick stat */}
              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span><strong className="text-foreground">{categories.reduce((sum, c) => sum + c.faqs.length, 0)}</strong> questions answered</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span><strong className="text-foreground">{categories.length}</strong> categories</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              whileInView={{ opacity: 1, scale: 1 }} 
              viewport={{ once: true }} 
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex justify-center"
            >
              <img src={faqImg} alt="Help and support" className="w-full max-w-md drop-shadow-xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ───── Quick Links ───── */}
      <section className="border-y border-border bg-muted/20 py-6">
        <div className="container">
          <div className="flex flex-wrap justify-center gap-3">
            {quickLinks.map((link, i) => (
              <Link key={i} to={link.href} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border text-sm font-semibold hover:border-primary/30 hover:shadow-sm transition-all">
                <link.icon className="h-4 w-4 text-primary" />
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ───── FAQ Sections ───── */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-4xl mx-auto space-y-12">
            {categories.map((category, catIndex) => (
              <motion.div key={catIndex} {...stagger(catIndex)}>
                {/* Category header */}
                <div className="flex items-start gap-4 mb-6">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center shrink-0`}>
                    <category.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-foreground">{category.title}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                  <Accordion type="single" collapsible className="w-full">
                    {category.faqs.map((faq, faqIndex) => (
                      <AccordionItem key={faqIndex} value={`${catIndex}-${faqIndex}`} className="border-border px-6">
                        <AccordionTrigger className="text-left font-semibold hover:text-primary py-5 text-[15px] gap-3">
                          {faq.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground leading-relaxed pb-5 text-[14px]">
                          {faq.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Still Have Questions ───── */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <motion.div {...fadeUp} className="max-w-4xl mx-auto">
            <div className="bg-card border border-border rounded-3xl p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                    <MessageSquare className="h-7 w-7 text-primary" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold mb-3 text-foreground">Still Have Questions?</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Our UK-based support team is available to help with any questions about fostering, agencies, or using the platform. We typically respond within 24 hours.
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <Button asChild size="lg" className="rounded-xl font-semibold h-12 shadow-lg shadow-primary/20">
                    <Link to="/contact">Contact Support <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="rounded-xl font-semibold h-12">
                    <a href={`tel:${supportPhone.replace(/[^\d+]/g, '')}`}>
                      <Phone className="mr-2 h-4 w-4" /> Call Us
                    </a>
                  </Button>
                  <Button asChild size="lg" variant="ghost" className="rounded-xl font-semibold h-12">
                    <a href={`mailto:${supportEmail}`}>
                      <MessageSquare className="mr-2 h-4 w-4" /> Email Us
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ───── CTA ───── */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80" />
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
        <div className="container relative text-center">
          <motion.div {...fadeUp}>
            <h2 className="text-2xl md:text-4xl font-extrabold text-primary-foreground mb-4">
              Ready to Start Your Fostering Journey?
            </h2>
            <p className="text-primary-foreground/70 mb-8 max-w-xl mx-auto text-lg">
              Find verified fostering agencies across the UK — completely free.
            </p>
            <Button asChild size="lg" variant="secondary" className="rounded-xl font-semibold h-12 px-8 shadow-lg">
              <Link to="/search"><Search className="mr-2 h-4 w-4" /> Find an Agency</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </PageLayout>
  );
};

export default FAQPage;
