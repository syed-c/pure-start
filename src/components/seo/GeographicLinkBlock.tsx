/**
 * GeographicLinkBlock - Contextual body links for SEO authority distribution
 * 
 * Creates internal link graphs based on page type:
 * - STATE PAGE: links to top cities, major services, neighboring states
 * - CITY PAGE: links to services in city, nearby cities, parent state
 * - SERVICE-CITY PAGE: links to same service in nearby cities, related services, parent city
 * 
 * This component implements the "ranking reinforcement loops" SEO pattern.
 * CANONICAL: All URLs use trailing slash format.
 */

import { Link } from "react-router-dom";
import { 
  MapPin, 
  Stethoscope, 
  ArrowRight,
  Building2,
  Navigation
} from "lucide-react";

// Neighboring UK region relationships
const NEIGHBORING_STATES: Record<string, { name: string; slug: string }[]> = {
  england: [
    { name: "North West England", slug: "north-west-england" },
    { name: "North East England", slug: "north-east-england" },
    { name: "Yorkshire and the Humber", slug: "yorkshire-and-the-humber" },
    { name: "East Midlands", slug: "east-midlands" },
    { name: "West Midlands", slug: "west-midlands" },
    { name: "East of England", slug: "east-of-england" },
    { name: "South East England", slug: "south-east-england" },
    { name: "South West England", slug: "south-west-england" },
    { name: "London", slug: "london" },
  ],
  scotland: [
    { name: "Glasgow and Clyde", slug: "glasgow-and-clyde" },
    { name: "Edinburgh and Lothians", slug: "edinburgh-and-lothians" },
    { name: "Highlands and Islands", slug: "highlands-and-islands" },
    { name: "Central Scotland", slug: "central-scotland" },
  ],
  wales: [
    { name: "South Wales", slug: "south-wales" },
    { name: "North Wales", slug: "north-wales" },
    { name: "Mid Wales", slug: "mid-wales" },
  ],
  "northern-ireland": [
    { name: "Belfast", slug: "belfast" },
    { name: "County Antrim", slug: "county-antrim" },
    { name: "County Down", slug: "county-down" },
    { name: "County Armagh", slug: "county-armagh" },
  ],
};

// Related services mapping for cross-linking
const RELATED_SERVICES: Record<string, string[]> = {
  "emergency-fostering": ["short-term-fostering", "long-term-fostering", "respite-fostering"],
  "short-term-fostering": ["emergency-fostering", "long-term-fostering", "therapeutic-fostering"],
  "long-term-fostering": ["short-term-fostering", "therapeutic-fostering", "fostering-to-adopt"],
  "respite-fostering": ["emergency-fostering", "short-term-fostering", "therapeutic-fostering"],
  "therapeutic-fostering": ["long-term-fostering", "short-term-fostering", "parent-and-child-fostering"],
  "parent-and-child-fostering": ["therapeutic-fostering", "fostering-to-adopt", "short-term-fostering"],
  "fostering-to-adopt": ["long-term-fostering", "therapeutic-fostering", "parent-and-child-fostering"],
  "remand-fostering": ["emergency-fostering", "short-term-fostering", "therapeutic-fostering"],
};

interface GeographicLinkBlockProps {
  pageType: "state" | "city" | "service-location";
  stateSlug: string;
  stateName: string;
  citySlug?: string;
  cityName?: string;
  serviceSlug?: string;
  serviceName?: string;
  // Data passed from parent to avoid duplicate queries
  topCities?: { name: string; slug: string }[];
  nearbyCities?: { name: string; slug: string }[];
  services?: { name: string; slug: string }[];
}

export const GeographicLinkBlock = ({
  pageType,
  stateSlug,
  stateName,
  citySlug,
  cityName,
  serviceSlug,
  serviceName,
  topCities = [],
  nearbyCities = [],
  services = [],
}: GeographicLinkBlockProps) => {
  const neighboringStates = NEIGHBORING_STATES[stateSlug] || [];
  const relatedServiceSlugs = serviceSlug ? RELATED_SERVICES[serviceSlug] || [] : [];
  const relatedServices = services.filter(s => relatedServiceSlugs.includes(s.slug)).slice(0, 4);

  // STATE PAGE: Links to cities, services, neighboring states
  if (pageType === "state") {
    return (
      <section
        className="animate-fade-in-up bg-card border border-border rounded-2xl p-6"
        aria-label="Explore more locations"
      >
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Navigation className="h-5 w-5 text-primary" />
          Explore Fostering in {stateName}
        </h3>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Top Cities */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1">
              <MapPin className="h-4 w-4" /> Top Cities
            </h4>
            <nav className="space-y-1.5">
              {topCities.slice(0, 6).map((city) => (
                <Link
                  key={city.slug}
                  to={`/${stateSlug}/${city.slug}/`}
                  className="block text-sm text-foreground hover:text-primary transition-colors"
                >
                  Agencies in {city.name} →
                </Link>
              ))}
            </nav>
          </div>

          {/* Major Services */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1">
              <Stethoscope className="h-4 w-4" /> Popular Services
            </h4>
            <nav className="space-y-1.5">
              {services.slice(0, 6).map((service) => (
                <Link
                  key={service.slug}
                  to={`/services/${service.slug}/`}
                  className="block text-sm text-foreground hover:text-primary transition-colors"
                >
                  {service.name} →
                </Link>
              ))}
            </nav>
          </div>

          {/* Neighboring States */}
          {neighboringStates.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                <Building2 className="h-4 w-4" /> Nearby States
              </h4>
              <nav className="space-y-1.5">
                {neighboringStates.map((state) => (
                  <Link
                    key={state.slug}
                    to={`/${state.slug}/`}
                    className="block text-sm text-foreground hover:text-primary transition-colors"
                  >
                    Agencies in {state.name} →
                  </Link>
                ))}
              </nav>
            </div>
          )}
        </div>
      </section>
    );
  }

  // CITY PAGE: Links to services in city, nearby cities, parent state
  if (pageType === "city" && citySlug && cityName) {
    return (
      <section
        className="animate-fade-in-up bg-card border border-border rounded-2xl p-6"
        aria-label="Explore agency services"
      >
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Navigation className="h-5 w-5 text-primary" />
          Fostering Services in {cityName}
        </h3>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Services in City */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1">
              <Stethoscope className="h-4 w-4" /> Services in {cityName}
            </h4>
            <nav className="space-y-1.5">
              {services.slice(0, 6).map((service) => (
                <Link
                  key={service.slug}
                  to={`/${stateSlug}/${citySlug}/${service.slug}/`}
                  className="block text-sm text-foreground hover:text-primary transition-colors"
                >
                  {service.name} →
                </Link>
              ))}
            </nav>
          </div>

          {/* Nearby Cities */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1">
              <MapPin className="h-4 w-4" /> Nearby Cities
            </h4>
            <nav className="space-y-1.5">
              {nearbyCities.slice(0, 6).map((city) => (
                <Link
                  key={city.slug}
                  to={`/${stateSlug}/${city.slug}/`}
                  className="block text-sm text-foreground hover:text-primary transition-colors"
                >
                  Agencies in {city.name} →
                </Link>
              ))}
            </nav>
          </div>

          {/* Parent State */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1">
              <Building2 className="h-4 w-4" /> Browse State
            </h4>
            <nav className="space-y-1.5">
              <Link
                to={`/${stateSlug}/`}
                className="block text-sm text-foreground hover:text-primary transition-colors"
              >
                All cities in {stateName} →
              </Link>
              {neighboringStates.slice(0, 2).map((state) => (
                <Link
                  key={state.slug}
                  to={`/${state.slug}/`}
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Agencies in {state.name} →
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </section>
    );
  }

  // SERVICE-LOCATION PAGE: Links to same service nearby, related services, parent city
  if (pageType === "service-location" && citySlug && cityName && serviceSlug && serviceName) {
    return (
      <section
        className="animate-fade-in-up bg-card border border-border rounded-2xl p-6"
        aria-label="Related fostering services"
      >
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Navigation className="h-5 w-5 text-primary" />
          More {serviceName} Options
        </h3>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Same Service in Nearby Cities */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1">
              <MapPin className="h-4 w-4" /> {serviceName} Nearby
            </h4>
            <nav className="space-y-1.5">
              {nearbyCities.slice(0, 5).map((city) => (
                <Link
                  key={city.slug}
                  to={`/${stateSlug}/${city.slug}/${serviceSlug}/`}
                  className="block text-sm text-foreground hover:text-primary transition-colors"
                >
                  {serviceName} in {city.name} →
                </Link>
              ))}
            </nav>
          </div>

          {/* Related Services in Same City */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1">
              <Stethoscope className="h-4 w-4" /> Related in {cityName}
            </h4>
            <nav className="space-y-1.5">
              {relatedServices.map((service) => (
                <Link
                  key={service.slug}
                  to={`/${stateSlug}/${citySlug}/${service.slug}/`}
                  className="block text-sm text-foreground hover:text-primary transition-colors"
                >
                  {service.name} →
                </Link>
              ))}
              <Link
                to={`/${stateSlug}/${citySlug}/`}
                className="block text-sm text-primary hover:underline font-medium mt-2"
              >
                All services in {cityName} →
              </Link>
            </nav>
          </div>

          {/* Parent Hierarchy */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1">
              <Building2 className="h-4 w-4" /> Browse More
            </h4>
            <nav className="space-y-1.5">
              <Link
                to={`/${stateSlug}/${citySlug}/`}
                className="block text-sm text-foreground hover:text-primary transition-colors"
              >
                All agencies in {cityName} →
              </Link>
              <Link
                to={`/${stateSlug}/`}
                className="block text-sm text-foreground hover:text-primary transition-colors"
              >
                All cities in {stateName} →
              </Link>
              <Link
                to={`/services/${serviceSlug}/`}
                className="block text-sm text-foreground hover:text-primary transition-colors"
              >
                {serviceName} nationwide →
              </Link>
            </nav>
          </div>
        </div>
      </section>
    );
  }

  return null;
};

export default GeographicLinkBlock;
