import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { 
  Facebook, Instagram, Twitter, Linkedin,
  MapPin, Heart, ChevronRight, Shield, CheckCircle, Lock, Home,
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
    <footer ref={ref} {...props} className="bg-foreground text-background/80 relative">
      {/* Trust strip */}
      <div className="border-b border-background/10">
        <div className="container py-4 px-4 md:px-8">
          <div className="flex flex-wrap justify-center gap-8 md:gap-14">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium">Ofsted Registered Agencies</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium">Safeguarding Focused</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium">Data Privacy</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium">Free for Foster Carers</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main footer */}
      <div className="container py-10 md:py-12 px-4 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-6">
          
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Home className="h-3.5 w-3.5" />
              </div>
              <span className="text-sm font-bold text-background">
                Foster<span className="text-primary">Connect</span>
              </span>
            </Link>
            <p className="text-background/50 mb-5 text-sm leading-relaxed max-w-xs">
              The UK's trusted fostering agency directory. Find Ofsted-rated agencies, read reviews, and start your fostering journey with confidence.
            </p>
            
            <div className="flex gap-2">
              {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
                <span key={i} className="h-8 w-8 rounded-md bg-background/5 border border-background/10 flex items-center justify-center opacity-25">
                  <Icon className="h-3.5 w-3.5" />
                </span>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-bold text-background mb-4 uppercase tracking-wider">Company</h4>
            <ul className="space-y-2">
              {company.map((item) => (
                <li key={item.path}>
                  <Link to={item.path} className="text-sm text-background/50 hover:text-primary transition-colors">{item.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-bold text-background mb-4 uppercase tracking-wider">Resources</h4>
            <ul className="space-y-2">
              {resources.map((item) => (
                <li key={item.path}>
                  <Link to={item.path} className="text-sm text-background/50 hover:text-primary transition-colors">{item.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Locations & Categories */}
          <div className="col-span-2 lg:col-span-2">
            <h4 className="text-xs font-bold text-background mb-4 uppercase tracking-wider">Find Agencies</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-semibold text-background/30 uppercase tracking-wider mb-2">By Region</p>
                <ul className="space-y-1.5">
                  {ACTIVE_REGIONS.map((region) => (
                    <li key={region.slug}>
                      <Link to={`/${region.slug}/`} className="text-sm text-background/50 hover:text-primary transition-colors flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 text-background/20" />
                        {region.name}
                      </Link>
                    </li>
                  ))}
                </ul>
                <p className="text-[10px] font-semibold text-background/30 uppercase tracking-wider mb-2 mt-4">Popular Cities</p>
                <ul className="space-y-1.5">
                  {POPULAR_CITIES.slice(0, 6).map((city) => (
                    <li key={city.slug}>
                      <Link to={`/england/${city.slug}/`} className="text-sm text-background/50 hover:text-primary transition-colors">
                        {city.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-background/30 uppercase tracking-wider mb-2">By Type</p>
                <ul className="space-y-1.5">
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
        </div>

        {/* Disclaimer */}
        <div className="border-t border-background/10 mt-8 pt-4">
          <p className="text-[10px] text-background/25 text-center max-w-3xl mx-auto leading-relaxed">
            Foster Connect is a directory service. Information displayed is for guidance only. Please confirm directly with agencies for the most current details about their services and registration status. 
            Agency registration is verified with Ofsted and relevant UK regulatory bodies.
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-background/10">
        <div className="container py-4 px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 text-[11px] text-background/35">
              <span>© {new Date().getFullYear()} Foster Connect. All rights reserved.</span>
              {legal.map((item) => (
                <span key={item.path}>
                  <span className="text-background/15 mr-3">|</span>
                  <Link to={item.path} className="hover:text-background/60 transition-colors">{item.name}</Link>
                </span>
              ))}
            </div>
            
            <Link 
              to="/list-your-agency/" 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 border border-primary/25 text-primary text-xs font-semibold hover:bg-primary/20 transition-all"
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
