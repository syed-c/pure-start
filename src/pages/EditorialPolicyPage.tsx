import { Link } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Section } from "@/components/layout/Section";
import { SEOHead } from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { Shield, FileCheck, Users, AlertTriangle, RefreshCw, BookOpen, ArrowRight, CheckCircle } from "lucide-react";

const EditorialPolicyPage = () => {

  const keyPoints = ["Evidence-based content", "Expert reviewed", "Regular updates", "Transparent corrections"];

  return (
    <PageLayout>
      <SEOHead
        title="Editorial Policy — Content Standards | Foster Connect"
        description="Learn about Foster Connect's editorial standards, fact-checking process, and commitment to accurate, evidence-based fostering information for UK families."
        canonical="/editorial-policy/"
      />

      {/* Hero */}
      <section className="relative bg-foreground text-background overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.15),transparent_50%)]" />
        <div className="container relative py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-primary">Our Standards</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6">
              Editorial <span className="text-primary">Policy</span>
            </h1>
            <p className="text-lg text-background/60 max-w-xl mx-auto mb-8">
              How we ensure accurate, trustworthy fostering information for UK families.
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
            <div className="flex items-center gap-4 mb-8 pb-6 border-b">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-muted-foreground"><strong>Last Updated:</strong> January 2026</p>
                <p className="text-sm text-muted-foreground">Committed to accuracy and transparency</p>
              </div>
            </div>

            <div className="space-y-10">
              <PolicySection
                icon={Shield}
                title="Our Commitment to Accuracy"
                content="All content published on Foster Connect is created, reviewed, and maintained to the highest editorial standards. Our goal is to provide UK families with accurate, evidence-based fostering information that helps them make informed decisions about their fostering journey."
              />
              <PolicySection
                icon={FileCheck}
                title="Content Creation Process"
                content="Every piece of content goes through a multi-step review process: (1) Research by qualified writers using peer-reviewed sources and UK regulatory authority guidelines (Ofsted, DfE). (2) Fact-checking against current regulations and best practice. (3) Review by fostering professionals for accuracy. (4) Final editorial review for clarity, completeness, and compliance."
              />
              <PolicySection
                icon={Users}
                title="Expert Contributors"
                content="Our content is informed by experienced fostering professionals across the UK. Contributors include social workers, fostering agency managers, and experienced foster carers who ensure our information reflects current best practices and UK-specific standards. All expert contributors disclose any conflicts of interest."
              />
              <PolicySection
                icon={AlertTriangle}
                title="Corrections & Updates"
                content="We take accuracy seriously. If you identify an error or outdated information, please contact us at editorial@fosterconnect.co.uk. Corrections are made promptly and transparently. Significant corrections are noted at the top of the affected content."
              />
              <PolicySection
                icon={RefreshCw}
                title="Regular Content Reviews"
                content="All fostering-related content is reviewed at least annually to ensure it remains current with the latest regulations, Ofsted standards, and UK fostering best practice. Each article displays its last review date for transparency."
              />

              <div className="bg-muted/50 rounded-2xl p-6 border border-border">
                <h3 className="font-bold text-foreground mb-2">Disclaimer</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Content on Foster Connect is for informational purposes only and does not constitute professional advice. Always consult a qualified social worker or fostering agency for guidance specific to your situation. Fostering allowance information is indicative and may vary by agency and local authority.
                </p>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t text-center">
              <p className="text-muted-foreground mb-4">Have questions about our editorial standards?</p>
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

function PolicySection({ icon: Icon, title, content }: { icon: any; title: string; content: string }) {
  return (
    <div className="group">
      <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        {title}
      </h2>
      <p className="text-muted-foreground leading-relaxed pl-[52px]">{content}</p>
    </div>
  );
}

export default EditorialPolicyPage;
