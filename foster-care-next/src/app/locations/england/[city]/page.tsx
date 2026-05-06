import { Metadata } from 'next';
import { getCity, getCities, getAgenciesByCity } from '@/lib/data';

interface Props {
  params: Promise<{ city: string }>;
}

export async function generateStaticParams() {
  const cities = await getCities();
  return cities.map((city) => ({ city: city.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const cityData = await getCity(city);
  const cityName = cityData?.name || city;
  
  return {
    title: `${cityName} Fostering Agencies | Find Foster Care in ${cityName}`,
    description: `Find verified fostering agencies in ${cityName}. Connect with the best fostering agencies near you for short-term, long-term, emergency and therapeutic fostering.`,
    alternates: {
      canonical: `https://www.foster-care.co.uk/locations/england/${city}`,
    },
  };
}

export default async function CityPage({ params }: Props) {
  const { city } = await params;
  const cityData = await getCity(city);
  const agencies = await getAgenciesByCity(cityData?.name || city);
  const cities = await getCities();

  const cityName = cityData?.name || city;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Hero */}
      <section className="relative py-20 bg-gradient-to-b from-[#0a0a0f] to-[#0f0f14]">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Fostering Agencies in <span className="text-[#f97316]">{cityName}</span>
            </h1>
            <p className="text-slate-400 text-lg mt-4">
              Find verified fostering agencies near you
            </p>
          </div>
        </div>
      </section>

      {/* Agencies List */}
      <section className="py-12 bg-[#0f0f14]">
        <div className="container px-4">
          <h2 className="text-2xl font-bold text-white mb-8">
            {agencies.length > 0 ? `${agencies.length} Agencies Found` : 'No Agencies Found'}
          </h2>
          
          {agencies.length > 0 ? (
            <div className="grid gap-4">
              {agencies.map((agency) => (
                <a
                  key={agency.id}
                  href={`/agencies/${agency.slug}`}
                  className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-[#f97316] transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{agency.name}</h3>
                      <p className="text-slate-400 text-sm mt-1">{agency.address}</p>
                      <p className="text-slate-400 text-sm">{agency.city}, {agency.state} {agency.postcode}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-[#f97316] font-semibold">★ {agency.rating.toFixed(1)}</div>
                      <div className="text-slate-400 text-sm">({agency.review_count} reviews)</div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-xl bg-white/5 border border-white/10 text-center">
              <p className="text-slate-400">
                No agencies found in {cityName}. Try a nearby city or contact us for assistance.
              </p>
              <a href="/contact" className="inline-block mt-4 px-6 py-3 bg-[#f97316] text-white rounded-full hover:bg-[#ea580c] transition-colors">
                Get in Touch
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Other Cities */}
      <section className="py-12 bg-[#0a0a0f]">
        <div className="container px-4">
          <h2 className="text-2xl font-bold text-white mb-6">Other Cities</h2>
          <div className="flex flex-wrap gap-3">
            {cities.filter(c => c.slug !== city).slice(0, 12).map((c) => (
              <a
                key={c.slug}
                href={`/locations/england/${c.slug}`}
                className="px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:border-[#f97316] text-white transition-colors"
              >
                {c.name}
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}