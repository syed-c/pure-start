import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown, Search, User, ChevronRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ACTIVE_REGIONS, POPULAR_CITIES, FOSTERING_CATEGORIES } from "@/lib/constants/activeRegions";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const topCities = POPULAR_CITIES.slice(0, 8);

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled
        ? 'bg-card/95 backdrop-blur-md shadow-lg shadow-primary/5 border-b border-border'
        : 'bg-card border-b border-transparent'
    }`}>
      <div className="container">
        {/* Top utility bar — desktop only */}
        <div className="hidden lg:flex items-center justify-between h-8 border-b border-border/40 text-[11px]">
          <div className="flex items-center gap-5 font-medium text-muted-foreground">
            <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link>
            <Link to="/faq" className="hover:text-foreground transition-colors">FAQ</Link>
            <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
          <Link to="/list-your-agency" className="font-semibold text-primary hover:text-primary/80 transition-colors">
            Are you an agency? List your service →
          </Link>
        </div>

        {/* Main bar */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md shadow-primary/20 group-hover:shadow-lg group-hover:shadow-primary/30 transition-shadow">
              <Heart className="h-4.5 w-4.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-black tracking-tight text-foreground leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Foster<span className="text-primary">Connect</span>
              </span>
              <span className="text-[9px] text-muted-foreground font-medium tracking-wide uppercase">
                UK Fostering Directory
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-0.5">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 px-3.5 py-2 text-[13px] font-semibold text-foreground/70 hover:text-foreground transition-colors rounded-lg hover:bg-muted/60">
                Fostering Types
                <ChevronDown className="h-3.5 w-3.5 opacity-40" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-60 rounded-xl p-2 bg-card border border-border shadow-xl shadow-primary/5 z-50">
                <DropdownMenuItem asChild className="rounded-lg font-bold text-foreground cursor-pointer py-2.5">
                  <Link to="/categories">All Categories</Link>
                </DropdownMenuItem>
                <div className="h-px bg-border my-1.5" />
                {FOSTERING_CATEGORIES.map((cat) => (
                  <DropdownMenuItem key={cat.slug} asChild className="rounded-lg font-medium text-foreground/70 cursor-pointer py-2">
                    <Link to={`/categories/${cat.slug}`}>{cat.name}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 px-3.5 py-2 text-[13px] font-semibold text-foreground/70 hover:text-foreground transition-colors rounded-lg hover:bg-muted/60">
                Locations
                <ChevronDown className="h-3.5 w-3.5 opacity-40" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 rounded-xl p-2 bg-card border border-border shadow-xl shadow-primary/5 z-50">
                {ACTIVE_REGIONS.map((region) => (
                  <DropdownMenuItem key={region.slug} asChild className="rounded-lg font-bold text-foreground cursor-pointer py-2.5">
                    <Link to={`/${region.slug}`}>{region.name}</Link>
                  </DropdownMenuItem>
                ))}
                <div className="h-px bg-border my-1.5" />
                <p className="px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 mt-1">Popular</p>
                {topCities.map((city) => (
                  <DropdownMenuItem key={city.slug} asChild className="rounded-lg font-medium text-foreground/70 cursor-pointer py-2">
                    <Link to={`/england/${city.slug}`}>{city.name}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link
              to="/blog"
              className="px-3.5 py-2 text-[13px] font-semibold text-foreground/70 hover:text-foreground transition-colors rounded-lg hover:bg-muted/60"
            >
              Blog
            </Link>

            <Link
              to="/how-it-works"
              className="px-3.5 py-2 text-[13px] font-semibold text-foreground/70 hover:text-foreground transition-colors rounded-lg hover:bg-muted/60"
            >
              How It Works
            </Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-[13px] font-semibold text-muted-foreground hover:text-foreground rounded-lg" asChild>
              <Link to="/list-your-agency">For Agencies</Link>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-lg text-muted-foreground hover:text-foreground h-9 w-9" asChild>
              <Link to="/auth"><User className="h-4 w-4" /></Link>
            </Button>
            <Button
              size="sm"
              className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold h-10 px-5 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all"
              onClick={() => navigate("/search")}
            >
              <Search className="h-3.5 w-3.5 mr-1.5" />
              Find Agency
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2.5 rounded-xl hover:bg-muted transition-colors text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden pb-5 border-t border-border animate-fade-in">
            <div className="pt-4">
              <button
                onClick={() => { setMobileMenuOpen(false); navigate("/search"); }}
                className="flex items-center gap-2.5 w-full bg-muted/50 border border-border/50 rounded-xl px-4 py-3.5 text-sm text-muted-foreground mb-4"
              >
                <Search className="h-4 w-4" />
                Search agencies, locations...
              </button>

              <div className="space-y-0.5">
                <Link to="/categories" className="flex items-center justify-between px-3 py-3 text-sm font-semibold text-foreground hover:bg-muted rounded-xl" onClick={() => setMobileMenuOpen(false)}>
                  Fostering Types <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
                <p className="px-3 pt-4 pb-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Locations</p>
                {ACTIVE_REGIONS.map((region) => (
                  <Link
                    key={region.slug}
                    to={`/${region.slug}`}
                    className="block px-3 py-3 text-sm font-medium text-foreground hover:bg-muted rounded-xl"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {region.name}
                  </Link>
                ))}
                <div className="h-px bg-border my-3" />
                <Link to="/how-it-works" className="block px-3 py-3 text-sm font-semibold text-foreground hover:bg-muted rounded-xl" onClick={() => setMobileMenuOpen(false)}>How It Works</Link>
                <Link to="/blog" className="block px-3 py-3 text-sm text-foreground/70 hover:bg-muted rounded-xl" onClick={() => setMobileMenuOpen(false)}>Blog</Link>
                <Link to="/faq" className="block px-3 py-3 text-sm text-foreground/70 hover:bg-muted rounded-xl" onClick={() => setMobileMenuOpen(false)}>FAQ</Link>
                <Link to="/contact" className="block px-3 py-3 text-sm text-foreground/70 hover:bg-muted rounded-xl" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
              </div>
              <div className="mt-5 space-y-2.5">
                <Button variant="outline" className="w-full rounded-xl font-bold h-11 border-border text-foreground" asChild>
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                </Button>
                <Button className="w-full rounded-xl bg-primary text-primary-foreground font-bold h-11 shadow-md shadow-primary/20" onClick={() => { setMobileMenuOpen(false); navigate("/search"); }}>
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
