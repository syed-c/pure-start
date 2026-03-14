import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { Heart, ArrowRight, MapPin } from "lucide-react";
import { ACTIVE_REGIONS, POPULAR_CITIES, FOSTERING_CATEGORIES } from "@/lib/constants/activeRegions";

const company = [
  { name: "About", path: "/about/" },
  { name: "How It Works", path: "/how-it-works/" },
  { name: "Contact", path: "/contact/" },
  { name: "FAQs", path: "/faq/" },
  { name: "Blog", path: "/blog/" },
];

const resources = [
  { name: "Find Agencies", path: "/search/" },
  { name: "Claim Profile", path: "/claim-profile/" },
  { name: "List Your Agency", path: "/list-your-agency/" },
  { name: "All Categories", path: "/categories/" },
  { name: "Sitemap", path: "/sitemap/" },
];

const legal = [
  { name: "Privacy Policy", path: "/privacy/" },
  { name: "Terms of Service", path: "/terms/" },
  { name: "Editorial Policy", path: "/editorial-policy/" },
  { name: "Verification Policy", path: "/verification-policy/" },
];

const topCategories = FOSTERING_CATEGORIES.slice(0, 6);

export const Footer = forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  (props, ref) => {
  return (
    <footer ref={ref} {...props} className="bg-foreground text-background/70">
      {/* Main footer */}
      <div className="container py-14 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 lg:gap-8">

          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Heart className="h-3.5 w-3.5" />
              </div>
              <span className="text-sm font-extrabold text-background">
                Foster<span className="text-primary">Connect</span>
              </span>
            </Link>
            <p className="text-background/40 text-sm leading-relaxed max-w-xs mb-6">
              The UK's trusted fostering agency directory. Find Ofsted-rated agencies and start your fostering journey.
            </p>
            <Link
              to="/list-your-agency/"
              className="inline-flex items-center gap-1.5 text-primary text-sm font-semibold hover:underline"
            >
              List Your Agency <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-bold text-background/40 mb-4 uppercase tracking-wider">Company</h4>
            <ul className="space-y-2.5">
              {company.map((item) => (
                <li key={item.path}>
                  <Link to={item.path} className="text-sm text-background/50 hover:text-primary transition-colors">{item.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-bold text-background/40 mb-4 uppercase tracking-wider">Resources</h4>
            <ul className="space-y-2.5">
              {resources.map((item) => (
                <li key={item.path}>
                  <Link to={item.path} className="text-sm text-background/50 hover:text-primary transition-colors">{item.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Locations */}
          <div>
            <h4 className="text-xs font-bold text-background/40 mb-4 uppercase tracking-wider">Locations</h4>
            <ul className="space-y-2.5">
              {ACTIVE_REGIONS.map((region) => (
                <li key={region.slug}>
                  <Link to={`/${region.slug}/`} className="text-sm text-background/50 hover:text-primary transition-colors flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-background/20" />
                    {region.name}
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <p className="text-[10px] text-background/25 uppercase tracking-wider font-semibold mb-2">Popular</p>
                {POPULAR_CITIES.slice(0, 4).map((city) => (
                  <Link key={city.slug} to={`/england/${city.slug}/`} className="block text-sm text-background/40 hover:text-primary transition-colors py-0.5">
                    {city.name}
                  </Link>
                ))}
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-bold text-background/40 mb-4 uppercase tracking-wider">Fostering Types</h4>
            <ul className="space-y-2.5">
              {topCategories.map((cat) => (
                <li key={cat.slug}>
                  <Link to={`/categories/${cat.slug}/`} className="text-sm text-background/50 hover:text-primary transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-background/10">
        <div className="container py-5">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-4 gap-y-1 text-xs text-background/30">
              <span>© {new Date().getFullYear()} Foster Connect</span>
              {legal.map((item) => (
                <Link key={item.path} to={item.path} className="hover:text-background/50 transition-colors">
                  {item.name}
                </Link>
              ))}
            </div>
            <p className="text-[11px] text-background/20 text-center md:text-right max-w-lg">
              Foster Connect is a directory service. Information displayed is for guidance only. Agency registration is verified with Ofsted and relevant UK regulatory bodies.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';
