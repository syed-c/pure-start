import { Link } from "react-router-dom";
import { 
  Stethoscope, 
  Users, 
  Clock, 
  CreditCard, 
  CheckCircle2,
  MapPin,
  Star,
  Shield,
  Award,
  HeartPulse,
  Building2
} from "lucide-react";

interface LocationSEOContentProps {
  variant: "state" | "city" | "service-location";
  locationName: string;
  stateName?: string;
  stateAbbr?: string;
  stateSlug?: string;
  treatmentName?: string;
  clinicCount?: number;
  cityCount?: number;
  popularTreatments?: { name: string; slug: string }[];
  nearbyLocations?: { name: string; slug: string }[];
}

/**
 * Deep SEO content component for location pages
 * Provides unique, human-written content to help pages rank
 */
export const LocationSEOContent = ({
  variant,
  locationName,
  stateName = "",
  stateAbbr = "",
  stateSlug = "",
  treatmentName = "",
  clinicCount = 0,
  cityCount = 0,
  popularTreatments = [],
  nearbyLocations = [],
}: LocationSEOContentProps) => {
  if (variant === "state") {
    return <StateSEOContent 
      stateName={locationName} 
      stateAbbr={stateAbbr}
      stateSlug={stateSlug}
      clinicCount={clinicCount}
      cityCount={cityCount}
      popularTreatments={popularTreatments}
    />;
  }

  if (variant === "city") {
    return <CitySEOContent 
      cityName={locationName}
      stateName={stateName}
      stateAbbr={stateAbbr}
      stateSlug={stateSlug}
      clinicCount={clinicCount}
      popularTreatments={popularTreatments}
      nearbyLocations={nearbyLocations}
    />;
  }

  return <ServiceLocationSEOContent 
    locationName={locationName}
    stateName={stateName}
    stateAbbr={stateAbbr}
    stateSlug={stateSlug}
    treatmentName={treatmentName}
    clinicCount={clinicCount}
    nearbyLocations={nearbyLocations}
  />;
};

const StateSEOContent = ({
  stateName,
  stateAbbr,
  stateSlug,
  clinicCount,
  cityCount,
  popularTreatments,
}: {
  stateName: string;
  stateAbbr: string;
  stateSlug: string;
  clinicCount: number;
  cityCount: number;
  popularTreatments: { name: string; slug: string }[];
}) => (
  <div className="space-y-12">
    {/* Why Choose Section */}
    <div className="bg-card border border-border rounded-3xl p-8 md:p-10">
      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
        Why Choose a Fostering Agency in {stateName}?
      </h2>
      <p className="text-lg text-muted-foreground leading-relaxed mb-6">
        {stateName} is home to some of the nation's finest fostering agencies. With {clinicCount}+ agencies 
        spread across {cityCount} cities, residents have access to world-class fostering support. From short-term 
        care to long-term placements, {stateName} agencies combine cutting-edge training with 
        compassionate support for children and families.
      </p>
      
      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <div className="flex gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Award className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-foreground mb-1">Ofsted Registered</h3>
            <p className="text-muted-foreground text-sm">All agencies are Ofsted registered and meet strict standards for foster care provision.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Stethoscope className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-foreground mb-1">Specialized Support</h3>
            <p className="text-muted-foreground text-sm">Access to specialized fostering programs, training, and 24/7 support services.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <CreditCard className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-foreground mb-1">Insurance Accepted</h3>
            <p className="text-muted-foreground text-sm">Most agencies provide comprehensive support including allowances, training, and 24/7 guidance.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Clock className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-foreground mb-1">Flexible Hours</h3>
            <p className="text-muted-foreground text-sm">Evening and weekend appointments available at many locations for your convenience.</p>
          </div>
        </div>
      </div>
    </div>

    {/* Fostering Services Section */}
    <div className="bg-card border border-border rounded-3xl p-8 md:p-10">
      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
        Fostering Services Available in {stateName}
      </h2>
      <p className="text-muted-foreground mb-6">
        {stateName} fostering agencies offer comprehensive support for children and families. 
        Whether you need short-term care, long-term placements, or specialist support, you'll find 
        experienced agencies throughout the state.
      </p>
      
      <div className="grid md:grid-cols-3 gap-4 mt-6">
        <div className="bg-muted/50 rounded-2xl p-5">
          <HeartPulse className="h-8 w-8 text-primary mb-3" />
          <h3 className="font-bold text-foreground mb-2">Emergency & Short-Term Care</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Emergency fostering placements</li>
            <li>• Short-term fostering (days to months)</li>
            <li>• Respite care for foster families</li>
          </ul>
        </div>
        <div className="bg-muted/50 rounded-2xl p-5">
          <Stethoscope className="h-8 w-8 text-primary mb-3" />
          <h3 className="font-bold text-foreground mb-2">Specialist & Long-Term Support</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Long-term fostering (months to years)</li>
            <li>• Therapeutic fostering (specialist support)</li>
            <li>• Parent and child fostering placements</li>
          </ul>
        </div>
        <div className="bg-muted/50 rounded-2xl p-5">
          <Star className="h-8 w-8 text-primary mb-3" />
          <h3 className="font-bold text-foreground mb-2">Specialist Pathways</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Fostering to adoption pathways</li>
            <li>• Remand fostering (youth justice)</li>
          </ul>
        </div>
      </div>
      
      {popularTreatments.length > 0 && (
        <div className="mt-8">
          <h3 className="font-bold text-foreground mb-4">Popular Services in {stateName}:</h3>
          <div className="flex flex-wrap gap-2">
            {popularTreatments.map((treatment) => (
              <Link
                key={treatment.slug}
                to={`/services/${treatment.slug}`}
                className="bg-primary/10 text-primary rounded-full px-4 py-2 text-sm font-medium hover:bg-primary/20 transition-colors"
              >
                {treatment.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>

    {/* Tips Section */}
    <div className="bg-card border border-border rounded-3xl p-8 md:p-10">
      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
        How to Find the Right Fostering Agency in {stateName}
      </h2>
      <p className="text-muted-foreground mb-6">
        Choosing the right fostering agency is an important decision for your family. Here are key 
        factors to consider when selecting an agency in {stateName}:
      </p>
      
      <div className="space-y-4">
        {[
          {
            title: "1. Check Credentials & Experience",
            desc: `Verify that the agency is Ofsted-registered in ${stateName} and has experience with the fostering types you are interested in. Look for additional certifications in specialist areas like therapeutic care or sibling placements.`
          },
          {
            title: "2. Read Foster Carer Reviews",
            desc: "Foster carer reviews provide valuable insights into the agency experience. Look for consistent positive feedback about support, communication, and training."
          },
          {
            title: "3. Consider Location & Support",
            desc: "Choose an agency that's convenient to your home or workplace. Many agencies now offer evening and weekend visits for busy families."
          },
          {
            title: "4. Verify Allowances & Support",
            desc: "Confirm the fostering allowances and additional support available. Many agencies in the UK offer competitive rates, training allowances, and flexible payment options."
          },
          {
            title: "5. Visit for a Consultation",
            desc: "Schedule an initial consultation to meet the team, tour the facility, and discuss your fostering goals. This helps ensure you feel comfortable with your choice."
          }
        ].map((item, i) => (
          <div key={i} className="flex gap-4 items-start">
            <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-foreground mb-1">{item.title}</h3>
              <p className="text-muted-foreground text-sm">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const CitySEOContent = ({
  cityName,
  stateName,
  stateAbbr,
  stateSlug,
  clinicCount,
  popularTreatments,
  nearbyLocations,
}: {
  cityName: string;
  stateName: string;
  stateAbbr: string;
  stateSlug: string;
  clinicCount: number;
  popularTreatments: { name: string; slug: string }[];
  nearbyLocations: { name: string; slug: string }[];
}) => (
  <div className="space-y-10">
    {/* Main Content */}
    <div className="bg-card border border-border rounded-3xl p-8 md:p-10">
      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
        About Fostering in {cityName}, {stateAbbr}
      </h2>
      <p className="text-lg text-muted-foreground leading-relaxed mb-6">
        {cityName} residents have access to {clinicCount}+ fostering agencies offering comprehensive 
        services. From short-term to long-term care, {cityName}'s foster care providers are 
        committed to helping children and families find the right support.
      </p>
      <p className="text-muted-foreground leading-relaxed mb-6">
        Whether you're looking for short-term care, emergency placements, or long-term 
        fostering support, you'll find qualified professionals in {cityName} ready to meet your needs. Many 
        local agencies use modern approaches and best practices including comprehensive assessments, 
        and therapeutic parenting and trauma-informed care approaches.
      </p>
      
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        <div className="bg-muted/50 rounded-2xl p-4 text-center">
          <Building2 className="h-8 w-8 text-primary mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">{clinicCount}+</div>
          <div className="text-sm text-muted-foreground">Fostering Agencys</div>
        </div>
        <div className="bg-muted/50 rounded-2xl p-4 text-center">
          <Star className="h-8 w-8 text-gold mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">4.8</div>
          <div className="text-sm text-muted-foreground">Avg. Rating</div>
        </div>
        <div className="bg-muted/50 rounded-2xl p-4 text-center">
          <Shield className="h-8 w-8 text-emerald mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">100%</div>
          <div className="text-sm text-muted-foreground">Licensed</div>
        </div>
        <div className="bg-muted/50 rounded-2xl p-4 text-center">
          <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">60s</div>
          <div className="text-sm text-muted-foreground">Book Enquiry</div>
        </div>
      </div>
    </div>

    {/* Services Section */}
    <div className="bg-card border border-border rounded-3xl p-8 md:p-10">
      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
        Fostering Services in {cityName}
      </h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
            <HeartPulse className="h-5 w-5 text-primary" />
            Core Fostering Services
          </h3>
          <ul className="text-muted-foreground space-y-2 ml-7">
            <li>• Comprehensive care assessments</li>
            <li>• Professional fostering assessments</li>
            <li>• Short-term & emergency placements</li>
            <li>• Long-term fostering placements</li>
            <li>• Respite care services</li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Specialist Fostering Services
          </h3>
          <ul className="text-muted-foreground space-y-2 ml-7">
            <li>• Therapeutic fostering support</li>
            <li>• Parent and child placements</li>
            <li>• Fostering to adoption pathways</li>
            <li>• Sibling group placements</li>
            <li>• Remand fostering support</li>
          </ul>
        </div>
      </div>
      
      {popularTreatments.length > 0 && (
        <div className="mt-8 pt-6 border-t border-border">
          <h3 className="font-bold text-foreground mb-4">Find Services by Type:</h3>
          <div className="flex flex-wrap gap-2">
            {popularTreatments.slice(0, 8).map((treatment) => (
              <Link
                key={treatment.slug}
                to={stateSlug ? `/${stateSlug}/${treatment.slug}` : `/services/${treatment.slug}`}
                className="bg-primary/10 text-primary rounded-full px-4 py-2 text-sm font-medium hover:bg-primary/20 transition-colors"
              >
                {treatment.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>

    {/* What to Expect Section */}
    <div className="bg-card border border-border rounded-3xl p-8 md:p-10">
      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
        What to Expect at a {cityName} Agency
      </h2>
      <p className="text-muted-foreground mb-6">
        First-time enquirers can expect a welcoming experience at {cityName} agency offices. Here's what 
        typically happens when you make an enquiry:
      </p>
      
      <div className="space-y-4">
        <div className="flex gap-4 items-start">
          <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">1</div>
          <div>
            <h3 className="font-bold text-foreground mb-1">Initial Enquiry</h3>
            <p className="text-muted-foreground text-sm">Complete your enquiry form and provide basic information. Many agencies offer online pre-registration.</p>
          </div>
        </div>
        <div className="flex gap-4 items-start">
          <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">2</div>
          <div>
            <h3 className="font-bold text-foreground mb-1">Assessment Meeting</h3>
            <p className="text-muted-foreground text-sm">The agency will conduct a thorough home visit, discuss your experience, and assess your suitability for fostering.</p>
          </div>
        </div>
        <div className="flex gap-4 items-start">
          <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">3</div>
          <div>
            <h3 className="font-bold text-foreground mb-1">Discuss Options</h3>
            <p className="text-muted-foreground text-sm">The agency will explain available fostering types, matching process, and answer any questions you have about your journey.</p>
          </div>
        </div>
        <div className="flex gap-4 items-start">
          <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">4</div>
          <div>
            <h3 className="font-bold text-foreground mb-1">Next Steps</h3>
            <p className="text-muted-foreground text-sm">Schedule your next meeting and begin the application process. Most agencies provide regular updates and support.</p>
          </div>
        </div>
      </div>
    </div>

    {/* Nearby Locations */}
    {nearbyLocations.length > 0 && (
      <div className="bg-card border border-border rounded-3xl p-8 md:p-10">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">
          Nearby Locations
        </h2>
        <p className="text-muted-foreground mb-4">
          Can't find what you're looking for in {cityName}? Browse agencies in nearby cities:
        </p>
        <div className="flex flex-wrap gap-2">
          {nearbyLocations.map((location) => (
            <Link
              key={location.slug}
              to={`/${stateSlug}/${location.slug}`}
              className="bg-muted hover:bg-muted/80 text-foreground rounded-full px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1"
            >
              <MapPin className="h-3 w-3" />
              {location.name}
            </Link>
          ))}
        </div>
      </div>
    )}
  </div>
);

const ServiceLocationSEOContent = ({
  locationName,
  stateName,
  stateAbbr,
  stateSlug,
  treatmentName,
  clinicCount,
  nearbyLocations,
}: {
  locationName: string;
  stateName: string;
  stateAbbr: string;
  stateSlug: string;
  treatmentName: string;
  clinicCount: number;
  nearbyLocations: { name: string; slug: string }[];
}) => {
  const treatmentLower = treatmentName.toLowerCase();
  
  return (
    <div className="space-y-10">
      {/* Treatment Details */}
      <div className="bg-card border border-border rounded-3xl p-8 md:p-10">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
          About {treatmentName} in {locationName}, {stateAbbr}
        </h2>
        <p className="text-lg text-muted-foreground leading-relaxed mb-6">
          Looking for {treatmentLower} care in {locationName}? Our network of {clinicCount}+ 
          verified fostering agencys includes specialists who excel in providing top-quality {treatmentLower} 
          treatments. Whether you're a new patient or seeking a second opinion, you'll find experienced 
          professionals dedicated to supporting your family's needs.
        </p>
        
        <div className="grid sm:grid-cols-2 gap-4 mt-6">
          <div className="bg-muted/50 rounded-2xl p-5">
            <Users className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-bold text-foreground mb-2">Experienced Specialists</h3>
            <p className="text-sm text-muted-foreground">
              Our {treatmentLower} specialists have years of experience and stay current with the latest 
              techniques and technology in fostering care.
            </p>
          </div>
          <div className="bg-muted/50 rounded-2xl p-5">
            <Shield className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-bold text-foreground mb-2">Quality Guaranteed</h3>
            <p className="text-sm text-muted-foreground">
              All agencies are registered in {stateName} and verified on our platform. Many offer 
              ongoing support guarantees and satisfaction reviews.
            </p>
          </div>
        </div>
      </div>

      {/* What to Know Section */}
      <div className="bg-card border border-border rounded-3xl p-8 md:p-10">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
          What to Know About {treatmentName} Fostering
        </h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-bold text-foreground mb-2">Consultation Process</h3>
            <p className="text-muted-foreground">
              Most {treatmentLower} care begins with a thorough consultation. The agency will 
              assess your situation, discuss your goals, and create a personalized plan. Many 
              agencies in {locationName} offer free or low-cost initial consultations.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-foreground mb-2">Timeline</h3>
            <p className="text-muted-foreground">
              The duration of {treatmentLower} care varies based on your specific situation. Some 
              placements can begin quickly, while others may require additional assessments 
              over several weeks or months.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-foreground mb-2">Allowances & Support</h3>
            <p className="text-muted-foreground">
              {treatmentName} support in {locationName} depends on the type of care and the 
              agency you choose. Many agencies provide competitive allowances, 
              training payments, and comprehensive support packages.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-foreground mb-2">Aftercare & Maintenance</h3>
            <p className="text-muted-foreground">
              Proper aftercare is essential for long-lasting results. The agency will provide specific 
              guidance and schedule follow-up support to ensure your fostering journey is successful.
            </p>
          </div>
        </div>
      </div>

      {/* Why Choose Local Section */}
      <div className="bg-card border border-border rounded-3xl p-8 md:p-10">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
          Why Choose a {locationName} {treatmentName} Agency?
        </h2>
        <ul className="space-y-3">
          {[
            `Convenient location for regular support visits and ongoing guidance`,
            `Familiarity with local authority processes and regional requirements`,
            `Strong community reputation and accessible foster carrier reviews`,
            `Emergency availability when you need urgent support`,
            `Personalized care from professionals who understand your family's needs`
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-muted-foreground">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Nearby Locations */}
      {nearbyLocations.length > 0 && (
        <div className="bg-card border border-border rounded-3xl p-8 md:p-10">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">
            {treatmentName} in Nearby Cities
          </h2>
          <p className="text-muted-foreground mb-4">
            Explore {treatmentLower} specialists in other {stateName} cities:
          </p>
          <div className="flex flex-wrap gap-2">
            {nearbyLocations.map((location) => (
              <Link
                key={location.slug}
                to={`/${stateSlug}/${location.slug}/${treatmentName.toLowerCase().replace(/\s+/g, '-')}`}
                className="bg-muted hover:bg-muted/80 text-foreground rounded-full px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1"
              >
                <MapPin className="h-3 w-3" />
                {treatmentName} in {location.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSEOContent;
