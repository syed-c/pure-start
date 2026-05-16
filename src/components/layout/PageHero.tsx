import { cn } from "@/lib/utils";
import { Breadcrumbs } from "./Breadcrumbs";
import { CheckCircle } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeroProps {
  title: string;
  highlight?: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  badge?: string;
  children?: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const PageHero = ({
  title,
  highlight,
  description,
  breadcrumbs,
  badge,
  children,
  className,
  size = "md"
}: PageHeroProps) => {
  const sizeClasses = {
    sm: "py-8 md:py-12",
    md: "py-10 md:py-16 lg:py-20",
    lg: "py-12 md:py-20 lg:py-28"
  };

  return (
    <section className={cn(
      "relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/20",
      sizeClasses[size],
      className
    )}>
      {/* Enhanced decorative elements with animations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-20 -right-20 w-64 md:w-[400px] lg:w-[500px] h-64 md:h-[400px] lg:h-[500px] bg-primary/8 rounded-full blur-3xl"
        />
        <div 
          className="absolute -bottom-20 -left-20 w-56 md:w-[320px] lg:w-[400px] h-56 md:h-[320px] lg:h-[400px] bg-accent/30 rounded-full blur-3xl"
        />
        <div 
          className="absolute top-1/3 right-1/4 w-16 md:w-24 h-16 md:h-24 bg-gold/10 rounded-full blur-xl"
        />
        <div 
          className="absolute bottom-1/4 left-1/3 w-12 md:w-16 h-12 md:h-16 bg-primary/10 rounded-full blur-lg"
        />
      </div>

      <div className="container relative z-10 px-4">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="animate-fade-in-up">
            <Breadcrumbs items={breadcrumbs} className="mb-4 md:mb-6" />
          </div>
        )}
        
        <div className="max-w-4xl">
          {/* Badge */}
          {badge && (
            <div 
              className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-full px-3 md:px-4 py-1.5 md:py-2 mb-4 md:mb-6 shadow-sm animate-fade-in-up"
            >
              <CheckCircle className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
              <span className="text-xs md:text-sm font-bold text-primary">{badge}</span>
            </div>
          )}

          {/* Bold Round Headline - Mobile optimized with balanced text */}
          <h1 
            className="animate-fade-in-up"
            style={{ animationDelay: '0.1s' }}
          >
            <span 
              className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-foreground tracking-tight leading-[1.08] text-balance" 
              style={{ fontFamily: "'Varela Round', 'Quicksand', sans-serif", textWrap: 'balance' }}
            >
              {title}
            </span>
            {highlight && (
              <span 
                className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight leading-[1.08] mt-1 text-balance" 
                style={{ fontFamily: "'Varela Round', 'Quicksand', sans-serif", textWrap: 'balance' }}
              >
                <span className="text-primary">{highlight}</span>
              </span>
            )}
          </h1>
          
          {description && (
            <p 
              className="mt-4 md:mt-6 text-sm md:text-base lg:text-lg xl:text-xl text-muted-foreground max-w-2xl font-medium animate-fade-in-up"
              style={{ animationDelay: '0.2s' }}
            >
              {description}
            </p>
          )}
          
          {children && (
            <div 
              className="mt-6 md:mt-8 animate-fade-in-up"
              style={{ animationDelay: '0.3s' }}
            >
              {children}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
