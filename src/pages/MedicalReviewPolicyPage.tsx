import { Link } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Section } from "@/components/layout/Section";
import { SEOHead } from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { CheckCircle, Users, FileCheck, RefreshCw, ShieldCheck, ArrowRight } from "lucide-react";

const MedicalReviewPolicyPage = () => {

  const reviewSteps = [
    { step: "1", title: "Content Drafting", desc: "Qualified writers create content using peer-reviewed sources, UK Government and Ofsted guidelines, and current fostering regulations." },
    { step: "2", title: "Expert Review", desc: "A qualified fostering professional reviews the content for accuracy, appropriate terminology, and alignment with current UK best practices." },
    { step: "3", title: "Compliance Check", desc: "Content is checked against UK advertising regulations, Ofsted standards, and fostering information guidelines to ensure full compliance." },
    { step: "4", title: "Publication & Monitoring", desc: "Approved content is published with clear attribution. All content is scheduled for periodic review to maintain accuracy." },
  ];

  const keyPoints = ["Expert reviewed", "Ofsted compliant", "Regular updates", "Transparent sourcing"];

  return (
    <PageLayout>
      <SEOHead
        title="Content Review Policy — Quality Standards | Foster Care"
        description="Understand how Foster Care's fostering content is reviewed by qualified professionals to ensure accuracy and compliance with UK fostering standards."
        canonical="/medical-review-policy/"
      />

      {/* Hero */}
      <section className="relative bg-foreground text-background overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.15),transparent_50%)]" />
        <div className="container relative py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-primary">Quality Standards</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6">
              Content Review <span className="text-primary">Policy</span>
            </h1>
            <p className="text-lg text-background/60 max-w-xl mx-auto mb-8">
              How we ensure accuracy and quality in all fostering-related content.
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
        <div className="max-w-3xl mx-auto">
          <div className="card-modern p-8 md:p-12">
            <div className="space-y-10">
              <div>
                <h2 className="text-2xl font-extrabold text-foreground mb-4">Our Review Process</h2>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  Every piece of fostering-related content on Foster Care undergoes a rigorous multi-step review process to ensure families receive accurate, trustworthy information.
                </p>

                <div className="space-y-5">
                  {reviewSteps.map((step) => (
                    <div key={step.step} className="flex gap-4 bg-muted/30 rounded-xl p-5 border border-border">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary text-primary-foreground font-extrabold text-lg flex items-center justify-center">
                        {step.step}
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground mb-1">{step.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <ReviewCard icon={Users} title="Reviewer Qualifications" desc="All content reviewers are qualified fostering professionals with current UK experience, including social workers and agency managers." />
                <ReviewCard icon={ShieldCheck} title="Conflict of Interest" desc="Reviewers must disclose any financial or professional relationships. Content is never influenced by advertisers or agency partnerships." />
                <ReviewCard icon={RefreshCw} title="Annual Re-Review" desc="All fostering content is re-reviewed at minimum annually, or sooner when new regulations or Ofsted changes warrant updates." />
                <ReviewCard icon={FileCheck} title="Transparent Attribution" desc="Each reviewed article displays the reviewer's name, credentials, and review date so users can verify the information source." />
              </div>

              <div className="bg-muted/50 rounded-2xl p-6 border border-border">
                <h3 className="font-bold text-foreground mb-2">Important Notice</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Content on Foster Care is reviewed for general accuracy but does not replace professional advice. Individual fostering decisions should always be made in consultation with a qualified social worker or fostering agency who can evaluate your specific circumstances.
                </p>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t text-center">
              <p className="text-muted-foreground mb-4">Have questions about our review standards?</p>
              <Button asChild variant="outline" className="rounded-xl font-bold">
                <Link to="/contact">Contact Us <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </Section>
    </PageLayout>
  );
};

function ReviewCard({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 hover:border-primary/20 transition-colors">
      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="font-bold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

export default MedicalReviewPolicyPage;
