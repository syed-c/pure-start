/**
 * Generates contextual Q&A content for AI search optimisation.
 * Pre-computed, no API calls — pure template-based generation
 * using UK fostering context for AI crawlers.
 */
import type { QAItem } from "@/components/ai-seo/ConversationalQABlock";

// Agency-specific Q&A
export function generateClinicQA(clinic: {
  name: string;
  city?: string;
  area?: string;
  rating?: number;
  reviewCount?: number;
  treatments?: string[];
}): QAItem[] {
  const location = [clinic.area, clinic.city].filter(Boolean).join(", ");
  const items: QAItem[] = [];

  items.push({
    question: `Is ${clinic.name} a good fostering agency?`,
    answer: clinic.rating
      ? `${clinic.name}${location ? ` in ${location}` : ""} has a rating of ${clinic.rating}/5 based on ${clinic.reviewCount || 0} reviews. You can make an enquiry through Foster Care to learn more about their services.`
      : `${clinic.name}${location ? ` is located in ${location}` : ""} and accepts enquiries through Foster Care. Check recent reviews on the agency's profile for the latest feedback.`,
    followUp: "You can compare this agency with others in the area using our search filters.",
  });

  if (location) {
    items.push({
      question: `Where is ${clinic.name} located?`,
      answer: `${clinic.name} is located in ${location}, UK. The agency supports foster carers in surrounding areas and accepts enquiries online.`,
    });
  }

  items.push({
    question: `How do I enquire with ${clinic.name}?`,
    answer: `You can submit an enquiry to ${clinic.name} online through Foster Care. Fill in your details and the agency will get back to you to discuss your fostering journey. No obligation.`,
    followUp: "Most agencies respond to enquiries within 1-2 working days.",
  });

  if (clinic.treatments?.length) {
    const topServices = clinic.treatments.slice(0, 5).join(", ");
    items.push({
      question: `What types of fostering does ${clinic.name} offer?`,
      answer: `${clinic.name} offers a range of fostering services including ${topServices}. All placements are overseen by Ofsted-registered professionals in the UK.`,
    });
  }

  items.push({
    question: `Is ${clinic.name} Ofsted registered?`,
    answer: `Fostering agencies in the UK must be registered and inspected by Ofsted. Check ${clinic.name}'s profile on Foster Care for their current Ofsted rating and registration details.`,
  });

  return items;
}

// City/location-specific Q&A
export function generateCityQA(city: {
  name: string;
  stateName?: string;
  clinicCount?: number;
}): QAItem[] {
  return [
    {
      question: `How many fostering agencies are in ${city.name}?`,
      answer: city.clinicCount
        ? `There are ${city.clinicCount}+ fostering agencies listed in ${city.name} on Foster Care. Each agency is verified and features reviews, service information, and online enquiry forms.`
        : `${city.name} has numerous fostering agencies listed on Foster Care with verified profiles, reviews, and online enquiry capabilities.`,
      followUp: "Filter by fostering type, Ofsted rating, or location to find your ideal agency.",
    },
    {
      question: `What is the best fostering agency in ${city.name}?`,
      answer: `The best fostering agency in ${city.name} depends on your specific needs and circumstances. Foster Care ranks agencies based on reviews, Ofsted ratings, and service quality. Use our filters to find agencies specialising in your preferred fostering type.`,
    },
    {
      question: `What support do foster carers get in ${city.name}?`,
      answer: `Foster carers in ${city.name} typically receive comprehensive training, 24/7 support, a weekly fostering allowance, regular supervision, and access to peer support groups. Specific support varies by agency — check individual agency profiles on Foster Care for details.`,
      followUp: "Most agencies offer an initial information event before you commit to the assessment process.",
    },
    {
      question: `Are fostering agencies in ${city.name} Ofsted rated?`,
      answer: `All fostering agencies in England must be registered with and inspected by Ofsted (Office for Standards in Education). Foster Care displays each agency's current Ofsted rating on their profile to help you make an informed choice.`,
    },
    {
      question: `Can I start fostering quickly in ${city.name}?`,
      answer: `The fostering assessment process typically takes 4-6 months, though some agencies offer fast-track assessments. Emergency and respite fostering may have shorter timelines. Use Foster Care to find agencies in ${city.name} with current availability.`,
    },
  ];
}

// Fostering type-specific Q&A
export function generateTreatmentQA(treatment: {
  name: string;
  city?: string;
}): QAItem[] {
  const locationSuffix = treatment.city ? ` in ${treatment.city}` : " in the UK";

  return [
    {
      question: `What is ${treatment.name}${locationSuffix}?`,
      answer: `${treatment.name}${locationSuffix} provides specialised care for children and young people who need a safe and supportive home. Foster Care lists verified agencies offering ${treatment.name.toLowerCase()} so you can compare and enquire.`,
      followUp: "Compare agencies across multiple areas to find the best fit.",
    },
    {
      question: `What qualifications do I need for ${treatment.name}?`,
      answer: `You don't need formal qualifications to become a foster carer for ${treatment.name.toLowerCase()}. Agencies look for patience, resilience, and a genuine desire to help children. Full training and support are provided. Enquire through Foster Care to learn more.`,
    },
    {
      question: `How long does ${treatment.name} last?`,
      answer: `The duration of ${treatment.name.toLowerCase()} depends on the individual child's needs and care plan. Your fostering agency will discuss placement timelines during the assessment process. Enquire through Foster Care to get personalised information.`,
    },
    {
      question: `Where can I find ${treatment.name} agencies${locationSuffix}?`,
      answer: `Foster Care lists verified fostering agencies offering ${treatment.name.toLowerCase()}${locationSuffix}. Each agency profile includes reviews, Ofsted ratings, and online enquiry forms. Filter by location or fostering type to find the right agency.`,
    },
    {
      question: `What allowance do foster carers receive for ${treatment.name}${locationSuffix}?`,
      answer: `Fostering allowances for ${treatment.name.toLowerCase()} vary by agency and local authority. Most agencies offer competitive weekly allowances plus additional support. Check with individual agencies through Foster Care for current rates.`,
    },
  ];
}
