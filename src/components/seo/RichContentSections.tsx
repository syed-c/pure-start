import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart, Shield, Users, BookOpen, Home, HandHeart, Phone, CheckCircle } from "lucide-react";

const fade = (i: number) => ({
  initial: { opacity: 0, y: 16 } as const,
  whileInView: { opacity: 1, y: 0 } as const,
  viewport: { once: true } as const,
  transition: { duration: 0.4, delay: i * 0.08 },
});

// Deterministic hash to pick variants so each page gets unique but stable content
function simpleHash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function pick<T>(arr: T[], hash: number, offset = 0): T {
  return arr[(hash + offset) % arr.length];
}

// ─── CITY PAGE ────────────────────────────────────────────
function cityContent(city: string, region: string, agencyCount: number) {
  const h = simpleHash(city + region);
  const councilArea = pick(["borough", "district", "metropolitan area", "county area"], h);
  const localFeature = pick(
    ["vibrant community centres", "well-connected transport links", "excellent local schools", "thriving neighbourhoods", "strong community networks"],
    h, 1
  );
  const supportOrg = pick(
    ["local children's services teams", "independent reviewing officers", "fostering advisory panels", "community family hubs"],
    h, 2
  );

  return [
    {
      icon: Home,
      title: `Why Foster in ${city}?`,
      body: `${city} is a thriving ${councilArea} within ${region}, offering foster carers a supportive environment backed by ${localFeature}. The local authority in ${city} works closely with independent fostering agencies to ensure every looked-after child receives stable, nurturing care. With ${agencyCount > 0 ? agencyCount + '+' : 'several'} Ofsted-registered agencies operating in the area, prospective carers have a genuine choice when selecting the agency that best matches their family's circumstances. Foster carers in ${city} benefit from access to ${supportOrg}, dedicated training programmes, and peer support groups that meet regularly across the ${councilArea}. The demand for foster placements in ${city} remains significant, particularly for sibling groups, teenagers, and children with additional needs, making it a rewarding area in which to begin or continue your fostering journey.`,
    },
    {
      icon: Shield,
      title: `Ofsted Standards & Safeguarding in ${city}`,
      body: `Every fostering agency listed for ${city} on Foster Care is registered with Ofsted and subject to regular inspection. Ofsted's framework evaluates agencies on leadership, the quality of care provided, and outcomes for children. In ${region}, agencies must also comply with the Children Act 1989 and the Fostering Services (England) Regulations 2011. Safeguarding training is mandatory for all approved foster carers, covering areas such as online safety, recognising signs of abuse, and the role of the designated safeguarding lead. Agencies in ${city} typically offer enhanced DBS checks, safer-recruitment policies, and ongoing supervision from qualified social workers. If you are considering fostering in ${city}, you can request Ofsted inspection reports directly through each agency's profile on our platform to compare performance and ratings before making an enquiry.`,
    },
    {
      icon: BookOpen,
      title: `The Fostering Assessment Process in ${city}`,
      body: `Becoming an approved foster carer in ${city} involves a structured assessment led by the agency you choose. The process typically begins with an initial enquiry — often a phone call or online form — followed by a home visit from a social worker. You will then complete Stage 1 (checks, references, and the Skills to Foster training course) and Stage 2 (the Form F assessment, which explores your background, parenting capacity, and support network). In total, the assessment usually takes four to six months. Agencies in ${city} offer flexible training schedules, including evening and weekend sessions, to accommodate working applicants. Once approved by a fostering panel, you are matched with a child whose needs align with your skills. Throughout your fostering career in ${city}, agencies provide annual reviews, continuous professional development, and 24-hour support lines to ensure you never feel unsupported.`,
    },
    {
      icon: Heart,
      title: `Fostering Allowances & Support in ${city}`,
      body: `Foster carers in ${city} receive a weekly fostering allowance that covers the cost of caring for a child, plus a fee element that recognises the carer's skills and commitment. The national minimum fostering allowance for England ranges from approximately £132 per week for a child under five to £187 per week for a young person aged 16-17, though many independent agencies in ${city} offer significantly higher rates. In addition to financial support, carers in ${city} can access tax relief (the first £10,000 of fostering income is tax-free, plus £200-£250 per week per child), membership of local fostering support groups, respite care arrangements, and dedicated therapeutic services for children with complex needs. Several agencies operating in ${city} also provide loyalty bonuses, holiday contributions, and equipment grants to help families provide the best possible care environment.`,
    },
  ];
}

// ─── STATE / REGION PAGE ──────────────────────────────────
function stateContent(region: string, cityCount: number, agencyCount: number) {
  const h = simpleHash(region);
  const landscape = pick(
    ["diverse urban and rural communities", "a mix of cities, towns, and coastal areas", "historic market towns and modern cities", "bustling metropolitan centres and quiet villages"],
    h
  );

  return [
    {
      icon: Users,
      title: `Fostering Across ${region}`,
      body: `${region} encompasses ${landscape}, each with its own demand for foster care. Across the region, ${agencyCount > 0 ? agencyCount + '+' : 'numerous'} Ofsted-registered fostering agencies support ${cityCount > 0 ? cityCount + '+' : 'many'} local authority areas. Whether you live in a city centre flat or a rural farmhouse, agencies in ${region} welcome applications from people of all backgrounds, cultures, and family structures. The Children's Commissioner for England has highlighted the ongoing need for more foster carers nationwide, and ${region} is no exception — particularly for placements serving older children, unaccompanied asylum-seeking young people, and parent-and-child arrangements. By choosing to foster in ${region}, you join a network of dedicated carers who collectively transform the lives of thousands of children every year.`,
    },
    {
      icon: Shield,
      title: `Regulation & Quality Assurance in ${region}`,
      body: `Fostering agencies operating in ${region} are inspected by Ofsted under the Social Care Common Inspection Framework (SCCIF). Inspection judgements range from Outstanding to Inadequate, and reports are published publicly, giving prospective carers full transparency. Local authorities in ${region} also have Independent Reviewing Officers (IROs) who monitor the care plans of every looked-after child. The regional Safeguarding Children Partnerships coordinate multi-agency safeguarding policies, ensuring consistent standards across ${region}. Foster Care's directory makes it easy to compare Ofsted ratings for agencies in ${region}, filter by specialisms, and read verified carer reviews — all in one place. We recommend contacting multiple agencies to understand the differences in training, support packages, and fostering allowances before committing to an application.`,
    },
    {
      icon: HandHeart,
      title: `Types of Fostering Available in ${region}`,
      body: `Agencies in ${region} recruit carers for a wide range of placement types. Emergency fostering provides immediate, short-notice care for children who need to be removed from unsafe situations — often requiring carers who can respond within hours. Short-term fostering covers placements lasting days to several months while a child's longer-term plan is determined. Long-term fostering offers stability for children who cannot return to their birth families but for whom adoption is not the right plan. Specialist placements include therapeutic fostering for children with complex emotional or behavioural needs, parent-and-child fostering where a young parent is assessed alongside their baby, and respite fostering, which gives full-time carers a planned break. Many agencies in ${region} also support Staying Put arrangements, enabling young people to remain with their foster family beyond 18.`,
    },
    {
      icon: BookOpen,
      title: `Training & Professional Development in ${region}`,
      body: `Agencies across ${region} invest heavily in carer training, beginning with the mandatory Skills to Foster (or equivalent) pre-approval course and continuing throughout a carer's registration. Core training modules cover child development, attachment theory, managing challenging behaviour, first aid, safe care, and equality and diversity. Many agencies in ${region} offer accredited qualifications such as the Level 3 Diploma in the Children and Young People's Workforce, giving carers formal recognition of their skills. Ongoing professional development includes workshops on topics like online safety, life-story work, therapeutic parenting, and preparing young people for independence. Regular supervision sessions with a qualified supervising social worker provide reflective space to discuss placements, celebrate successes, and address challenges. This commitment to training ensures foster carers in ${region} are well-equipped to meet the needs of the children in their care.`,
    },
  ];
}

// ─── SERVICE PAGE ─────────────────────────────────────────
function serviceContent(serviceName: string, agencyCount: number) {
  const h = simpleHash(serviceName);
  const sn = serviceName.toLowerCase();

  return [
    {
      icon: Heart,
      title: `Understanding ${serviceName}`,
      body: `${serviceName} is a vital part of the UK's children's social care system, designed to provide nurturing family-based care for children and young people who cannot safely remain with their birth families. Unlike residential care, ${sn} places children within trained family households, giving them the stability, routine, and individual attention they need to thrive. Across England, Scotland, Wales, and Northern Ireland, ${agencyCount > 0 ? agencyCount + '+' : 'hundreds of'} agencies recruit, train, and support carers who specialise in ${sn}. The approach is grounded in attachment theory and trauma-informed practice, ensuring that carers understand the impact of early adversity and can respond with patience, empathy, and skill. Whether you are exploring fostering for the first time or looking to transfer to an agency that better supports ${sn}, Foster Care's directory helps you compare options, read Ofsted reports, and make an informed choice.`,
    },
    {
      icon: Users,
      title: `Who Can Become a ${serviceName} Carer?`,
      body: `There is no single profile of a successful ${sn} carer. Agencies across the UK welcome applications from individuals and couples of any gender, ethnicity, religion, or sexual orientation. You can be a homeowner or a renter, employed or retired, a parent or someone without children. The key qualities agencies look for include emotional resilience, patience, a genuine commitment to children's wellbeing, and a spare bedroom that meets minimum size requirements. ${serviceName} carers must be at least 21 years old (18 in some regions) and will undergo enhanced DBS checks, medical assessments, and comprehensive references. Previous experience with children — whether professional, voluntary, or personal — is valued but not always essential. Agencies provide full training to equip you with the skills and knowledge needed for ${sn}, so what matters most is your willingness to learn and your capacity to provide a safe, loving home.`,
    },
    {
      icon: Shield,
      title: `Ofsted Oversight of ${serviceName} Agencies`,
      body: `In England, all independent fostering agencies and local authority fostering services providing ${sn} are inspected by Ofsted under the Social Care Common Inspection Framework. Inspections assess the overall experiences and progress of children, the quality of care and safeguarding arrangements, and the effectiveness of leadership and management. Agencies rated Outstanding demonstrate exceptional practice, while those rated Good meet all regulatory requirements and deliver positive outcomes. Foster Care displays each agency's latest Ofsted rating on their profile, along with links to full inspection reports, so you can make a confident, evidence-based decision. In Scotland, the Care Inspectorate performs a similar function, while Care Inspectorate Wales and the Regulation and Quality Improvement Authority (RQIA) oversee services in Wales and Northern Ireland respectively.`,
    },
    {
      icon: Phone,
      title: `How to Enquire About ${serviceName}`,
      body: `Starting your ${sn} journey is straightforward. Browse our directory to find agencies that specialise in ${sn}, compare their Ofsted ratings and carer reviews, and click "Enquire" on the profiles that interest you. Most agencies will respond within 48 hours to arrange an initial conversation — this is an informal, no-obligation chat where you can ask questions about training, support, allowances, and the types of children who need placements. If you decide to proceed, the agency will invite you to an information evening or a one-to-one meeting, followed by the formal assessment process. We recommend contacting at least two or three agencies so you can compare the support packages, training quality, and fostering culture before committing. Foster Care is here to make that comparison easy, transparent, and free of charge for prospective carers across the UK.`,
    },
  ];
}

// ─── SERVICE-LOCATION PAGE ────────────────────────────────
function serviceLocationContent(serviceName: string, city: string, region: string, agencyCount: number) {
  const h = simpleHash(serviceName + city);
  const sn = serviceName.toLowerCase();
  const localTrait = pick(
    ["strong local authority partnerships", "active fostering community networks", "dedicated children's services teams", "well-resourced family support centres"],
    h
  );

  return [
    {
      icon: Home,
      title: `${serviceName} in ${city} — Local Overview`,
      body: `${city} is one of ${region}'s key areas for ${sn}, with ${agencyCount > 0 ? agencyCount + '+' : 'several'} agencies actively recruiting carers. The local authority in ${city} works alongside independent fostering agencies to ensure sufficient placements are available for children who need them. ${city} benefits from ${localTrait}, making it a supportive environment for both new and experienced foster carers. The demand for ${sn} placements in ${city} reflects national trends — there is a particular need for carers willing to support teenagers, sibling groups, and children with disabilities or complex health needs. By fostering in ${city}, you become part of a local network of carers who share experiences, attend support groups together, and contribute to better outcomes for children in the area. Agencies operating in ${city} provide comprehensive induction programmes, ongoing training, and access to therapeutic services to ensure you feel confident and well-supported from day one.`,
    },
    {
      icon: CheckCircle,
      title: `What to Expect from ${serviceName} Agencies in ${city}`,
      body: `When you enquire about ${sn} with an agency in ${city}, the process typically follows a clear structure. After an initial conversation and information session, you will begin the assessment, which includes background checks (enhanced DBS, medical, references from employers and personal contacts), the Skills to Foster course, and the Form F home study. A qualified social worker will visit your home several times to explore your motivation, parenting capacity, and support network. The entire process usually takes four to six months. Once approved by a fostering panel, you will be matched with a child whose needs align with your experience, skills, and family circumstances. Agencies in ${city} pride themselves on thoughtful matching, ensuring that placements have the best chance of success. Post-approval, you will receive regular supervision, annual reviews, and access to a 24-hour support line for emergencies.`,
    },
    {
      icon: Heart,
      title: `Support & Allowances for ${serviceName} Carers in ${city}`,
      body: `Foster carers providing ${sn} in ${city} receive a combination of a maintenance allowance (to cover the child's day-to-day costs) and a fee payment (recognising the carer's time and skills). Rates vary between agencies, but many independent agencies in ${city} offer enhanced packages above the national minimum. Additional financial support may include birthday and holiday allowances, mileage reimbursement for contact visits, and grants for bedroom equipment or adaptations. Beyond finances, agencies in ${city} provide access to specialist therapeutic consultations, educational advocacy for looked-after children, peer mentoring from experienced carers, and regular social events for foster families. Respite arrangements are available to ensure carers have planned breaks, and many agencies offer a dedicated out-of-hours team for urgent advice. This robust support structure helps foster carers in ${city} sustain long, rewarding careers in ${sn}.`,
    },
    {
      icon: BookOpen,
      title: `Frequently Needed Placements for ${serviceName} in ${city}`,
      body: `The children who come into ${sn} in ${city} have diverse backgrounds and needs. Some require emergency placements at short notice — perhaps after a family crisis or safeguarding concern — while others need planned, longer-term arrangements. Sibling groups are among the most challenging to place because they need carers with enough space and energy to keep brothers and sisters together. Teenagers often wait longest for placements, yet they benefit enormously from the stability that committed foster carers provide during a pivotal stage of their development. Children with special educational needs and disabilities (SEND) may require carers with specific skills or home adaptations. Unaccompanied asylum-seeking children arriving in ${city} need culturally sensitive care and language support. Whatever the child's circumstances, agencies in ${city} provide tailored training and specialist guidance so you can offer the right support from the very first day of placement.`,
    },
  ];
}

// ─── STATE-SERVICE PAGE ───────────────────────────────────
function stateServiceContent(serviceName: string, region: string, agencyCount: number, cityCount: number) {
  const sn = serviceName.toLowerCase();

  return [
    {
      icon: HandHeart,
      title: `${serviceName} Across ${region}`,
      body: `${region} has a well-established network of fostering agencies providing ${sn} across ${cityCount > 0 ? cityCount + '+' : 'numerous'} towns and cities. The regional demand for ${sn} placements continues to grow as local authorities seek family-based alternatives to residential care. Agencies across ${region} are regulated by Ofsted and adhere to the national minimum standards for fostering services. ${agencyCount > 0 ? agencyCount + '+' : 'Multiple'} agencies in ${region} currently recruit carers for ${sn}, offering competitive allowances, comprehensive training, and dedicated social worker support. Whether you are based in the region's largest city or a quieter rural community, agencies are keen to hear from prospective carers who can offer a safe, stable home. Foster Care makes it simple to compare agencies operating in ${region}, view their latest Ofsted inspection results, and submit enquiries — all from one directory.`,
    },
    {
      icon: Shield,
      title: `Quality & Standards for ${serviceName} in ${region}`,
      body: `All agencies offering ${sn} in ${region} must meet the requirements of the Care Standards Act 2000 and the Fostering Services (England) Regulations 2011. Ofsted inspections evaluate the quality of care, safeguarding effectiveness, and leadership within each agency. Foster Care's profiles display the most recent Ofsted rating for every agency in ${region}, giving you immediate visibility of performance. Beyond regulatory compliance, many agencies in ${region} pursue voluntary accreditation through bodies such as The Fostering Network, demonstrating an additional commitment to best practice. Local Safeguarding Children Partnerships across ${region} ensure that multi-agency protocols are followed whenever a child is at risk. As a prospective carer exploring ${sn} in ${region}, you can use Foster Care to filter agencies by rating, compare support packages, and read reviews from other carers before deciding where to apply.`,
    },
    {
      icon: BookOpen,
      title: `Getting Started with ${serviceName} in ${region}`,
      body: `If you are interested in ${sn} in ${region}, the first step is to explore the agencies available in your area. Use Foster Care's directory to filter by location, fostering type, and Ofsted rating. Once you have identified agencies that interest you, submit an enquiry through their profile — most agencies respond within one to two working days. The initial stage involves an informal chat, either by phone or in person, where you can ask questions and learn about the agency's ethos, training programme, and allowance structure. If you decide to proceed, you will attend a preparation course (typically the Skills to Foster programme, run over several days or weekends) before entering the formal assessment. Throughout the process, a supervising social worker will guide and support you. Many carers in ${region} report that the assessment, while thorough, is a positive and empowering experience that prepares them well for the rewarding reality of ${sn}.`,
    },
  ];
}

// ─── MAIN COMPONENT ──────────────────────────────────────

interface RichContentSectionsProps {
  pageType: "city" | "state" | "service" | "service-location" | "state-service";
  cityName?: string;
  regionName?: string;
  serviceName?: string;
  agencyCount?: number;
  cityCount?: number;
  stateSlug?: string;
  citySlug?: string;
  serviceSlug?: string;
}

export const RichContentSections = ({
  pageType,
  cityName = "",
  regionName = "",
  serviceName = "",
  agencyCount = 0,
  cityCount = 0,
  stateSlug,
  citySlug,
  serviceSlug,
}: RichContentSectionsProps) => {
  let sections: { icon: any; title: string; body: string }[] = [];

  switch (pageType) {
    case "city":
      sections = cityContent(cityName, regionName, agencyCount);
      break;
    case "state":
      sections = stateContent(regionName, cityCount, agencyCount);
      break;
    case "service":
      sections = serviceContent(serviceName, agencyCount);
      break;
    case "service-location":
      sections = serviceLocationContent(serviceName, cityName, regionName, agencyCount);
      break;
    case "state-service":
      sections = stateServiceContent(serviceName, regionName, agencyCount, cityCount);
      break;
  }

  if (!sections.length) return null;

  return (
    <div className="space-y-6">
      {sections.map((section, i) => (
        <motion.div key={i} {...fade(i)} className="bg-card border border-border rounded-2xl p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="hidden md:flex shrink-0 h-10 w-10 rounded-xl bg-primary/10 items-center justify-center">
              <section.icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg md:text-xl font-bold text-foreground mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {section.title}
              </h2>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                {section.body}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default RichContentSections;
