import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Zap, Phone, MapPin, Clock, AlertTriangle, 
  Navigation, Search, CheckCircle, Star, Shield,
  Heart, ArrowRight, Building2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PageLayout } from '@/components/layout/PageLayout';
import { Section } from '@/components/layout/Section';
import { SEOHead } from '@/components/seo/SEOHead';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { useSeoPageContent } from '@/hooks/useSeoPageContent';
import { format } from 'date-fns';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

export default function EmergencyFosteringFinder() {
  const { data: seoContent } = useSeoPageContent("emergency-fostering");
  const [stateId, setStateId] = useState('');
  const [cityId, setCityId] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [searchTriggered, setSearchTriggered] = useState(false);

  const { data: states } = useQuery({
    queryKey: ['emergency-states'],
    queryFn: async () => {
      const { data } = await supabase.from('states').select('id, name, abbreviation').eq('is_active', true).order('name');
      return data || [];
    },
  });

  const { data: cities } = useQuery({
    queryKey: ['emergency-cities', stateId],
    queryFn: async () => {
      let q = supabase.from('cities').select('id, name, slug').eq('is_active', true).order('name');
      if (stateId) q = q.eq('state_id', stateId);
      const { data } = await q.limit(200);
      return data || [];
    },
  });

  const { data: clinics, isLoading } = useQuery({
    queryKey: ['emergency-clinics', stateId, cityId],
    queryFn: async () => {
      let query = supabase
        .from('clinics')
        .select(`
          id, name, slug, address, phone, rating, review_count, city_id,
          cities(name, states(abbreviation))
        `)
        .eq('is_active', true)
        .not('phone', 'is', null);

      if (cityId) {
        query = query.eq('city_id', cityId);
      } else if (stateId) {
        query = query.eq('cities.state_id', stateId);
      }

      const { data } = await query.limit(30);

      return (data || []).map((clinic: any) => ({
        ...clinic,
        cityName: clinic.cities?.name || '',
        stateAbbr: clinic.cities?.states?.abbreviation || '',
      })).sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0));
    },
    enabled: searchTriggered,
  });

  const filteredCities = citySearch
    ? cities?.filter(c => c.name.toLowerCase().includes(citySearch.toLowerCase()))
    : cities;

  const handleSearch = () => {
    setSearchTriggered(true);
  };

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Emergency Fostering" },
  ];

  return (
    <PageLayout>
      <SEOHead
        title={seoContent?.meta_title || "Emergency Fostering | Find Agencies With Immediate Placements | Foster Connect"}
        description={seoContent?.meta_description || "Find fostering agencies offering emergency placements. Get immediate support for children who need urgent care."}
        canonical="/emergency-fostering/"
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-destructive/5 via-background to-background pt-6 pb-12">
        <div className="container relative z-10 px-4">
          <div className="flex justify-center mb-4">
            <Breadcrumbs items={breadcrumbs} />
          </div>
          
          <div className="max-w-3xl mx-auto text-center">
            <motion.div {...fadeUp} className="inline-flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-full px-4 py-2 mb-4">
              <Zap className="h-4 w-4 text-destructive" />
              <span className="text-xs font-semibold text-destructive">Urgent Placements</span>
            </motion.div>
            
            <motion.h1 {...fadeUp} transition={{ delay: 0.1 }} className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
              Emergency <span className="text-destructive">Fostering</span> Finder
            </motion.h1>
            
            <motion.p {...fadeUp} transition={{ delay: 0.2 }} className="text-base md:text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Find fostering agencies that offer emergency placements across the UK. Select your location to see agencies with immediate availability.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <Section size="sm">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeUp} className="bg-card border border-border rounded-2xl p-6 shadow-card">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Region</Label>
                <Select value={stateId} onValueChange={(v) => { setStateId(v); setCityId(''); setSearchTriggered(false); }}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {states?.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">City</Label>
                <Select value={cityId} onValueChange={(v) => { setCityId(v); setSearchTriggered(false); }}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="px-2 pb-2">
                      <Input placeholder="Search cities..." value={citySearch} onChange={e => setCitySearch(e.target.value)} className="h-8" />
                    </div>
                    {filteredCities?.slice(0, 50).map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold invisible">Search</Label>
                <Button className="w-full h-11 rounded-xl font-semibold" onClick={handleSearch} disabled={!stateId}>
                  <Search className="h-4 w-4 mr-2" />
                  Find Now
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* Results */}
      {searchTriggered && (
        <Section size="md">
          <div className="max-w-4xl mx-auto space-y-8">
            {clinics && clinics.length > 0 ? (
              <div>
                <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald" />
                  Agencies Found ({clinics.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {clinics.map((clinic: any) => (
                    <Card key={clinic.id} className="rounded-2xl hover:border-primary/30 transition-all">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-bold text-base">{clinic.name}</h3>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3" />
                              {clinic.cityName}{clinic.stateAbbr ? `, ${clinic.stateAbbr}` : ''}
                            </p>
                          </div>
                          {clinic.rating && (
                            <div className="flex items-center gap-1 text-sm">
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                              <span className="font-bold">{clinic.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 mt-3">
                          {clinic.phone && (
                            <Button size="sm" variant="outline" className="rounded-lg flex-1" asChild>
                              <a href={`tel:${clinic.phone}`}>
                                <Phone className="h-3.5 w-3.5 mr-1" /> Call
                              </a>
                            </Button>
                          )}
                          <Button size="sm" className="rounded-lg flex-1" asChild>
                            <Link to={`/agency/${clinic.slug || clinic.id}`}>
                              View Profile <ArrowRight className="h-3.5 w-3.5 ml-1" />
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : !isLoading ? (
              <Card className="rounded-2xl">
                <CardContent className="py-12 text-center">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-display text-lg font-bold mb-2">No agencies found</h3>
                  <p className="text-muted-foreground mb-4">Try a nearby city or broader region search.</p>
                  <Button variant="outline" className="rounded-xl" asChild>
                    <Link to="/search">Browse All Agencies</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </Section>
      )}

      {/* What is Emergency Fostering */}
      <Section size="lg" className="bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-10">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
              What is <span className="text-destructive">Emergency Fostering?</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm">Emergency fostering provides immediate, short-notice care for children who need urgent placement.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            <motion.div {...fadeUp} className="bg-card border border-destructive/20 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <h3 className="font-display text-lg font-bold">When Emergency Fostering is Needed</h3>
              </div>
              <ul className="space-y-3">
                {['A child is at immediate risk of harm', 'Parents are suddenly unable to care for their child', 'A placement breakdown has occurred', 'Police protection has been invoked', 'A child has been abandoned', 'Court order requiring immediate removal'].map(item => (
                  <li key={item} className="flex items-start gap-2.5 text-sm">
                    <CheckCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Heart className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display text-lg font-bold">What Emergency Carers Provide</h3>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {[
                  'A safe and welcoming home at short notice',
                  'Stability and reassurance during a crisis',
                  'Basic necessities — clothing, food, comfort',
                  'Working closely with social workers',
                  'Supporting the child through the transition',
                  'Flexibility to accept placements quickly'
                ].map(item => (
                  <li key={item} className="flex items-start gap-2.5">
                    <Building2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* FAQ */}
      <Section size="lg">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-10">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Frequently Asked <span className="text-primary">Questions</span>
            </h2>
          </motion.div>

          <Accordion type="single" collapsible className="space-y-3">
            {[
              { q: "How quickly can an emergency placement happen?", a: "Emergency placements can happen within hours. Agencies with dedicated emergency carers can often arrange same-day placements when a child needs immediate care." },
              { q: "How long do emergency placements last?", a: "Emergency placements typically last from a few days to a few weeks while longer-term plans are made. The duration depends on the child's circumstances and care planning." },
              { q: "Do I need special training for emergency fostering?", a: "Agencies provide specific training for emergency foster carers, including managing trauma, attachment, and working with children who have experienced sudden upheaval." },
              { q: "What support is available during an emergency placement?", a: "Agencies provide 24/7 support for emergency carers, including out-of-hours social worker access, emergency supplies, and immediate guidance." },
            ].map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="bg-card border border-border rounded-2xl px-5 data-[state=open]:border-primary/30">
                <AccordionTrigger className="text-left font-bold hover:no-underline py-4">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4 text-sm">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Section>

      {/* CTA */}
      <Section variant="primary" size="md">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
            Interested in Emergency Fostering?
          </h2>
          <p className="text-primary-foreground/80 mb-8">
            If you're considering becoming an emergency foster carer, browse agencies in your area to learn about the support and training available.
          </p>
          <Button asChild size="lg" variant="secondary" className="rounded-2xl font-bold">
            <Link to="/search">
              <Search className="mr-2 h-5 w-5" />
              Find Agencies Near You
            </Link>
          </Button>
        </div>
      </Section>
    </PageLayout>
  );
}
