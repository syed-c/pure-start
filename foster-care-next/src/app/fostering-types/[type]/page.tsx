import { Metadata } from 'next';
import { getFosteringCategory, getFosteringCategories, getCities } from '@/lib/data';

interface Props {
  params: Promise<{ type: string }>;
}

export async function generateStaticParams() {
  const categories = await getFosteringCategories();
  return categories.map((cat) => ({ type: cat.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params;
  const category = await getFosteringCategory(type);
  const name = category?.name || type.replace(/-/g, ' ');
  
  return {
    title: `${name} Fostering Agencies | Find ${name} in UK`,
    description: `Find verified ${name.toLowerCase()} agencies across the UK. Connect with specialist agencies providing ${name.toLowerCase()} services.`,
    alternates: {
      canonical: `https://www.foster-care.co.uk/fostering-types/${type}`,
    },
  };
}

export default async function FosteringTypePage({ params }: Props) {
  const { type } = await params;
  const category = await getFosteringCategory(type);
  const categories = await getFosteringCategories();
  const cities = await getCities();

  const name = category?.name || type.replace(/-/g, ' ');
  const displayName = name.charAt(0).toUpperCase() + name.slice(1);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <section className="relative py-20 bg-gradient-to-b from-[#0a0a0f] to-[#0f0f14]">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              <span className="text-[#f97316]">{displayName}</span> Fostering
            </h1>
            <p className="text-slate-400 text-lg mt-4 max-w-2xl mx-auto">
              {category?.description || `Find verified agencies providing ${name} services across the UK.`}
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 bg-[#0f0f14]">
        <div className="container px-4">
          <h2 className="text-2xl font-bold text-white mb-6">Find {displayName} by Location</h2>
          <div className="flex flex-wrap gap-3">
            {cities.slice(0, 12).map((city) => (
              <a
                key={city.slug}
                href={`/fostering-types/${type}/locations/england/${city.slug}`}
                className="px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:border-[#f97316] text-white transition-colors"
              >
                {city.name}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-[#0a0a0f]">
        <div className="container px-4">
          <h2 className="text-2xl font-bold text-white mb-6">Other Fostering Types</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.filter(c => c.slug !== type).map((cat) => (
              <a
                key={cat.slug}
                href={`/fostering-types/${cat.slug}`}
                className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#f97316] text-white transition-colors"
              >
                {cat.name}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-gradient-to-r from-[#f97316] to-pink-500">
        <div className="container px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to explore {name}?</h2>
          <p className="text-white/90 mb-6">Contact agencies specializing in {name} today.</p>
          <a
            href="/contact"
            className="inline-block px-8 py-3 bg-white text-[#f97316] font-semibold rounded-full hover:bg-gray-100 transition-colors"
          >
            Get in Touch
          </a>
        </div>
      </section>
    </div>
  );
}