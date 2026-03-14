import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown, Search, ChevronRight, Heart } from "lucide-react";
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
        ? 'bg-background/80 backdrop-blur-xl shadow-sm border-b border-border/50'
        : 'bg-background/50 backdrop-blur-sm border-b border-transparent'
    }`}>
      <div className="container">
        <div className="flex items-center justify-between h-[60px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Heart className="h-[18px] w-[18px]" />
            </div>
            <span className="text-[15px] font-extrabold text-foreground tracking-tight">
              Foster<span className="text-primary">Connect</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-0.5">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-semibold text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/60">
                Fostering Types
                <ChevronDown className="h-3.5 w-3.5 opacity-40" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 rounded-xl p-1.5 z-50 shadow-lg border-border/50">
                <DropdownMenuItem asChild className="rounded-lg font-semibold cursor-pointer py-2.5 px-3">
                  <Link to="/categories">All Categories</Link>
                </DropdownMenuItem>
                <div className="h-px bg-border/50 my-1" />
                {FOSTERING_CATEGORIES.map((cat) => (
                  <DropdownMenuItem key={cat.slug} asChild className="rounded-lg cursor-pointer py-2 px-3">
                    <Link to={`/categories/${cat.slug}`}>{cat.name}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-semibold text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/60">
                Locations
                <ChevronDown className="h-3.5 w-3.5 opacity-40" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52 rounded-xl p-1.5 z-50 shadow-lg border-border/50">
                {ACTIVE_REGIONS.map((region) => (
                  <DropdownMenuItem key={region.slug} asChild className="rounded-lg font-semibold cursor-pointer py-2.5 px-3">
                    <Link to={`/${region.slug}`}>{region.name}</Link>
                  </DropdownMenuItem>
                ))}
                <div className="h-px bg-border/50 my-1" />
                <p className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 mt-1">Popular Cities</p>
                {topCities.map((city) => (
                  <DropdownMenuItem key={city.slug} asChild className="rounded-lg cursor-pointer py-1.5 px-3 text-muted-foreground">
                    <Link to={`/england/${city.slug}`}>{city.name}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link to="/how-it-works" className="px-3.5 py-2 text-[13px] font-semibold text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/60">
              How It Works
            </Link>

            <Link to="/blog" className="px-3.5 py-2 text-[13px] font-semibold text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/60">
              Blog
            </Link>

            <Link to="/about" className="px-3.5 py-2 text-[13px] font-semibold text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/60">
              About
            </Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-2.5">
            <Button variant="ghost" size="sm" className="text-[13px] font-semibold text-muted-foreground hover:text-foreground" asChild>
              <Link to="/list-your-agency">For Agencies</Link>
            </Button>
            <Button
              size="sm"
              className="rounded-xl bg-primary text-primary-foreground font-bold h-9 px-5 shadow-sm hover:shadow-md transition-shadow"
              onClick={() => navigate("/search")}
            >
              <Search className="h-3.5 w-3.5 mr-1.5" />
              Find Agency
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-xl hover:bg-muted/60 transition-colors text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden pb-5 border-t border-border/50 animate-fade-in">
            <div className="pt-4">
              <button
                onClick={() => { setMobileMenuOpen(false); navigate("/search"); }}
                className="flex items-center gap-3 w-full bg-muted/50 border border-border/50 rounded-xl px-4 py-3.5 text-sm text-muted-foreground mb-4"
              >
                <Search className="h-4 w-4" />
                Search agencies, locations...
              </button>

              <div className="space-y-0.5">
                <Link to="/categories" className="flex items-center justify-between px-4 py-3 text-sm font-bold text-foreground hover:bg-muted/60 rounded-xl" onClick={() => setMobileMenuOpen(false)}>
                  Fostering Types <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
                <p className="px-4 pt-4 pb-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Locations</p>
                {ACTIVE_REGIONS.map((region) => (
                  <Link
                    key={region.slug}
                    to={`/${region.slug}`}
                    className="block px-4 py-2.5 text-sm text-foreground hover:bg-muted/60 rounded-xl"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {region.name}
                  </Link>
                ))}
                <div className="h-px bg-border/50 my-3" />
                <Link to="/how-it-works" className="block px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted/60 rounded-xl" onClick={() => setMobileMenuOpen(false)}>How It Works</Link>
                <Link to="/blog" className="block px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted/60 rounded-xl" onClick={() => setMobileMenuOpen(false)}>Blog</Link>
                <Link to="/about" className="block px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted/60 rounded-xl" onClick={() => setMobileMenuOpen(false)}>About</Link>
                <Link to="/contact" className="block px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted/60 rounded-xl" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
              </div>
              <div className="mt-5 space-y-2.5">
                <Button variant="outline" className="w-full rounded-xl font-bold h-11" asChild>
                  <Link to="/list-your-agency" onClick={() => setMobileMenuOpen(false)}>List Your Agency</Link>
                </Button>
                <Button className="w-full rounded-xl bg-primary text-primary-foreground font-bold h-11 shadow-sm" onClick={() => { setMobileMenuOpen(false); navigate("/search"); }}>
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
