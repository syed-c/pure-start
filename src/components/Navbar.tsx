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
    <nav className={`sticky top-0 z-50 transition-all duration-200 ${
      isScrolled
        ? 'bg-background/95 backdrop-blur-md shadow-sm border-b border-border'
        : 'bg-background border-b border-transparent'
    }`}>
      <div className="container">
        {/* Main bar */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Heart className="h-4 w-4" />
            </div>
            <span className="text-base font-extrabold text-foreground tracking-tight">
              Foster<span className="text-primary">Connect</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted">
                Fostering Types
                <ChevronDown className="h-3.5 w-3.5 opacity-50" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 rounded-lg p-1.5 z-50">
                <DropdownMenuItem asChild className="rounded-md font-semibold cursor-pointer py-2.5">
                  <Link to="/categories">All Categories</Link>
                </DropdownMenuItem>
                <div className="h-px bg-border my-1" />
                {FOSTERING_CATEGORIES.map((cat) => (
                  <DropdownMenuItem key={cat.slug} asChild className="rounded-md cursor-pointer py-2">
                    <Link to={`/categories/${cat.slug}`}>{cat.name}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted">
                Locations
                <ChevronDown className="h-3.5 w-3.5 opacity-50" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52 rounded-lg p-1.5 z-50">
                {ACTIVE_REGIONS.map((region) => (
                  <DropdownMenuItem key={region.slug} asChild className="rounded-md font-semibold cursor-pointer py-2.5">
                    <Link to={`/${region.slug}`}>{region.name}</Link>
                  </DropdownMenuItem>
                ))}
                <div className="h-px bg-border my-1" />
                <p className="px-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1 mt-1">Popular</p>
                {topCities.map((city) => (
                  <DropdownMenuItem key={city.slug} asChild className="rounded-md cursor-pointer py-1.5">
                    <Link to={`/england/${city.slug}`}>{city.name}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link to="/how-it-works" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted">
              How It Works
            </Link>

            <Link to="/blog" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted">
              Blog
            </Link>

            <Link to="/about" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted">
              About
            </Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-sm font-medium text-muted-foreground" asChild>
              <Link to="/list-your-agency">For Agencies</Link>
            </Button>
            <Button
              size="sm"
              className="rounded-lg bg-primary text-primary-foreground font-semibold h-9 px-4"
              onClick={() => navigate("/search")}
            >
              <Search className="h-3.5 w-3.5 mr-1.5" />
              Find Agency
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden pb-4 border-t border-border animate-fade-in">
            <div className="pt-3">
              <button
                onClick={() => { setMobileMenuOpen(false); navigate("/search"); }}
                className="flex items-center gap-2.5 w-full bg-muted border border-border rounded-lg px-3 py-3 text-sm text-muted-foreground mb-3"
              >
                <Search className="h-4 w-4" />
                Search agencies, locations...
              </button>

              <div className="space-y-0.5">
                <Link to="/categories" className="flex items-center justify-between px-3 py-2.5 text-sm font-semibold text-foreground hover:bg-muted rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                  Fostering Types <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
                <p className="px-3 pt-3 pb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Locations</p>
                {ACTIVE_REGIONS.map((region) => (
                  <Link
                    key={region.slug}
                    to={`/${region.slug}`}
                    className="block px-3 py-2.5 text-sm text-foreground hover:bg-muted rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {region.name}
                  </Link>
                ))}
                <div className="h-px bg-border my-2" />
                <Link to="/how-it-works" className="block px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted rounded-lg" onClick={() => setMobileMenuOpen(false)}>How It Works</Link>
                <Link to="/blog" className="block px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted rounded-lg" onClick={() => setMobileMenuOpen(false)}>Blog</Link>
                <Link to="/about" className="block px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted rounded-lg" onClick={() => setMobileMenuOpen(false)}>About</Link>
                <Link to="/contact" className="block px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted rounded-lg" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
              </div>
              <div className="mt-4 space-y-2">
                <Button variant="outline" className="w-full rounded-lg font-semibold h-10" asChild>
                  <Link to="/list-your-agency" onClick={() => setMobileMenuOpen(false)}>List Your Agency</Link>
                </Button>
                <Button className="w-full rounded-lg bg-primary text-primary-foreground font-semibold h-10" onClick={() => { setMobileMenuOpen(false); navigate("/search"); }}>
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
