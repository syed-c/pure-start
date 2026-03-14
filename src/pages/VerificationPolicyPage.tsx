import { Link } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Section } from "@/components/layout/Section";
import { SEOHead } from "@/components/seo/SEOHead";
import { StructuredData } from "@/components/seo/StructuredData";
import { Button } from "@/components/ui/button";
import { BadgeCheck, Shield, FileCheck, Search, Clock, AlertTriangle, Building2, UserCheck, ArrowRight, CheckCircle } from "lucide-react";

const VerificationPolicyPage = () => {
  const verificationLevels = [
    {
      level: "Basic Listing",
      badge: "Listed",
      color: "bg-muted text-muted-foreground",
      items: ["Agency name and contact info published", "Appears in directory search results", "No verification of ownership"],
    },
    {
      level: "Claimed Profile",
      badge: "Claimed",
      color: "bg-blue-custom/10 text-blue-custom",
      items: ["Ownership verified via email or phone OTP", "Agency can manage their profile info", "Can respond to carer reviews"],
    },
    {
      level: "Verified Agency",
      badge: "✓ Verified",
      color: "bg-primary/10 text-primary",
      items: ["Ofsted registration verified", "Agency address confirmed", "Priority ranking in search results", "Verified badge displayed on profile"],
    },
  ];

  const faqs = [
    { question: "How long does verification take?", answer: "The verification process typically takes 2-5 business days after submitting all required documents." },
    { question: "What documents are needed?", answer: "We require a valid Ofsted registration certificate, proof of address, and confirmation of the registered manager's identity." },
    { question: "Does verification cost anything?", answer: "Basic verification is free. The verification process is included with all listing plans." },
    { question: "How often is verification renewed?", answer: "Verification status is reviewed annually or when Ofsted inspection results are updated, whichever comes first." },
  ];

  const keyPoints = ["Ofsted verified", "Multi-step process", "Annual renewal", "Transparent badges"];

  return (
    <PageLayout>
      <SEOHead
        title="Verification Policy — How We Verify Fostering Agencies | Foster Connect"
        description="Learn how Foster Connect verifies fostering agencies in the UK. Our multi-step process ensures families connect with legitimate, Ofsted-registered agencies."
        canonical="/verification-policy/"
      />
      <StructuredData type="faq" questions={faqs} />

      {/* Hero */}
      <section className="relative bg-foreground text-background overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.15),transparent_50%)]" />
        <div className="container relative py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <BadgeCheck className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-primary">Trust & Safety</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6">
              Verification <span className="text-primary">Policy</span>
            </h1>
            <p className="text-lg text-background/60 max-w-xl mx-auto mb-8">
              How we verify fostering agencies to protect families and build trust across the UK.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {keyPoints.map((point, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/5 border border-background/10">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm">{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Section size="lg">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Verification Levels */}
          <div>
            <h2 className="text-2xl font-extrabold text-foreground mb-8 text-center">Verification Levels</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {verificationLevels.map((level) => (
                <div key={level.level} className="bg-card border border-border rounded-2xl p-6 flex flex-col hover:border-primary/20 hover:shadow-md transition-all">
                  <span className={`inline-block self-start text-xs font-bold px-3 py-1 rounded-full mb-4 ${level.color}`}>
                    {level.badge}
                  </span>
                  <h3 className="font-bold text-foreground mb-4">{level.level}</h3>
                  <ul className="space-y-2.5 text-sm text-muted-foreground">
                    {level.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <FileCheck className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Process */}
          <div>
            <h2 className="text-2xl font-extrabold text-foreground mb-8">Our Verification Process</h2>
            <div className="space-y-5">
              {[
                { icon: Search, title: "Document Submission", desc: "Agency submits their Ofsted registration certificate, proof of address, and registered manager details." },
                { icon: UserCheck, title: "Identity Verification", desc: "We verify the submitter's identity and authority to represent the agency." },
                { icon: Building2, title: "Agency Confirmation", desc: "Physical address and agency details are confirmed through Ofsted's public register and official records." },
                { icon: Shield, title: "Badge Awarded", desc: "Upon successful verification, the agency receives the Verified badge visible to all users." },
              ].map((step, i) => (
                <div key={i} className="flex gap-4 items-start bg-card border border-border rounded-xl p-5 hover:border-primary/20 transition-colors">
                  <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <step.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ongoing Monitoring */}
          <div className="bg-muted/50 rounded-2xl p-6 border border-border">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-foreground">Ongoing Monitoring</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Verification is not a one-time event. We continuously monitor verified agencies for:
            </p>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-primary" /> Ofsted registration status and inspection results</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-primary" /> Carer complaint patterns and resolution</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-primary" /> Regulatory actions from Ofsted or other bodies</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-primary" /> Profile accuracy and information currency</li>
            </ul>
          </div>

          {/* Reporting */}
          <div className="flex gap-4 items-start bg-destructive/5 border border-destructive/20 rounded-xl p-5">
            <div className="h-11 w-11 rounded-xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-1">Report a Concern</h3>
              <p className="text-sm text-muted-foreground">
                If you believe a listed agency is unregistered or misrepresenting their credentials, please report it to{" "}
                <a href="mailto:trust@fosterconnect.co.uk" className="text-primary hover:underline">trust@fosterconnect.co.uk</a>.
                All reports are investigated within 48 hours.
              </p>
            </div>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-2xl font-extrabold text-foreground mb-6">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-5 hover:border-primary/20 transition-colors">
                  <h3 className="font-bold text-foreground mb-1.5">{faq.question}</h3>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center pt-4">
            <Button asChild variant="outline" className="rounded-xl font-bold">
              <Link to="/contact">Have Questions? Contact Us <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </Section>
    </PageLayout>
  );
};

export default VerificationPolicyPage;
