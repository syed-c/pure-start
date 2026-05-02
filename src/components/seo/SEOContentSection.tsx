import { Link } from "react-router-dom";

interface SEOContentSectionProps {
  locationName?: string;
  serviceName?: string;
  stateName?: string;
  variant: 'location' | 'service' | 'service-location' | 'listing';
  relatedLinks?: { label: string; href: string }[];
  agencyCount?: number;
  fosterCarerCount?: number;
}

export function SEOContentSection({ 
  locationName, 
  serviceName, 
  stateName,
  variant, 
  relatedLinks,
  agencyCount = 0,
  fosterCarerCount = 0
}: SEOContentSectionProps) {
  
  const renderLocationContent = () => (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Finding the Best Fostering Agency in {locationName}{stateName ? `, ${stateName}` : ''}
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          {locationName} is home to {agencyCount > 0 ? `over ${agencyCount}` : 'numerous'} Ofsted-registered fostering agencies 
          offering a comprehensive range of fostering services. Whether you need short-term, long-term, emergency, or specialist fostering care, 
          our directory connects you with licensed agencies who meet the highest standards of care.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-4">
          The fostering community in {locationName} includes independent fostering agencies (IFAs), local authority teams, 
          therapeutic specialists, and specialist support services. Many agencies offer comprehensive training, 24/7 support, 
          and competitive allowances for foster carers.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          All fostering agencies listed on our platform have been verified for their Ofsted registration and credentials. 
          You can compare ratings, read authentic reviews, view agency profiles, and send enquiries 
          directly through our platform.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Why Choose a Fostering Agency in {locationName}?
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Selecting a local fostering agency in {locationName} offers numerous advantages for your fostering journey. 
          Proximity means easier access for face-to-face consultations, training sessions, 
          and ongoing support visits, which are all essential for a successful fostering placement.
        </p>
        <ul className="space-y-3 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">•</span>
            <span>Convenient local offices with easy parking and public transit access</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">•</span>
            <span>Ofsted-registered agencies with verified credentials and ratings</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">•</span>
            <span>Experienced social workers and supervising social workers supporting diverse family needs</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">•</span>
            <span>Flexible consultation times including evenings and weekends at many agencies</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">•</span>
            <span>Competitive fostering allowances and comprehensive support packages</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">•</span>
            <span>Emergency support services for urgent placement needs</span>
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-foreground mb-4">
          What to Look for When Choosing a Fostering Agency
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Finding the right fostering agency involves considering several important factors. Look for agencies with 
          strong Ofsted ratings, relevant specialisations, and positive testimonials from existing foster carers. 
          Consider whether the agency offers the specific types of fostering you can provide, from temporary care to long-term placements.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Don't hesitate to request a information pack, attend an information evening, or speak directly with a supervising 
          social worker to discuss your circumstances. A good agency-carer relationship is built on trust, communication, and shared 
          commitment to the child's wellbeing.
        </p>
      </section>

      {relatedLinks && relatedLinks.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Explore Nearby Areas
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Can't find exactly what you're looking for in {locationName}? Explore agencies in neighbouring communities 
            to find the perfect match for your fostering care capabilities.
          </p>
          <div className="flex flex-wrap gap-2">
            {relatedLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="bg-muted hover:bg-primary hover:text-primary-foreground rounded-xl px-4 py-2 text-sm font-bold transition-all"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );

  const renderServiceContent = () => (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Understanding {serviceName} Fostering
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          {serviceName} is one of the most sought-after types of fostering across the United Kingdom. Our network of 
          verified fostering agencies offers comprehensive support using the latest approaches and training to ensure 
          the best outcomes for both foster carers and the children in your care.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Whether you're considering {serviceName?.toLowerCase()} for the first time or seeking further information from 
          another qualified agency, our comprehensive directory connects you with experienced fostering professionals 
          who can guide you through every step of the process.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Modern {serviceName?.toLowerCase()} fostering has evolved significantly in recent years, with improved 
          training, support mechanisms, and outcomes. Many foster carers report feeling well-supported and are impressed by the 
          rewards achieved through providing loving care to children in need.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Benefits of {serviceName}
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Foster carers who provide {serviceName?.toLowerCase()} care often experience significant improvements in both 
          their personal wellbeing and the lives of the children they care for. Here are some of the key benefits you can expect:
        </p>
        <ul className="space-y-3 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">•</span>
            <span>Improved wellbeing for children through dedicated, specialised care</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">•</span>
            <span>Comprehensive training and ongoing professional development</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">•</span>
            <span>Competitive allowances with regular reviews and enhancements</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">•</span>
            <span>Personalised support plans tailored to your unique circumstances</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">•</span>
            <span>24/7 access to therapeutic teams and specialist support</span>
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Preparing for Your {serviceName} Journey
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Before beginning your {serviceName?.toLowerCase()} journey, your agency will conduct a thorough assessment and 
          discuss your options. This may include home visits, background checks, and preparation training to create 
          a customized plan that matches your capabilities with children's needs.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Be sure to discuss your family circumstances, your motivations for fostering, and any questions you 
          have about the process. Your agency team is there to ensure you feel comfortable and informed throughout 
          your fostering journey.
        </p>
      </section>

      {relatedLinks && relatedLinks.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Related Fostering Types
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Explore other types of fostering that may complement your {serviceName?.toLowerCase()} experience 
            or suit your circumstances better.
          </p>
          <div className="flex flex-wrap gap-2">
            {relatedLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="bg-muted hover:bg-primary hover:text-primary-foreground rounded-xl px-4 py-2 text-sm font-bold transition-all"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );

  const renderServiceLocationContent = () => (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold text-foreground mb-4">
          {serviceName} in {locationName}{stateName ? `, ${stateName}` : ''}
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Looking for {serviceName?.toLowerCase()} specialists in {locationName}? Our comprehensive directory features 
          {agencyCount > 0 ? ` ${agencyCount}+` : ''} verified fostering agencies who specialise in this type of care 
          and proudly support families throughout the {locationName} area and surrounding communities.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Each agency in our network has been carefully vetted for their Ofsted registration, experience, and commitment to 
          foster carer support. You can compare ratings based on authentic reviews, view agency profiles, 
          and make enquiries with complete confidence.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          {serviceName} in {locationName} is supported by experienced agencies using comprehensive approaches and training. 
          Many local agencies offer guidance sessions, comprehensive training programmes, and flexible support options to make 
          fostering accessible to all suitable families.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Why Choose {locationName} for {serviceName}?
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          {locationName} has become a destination for quality fostering care, with agencies equipped with 
          trained professionals and comprehensive support systems. Here's why families choose 
          local providers for their {serviceName?.toLowerCase()} journey:
        </p>
        <ul className="space-y-3 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">•</span>
            <span>Access to top-rated {serviceName?.toLowerCase()} agencies in your local community</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">•</span>
            <span>Convenient information sessions including daytime, evenings, and weekend options</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">•</span>
            <span>Transparent information about allowances and support packages</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">•</span>
            <span>Comprehensive follow-up support and ongoing training close to your home</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">•</span>
            <span>Modern agencies with dedicated support teams and therapeutic services</span>
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-foreground mb-4">
          What to Expect During Your {serviceName} Enquiry
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Your first {serviceName?.toLowerCase()} enquiry in {locationName} will typically include a friendly conversation 
          about your circumstances, discussion of your fostering goals, and a detailed explanation of what's involved. 
          Many agencies offer information evenings and open days for prospective foster carers.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          During your enquiry, don't hesitate to ask about the agency's experience with {serviceName?.toLowerCase()}, 
          speak with current foster carers, and discuss the timeline and preparation process. 
          A good agency will take the time to address all your questions and concerns.
        </p>
      </section>
    </div>
  );

  const renderListingContent = () => (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold text-foreground mb-4">
          How to Choose the Right Fostering Agency
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Choosing the right fostering agency is one of the most important decisions you can make for your fostering journey. 
          Our platform simplifies this process by allowing you to compare verified agencies based on their Ofsted ratings, 
          services offered, location, and support available.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Look for agencies with consistently strong Ofsted ratings, relevant specialisations for your circumstances, 
          convenient office locations, and support availability that fits your schedule. Consider factors like 
          training provision, allowance packages, and the range of fostering types offered.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          All profiles on our platform include verified credentials, authentic testimonials, and detailed 
          information about each agency. You can view photos, read reviews, and request information packs from 
          many agencies before making your first enquiry.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-foreground mb-4">
          What to Expect as a Prospective Foster Carer
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Whether you're just starting to consider fostering or ready to take the next step, knowing what to expect 
          can help you feel more comfortable and prepared for your journey.
        </p>
        <ul className="space-y-3 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">•</span>
            <span>A welcoming, supportive environment focused on your family's needs</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">•</span>
            <span>Comprehensive assessment with personalised guidance</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">•</span>
            <span>Clear communication about all options, processes, and allowances</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">•</span>
            <span>Easy online enquiry forms and responsive contact options</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">•</span>
            <span>Ongoing support, training, and access to support networks</span>
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Questions to Ask Your New Agency
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          When meeting with a new agency, it's important to ask the right questions to ensure they're 
          the right fit for your fostering goals. Consider asking about:
        </p>
        <ul className="space-y-3 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">•</span>
            <span>Their experience and training in specific types of fostering you can provide</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">•</span>
            <span>24/7 support availability and your assigned worker's contact details</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">•</span>
            <span>Fostering allowances, fees, and available financial support</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">•</span>
            <span>Their approach to Training, support groups, and peer networks</span>
          </li>
        </ul>
      </section>
    </div>
  );

  return (
    <div className="card-modern p-8 max-w-4xl">
      {variant === 'location' && renderLocationContent()}
      {variant === 'service' && renderServiceContent()}
      {variant === 'service-location' && renderServiceLocationContent()}
      {variant === 'listing' && renderListingContent()}
    </div>
  );
}