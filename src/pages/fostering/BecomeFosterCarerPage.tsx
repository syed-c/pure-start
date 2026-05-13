import { Link } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEOHead } from "@/components/seo/SEOHead";
import { 
  Heart, 
  Shield, 
  Users, 
  Clock, 
  Award, 
  CheckCircle, 
  ArrowRight, 
  Phone, 
  Mail,
  Star,
  Baby,
  GraduationCap,
  Home,
  MessageCircle,
  Search
} from "lucide-react";

const BecomeFosterCarerPage = () => {
  const steps = [
    {
      number: 1,
      title: "Research & Enquire",
      description: "Browse our directory of Ofsted-rated agencies. Read reviews from current foster carers and compare what each agency offers.",
      icon: Search,
    },
    {
      number: 2,
      title: "Initial Contact",
      description: "Get in touch with your chosen agencies. They'll explain the different types of fostering and answer your questions.",
      icon: Phone,
    },
    {
      number: 3,
      title: "Assessment",
      description: "Complete the assessment process (usually 6-12 months). This includes home visits, training, and background checks.",
      icon: Shield,
    },
    {
      number: 4,
      title: "Approval",
      description: "Once approved, you'll be matched with a child or young person who fits your family's circumstances and capabilities.",
      icon: Heart,
    },
  ];

  const fosteringTypes = [
    {
      title: "Short-Term Fostering",
      description: "Care for children for a few days to several months while plans are made for their future.",
      icon: Clock,
    },
    {
      title: "Long-Term Fostering",
      description: "Provide a permanent home for children who cannot return to their birth family.",
      icon: Home,
    },
    {
      title: "Emergency Fostering",
      description: "Provide immediate, short-notice care for children in crisis situations.",
      icon: Shield,
    },
    {
      title: "Therapeutic Fostering",
      description: "Specialist care for children with complex emotional and behavioral needs.",
      icon: Heart,
    },
    {
      title: "Parent & Child Fostering",
      description: "Support birth parents while caring for their child in a separate placement.",
      icon: Users,
    },
    {
      title: "Respite Fostering",
      description: "Provide temporary breaks for other foster families or parents.",
      icon: Clock,
    },
  ];

  const requirements = [
    "Be over 21 years old",
    "Have a spare bedroom",
    "Be a UK resident or have indefinite leave to remain",
    "Have no criminal convictions against children",
    "Be in good health",
    "Have the time and commitment to care for a child",
  ];

  const faqs = [
    {
      q: "How much do foster carers get paid?",
      a: "Foster carers receive a weekly allowance that covers the cost of caring for a child. The amount varies by agency and fostering type, but typically ranges from £400-£800 per week. Additional payments may be available for complexity allowances."
    },
    {
      q: "Do I need qualifications to become a foster carer?",
      a: "No formal qualifications are required. Agencies provide comprehensive training throughout your fostering journey. What matters most is your ability to provide a safe, loving, and stable home."
    },
    {
      q: "Can I work and foster?",
      a: "Yes, many foster carers work part-time or from home. However, you must be able to meet the needs of the child in your care, which may require flexibility in your working arrangements."
    },
    {
      q: "Can I foster if I have pets?",
      a: "Most agencies accept households with pets. You'll need to complete a pet assessment to ensure the safety of children in your care. Certain breeds may be restricted."
    },
    {
      q: "What support do foster carers receive?",
      a: "Foster carers receive 24/7 support, regular training, a dedicated social worker, peer support groups, and competitive allowances. You'll never be alone in your fostering journey."
    },
  ];

  return (
    <PageLayout>
      <SEOHead
        title="Become a Foster Carer | UK Foster Care Guide"
        description="Learn how to become a foster carer in the UK. Find out about the process, requirements, types of fostering, and how to choose the right agency."
        canonical="/become-foster-carer"
        keywords={["become a foster carrier", "foster care UK", "how to become a foster parent", "fostering process", "fostering requirements"]}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-20 md:py-28">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[400px] bg-primary/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[300px] bg-teal-500/10 rounded-full blur-[120px]" />
        </div>
        
        <div className="container relative z-10 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-teal-500/20 text-teal-300 hover:bg-teal-500/30">
              <Heart className="w-4 h-4 mr-2" />
              Make a Difference
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Become a <span className="text-primary">Foster Carer</span>
            </h1>
            <p className="text-white/70 text-xl mb-8 max-w-2xl mx-auto">
              Every child deserves a safe, loving home. Join thousands of families across the UK who are transforming lives through fostering.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" className="rounded-full text-lg px-8" asChild>
                <Link to="/agencies">
                  Find an Agency
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full text-lg px-8" asChild>
                <Link to="/faq">
                  Learn More
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <Section size="md" className="-mt-12 relative z-20">
        <div className="container px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-card/80 backdrop-blur border-primary/20">
              <CardContent className="p-6 text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">55,000+</div>
                <div className="text-muted-foreground">Children in foster care</div>
              </CardContent>
            </Card>
            <Card className="bg-card/80 backdrop-blur border-primary/20">
              <CardContent className="p-6 text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">8,000+</div>
                <div className="text-muted-foreground">Foster families needed</div>
              </CardContent>
            </Card>
            <Card className="bg-card/80 backdrop-blur border-primary/20">
              <CardContent className="p-6 text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">£600+</div>
                <div className="text-muted-foreground">Average weekly allowance</div>
              </CardContent>
            </Card>
            <Card className="bg-card/80 backdrop-blur border-primary/20">
              <CardContent className="p-6 text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">24/7</div>
                <div className="text-muted-foreground">Support available</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Section>

      {/* Types of Fostering */}
      <Section size="lg">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Types of Fostering</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              There are many ways to make a difference. Find the type of fostering that fits your family.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fosteringTypes.map((type, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <type.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{type.title}</h3>
                  <p className="text-muted-foreground">{type.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      {/* The Process */}
      <Section size="lg" className="bg-muted/30">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How to Become a Foster Carer</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              The journey to becoming a foster carer's typically takes 6-12 months. Here's what to expect.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-primary text-white text-2xl font-bold flex items-center justify-center mb-4">
                    {step.number}
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <step.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-1/2 w-full h-0.5 bg-border -translate-y-1/2 z-0" />
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" className="rounded-full" asChild>
              <Link to="/agencies">
                Start Your Journey
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </Section>

      {/* Requirements */}
      <Section size="lg">
        <div className="container px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Who Can Foster?</h2>
              <p className="text-muted-foreground text-lg mb-6">
                People from all walks of life make brilliant foster carers. There's no perfect profile – what matters is your commitment to caring for a child.
              </p>
              <div className="space-y-3">
                {requirements.map((req, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                    <span>{req}</span>
                  </div>
                ))}
              </div>
            </div>
            <Card className="bg-gradient-to-br from-primary/10 to-teal/10 border-primary/20">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold mb-4">You don't need to:</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Be married or in a relationship</li>
                  <li>• Own your own home</li>
                  <li>• have formal qualifications</li>
                  <li>• Be young - carers can be over 70</li>
                  <li>• Have children of your own</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </Section>

      {/* FAQ */}
      <Section size="lg" className="bg-muted/30">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Get answers to common questions about becoming a foster carer's.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">{faq.q}</h3>
                  <p className="text-muted-foreground">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" className="rounded-full" asChild>
              <Link to="/faq">
                View All FAQs
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section size="lg">
        <div className="container px-4">
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-primary/20 overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px]" />
            </div>
            <CardContent className="p-8 md:p-12 text-center relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Transform a Child's Life?
              </h2>
              <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
                Find the perfect fostering agency for your family. All agencies provide full training, 
                ongoing support, and competitive allowances.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button size="lg" className="rounded-full text-lg px-8" asChild>
                  <Link to="/agencies">
                    Search Agencies
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="rounded-full text-lg px-8 border-white bg-transparent text-white hover:bg-white/10" asChild>
                  <Link to="/compare">
                    Compare Agencies
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Section>
    </PageLayout>
  );
};

export default BecomeFosterCarerPage;