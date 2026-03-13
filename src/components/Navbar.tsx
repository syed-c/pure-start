import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown, Search, User, ChevronRight, Home } from "lucide-react";
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
    <>
      {/* Slim top utility bar */}
      <div className="bg-foreground text-background hidden lg:block">
        <div className="container flex items-center justify-between h-8">
          <div className="flex items-center gap-5 text-[11px] font-medium">
            <Link to="/about" className="text-background/70 hover:text-background transition-colors">About</Link>
            <Link to="/blog" className="text-background/70 hover:text-background transition-colors">Blog</Link>
            <Link to="/faq" className="text-background/70 hover:text-background transition-colors">FAQ</Link>
            <Link to="/contact" className="text-background/70 hover:text-background transition-colors">Contact</Link>
          </div>
          <Link to="/list-your-agency" className="text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors">
            Are you an agency? List your service →
          </Link>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className={`sticky top-0 z-50 transition-all duration-200 ${
        isScrolled 
          ? 'bg-card/98 backdrop-blur-sm border-b border-border shadow-sm' 
          : 'bg-card border-b border-border/60'
      }`}>
        <div className="container">
          <div className="flex items-center justify-between h-14 lg:h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Home className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold tracking-tight text-foreground leading-none">
                    Foster<span className="text-primary">Connect</span>
                  </span>
                  <span className="text-[9px] text-muted-foreground font-medium">
                    UK Fostering Directory
                  </span>
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors rounded-md hover:bg-muted/50">
                  Fostering Types
                  <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 rounded-lg p-1.5 bg-card border border-border shadow-lg z-50">
                  <DropdownMenuItem asChild className="rounded-md font-semibold text-foreground cursor-pointer">
                    <Link to="/categories">All Categories</Link>
                  </DropdownMenuItem>
                  <div className="h-px bg-border my-1" />
                  {FOSTERING_CATEGORIES.map((cat) => (
                    <DropdownMenuItem key={cat.slug} asChild className="rounded-md font-medium text-foreground/80 cursor-pointer">
                      <Link to={`/categories/${cat.slug}`}>{cat.name}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors rounded-md hover:bg-muted/50">
                  Locations
                  <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-52 rounded-lg p-1.5 bg-card border border-border shadow-lg z-50">
                  {ACTIVE_REGIONS.map((region) => (
                    <DropdownMenuItem key={region.slug} asChild className="rounded-md font-semibold text-foreground cursor-pointer">
                      <Link to={`/${region.slug}`}>{region.name}</Link>
                    </DropdownMenuItem>
                  ))}
                  <div className="h-px bg-border my-1" />
                  <p className="px-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 mt-1">Popular Cities</p>
                  {topCities.map((city) => (
                    <DropdownMenuItem key={city.slug} asChild className="rounded-md font-medium text-foreground/80 cursor-pointer">
                      <Link to={`/england/${city.slug}`}>{city.name}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Link 
                to="/blog" 
                className="px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors rounded-md hover:bg-muted/50"
              >
                Blog
              </Link>

              <Link 
                to="/how-it-works" 
                className="px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors rounded-md hover:bg-muted/50"
              >
                How It Works
              </Link>
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-sm font-medium text-foreground/70 hover:text-foreground" asChild>
                <Link to="/list-your-agency">For Agencies</Link>
              </Button>
              <Button variant="ghost" size="icon" className="rounded-lg text-foreground/60 hover:text-foreground h-9 w-9" asChild>
                <Link to="/auth"><User className="h-4 w-4" /></Link>
              </Button>
              <Button 
                size="sm" 
                className="rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-9 px-4"
                onClick={() => navigate("/search")}
              >
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
            <div className="lg:hidden py-4 border-t border-border animate-fade-in bg-card">
              <button
                onClick={() => { setMobileMenuOpen(false); navigate("/search"); }}
                className="flex items-center gap-2 w-full bg-muted/60 border border-border/60 rounded-lg px-4 py-3 text-sm text-muted-foreground mb-3"
              >
                <Search className="h-4 w-4" />
                Search agencies, locations...
              </button>

              <div className="space-y-0.5">
                <Link to="/categories" className="flex items-center justify-between px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                  Fostering Types <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
                <p className="px-3 pt-3 pb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Locations</p>
                {ACTIVE_REGIONS.map((region) => (
                  <Link 
                    key={region.slug} 
                    to={`/${region.slug}`} 
                    className="block px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted rounded-lg" 
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {region.name}
                  </Link>
                ))}
                <div className="h-px bg-border my-2" />
                <Link to="/how-it-works" className="block px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted rounded-lg" onClick={() => setMobileMenuOpen(false)}>How It Works</Link>
                <Link to="/blog" className="block px-3 py-2.5 text-sm text-foreground/70 hover:bg-muted rounded-lg" onClick={() => setMobileMenuOpen(false)}>Blog</Link>
                <Link to="/faq" className="block px-3 py-2.5 text-sm text-foreground/70 hover:bg-muted rounded-lg" onClick={() => setMobileMenuOpen(false)}>FAQ</Link>
                <Link to="/contact" className="block px-3 py-2.5 text-sm text-foreground/70 hover:bg-muted rounded-lg" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
              </div>
              <div className="mt-4 space-y-2">
                <Button variant="outline" className="w-full rounded-lg font-semibold border-border text-foreground" asChild>
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                </Button>
                <Button className="w-full rounded-lg bg-primary text-primary-foreground font-semibold" onClick={() => { setMobileMenuOpen(false); navigate("/search"); }}>
                  Find Agency
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
