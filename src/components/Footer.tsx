import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { Heart, MapPin, Mail, Phone, Shield, CheckCircle, ArrowRight, ExternalLink } from "lucide-react";

const company = [
  { name: "About Us", path: "/about" },
  { name: "How It Works", path: "/how-it-works" },
  { name: "Contact", path: "/contact" },
  { name: "FAQ", path: "/faq" },
  { name: "Blog", path: "/blog" },
];

const resources = [
  { name: "Find Agencies", path: "/search" },
  { name: "Browse by Location", path: "/locations" },
  { name: "Fostering Categories", path: "/categories" },
  { name: "Become a Foster Carer", path: "/become-foster-carer" },
  { name: "Allowance Calculator", path: "/tools/fostering-allowance-calculator" },
  { name: "Claim Your Profile", path: "/claim-profile" },
];

const legal = [
  { name: "Privacy Policy", path: "/privacy" },
  { name: "Terms of Service", path: "/terms" },
  { name: "Editorial Policy", path: "/editorial-policy" },
  { name: "Verification Policy", path: "/verification-policy" },
];

const regions = [
  { name: "England", path: "/fostering-agencies" },
  { name: "Scotland", path: "/fostering-agencies/glasgow" },
  { name: "Wales", path: "/fostering-agencies/cardiff" },
  { name: "Northern Ireland", path: "/fostering-agencies/belfast" },
];

const popularCities = [
  { name: "London", path: "/fostering-agencies/london" },
  { name: "Birmingham", path: "/fostering-agencies/birmingham" },
  { name: "Manchester", path: "/fostering-agencies/manchester" },
  { name: "Leeds", path: "/fostering-agencies/leeds" },
  { name: "Glasgow", path: "/fostering-agencies/glasgow" },
  { name: "Liverpool", path: "/fostering-agencies/liverpool" },
];

export const Footer = forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  (props, ref) => {
    const currentYear = new Date().getFullYear();

    return (
      <footer ref={ref} {...props} className="bg-slate-950 border-t border-slate-800">
        {/* Main Footer Content */}
        <div className="container py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Brand Column */}
            <div className="lg:col-span-2 space-y-4">
              <Link to="/" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-teal-500 shadow-lg shadow-teal-500/25">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-extrabold text-white">
                  Foster<span className="text-teal-400">Care</span> UK
                </span>
              </Link>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                The UK's leading directory for fostering agencies. Find trusted, Ofsted-registered agencies across England, Scotland, Wales, and Northern Ireland.
              </p>
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg text-xs font-medium text-teal-400">
                  <Shield className="h-3.5 w-3.5" />
                  Ofsted Verified
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg text-xs font-medium text-green-400">
                  <CheckCircle className="h-3.5 w-3.5" />
                  SSL Secure
                </div>
              </div>
            </div>

            {/* Company */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Company</h4>
              <ul className="space-y-2.5">
                {company.map((item) => (
                  <li key={item.path}>
                    <Link to={item.path} className="text-sm text-slate-400 hover:text-teal-400 transition-colors">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Resources</h4>
              <ul className="space-y-2.5">
                {resources.map((item) => (
                  <li key={item.path}>
                    <Link to={item.path} className="text-sm text-slate-400 hover:text-teal-400 transition-colors">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Locations */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Locations</h4>
              <ul className="space-y-2.5">
                {regions.map((item) => (
                  <li key={item.path}>
                    <Link to={item.path} className="text-sm text-slate-400 hover:text-teal-400 transition-colors">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="pt-2">
                <p className="text-xs font-medium text-slate-500 mb-2">Popular Cities</p>
                <div className="flex flex-wrap gap-2">
                  {popularCities.slice(0, 3).map((city) => (
                    <Link 
                      key={city.path} 
                      to={city.path} 
                      className="text-xs px-2 py-1 bg-slate-800 rounded text-slate-400 hover:text-teal-400 hover:bg-slate-700 transition-colors"
                    >
                      {city.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter CTA */}
        <div className="border-t border-b border-slate-800">
          <div className="container py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-white">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/20">
                  <Mail className="h-5 w-5 text-teal-400" />
                </div>
                <div>
                  <p className="font-bold text-sm"> Stay updated on fostering news</p>
                  <p className="text-xs text-slate-400">Tips, advice, and agency updates — direct to your inbox.</p>
                </div>
              </div>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-teal-500 text-white text-sm font-bold rounded-xl px-5 py-2.5 hover:bg-teal-600 transition-colors"
              >
                Subscribe <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="container py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              © {currentYear} Foster Care UK. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              {legal.map((item) => (
                <Link key={item.path} to={item.path} className="text-sm text-slate-500 hover:text-teal-400 transition-colors">
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    );
  }
);

export default Footer;