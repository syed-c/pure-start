import { Metadata } from 'next';
import { getCity, getCities, getFosteringCategories, getAgenciesByCategoryAndCity } from '@/lib/data';

interface Props {
  params: Promise<{ city: string; borough: string }>;
}

export async function generateStaticParams() {
  const cities = await getCities();
  const boroughs = ['camden', 'islington', 'hackney', 'tower-hamlets', 'greenwich', 'lewisham'];
  const params = [];
  for (const city of cities) {
    for (const borough of boroughs) {
      params.push({ city: city.slug, borough });
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city, borough } = await params;
  const cityData = await getCity(city);
  const cityName = cityData?.name || city;
  const boroughName = borough.replace(/-/g, ' ');
  
  return {
    title: `${boroughName.charAt(0).toUpperCase() + boroughName.slice(1)} Fostering Agencies | ${cityName} Foster Care`,
    description: `Find verified fostering agencies in ${boroughName}, ${cityName}. Connect with the best fostering agencies near you.`,
    alternates: {
      canonical: `https://www.foster-care.co.uk/locations/england/${city}/${borough}`,
    },
  };
}

export default async function BoroughPage({ params }: Props) {
  const { city, borough } = await params;
  const cityData = await getCity(city);
  const agencies = await getAgenciesByCategoryAndCity('', city);
  const categories = await getFosteringCategories();
  const cities = await getCities();

  const cityName = cityData?.name || city;
  const boroughName = borough.replace(/-/g, ' ');
  const boroughDisplay = boroughName.charAt(0).toUpperCase() + boroughName.slice(1);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <section className="relative py-20 bg-gradient-to-b from-[#0a0a0f] to-[#0f0f14]">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Fostering Agencies in <span className="text-[#f97316]">{boroughDisplay}</span>, {cityName}
            </h1>
            <p className="text-slate-400 text-lg mt-4">
              Find verified fostering agencies in your area
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 bg-[#0f0f14]">
        <div className="container px-4">
          <h2 className="text-2xl font-bold text-white mb-8">
            {agencies.length > 0 ? `${agencies.length} Agencies Found` : 'No Agencies Found'}
          </h2>
          
          {agencies.length > 0 ? (
            <div className="grid gap-4">
              {agencies.slice(0, 10).map((agency) => (
                <a
                  key={agency.id}
                  href={`/agencies/${agency.slug}`}
                  className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-[#f97316] transition-colors"
                >
                  <h3 className="text-lg font-semibold text-white">{agency.name}</h3>
                  <p className="text-slate-400 text-sm mt-1">{agency.address}</p>
                </a>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-xl bg-white/5 border border-white/10 text-center">
              <p className="text-slate-400">
                No agencies found in {boroughDisplay}. Browse by service type:
              </p>
              <div className="flex flex-wrap gap-3 justify-center mt-4">
                {categories.slice(0, 4).map((cat) => (
                  <a
                    key={cat.slug}
                    href={`/fostering-types/${cat.slug}/locations/england/${city}`}
                    className="px-4 py-2 rounded-full bg-[#f97316] text-white text-sm"
                  >
                    {cat.name}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}