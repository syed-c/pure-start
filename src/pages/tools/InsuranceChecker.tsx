import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, CheckCircle, Search, MapPin, Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { SEOHead } from '@/components/seo/SEOHead';
import { useSeoPageContent } from '@/hooks/useSeoPageContent';

export default function InsuranceChecker() {
  const { data: seoContent } = useSeoPageContent("tools/insurance-checker");
  const [insuranceId, setInsuranceId] = useState('');
  const [stateId, setStateId] = useState('');
  const [cityId, setCityId] = useState('');
  const [treatmentId, setTreatmentId] = useState('');
  const [citySearch, setCitySearch] = useState('');

  const { data: insurances } = useQuery({
    queryKey: ['tool-insurances'],
    queryFn: async () => {
      const { data } = await supabase.from('insurances').select('id, name').order('name');
      return data || [];
    },
  });

  const { data: treatments } = useQuery({
    queryKey: ['tool-treatments'],
    queryFn: async () => {
      const { data } = await supabase.from('fostering_categories').select('id, name, slug').eq('is_active', true).order('name');
      return data || [];
    },
  });

  const { data: states } = useQuery({
    queryKey: ['tool-states'],
    queryFn: async () => {
      const { data } = await supabase.from('states').select('id, name, abbreviation').eq('is_active', true).order('name');
      return data || [];
    },
  });

  const { data: cities } = useQuery({
    queryKey: ['tool-cities', stateId],
    queryFn: async () => {
      let q = supabase.from('cities').select('id, name, slug').eq('is_active', true).order('name');
      if (stateId) q = q.eq('state_id', stateId);
      const { data } = await q.limit(200);
      return data || [];
    },
  });

  const { data: matchingClinics } = useQuery({
    queryKey: ['insurance-clinics', insuranceId, stateId, cityId, treatmentId],
    queryFn: async () => {
      if (!insuranceId) return null;

      const { data: ciData } = await supabase
        .from('clinic_insurances')
        .select('clinic_id')
        .eq('insurance_id', insuranceId);

      if (!ciData || ciData.length === 0) return { clinics: [], count: 0 };

      const clinicIds = ciData.map((ci: any) => ci.clinic_id);

      let query = supabase
        .from('agencies')
        .select('id, name, slug, rating, review_count, address, city_id, cities(name, states(abbreviation))')
        .eq('is_active', true)
        .in('id', clinicIds.slice(0, 100));

      if (cityId) {
        query = query.eq('city_id', cityId);
      } else if (stateId) {
        query = query.eq('cities.state_id', stateId);
      }

      const { data: clinics } = await query.limit(20);

      let filtered = clinics || [];
      if (treatmentId && filtered.length > 0) {
        const { data: ctData } = await supabase
          .from('clinic_treatments')
          .select('clinic_id, price_from, price_to')
          .eq('treatment_id', treatmentId)
          .in('agency_id', filtered.map((c: any) => c.id));

        const ctMap = new Map((ctData || []).map((ct: any) => [ct.clinic_id, ct]));
        filtered = filtered.filter((c: any) => ctMap.has(c.id)).map((c: any) => ({
          ...c,
          pricing: ctMap.get(c.id),
        }));
      }

      return {
        clinics: filtered.sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0)),
        count: clinicIds.length,
      };
    },
    enabled: !!insuranceId,
  });

  const selectedInsurance = insurances?.find(i => i.id === insuranceId);
  const selectedTreatment = treatments?.find(t => t.id === treatmentId);
  const selectedState = states?.find(s => s.id === stateId);
  const filteredCities = citySearch
    ? cities?.filter(c => c.name.toLowerCase().includes(citySearch.toLowerCase()))
    : cities;

  return (
    <PageLayout>
      <SEOHead
        title={seoContent?.meta_title || "Support Services Checker | Foster Care"}
        description={seoContent?.meta_description || "Check which fostering agencies offer the support services you need. Find agencies near you with the right expertise."}
        canonical="/tools/insurance-checker/"
      />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Support Services Checker</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find fostering agencies that offer the support services you need. Select your requirements to see matching agencies.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Check Services
              </CardTitle>
              <CardDescription>Select your requirements and location to find matching agencies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Support Type</Label>
                <Select value={insuranceId} onValueChange={setInsuranceId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select support type" />
                  </SelectTrigger>
                  <SelectContent>
                    {insurances?.map(ins => (
                      <SelectItem key={ins.id} value={ins.id}>{ins.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Region</Label>
                  <Select value={stateId} onValueChange={(v) => { setStateId(v); setCityId(''); }}>
                    <SelectTrigger>
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
                  <Label>City</Label>
                  <Select value={cityId} onValueChange={setCityId}>
                    <SelectTrigger>
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
              </div>

              <div className="space-y-2">
                <Label>Fostering Type (Optional)</Label>
                <Select value={treatmentId} onValueChange={setTreatmentId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Any type" />
                  </SelectTrigger>
                  <SelectContent>
                    {treatments?.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Results</CardTitle>
            </CardHeader>
            <CardContent>
              {matchingClinics ? (
                <div className="space-y-4">
                  <div className="text-center p-6 bg-primary/5 rounded-lg">
                    <CheckCircle className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-1">
                      {selectedInsurance?.name} Available At
                    </p>
                    <p className="text-4xl font-bold text-primary">{matchingClinics.count}</p>
                    <p className="text-sm text-muted-foreground">agencies on our platform</p>
                  </div>

                  {matchingClinics.clinics.length > 0 && (
                    <p className="text-sm text-muted-foreground text-center">
                      {matchingClinics.clinics.length} shown in your area
                    </p>
                  )}

                  <Button className="w-full" asChild>
                    <Link to={`/search?insurance=${selectedInsurance?.name || ''}&state=${selectedState?.abbreviation || ''}`}>
                      <Search className="h-4 w-4 mr-2" />
                      Browse All Matching Agencies
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Select your requirements to find matching agencies</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {matchingClinics?.clinics && matchingClinics.clinics.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Agencies Offering {selectedInsurance?.name}
              </CardTitle>
              <CardDescription>
                {selectedTreatment ? `Offering ${selectedTreatment.name} • ` : ''}
                {selectedState ? `${selectedState.name}` : 'All locations'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agency</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Rating</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matchingClinics.clinics.map((clinic: any) => (
                    <TableRow key={clinic.id}>
                      <TableCell className="font-medium">{clinic.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {clinic.cities?.name}, {clinic.cities?.states?.abbreviation}
                      </TableCell>
                      <TableCell className="text-right">
                        {clinic.rating ? (
                          <div className="flex items-center justify-end gap-1">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            {clinic.rating.toFixed(1)}
                          </div>
                        ) : '—'}
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost" asChild>
                          <Link to={`/agency/${clinic.slug || clinic.id}`}>
                            View <ArrowRight className="h-4 w-4 ml-1" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">How do I know if an agency offers the support I need?</h3>
              <p className="text-muted-foreground">
                Agencies on our platform specify their support services and fostering types. Select your requirements above to see verified agencies that match your needs.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">What types of support do fostering agencies provide?</h3>
              <p className="text-muted-foreground">
                Most agencies provide 24/7 support, training, supervision, peer groups, and therapeutic services. Some also offer specialist support for complex needs, disability, and therapeutic fostering.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">How can I verify an agency's credentials?</h3>
              <p className="text-muted-foreground">
                All agencies listed on Foster Care are Ofsted-registered. You can verify their Ofsted rating on their profile page or directly on the Ofsted website.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
