import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { SEOHead } from '@/components/seo/SEOHead';
import { PromotionBanner, getDiscountedPrice } from '@/components/subscription/PromotionBanner';
import {
  Check, X, Crown, Star, Zap, Shield, ArrowRight, BadgeCheck,
  HelpCircle, Loader2, Percent
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import { useAgencyProfile } from '@/hooks/useDentistClinic';

// Monthly-only plans for fostering agencies
const PLANS = [
  {
    id: 'verified-presence',
    name: 'Verified Presence',
    slug: 'verified-presence',
    price: 79,
    tagline: 'For agencies that want trust, visibility, and profile control',
    color: 'slate',
    leadQuota: 5,
    whoIsItFor: 'New agencies, agencies wanting to establish trust online, organisations with unclaimed profiles.',
    painRemoved: 'Stop losing enquiries to agencies with verified badges. Control your online reputation.',
    withoutIt: 'Your profile shows "Unclaimed" — carers see you as less trustworthy than verified competitors.',
    successLooks: 'Verified badge, full profile control, carers finding accurate info about your agency.',
    features: [
      { name: 'Verified Agency Badge', included: true },
      { name: 'Full Profile Control', included: true },
      { name: 'Enhanced Profile (photos, services, Ofsted rating)', included: true },
      { name: 'Public Review Display', included: true },
      { name: 'AI-Assisted Review Replies (10/mo)', included: true },
      { name: 'Profile Views & Basic Analytics', included: true },
      { name: 'Enquiry Tracking (5 verified enquiries/mo)', included: true },
      { name: 'Email Support', included: true },
      { name: 'Priority Search Ranking', included: false },
      { name: 'Website & SEO', included: false },
      { name: 'Full Reputation Suite', included: false },
      { name: 'Dedicated Account Manager', included: false },
    ]
  },
  {
    id: 'growth-engine',
    name: 'Growth Engine',
    slug: 'growth-engine',
    price: 199,
    tagline: 'For agencies actively seeking carer recruitment and visibility',
    color: 'primary',
    popular: true,
    leadQuota: 15,
    whoIsItFor: 'Established agencies ready to grow, organisations wanting more carer enquiries, agencies serious about reputation.',
    painRemoved: 'Stop guessing if marketing works. Get real carer enquiries with tracking and SEO visibility.',
    withoutIt: 'Your competitors rank higher, get more reviews, and capture the carers searching for an agency.',
    successLooks: 'First page visibility, steady enquiry flow, reputation improving month-over-month.',
    features: [
      { name: 'Everything in Verified Presence', included: true },
      { name: 'Priority Search Ranking', included: true },
      { name: 'Platform-Hosted Website & SEO', included: true },
      { name: 'Full Reputation Suite', included: true },
      { name: 'Unlimited AI-Assisted Review Replies', included: true },
      { name: 'Advanced Analytics & Enquiry Intelligence', included: true },
      { name: 'Enquiry Tracking (15 verified enquiries/mo)', included: true },
      { name: 'AI Blog Drafts (4/month)', included: true },
      { name: 'AI Growth Tools', included: true },
      { name: 'Priority Support', included: true },
      { name: 'Custom Website Design', included: false },
      { name: 'Dedicated Account Manager', included: false },
    ]
  },
  {
    id: 'autopilot-growth',
    name: 'Autopilot Growth',
    slug: 'autopilot-growth',
    price: 349,
    tagline: 'For agencies that want hands-off growth infrastructure',
    color: 'gold',
    leadQuota: 30,
    whoIsItFor: 'Multi-location agencies, busy organisations who want growth without the work, agencies ready to dominate recruitment.',
    painRemoved: 'Stop spending hours on marketing. Get a dedicated manager and AI-powered growth on autopilot.',
    withoutIt: 'You spend weekends managing reviews and SEO while competitors with teams outpace you.',
    successLooks: 'Hands-off growth, consistent enquiry flow, top local rankings, and time back in your schedule.',
    features: [
      { name: 'Everything in Growth Engine', included: true },
      { name: 'Premium Verified Badge', included: true },
      { name: 'Top Priority Search Ranking', included: true },
      { name: 'Custom Website Design', included: true },
      { name: 'Unlimited AI Blog Drafts', included: true },
      { name: 'Enterprise Analytics & Insights', included: true },
      { name: 'Enquiry Tracking (30 verified enquiries/mo)', included: true },
      { name: 'Full AI Growth Suite', included: true },
      { name: 'Google Business Optimisation', included: true },
      { name: 'Dedicated Account Manager', included: true },
      { name: 'Priority Phone Support', included: true },
      { name: 'White-Glove Onboarding', included: true },
    ]
  }
];

const COMPARISON_FEATURES = [
  { key: 'verified_badge', name: 'Verified Agency Badge', category: 'Trust' },
  { key: 'profile_control', name: 'Full Profile Control', category: 'Profile' },
  { key: 'lead_quota', name: 'Verified Enquiry Tracking', category: 'Enquiries' },
  { key: 'analytics', name: 'Analytics Dashboard', category: 'Analytics' },
  { key: 'review_replies', name: 'AI Review Replies', category: 'Reputation' },
  { key: 'reputation_suite', name: 'Full Reputation Suite', category: 'Reputation' },
  { key: 'priority_listing', name: 'Priority Search Ranking', category: 'Visibility' },
  { key: 'website_seo', name: 'Website & SEO', category: 'Marketing' },
  { key: 'blog_drafts', name: 'AI Blog Content', category: 'Marketing' },
  { key: 'gmb_optimization', name: 'Google Business Optimisation', category: 'Marketing' },
  { key: 'dedicated_manager', name: 'Dedicated Account Manager', category: 'Support' },
  { key: 'phone_support', name: 'Phone Support', category: 'Support' },
];

const FEATURE_VALUES: Record<string, Record<string, string | boolean>> = {
  'verified-presence': {
    verified_badge: true, profile_control: true, lead_quota: '5/mo', analytics: 'Basic',
    review_replies: '10/mo', reputation_suite: false, priority_listing: false, website_seo: false,
    blog_drafts: false, gmb_optimization: false, dedicated_manager: false, phone_support: false,
  },
  'growth-engine': {
    verified_badge: true, profile_control: true, lead_quota: '15/mo', analytics: 'Advanced',
    review_replies: 'Unlimited', reputation_suite: true, priority_listing: true, website_seo: true,
    blog_drafts: '4/mo', gmb_optimization: false, dedicated_manager: false, phone_support: false,
  },
  'autopilot-growth': {
    verified_badge: true, profile_control: true, lead_quota: '30/mo', analytics: 'Enterprise',
    review_replies: 'Unlimited', reputation_suite: true, priority_listing: true, website_seo: true,
    blog_drafts: 'Unlimited', gmb_optimization: true, dedicated_manager: true, phone_support: true,
  },
};

const FAQS = [
  { question: 'Why monthly billing only?', answer: 'Monthly billing keeps us accountable. You see results every month, or you can cancel. No long contracts, no hidden fees.' },
  { question: 'Do you guarantee new carer enquiries?', answer: 'We track verified enquiries (calls, form submissions, chat contacts). We provide visibility and enquiry flow — no guarantees, just transparent tracking.' },
  { question: 'Is my data secure?', answer: 'Yes. We follow UK GDPR data protection standards. We track contact intent only. All sensitive data remains secure and encrypted.' },
  { question: 'Do I need new software?', answer: 'No. Foster Care works alongside your existing systems. We provide a dashboard for reputation and enquiries.' },
  { question: 'Who owns the website content?', answer: 'You own all content you create. Cancel anytime and export your content.' },
  { question: 'How does the verification badge work?', answer: 'We verify your agency credentials (Ofsted registration, address, ownership) through a manual review process. Once verified, a trust badge appears on your profile.' },
  { question: 'What counts as a verified enquiry?', answer: 'A verified enquiry is: (1) A phone call lasting 30+ seconds, (2) A completed enquiry form, or (3) A chat conversation resulting in contact info exchange.' },
  { question: 'Can I cancel anytime?', answer: 'Yes, absolutely. Cancel with one click. No cancellation fees. Your profile remains visible but reverts to free/unclaimed status.' },
];

const FREE_VS_PAID = [
  { feature: 'Basic Listing (name, phone, address)', free: true, paid: true },
  { feature: 'Public Review Display', free: true, paid: true },
  { feature: 'Profile Badge', free: 'Unclaimed', paid: 'Verified ✓' },
  { feature: 'Direct Enquiry Emails', free: '❌ Held for review', paid: '✅ Instant notification' },
  { feature: 'Profile Control', free: false, paid: true },
  { feature: 'Review Replies', free: false, paid: true },
  { feature: 'Enquiry Tracking', free: false, paid: true },
  { feature: 'Analytics Dashboard', free: false, paid: true },
  { feature: 'Website & SEO', free: false, paid: 'Growth+' },
  { feature: 'Priority Visibility', free: false, paid: 'Growth+' },
];

export default function PricingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { data: userAgency } = useAgencyProfile();
  const checkout = useStripeCheckout();
  const [checkingOutPlan, setCheckingOutPlan] = useState<string | null>(null);

  useEffect(() => {
    const status = searchParams.get('subscription');
    if (status === 'success') toast.success('Subscription activated! Welcome to your growth journey.');
    else if (status === 'cancelled') toast.info('Checkout cancelled. You can try again anytime.');
  }, [searchParams]);

  const handleSelectPlan = (plan: typeof PLANS[0]) => {
    if (!user) { navigate('/auth?redirect=/pricing'); return; }
    if (userAgency?.id) {
      setCheckingOutPlan(plan.id);
      checkout.mutate({ planSlug: plan.slug, clinicId: userAgency.id }, { onSettled: () => setCheckingOutPlan(null) });
    } else {
      navigate('/list-your-agency');
    }
  };

  const getPlanColors = (plan: typeof PLANS[0]) => {
    if (plan.popular) return 'border-primary bg-primary/5 ring-2 ring-primary shadow-xl';
    if (plan.color === 'gold') return 'border-gold bg-gold/5';
    return 'border-border';
  };

  const renderFeatureValue = (planId: string, featureKey: string) => {
    const value = FEATURE_VALUES[planId]?.[featureKey];
    if (value === true) return <Check className="h-5 w-5 text-teal mx-auto" />;
    if (value === false) return <X className="h-5 w-5 text-muted-foreground/30 mx-auto" />;
    return <span className="text-sm font-medium">{value}</span>;
  };

  return (
    <>
      <SEOHead
        title="Pricing | Fostering Agency Growth Platform | Foster Care"
        description="Monthly fostering agency growth plans. Verified listings, reputation management, enquiry tracking, SEO. No contracts, cancel anytime."
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1">
          {/* Hero */}
          <section className="py-16 md:py-24 bg-gradient-to-b from-primary/5 to-background">
            <div className="container mx-auto px-4 text-center">
              <div className="max-w-3xl mx-auto mb-8"><PromotionBanner variant="banner" /></div>
              <Badge className="mb-4 bg-teal/10 text-teal border-0">Monthly Plans • Cancel Anytime</Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-6 leading-tight">
                Stop Losing Carers to<br /><span className="text-primary">Unverified Competitors</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                Prospective foster carers are searching online. They choose agencies with verified badges,
                strong reviews, and professional profiles. Don't let an unclaimed listing cost you applicants.
              </p>
              <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm text-muted-foreground">
                {["No long contracts", "Cancel anytime", "Transparent tracking", "Ofsted Compliant"].map(t => (
                  <span key={t} className="flex items-center gap-2"><Check className="h-4 w-4 text-teal" />{t}</span>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="gap-2" onClick={() => document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' })}>
                  View Monthly Plans <ArrowRight className="h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/contact')}>Book a Demo</Button>
              </div>
            </div>
          </section>

          {/* Pricing Cards */}
          <section id="plans" className="py-16 -mt-8">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 mb-4">
                  <Percent className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-bold text-red-600">50% OFF All Plans - Limited Time Offer!</span>
                </div>
                <h2 className="text-3xl font-display font-bold mb-3">Choose Your Growth Path</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  All plans include verified badge eligibility, profile control, and transparent enquiry tracking.
                  <strong className="text-foreground"> Monthly billing only — no annual lock-ins.</strong>
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
                {PLANS.map((plan) => (
                  <Card key={plan.id} className={`relative rounded-2xl transition-all hover:shadow-xl ${getPlanColors(plan)}`}>
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground px-4 py-1 shadow-lg"><Star className="h-3 w-3 mr-1 fill-current" />Most Popular</Badge>
                      </div>
                    )}
                    <CardHeader className="pb-4 pt-8">
                      <div className="flex items-center gap-2 mb-2">
                        {plan.color === 'gold' ? <Crown className="h-6 w-6 text-gold" /> : plan.popular ? <Zap className="h-6 w-6 text-primary" /> : <Shield className="h-6 w-6 text-muted-foreground" />}
                        <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      </div>
                      <CardDescription className="text-sm">{plan.tagline}</CardDescription>
                      <div className="mt-6">
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-bold text-red-600">£{getDiscountedPrice(plan.price).discounted}</span>
                          <span className="text-muted-foreground">/month</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-lg text-muted-foreground line-through">£{plan.price}</span>
                          <Badge className="bg-red-500 text-white border-0 text-xs">50% OFF</Badge>
                        </div>
                        <p className="text-sm text-teal mt-2 font-medium">
                          Save £{getDiscountedPrice(plan.price).savings}/month • {plan.leadQuota} verified enquiries
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-3">
                        {plan.features.slice(0, 8).map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-3">
                            {feature.included ? <Check className="h-4 w-4 text-teal flex-shrink-0" /> : <X className="h-4 w-4 text-muted-foreground/30 flex-shrink-0" />}
                            <span className={`text-sm ${!feature.included ? 'text-muted-foreground/50' : ''}`}>{feature.name}</span>
                          </li>
                        ))}
                      </ul>
                      <Button className={`w-full mt-6 ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''}`} variant={plan.popular ? 'default' : 'outline'} size="lg"
                        onClick={() => handleSelectPlan(plan)} disabled={checkingOutPlan === plan.id || checkout.isPending}>
                        {checkingOutPlan === plan.id ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Redirecting...</>) : (<>{user && userAgency ? 'Get Started' : 'Start Monthly'}<ArrowRight className="h-4 w-4 ml-2" /></>)}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <p className="text-center text-sm text-muted-foreground mt-8">All plans billed monthly. Cancel anytime — no cancellation fees.</p>
            </div>
          </section>

          {/* Who Is It For */}
          <section className="py-16 bg-slate-50/50 dark:bg-slate-900/30">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-display font-bold mb-3">Find Your Perfect Plan</h2>
                <p className="text-muted-foreground">Not sure which plan? Here's who each is designed for.</p>
              </div>
              <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {PLANS.map((plan) => (
                  <Card key={plan.id} className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {plan.color === 'gold' ? <Crown className="h-5 w-5 text-gold" /> : plan.popular ? <Zap className="h-5 w-5 text-primary" /> : <Shield className="h-5 w-5" />}
                        {plan.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div><p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Who It's For</p><p className="text-sm">{plan.whoIsItFor}</p></div>
                      <div><p className="text-xs font-semibold text-teal uppercase mb-1">Pain Removed</p><p className="text-sm">{plan.painRemoved}</p></div>
                      <div><p className="text-xs font-semibold text-coral uppercase mb-1">Without It</p><p className="text-sm text-muted-foreground">{plan.withoutIt}</p></div>
                      <div><p className="text-xs font-semibold text-primary uppercase mb-1">Success Looks Like</p><p className="text-sm">{plan.successLooks}</p></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Free vs Paid */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-display font-bold mb-3">Free vs Paid</h2>
                <p className="text-muted-foreground">No hidden upsells — here's exactly what's free and what's not.</p>
              </div>
              <div className="max-w-2xl mx-auto bg-background rounded-2xl shadow-sm border overflow-hidden">
                <table className="w-full">
                  <thead><tr className="border-b bg-slate-50 dark:bg-slate-800/50"><th className="text-left p-4 font-semibold">Feature</th><th className="text-center p-4 font-semibold">Free</th><th className="text-center p-4 font-semibold">Paid</th></tr></thead>
                  <tbody>
                    {FREE_VS_PAID.map((row, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? '' : 'bg-slate-50/50 dark:bg-slate-800/20'}>
                        <td className="p-4 text-sm">{row.feature}</td>
                        <td className="text-center p-4">{row.free === true ? <Check className="h-5 w-5 text-teal mx-auto" /> : row.free === false ? <X className="h-5 w-5 text-muted-foreground/30 mx-auto" /> : <span className="text-sm text-muted-foreground">{row.free}</span>}</td>
                        <td className="text-center p-4">{row.paid === true ? <Check className="h-5 w-5 text-teal mx-auto" /> : <span className="text-sm font-medium text-teal">{row.paid}</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Compare */}
          <section className="py-16 bg-slate-50/50 dark:bg-slate-900/30">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-display font-bold mb-3">Compare All Plans</h2>
                <p className="text-muted-foreground">Detailed feature breakdown across all tiers.</p>
              </div>
              <div className="max-w-5xl mx-auto bg-background rounded-2xl shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr className="border-b bg-slate-50 dark:bg-slate-800/50">
                      <th className="text-left p-4 font-semibold">Feature</th>
                      {PLANS.map(plan => (<th key={plan.id} className="text-center p-4 font-semibold"><div className="flex flex-col items-center gap-1"><span>{plan.name}</span><span className="text-sm font-normal text-muted-foreground">£{plan.price}/mo</span></div></th>))}
                    </tr></thead>
                    <tbody>
                      {COMPARISON_FEATURES.map((feature, idx) => (
                        <tr key={feature.key} className={idx % 2 === 0 ? '' : 'bg-slate-50/50 dark:bg-slate-800/20'}>
                          <td className="p-4"><span className="text-sm">{feature.name}</span></td>
                          {PLANS.map(plan => (<td key={plan.id} className="text-center p-4">{renderFeatureValue(plan.id, feature.key)}</td>))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-display font-bold mb-3">Frequently Asked Questions</h2>
                <p className="text-muted-foreground">Everything you need to know before subscribing.</p>
              </div>
              <div className="max-w-3xl mx-auto">
                <Accordion type="single" collapsible className="space-y-4">
                  {FAQS.map((faq, idx) => (
                    <AccordionItem key={idx} value={`faq-${idx}`} className="border rounded-xl px-6 bg-background">
                      <AccordionTrigger className="text-left hover:no-underline py-4">
                        <span className="flex items-center gap-3"><HelpCircle className="h-5 w-5 text-primary flex-shrink-0" />{faq.question}</span>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-4 pl-8">{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          </section>

          {/* Legal */}
          <section className="py-8 border-t">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center text-xs text-muted-foreground space-y-2">
                <p><strong>No Guarantees:</strong> Enquiry quotas represent verified enquiries tracked, not carers delivered. Results depend on profile quality, response time, reviews, and local market.</p>
                <p><strong>Data Protection:</strong> Foster Care tracks contact intent only and follows UK GDPR standards. All sensitive data remains secure.</p>
                <p><strong>Google Business Profile:</strong> We assist and optimise — we do not impersonate or auto-post on your behalf.</p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-16 bg-gradient-to-r from-primary to-primary/80">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-4">
                Ready to Grow Your Fostering Agency?
              </h2>
              <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
                Join fostering agencies across England who trust Foster Care for verified visibility and carer recruitment.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" className="gap-2" onClick={() => navigate('/list-your-agency')}>
                  Get Verified Now <BadgeCheck className="h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate('/contact')}>
                  Book a Demo
                </Button>
              </div>
              <p className="text-primary-foreground/60 text-sm mt-6">Monthly billing • Cancel anytime • Transparent tracking</p>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
