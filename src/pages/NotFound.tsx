import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    
    let meta = document.querySelector('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'robots');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'noindex, nofollow');
    
    document.title = 'Page Not Found | Foster Connect';
    
    return;
  }, [location.pathname, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/30">
      <div className="text-center px-4 max-w-md">
        <div className="mb-6">
          <span className="text-8xl font-black bg-gradient-to-r from-primary to-teal bg-clip-text text-transparent">
            404
          </span>
        </div>
        
        <h1 className="mb-3 text-2xl font-bold text-foreground">
          Page Not Found
        </h1>
        
        <p className="mb-6 text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="default" className="gap-2">
            <Link to="/">
              <Home className="h-4 w-4" />
              Go to Homepage
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="gap-2">
            <Link to="/search/">
              <Search className="h-4 w-4" />
              Find an Agency
            </Link>
          </Button>
          
          <Button 
            variant="ghost" 
            className="gap-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>
        
        <div className="mt-8 pt-6 border-t border-border/50">
          <p className="text-xs text-muted-foreground mb-3">Browse by Region:</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link to="/london/" className="text-xs text-primary hover:underline">London</Link>
            <span className="text-muted-foreground/30">•</span>
            <Link to="/south-east/" className="text-xs text-primary hover:underline">South East</Link>
            <span className="text-muted-foreground/30">•</span>
            <Link to="/north-west/" className="text-xs text-primary hover:underline">North West</Link>
            <span className="text-muted-foreground/30">•</span>
            <Link to="/west-midlands/" className="text-xs text-primary hover:underline">West Midlands</Link>
            <span className="text-muted-foreground/30">•</span>
            <Link to="/yorkshire/" className="text-xs text-primary hover:underline">Yorkshire</Link>
            <span className="text-muted-foreground/30">•</span>
            <Link to="/scotland/" className="text-xs text-primary hover:underline">Scotland</Link>
            <span className="text-muted-foreground/30">•</span>
            <Link to="/wales/" className="text-xs text-primary hover:underline">Wales</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
