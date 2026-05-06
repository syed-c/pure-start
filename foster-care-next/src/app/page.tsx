import { Metadata } from 'next';
import { getFosteringCategories, getCities } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Find Fostering Agencies in UK | Foster Care',
  description: 'Connect with verified fostering agencies across England, Scotland, Wales & Northern Ireland. Find your perfect foster agency today.',
  alternates: {
    canonical: 'https://www.foster-care.co.uk/',
  },
};

export default async function Home() {
  const categories = await getFosteringCategories();
  const cities = await getCities();

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-[#0a0a0f]">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#f97316]/20 via-transparent to-transparent" />
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </div>

        {/* Floating shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#f97316]/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/15 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[150px]" />
        </div>

        <div className="container relative z-10 px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Top Badge */}
            <div className="mb-6">
              <div className="inline-flex items-center bg-white/10 backdrop-blur-md border border-white/20 text-white px-5 py-2 rounded-full">
                <span className="text-yellow-400 mr-2">★</span>
                Trusted by 10,000+ Families
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-[1.1]">
              Find Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f97316] via-orange-400 to-pink-400">
                Perfect Foster
              </span>
              {' '}Agency
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-slate-400 mt-6 max-w-2xl mx-auto">
              Connect with verified fostering agencies across England, Scotland, Wales & Northern Ireland. 
              Find the right support for your family journey.
            </p>

            {/* Search Box */}
            <div className="mt-10">
              <form action="/search" method="GET" className="flex gap-2 max-w-xl mx-auto">
                <input
                  type="text"
                  name="q"
                  placeholder="Search by location or service type..."
                  className="flex-1 px-6 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f97316]"
                />
                <button
                  type="submit"
                  className="px-8 py-4 rounded-full bg-[#f97316] text-white font-semibold hover:bg-[#ea580c] transition-colors"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Stats */}
            <div className="mt-12 flex justify-center gap-12 text-white">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#f97316]">{categories.length}+</div>
                <div className="text-slate-400 text-sm">Service Types</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#f97316]">{cities.length}+</div>
                <div className="text-slate-400 text-sm">Locations</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#f97316]">500+</div>
                <div className="text-slate-400 text-sm">Agencies</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOSTERING TYPES SECTION */}
      <section className="py-20 bg-[#0a0a0f]">
        <div className="container px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            Types of Fostering
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.slice(0, 8).map((category) => (
              <a
                key={category.slug}
                href={`/fostering-types/${category.slug}`}
                className="group p-6 rounded-xl bg-white/5 border border-white/10 hover:border-[#f97316] transition-colors"
              >
                <h3 className="text-lg font-semibold text-white group-hover:text-[#f97316] transition-colors">
                  {category.name}
                </h3>
                <p className="text-slate-400 text-sm mt-2 line-clamp-2">
                  {category.description}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CITIES SECTION */}
      <section className="py-20 bg-[#0f0f14]">
        <div className="container px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            Find Agencies by City
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cities.map((city) => (
              <a
                key={city.slug}
                href={`/locations/england/${city.slug}`}
                className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-[#f97316] text-white text-center transition-colors"
              >
                {city.name}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 bg-gradient-to-r from-[#f97316] to-pink-500">
        <div className="container px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Your Fostering Journey?
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Connect with our team to learn more about becoming a foster car or finding the right agency.
          </p>
          <a
            href="/contact"
            className="inline-block px-8 py-4 bg-white text-[#f97316] font-semibold rounded-full hover:bg-gray-100 transition-colors"
          >
            Get in Touch
          </a>
        </div>
      </section>
    </div>
  );
}