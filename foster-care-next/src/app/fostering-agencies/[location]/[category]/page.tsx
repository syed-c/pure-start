import { Metadata } from 'next';
import { getFosteringCategory, getCities, getFosteringCategories, getAgenciesByCategoryAndCity } from '@/lib/data';

interface Props {
  params: Promise<{ location: string; category: string }>;
}

export async function generateStaticParams() {
  const categories = await getFosteringCategories();
  const cities = await getCities();
  const params = [];
  
  for (const city of cities.slice(0, 10)) {
    for (const category of categories) {
      params.push({ location: city.slug, category: category.slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { location, category } = await params;
  const cat = await getFosteringCategory(category);
  const catName = cat?.name || category.replace(/-/g, ' ');
  const cityName = location.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  
  return {
    title: `${catName} Agencies in ${cityName} — Compare Ofsted-Rated Agencies`,
    description: `Find ${catName.toLowerCase()} agencies in ${cityName}. Compare Ofsted-rated fostering agencies, ratings, and services. Get contact details and reviews.`,
    alternates: {
      canonical: `https://www.foster-care.co.uk/fostering-agencies/${location}/${category}`,
    },
  };
}

export default async function CategoryLocationPage({ params }: Props) {
  const { location, category } = await params;
  const cat = await getFosteringCategory(category);
  const categoryName = cat?.name || category.replace(/-/g, ' ');
  const cityName = location.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const agencies = await getAgenciesByCategoryAndCity(category, location);
  const categories = await getFosteringCategories();
  const cities = await getCities();

  const displayCat = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Hero */}
      <section className="relative py-20 bg-gradient-to-b from-[#0a0a0f] to-[#0f0f14]">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              <span className="text-[#f97316]">{displayCat}</span> Agencies in {cityName}
            </h1>
            <p className="text-slate-400 text-lg mt-4">
              Compare Ofsted-rated {categoryName.toLowerCase()} agencies in {cityName}
            </p>
          </div>
        </div>
      </section>

      {/* Agencies */}
      <section className="py-12 bg-[#0f0f14]">
        <div className="container px-4">
          <h2 className="text-2xl font-bold text-white mb-8">
            {agencies.length > 0 ? `${agencies.length} Agencies Found` : 'No Agencies Found'}
          </h2>
          
          {agencies.length > 0 ? (
            <div className="grid gap-4">
              {agencies.slice(0, 20).map((agency) => (
                <a
                  key={agency.id}
                  href={`/agencies/${agency.slug}`}
                  className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-[#f97316] transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{agency.name}</h3>
                      <p className="text-slate-400 text-sm mt-1">{agency.address}</p>
                      <p className="text-slate-400 text-sm">{agency.city}, {agency.state}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-[#f97316] font-semibold">★ {agency.rating?.toFixed(1) || 'N/A'}</div>
                      <div className="text-slate-400 text-sm">({agency.review_count || 0} reviews)</div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-xl bg-white/5 border border-white/10 text-center">
              <p className="text-slate-400">
                No {categoryName.toLowerCase()} agencies found in {cityName}. 
                Browse other locations or contact us for assistance.
              </p>
              <div className="flex flex-wrap gap-3 justify-center mt-4">
                <a href="/contact" className="px-6 py-3 bg-[#f97316] text-white rounded-full hover:bg-[#ea580c] transition-colors">
                  Get in Touch
                </a>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Internal Linking: Category → Location */}
      <section className="py-12 bg-[#0a0a0f]">
        <div className="container px-4">
          <h2 className="text-2xl font-bold text-white mb-6">
            View {displayCat} Agencies by Location
          </h2>
          <div className="flex flex-wrap gap-3">
            {cities.slice(0, 16).map((city) => (
              <a
                key={city.slug}
                href={`/fostering-agencies/${city.slug}/${category}`}
                className="px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:border-[#f97316] text-white transition-colors"
              >
                {city.name}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Internal Linking: Location → Category */}
      <section className="py-12 bg-[#0f0f14]">
        <div className="container px-4">
          <h2 className="text-2xl font-bold text-white mb-6">
            All Fostering Types in {cityName}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <a
                key={cat.slug}
                href={`/fostering-agencies/${location}/${cat.slug}`}
                className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#f97316] text-white transition-colors"
              >
                {cat.name}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-gradient-to-r from-[#f97316] to-pink-500">
        <div className="container px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Are you a {categoryName} agency in {cityName}?
          </h2>
          <p className="text-white/90 mb-6">List your agency on Foster Care UK.</p>
          <a
            href="/list-your-agency"
            className="inline-block px-8 py-3 bg-white text-[#f97316] font-semibold rounded-full hover:bg-gray-100 transition-colors"
          >
            List Your Agency
          </a>
        </div>
      </section>
    </div>
  );
}