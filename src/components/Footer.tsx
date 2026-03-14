import { forwardRef } from "react";
import { Link } from "react-router-dom";
import {
  Facebook, Instagram, Twitter, Linkedin,
  MapPin, Heart, ChevronRight, Shield, CheckCircle, Lock,
} from "lucide-react";
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
    <footer ref={ref} {...props} className="bg-foreground text-background/80 relative overflow-hidden">
      {/* Subtle decorative gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Trust strip */}
      <div className="border-b border-background/8 relative">
        <div className="container py-5 px-4 md:px-8">
          <div className="flex flex-wrap justify-center gap-6 md:gap-12">
            {[
              { icon: CheckCircle, text: "Ofsted Registered Agencies" },
              { icon: Shield, text: "Safeguarding Focused" },
              { icon: Lock, text: "Data Privacy" },
              { icon: Heart, text: "Free for Foster Carers" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
                  <item.icon className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-xs font-semibold text-background/70">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="container py-12 md:py-16 px-4 md:px-8 relative">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10 lg:gap-6">

          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-5 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md shadow-primary/20">
                <Heart className="h-4 w-4" />
              </div>
              <span className="text-sm font-black text-background" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Foster<span className="text-primary">Connect</span>
              </span>
            </Link>
            <p className="text-background/40 mb-6 text-sm leading-relaxed max-w-xs">
              The UK's trusted fostering agency directory. Find Ofsted-rated agencies, read reviews, and start your fostering journey with confidence.
            </p>

            <div className="flex gap-2">
              {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
                <span key={i} className="h-9 w-9 rounded-lg bg-background/5 border border-background/8 flex items-center justify-center hover:bg-background/10 hover:border-background/15 transition-colors cursor-pointer">
                  <Icon className="h-3.5 w-3.5 opacity-40" />
                </span>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-[11px] font-black text-background/50 mb-5 uppercase tracking-[0.15em]">Company</h4>
            <ul className="space-y-2.5">
              {company.map((item) => (
                <li key={item.path}>
                  <Link to={item.path} className="text-sm text-background/40 hover:text-primary transition-colors">{item.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-[11px] font-black text-background/50 mb-5 uppercase tracking-[0.15em]">Resources</h4>
            <ul className="space-y-2.5">
              {resources.map((item) => (
                <li key={item.path}>
                  <Link to={item.path} className="text-sm text-background/40 hover:text-primary transition-colors">{item.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Locations & Categories */}
          <div className="col-span-2 lg:col-span-2">
            <h4 className="text-[11px] font-black text-background/50 mb-5 uppercase tracking-[0.15em]">Find Agencies</h4>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <p className="text-[10px] font-bold text-background/20 uppercase tracking-[0.15em] mb-2.5">By Region</p>
                <ul className="space-y-2">
                  {ACTIVE_REGIONS.map((region) => (
                    <li key={region.slug}>
                      <Link to={`/${region.slug}/`} className="text-sm text-background/40 hover:text-primary transition-colors flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 text-background/15" />
                        {region.name}
                      </Link>
                    </li>
                  ))}
                </ul>
                <p className="text-[10px] font-bold text-background/20 uppercase tracking-[0.15em] mb-2.5 mt-5">Popular Cities</p>
                <ul className="space-y-2">
                  {POPULAR_CITIES.slice(0, 6).map((city) => (
                    <li key={city.slug}>
                      <Link to={`/england/${city.slug}/`} className="text-sm text-background/40 hover:text-primary transition-colors">
                        {city.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[10px] font-bold text-background/20 uppercase tracking-[0.15em] mb-2.5">By Type</p>
                <ul className="space-y-2">
                  {topCategories.map((cat) => (
                    <li key={cat.slug}>
                      <Link to={`/categories/${cat.slug}/`} className="text-sm text-background/40 hover:text-primary transition-colors">
                        {cat.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="border-t border-background/8 mt-10 pt-5">
          <p className="text-[10px] text-background/20 text-center max-w-3xl mx-auto leading-relaxed">
            Foster Connect is a directory service. Information displayed is for guidance only. Please confirm directly with agencies for the most current details about their services and registration status.
            Agency registration is verified with Ofsted and relevant UK regulatory bodies.
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-background/8">
        <div className="container py-4 px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 text-[11px] text-background/25">
              <span>© {new Date().getFullYear()} Foster Connect. All rights reserved.</span>
              {legal.map((item) => (
                <span key={item.path}>
                  <span className="text-background/10 mr-3">|</span>
                  <Link to={item.path} className="hover:text-background/50 transition-colors">{item.name}</Link>
                </span>
              ))}
            </div>

            <Link
              to="/list-your-agency/"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-bold hover:bg-primary/15 transition-all"
            >
              For Agencies: List Your Service
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';
