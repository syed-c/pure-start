import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown, Search, MapPin, Heart, Phone, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { POPULAR_CITIES, FOSTERING_CATEGORIES } from "@/lib/constants/activeRegions";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fosterTypes = [
    { name: "Emergency Fostering", slug: "emergency-fostering", icon: "🚨" },
    { name: "Short-Term Fostering", slug: "short-term-fostering", icon: "📅" },
    { name: "Long-Term Fostering", slug: "long-term-fostering", icon: "🏠" },
    { name: "Respite Fostering", slug: "respite-fostering", icon: "💝" },
    { name: "Therapeutic Fostering", slug: "therapeutic-fostering", icon: "🧠" },
    { name: "Parent & Child", slug: "parent-and-child-fostering", icon: "👶" },
  ];

  const regions = [
    { name: "England", slug: "england" },
    { name: "Scotland", slug: "scotland" },
    { name: "Wales", slug: "wales" },
    { name: "Northern Ireland", slug: "northern-ireland" },
  ];

  const topCities = POPULAR_CITIES.slice(0, 8);

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled
        ? 'bg-slate-900/95 backdrop-blur-xl shadow-lg shadow-black/20 border-b border-slate-700'
        : 'bg-slate-900/80 backdrop-blur-md border-b border-slate-800'
    }`}>
      <div className="container">
        <div className="flex items-center justify-between h-16 lg:h-[70px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-teal-500 shadow-lg shadow-teal-500/25">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-extrabold text-white tracking-tight hidden sm:block">
              Foster<span className="text-teal-400">Care</span> UK
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {/* Fostering Types Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all rounded-lg outline-none">
                Fostering Types
                <ChevronDown className="h-4 w-4 text-slate-500" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72 rounded-xl p-2 bg-slate-800 border-slate-700 shadow-xl shadow-black/30 z-50">
                <DropdownMenuLabel className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 py-2">Select Fostering Type</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-700" />
                {fosterTypes.map((cat) => (
                  <DropdownMenuItem key={cat.slug} asChild className="rounded-lg cursor-pointer py-3 px-3 hover:bg-slate-700 hover:text-teal-400">
                    <Link to={`/categories/${cat.slug}`} className="flex items-center gap-3">
                      <span className="text-lg">{cat.icon}</span>
                      <span className="font-semibold">{cat.name}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem asChild className="rounded-lg cursor-pointer py-2.5 px-3 bg-slate-700/50 hover:bg-slate-700 text-teal-400 font-semibold">
                  <Link to="/categories" className="flex items-center justify-between w-full">
                    View All Types <ArrowRight className="h-4 w-4" />
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Locations Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all rounded-lg outline-none">
                Locations
                <ChevronDown className="h-4 w-4 text-slate-500" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 rounded-xl p-2 bg-slate-800 border-slate-700 shadow-xl shadow-black/30 z-50">
                <DropdownMenuLabel className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 py-2">UK Regions</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-700" />
                {regions.map((region) => (
                  <DropdownMenuItem key={region.slug} asChild className="rounded-lg cursor-pointer py-2.5 px-3 hover:bg-slate-700 hover:text-teal-400">
                    <Link to={`/${region.slug}`} className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-teal-500" />
                      <span className="font-semibold">{region.name}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator className="bg-slate-700 my-2" />
                <DropdownMenuLabel className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 py-2">Popular Cities</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-700" />
                {topCities.map((city) => (
                  <DropdownMenuItem key={city.slug} asChild className="rounded-lg cursor-pointer py-2 px-3 text-slate-300 hover:bg-slate-700 hover:text-white">
                    <Link to={`/england/${city.slug}`}>{city.name}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link to="/search" className="px-4 py-2.5 text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all rounded-lg">
              Find Agency
            </Link>

            <Link to="/become-foster-carer" className="px-4 py-2.5 text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all rounded-lg">
              Become Carer
            </Link>

            <Link to="/about" className="px-4 py-2.5 text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all rounded-lg">
              About
            </Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <Link to="/contact" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-teal-400 transition-colors">
              <Phone className="h-4 w-4" />
              <span>Contact</span>
            </Link>
            <Button
              size="sm"
              className="rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 text-white font-bold h-10 px-5 shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all"
              onClick={() => navigate("/search")}
            >
              <Search className="h-4 w-4 mr-2" />
              Find Agency
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-xl hover:bg-slate-800 transition-colors text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden pb-6 border-t border-slate-800 animate-fade-in">
            <div className="pt-4 space-y-4">
              {/* Search Box */}
              <button
                onClick={() => { setMobileMenuOpen(false); navigate("/search"); }}
                className="flex items-center gap-3 w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 text-sm text-slate-400"
              >
                <Search className="h-4 w-4" />
                Search agencies, locations...
              </button>

              {/* Mobile Links */}
              <div className="space-y-1">
                <p className="px-2 py-2 text-xs font-bold text-slate-500 uppercase tracking-widest">Fostering Types</p>
                {fosterTypes.map((cat) => (
                  <Link
                    key={cat.slug}
                    to={`/categories/${cat.slug}`}
                    className="flex items-center gap-3 px-3 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>{cat.icon}</span> {cat.name}
                  </Link>
                ))}
                
                <div className="h-px bg-slate-800 my-3" />
                
                <p className="px-2 py-2 text-xs font-bold text-slate-500 uppercase tracking-widest">Locations</p>
                {regions.map((region) => (
                  <Link
                    key={region.slug}
                    to={`/${region.slug}`}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-200 hover:bg-slate-800 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <MapPin className="h-4 w-4 text-teal-500" /> {region.name}
                  </Link>
                ))}
                
                <div className="h-px bg-slate-800 my-3" />
                
                <Link to="/become-foster-carer" className="flex px-3 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                  Become a Foster Carer
                </Link>
                <Link to="/about" className="flex px-3 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                  About Us
                </Link>
                <Link to="/contact" className="flex px-3 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                  Contact
                </Link>
              </div>
              
              <div className="pt-2 space-y-2.5">
                <Button className="w-full rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 text-white font-bold h-12 shadow-lg" onClick={() => { setMobileMenuOpen(false); navigate("/search"); }}>
                  <Search className="h-4 w-4 mr-2" />
                  Find Agency
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;