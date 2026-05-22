const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://vcvvtklbyvdbysfdbnfp.supabase.co';
const serviceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjdnZ0a2xieXZkYnlzZmRibmZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTU3Mzg3NCwiZXhwIjoyMDc3MTQ5ODc0fQ.KV1k56566JlPRlDHs613vsCqSyibpaLG4oY_hTt39fs';

const supabase = createClient(supabaseUrl, serviceKey);

// Content templates unique to each city type
const cityContent = {
  london: {
    h1: "Find Fostering Agencies in London | Verified Ofsted Registered",
    content: `London offers one of the UK's most diverse foster care networks, with agencies across all boroughs providing comprehensive support for children in need. Whether you're in Central London, East London, West London, or the suburbs, you'll find Ofsted-registered fostering agencies ready to support your journey as a foster carer.

London's fostering agencies specialize in emergency placements, short-term care, long-term fostering, and specialist services for children with complex needs. Many agencies in London also offer enhanced allowances and 24/7 support for foster carers.

The capital city has excellent transport links making it easy to attend training sessions, support groups, and agency meetings. Many London agencies also provide childcare support and flexible arrangements for working foster families.`,
    faqs: [
      { question: "How do I become a foster carer in London?", answer: "Contact any Ofsted-registered agency in London, complete their assessment process, and attend preparation training. Most agencies can guide you through the entire process." },
      { question: "What foster care types are available in London?", answer: "London agencies offer emergency, short-term, long-term, parent and child, therapeutic, and specialist fostering placements." },
      { question: "What allowances do London foster carers receive?", answer: "London typically offers higher allowances to reflect the cost of living, ranging from £400-£800 per week depending on the placement type." }
    ]
  },
  birmingham: {
    h1: "Fostering Agencies in Birmingham | West Midlands Foster Care",
    content: `Birmingham is one of the UK's largest fostering hubs, with numerous agencies across the West Midlands providing exceptional care for children. The city's diverse community means agencies here have experience supporting children from various backgrounds.

Birmingham foster agencies offer comprehensive training programmes, regular support groups, and dedicated social workers. Many agencies in Birmingham also specialize in supporting looked-after children with education needs, having strong links with local schools and academies.

The West Midlands has a strong network of foster families, with Birmingham agencies often hosting community events and training days. If you're considering fostering, Birmingham's agencies provide excellent preparation and ongoing support.`,
    faqs: [
      { question: "What makes Birmingham good for fostering?", answer: "Birmingham has multiple agencies, excellent transport links, diverse communities, and strong educational support networks." },
      { question: "Are there emergency fostering roles in Birmingham?", answer: "Yes, Birmingham agencies frequently need emergency foster carers for immediate placements." }
    ]
  },
  manchester: {
    h1: "Fostering Agencies in Manchester | Greater Manchester Care",
    content: `Manchester and Greater Manchester have a thriving foster care community with agencies experienced in supporting both children and foster families. The city's universities and colleges mean many agencies have student foster programmes.

Fostering agencies in Manchester specialize in supporting children with educational needs, with strong connections to local schools and colleges. Manchester offers a vibrant foster community with regular events and support groups.

The city's cultural diversity means Manchester agencies have expertise in supporting children from various ethnic and cultural backgrounds. Greater Manchester also offers good transport links across all boroughs.`,
    faqs: [
      { question: "Can students foster in Manchester?", answer: "Yes, some Manchester agencies have specific programmes for student foster carers and young foster parents." },
      { question: "What support is available for Manchester foster carers?", answer: "24/7 support, training, respite care, and community events are available through all Manchester agencies." }
    ]
  },
  kent: {
    h1: "Fostering Agencies in Kent | Kent County Foster Care",
    content: `Kent, known as the Garden of England, has fostering agencies that provide excellent support for both urban and rural foster families. The county's proximity to London makes it popular for families wanting space while maintaining city connections.
    
Kent foster agencies offer diverse placement types, from supporting children in Dover and Folkestone to agencies in Maidstone and Tunbridge Wells. The county's good schools and lower cost of living than London make it attractive for families.

Kent agencies are known for their strong community ties and support networks across the county. Many agencies here specialize in family finding for sibling groups and children with complex needs.`,
    faqs: [
      { question: "Is Kent good for commuting foster families?", answer: "Yes, Kent offers good rail links to London while providing more affordable housing than the capital." },
      { question: "What types of fostering are needed in Kent?", answer: "Short-term, long-term, and specialist placements for children with complex needs are particularly needed." }
    ]
  },
  leeds: {
    h1: "Fostering Agencies in Leeds | West Yorkshire Foster Care",
    content: `Leeds is one of the UK's largest cities and a major fostering hub in West Yorkshire. The city's fostering agencies are known for their excellent support networks and strong partnerships with local schools and social services.
    
Leeds foster carers benefit from a wide range of placement options including emergency, short-term, long-term, and therapeutic fostering. The city's diverse population means agencies have experience supporting children and families from many cultural and ethnic backgrounds.
    
West Yorkshire's strong community of foster families means regular support groups, training events, and social activities. Leeds agencies typically offer competitive allowances and comprehensive training programmes for new and experienced carers.`,
    faqs: [
      { question: "What training is offered to Leeds foster carers?", answer: "Agencies in Leeds provide Skills to Foster training, therapeutic parenting courses, and ongoing professional development." },
      { question: "Are there specialist fostering roles in Leeds?", answer: "Yes, Leeds agencies need therapeutic and complex needs foster carers, as well as parent-and-child placement carers." }
    ]
  },
  liverpool: {
    h1: "Fostering Agencies in Liverpool | Merseyside Foster Care",
    content: `Liverpool has a strong tradition of community care, and its fostering agencies reflect the city's warm and welcoming character. Merseyside's foster carers are well-supported with 24/7 access to dedicated social workers and comprehensive training.
    
Agencies in Liverpool offer a full range of fostering types from emergency placements to long-term care. The city's excellent transport links make it easy to attend training sessions, support groups, and agency meetings across the Merseyside region.
    
Liverpool foster carers benefit from a close-knit community of fellow carers, regular events, and strong peer support networks. Many agencies also offer enhanced allowances for specialist placements and sibling groups.`,
    faqs: [
      { question: "What makes fostering in Liverpool unique?", answer: "Liverpool's strong community spirit and extensive support networks create an excellent environment for foster families." },
      { question: "Do Liverpool agencies offer sibling placements?", answer: "Yes, many Liverpool agencies prioritise keeping sibling groups together and offer enhanced support for these placements." }
    ]
  },
  bristol: {
    h1: "Fostering Agencies in Bristol | South West Foster Care",
    content: `Bristol is a vibrant city with a strong fostering community in the South West. The city's fostering agencies work closely with local authorities to provide safe, nurturing homes for children and young people across the region.
    
Bristol agencies offer diverse fostering opportunities including short-break respite care, emergency placements, long-term fostering, and specialist therapeutic support. The city's excellent schools and transport links make it an ideal location for foster families.
    
Foster carers in Bristol benefit from competitive allowances, comprehensive training packages, and 24/7 support from experienced social workers. The South West's network of foster families provides ongoing peer support and community connections.`,
    faqs: [
      { question: "Is there a need for foster carers in Bristol?", answer: "Yes, Bristol consistently needs foster carers for all placement types, particularly for teenagers and sibling groups." },
      { question: "What support do Bristol agencies provide?", answer: "24/7 support, training, respite care, and regular social events are provided by all Bristol fostering agencies." }
    ]
  },
  sheffield: {
    h1: "Fostering Agencies in Sheffield | South Yorkshire Foster Care",
    content: `Sheffield offers an excellent fostering environment with agencies that combine city accessibility with South Yorkshire's strong community values. The city is known for its family-friendly atmosphere and excellent support networks for foster carers.
    
Fostering agencies in Sheffield provide a wide range of placement types including emergency, short-term, long-term, and specialist care. The city's location at the edge of the Peak District offers foster families a unique blend of urban amenities and outdoor spaces.
    
Sheffield agencies are known for their personalised approach, matching carers with placements that suit their skills and experience. Carers receive competitive allowances, thorough training, and access to a supportive community of fellow foster families.`,
    faqs: [
      { question: "Is Sheffield a good place for fostering?", answer: "Yes, Sheffield offers strong agency support, good schools, affordable housing, and a welcoming community for foster families." },
      { question: "What types of fostering are available in Sheffield?", answer: "Emergency, short-term, long-term, respite, therapeutic, and parent-and-child placements are all available." }
    ]
  },
  newcastle: {
    h1: "Fostering Agencies in Newcastle | Tyne and Wear Foster Care",
    content: `Newcastle upon Tyne is a thriving city in the North East with a proud tradition of supporting children in care. The city's fostering agencies are known for their dedicated teams and strong local authority partnerships.
    
Newcastle agencies offer comprehensive fostering services including emergency placements, short-term care, long-term fostering, and specialist support for children with complex needs. The city's excellent transport links across Tyne and Wear make it convenient for carers to access training and support.
    
Foster carers in Newcastle benefit from competitive allowances, outstanding training programmes, and 24/7 support from experienced professionals. The North East's close-knit fostering community provides excellent peer support and regular social events.`,
    faqs: [
      { question: "Are Newcastle agencies looking for new foster carers?", answer: "Yes, Newcastle consistently needs more foster carers, particularly for emergency and short-term placements." },
      { question: "What support do Newcastle foster carers receive?", answer: "Comprehensive training, 24/7 support, competitive allowances, and access to peer support groups are standard." }
    ]
  },
  nottingham: {
    h1: "Fostering Agencies in Nottingham | East Midlands Foster Care",
    content: `Nottingham is a vibrant city in the East Midlands with a strong fostering community. The city's agencies offer diverse placement options and excellent support for foster families across Nottinghamshire.
    
Nottingham foster agencies specialise in a wide range of placements from emergency care to long-term fostering. Many agencies also offer therapeutic support for children who have experienced trauma, as well as parent-and-child placement programmes.
    
The East Midlands has a growing network of foster families, with Nottingham agencies hosting regular training events and support groups. Carers receive competitive allowances, dedicated social worker support, and access to specialist training programmes.`,
    faqs: [
      { question: "What fostering is most needed in Nottingham?", answer: "Emergency foster carers and those able to care for teenagers and sibling groups are particularly in demand." },
      { question: "How do I become a foster carer in Nottingham?", answer: "Contact local agencies directly, attend an information session, and begin the Skills to Foster training programme." }
    ]
  },
  leicester: {
    h1: "Fostering Agencies in Leicester | Leicestershire Foster Care",
    content: `Leicester is one of the UK's most diverse cities, and its fostering agencies are experienced in supporting children from a wide range of cultural and ethnic backgrounds. The city's agencies work closely with local communities to provide culturally sensitive care.
    
Leicester agencies offer all major fostering types including emergency, short-term, long-term, respite, and therapeutic placements. The city's central location in the East Midlands provides excellent access to training and support services.
    
Foster carers in Leicester benefit from competitive allowances, comprehensive training packages including cultural competency training, and strong peer support networks. The city's diverse community means agencies can often match children with carers who share their cultural background.`,
    faqs: [
      { question: "Does Leicester need foster carers from diverse backgrounds?", answer: "Yes, Leicester particularly needs carers who reflect the city's diverse communities to support children from similar backgrounds." },
      { question: "What training do Leicester agencies provide?", answer: "Skills to Foster, therapeutic parenting, cultural competency, and specialist training for complex needs are all available." }
    ]
  },
  coventry: {
    h1: "Fostering Agencies in Coventry | West Midlands Foster Care",
    content: `Coventry is an historic city in the West Midlands with a dedicated fostering community. The city's agencies provide excellent support for foster families and work closely with local schools and community services.
    
Coventry fostering agencies offer a comprehensive range of placements from emergency care through to long-term and specialist fostering. The city's central location makes it easy to access training across the West Midlands region.
    
Foster carers in Coventry receive competitive allowances, 24/7 support from dedicated social workers, and access to ongoing training programmes. The city's strong community networks provide valuable peer support for new and experienced carers alike.`,
    faqs: [
      { question: "What is the fostering process in Coventry?", answer: "Contact an agency, attend preparation training, complete the assessment, and attend panel. Most processes take 4-6 months." },
      { question: "Are Coventry agencies independent or local authority?", answer: "Coventry has both independent fostering agencies and the local authority fostering service to choose from." }
    ]
  },
  brighton: {
    h1: "Fostering Agencies in Brighton | East Sussex Foster Care",
    content: `Brighton and Hove is a vibrant coastal city with a strong and inclusive fostering community. The city's agencies are known for their progressive approach and excellent support for diverse foster families.
    
Brighton agencies offer a full spectrum of fostering placements including emergency care, short-term breaks, long-term fostering, and specialist therapeutic support. The city's coastal location and strong community networks create a supportive environment for foster families.
    
Foster carers in Brighton benefit from competitive allowances, comprehensive training programmes, and 24/7 support. The city's inclusive culture means agencies are experienced in supporting LGBTQ+ foster carers and children from all backgrounds.`,
    faqs: [
      { question: "Is Brighton inclusive for all foster carers?", answer: "Yes, Brighton agencies actively welcome carers from all backgrounds including LGBTQ+ carers and single applicants." },
      { question: "What types of fostering are available in Brighton?", answer: "Emergency, short-term, long-term, respite, therapeutic, and parent-and-child placements are all available." }
    ]
  },
  southampton: {
    h1: "Fostering Agencies in Southampton | Hampshire Foster Care",
    content: `Southampton is a major port city on the south coast with a well-established fostering community. The city's agencies provide excellent support networks and have strong partnerships with Hampshire's local authorities.
    
Southampton fostering agencies offer a wide range of placements including emergency care, short-term fostering, long-term care, and specialist placements for children with complex needs. The city's location provides easy access to both coastal and rural communities.
    
Foster carers in Southampton receive competitive allowances, comprehensive initial and ongoing training, and 24/7 support from experienced social workers. The south coast's fostering community offers regular support groups and social events.`,
    faqs: [
      { question: "What support is available for Southampton foster carers?", answer: "24/7 support, comprehensive training, respite care, and access to local support groups are all provided." },
      { question: "Do Southampton agencies offer long-term placements?", answer: "Yes, long-term fostering is available alongside emergency, short-term, and specialist placement options." }
    ]
  },
  glasgow: {
    h1: "Fostering Agencies in Glasgow | Scotland Foster Care",
    content: `Glasgow is Scotland's largest city and a major fostering centre with agencies serving communities across the central belt. Scottish fostering follows distinct legislation and offers unique support structures for foster families.
    
Glasgow agencies provide all major fostering types including emergency, short-term, long-term, kinship care, and specialist placements. Scotland's children's hearings system means foster carers in Glasgow work within a supportive legal framework focused on the child's welfare.
    
Foster carers in Glasgow benefit from competitive allowances, comprehensive training aligned with Scottish regulations, and strong peer support networks. The city's fostering community is well-connected with regular training events and social gatherings.`,
    faqs: [
      { question: "Is fostering different in Scotland?", answer: "Yes, Scotland has its own fostering legislation and the children's hearings system, supported by the Care Inspectorate." },
      { question: "What support do Glasgow foster carers receive?", answer: "Training, allowances, 24/7 support, and access to Scotland's foster carer networks are provided." }
    ]
  },
  edinburgh: {
    h1: "Fostering Agencies in Edinburgh | Scotland Foster Care",
    content: `Edinburgh, Scotland's capital city, has a well-established fostering community with agencies offering excellent support for children and foster families across the Lothians. The city combines historic charm with modern fostering services.
    
Edinburgh agencies offer a full range of fostering placements including emergency care, short-term fostering, long-term placements, and specialist therapeutic support. The city's excellent schools and transport links make it an attractive location for foster families.
    
Foster carers in Edinburgh benefit from competitive allowances, thorough training programmes aligned with Scottish standards, and 24/7 professional support. Scotland's fostering community provides strong peer networks across the central belt.`,
    faqs: [
      { question: "How do I foster in Edinburgh?", answer: "Contact an Edinburgh agency, attend an information event, complete the Scottish fostering assessment, and attend panel." },
      { question: "What is the need for foster carers in Edinburgh?", answer: "Edinburgh needs carers for all age groups, with particular demand for carers willing to take teenagers and sibling groups." }
    ]
  },
  cardiff: {
    h1: "Fostering Agencies in Cardiff | Wales Foster Care",
    content: `Cardiff, the capital of Wales, has a strong fostering community supported by both local authority and independent agencies. Welsh fostering follows its own legislation with a focus on the child's voice and cultural identity.
    
Cardiff agencies provide all major fostering types including emergency care, short-term and long-term placements, respite care, and specialist support. Wales' Welsh language and cultural considerations mean many agencies offer bilingual support for Welsh-speaking children and families.
    
Foster carers in Cardiff benefit from competitive allowances, comprehensive training aligned with Welsh regulations, and strong peer support networks. The city's fostering community is welcoming and well-supported with regular events and training.`,
    faqs: [
      { question: "Is fostering in Wales different from England?", answer: "Yes, Wales has its own fostering regulations under the Social Services and Well-being Act, with unique support frameworks." },
      { question: "Do Cardiff agencies offer Welsh language support?", answer: "Yes, many Cardiff agencies provide Welsh language support for carers and children who prefer to communicate in Welsh." }
    ]
  },
  belfast: {
    h1: "Fostering Agencies in Belfast | Northern Ireland Foster Care",
    content: `Belfast is the largest city in Northern Ireland with fostering agencies serving communities across the region. Northern Ireland has its own fostering framework under the Health and Social Care (HSC) system, offering unique support for foster families.
    
Belfast agencies provide emergency, short-term, long-term, kinship care, and specialist fostering placements. The HSC Trust system works alongside independent agencies to ensure every child finds the right foster family.
    
Foster carers in Belfast benefit from competitive allowances, comprehensive training aligned with Northern Irish regulations, and dedicated support from fostering social workers. The fostering community across Northern Ireland is close-knit with excellent peer support networks.`,
    faqs: [
      { question: "How does fostering work in Northern Ireland?", answer: "Fostering in Northern Ireland is managed through HSC Trusts and independent agencies, following regional regulations." },
      { question: "Do Belfast agencies offer specialist placements?", answer: "Yes, therapeutic, complex needs, and sibling group placements are available through Belfast agencies." }
    ]
  },
  aberdeen: {
    h1: "Fostering Agencies in Aberdeen | Scotland Foster Care",
    content: `Aberdeen is a thriving city in north-east Scotland with dedicated fostering agencies serving communities across the region. The city offers a unique blend of urban amenities and access to some of Scotland's most beautiful countryside.
    
Aberdeen agencies provide all major fostering types including emergency placements, short-term care, long-term fostering, and specialist support. The city's strong economy and excellent schools make it an attractive location for foster families.
    
Foster carers in Aberdeen benefit from competitive allowances, comprehensive training aligned with Scottish fostering standards, and 24/7 support. The north-east Scotland fostering community is well-connected with regular support groups and training events.`,
    faqs: [
      { question: "Is there a need for foster carers in Aberdeen?", answer: "Yes, Aberdeen needs foster carers for all age groups, with particular demand for emergency and short-term carers." },
      { question: "What support do Aberdeen agencies offer?", answer: "Training, competitive allowances, 24/7 support, and access to Scotland's foster carer network are provided." }
    ]
  },
  swansea: {
    h1: "Fostering Agencies in Swansea | Wales Foster Care",
    content: `Swansea is a vibrant coastal city in South Wales with a dedicated fostering community. The city's agencies work closely with Welsh local authorities to provide nurturing homes for children and young people across the region.
    
Swansea fostering agencies offer emergency, short-term, long-term, and specialist placements. The city's location on the beautiful Gower Peninsula provides foster families with a unique quality of life while maintaining access to all essential services.
    
Foster carers in Swansea benefit from competitive allowances, comprehensive training aligned with Welsh regulations, and 24/7 support from experienced social workers. The South Wales fostering community offers strong peer networks and regular support events.`,
    faqs: [
      { question: "How do I become a foster carer in Swansea?", answer: "Contact a local agency, attend an information session, and begin the assessment process. Most agencies are actively recruiting." },
      { question: "What types of fostering are available in Swansea?", answer: "Emergency, short-term, long-term, respite, and specialist placements are all available through Swansea agencies." }
    ]
  },
  // Generic content for other cities
  default: (cityName) => ({
    h1: `Fostering Agencies in ${cityName} | Find Approved Foster Care`,
    content: `${cityName} has Ofsted-registered fostering agencies ready to support your fostering journey. Whether you are considering becoming a foster carer for the first time or looking to transfer to a new agency, ${cityName} offers excellent options for every stage of your fostering career.

The fostering agencies in ${cityName} provide a wide range of placement types to suit different circumstances. Emergency fostering placements are available for children who need immediate care, often at short notice. Short-term fostering provides temporary care while plans are made for a child's long-term future, which could last from a few weeks to several months. Long-term fostering offers a stable, loving home for children who cannot return to their birth families, providing security and continuity throughout their childhood.

Many ${cityName} agencies also offer specialist fostering placements. Therapeutic fostering supports children who have experienced trauma or loss, with carers receiving additional training and support to help children heal and thrive. Parent-and-child fostering allows carers to support a parent and their baby or young child together, helping to develop parenting skills in a safe environment. Respite and short-break care gives main carers a rest while providing children with a positive short-term experience.

Foster carers in ${cityName} receive comprehensive support from their agencies. This includes thorough initial training such as the Skills to Foster preparation course, followed by ongoing professional development opportunities throughout your fostering career. Carers have a dedicated supervising social worker who provides regular visits, advice, and guidance. Most agencies offer 24/7 telephone support so you are never alone, no matter what time of day or night.

The fostering allowances in ${cityName} follow national guidelines, with weekly payments covering the child's food, clothing, pocket money, and everyday expenses. Additional allowances are provided for birthdays, holidays, and special occasions. Foster carers also receive tax relief on their allowances and may be eligible for additional payments depending on the type of placement and the child's needs.

If you are ready to take the next step, the agencies in ${cityName} are waiting to hear from you. Most offer free, no-obligation information sessions where you can learn more about fostering, ask questions, and meet current foster carers. The assessment process typically takes four to six months and includes preparation training, home visits, background checks, and a fostering panel. Your agency will guide and support you through every stage of the process to becoming an approved foster carer.`,
    faqs: [
      { question: `How do I start fostering in ${cityName}?`, answer: "Contact local agencies for an information visit or attend a free information session. They will explain the process, requirements, and what to expect." },
      { question: `What support do ${cityName} foster carers receive?`, answer: "All agencies provide Skills to Foster training, a dedicated supervising social worker, 24/7 support, competitive allowances, and access to local support groups." },
      { question: `Can I foster if I work full-time in ${cityName}?`, answer: "Many foster families work flexibly or part-time. Some placement types like emergency care may require more availability. Discuss your situation with agencies to find the right fit." },
      { question: `What fostering types are available in ${cityName}?`, answer: "Emergency, short-term, long-term, respite, therapeutic, parent-and-child, and sibling group placements are all available through agencies in the area." },
      { question: `How long does the fostering assessment take in ${cityName}?`, answer: "The assessment process typically takes 4-6 months, including training, home visits, background checks, and the fostering panel decision." }
    ]
  })
};

// Get all cities and generate content
const CITY_REGIONS = {
  london:'england', birmingham:'england', manchester:'england', leeds:'england',
  liverpool:'england', bristol:'england', sheffield:'england', newcastle:'england',
  nottingham:'england', southampton:'england', oxford:'england', cambridge:'england',
  brighton:'england', leicester:'england', coventry:'england', plymouth:'england',
  reading:'england', norwich:'england', derby:'england', hull:'england',
  portsmouth:'england', luton:'england', 'milton-keynes':'england',
  wolverhampton:'england', sunderland:'england', walsall:'england', oldham:'england',
  wigan:'england', 'stoke-on-trent':'england', warrington:'england', bradford:'england',
  york:'england', salford:'england', blackpool:'england', exeter:'england',
  colchester:'england', chelmsford:'england', maidstone:'england', kent:'england',
  glasgow:'scotland', edinburgh:'scotland', aberdeen:'scotland', dundee:'scotland',
  inverness:'scotland', stirling:'scotland', paisley:'scotland',
  cardiff:'wales', swansea:'wales', newport:'wales', wrexham:'wales', barry:'wales',
  belfast:'northern-ireland', derry:'northern-ireland', lisburn:'northern-ireland',
  newry:'northern-ireland',
};

async function generateContent() {
  console.log('Fetching cities...');
  
  const { data: cities, error } = await supabase
    .from('cities')
    .select('name, slug')
    .eq('is_active', true)
    .order('name');
  
  if (error) {
    console.error('Error fetching cities:', error);
    return;
  }
  
  console.log(`Found ${cities.length} cities`);
  
  let inserted = 0;
  let skipped = 0;
  
  for (const city of cities) {
    const cityName = city.name.trim();
    const slug = city.slug.trim();
    const region = CITY_REGIONS[slug];
    
    if (!region) {
      console.log(`Skipped ${slug}: unknown region`);
      skipped++;
      continue;
    }
    
    // Determine content based on city
    let content;
    if (cityContent[slug]) {
      content = cityContent[slug];
    } else {
      content = cityContent.default(cityName);
    }
    
    const pageSlug = `${region}/${slug}`;
    
    // Upsert to seo_pages
    const { error: upsertError } = await supabase
      .from('seo_pages')
      .upsert({
        slug: pageSlug,
        page_type: 'city',
        title: content.h1,
        h1: content.h1,
        meta_title: content.h1,
        meta_description: content.content.substring(0, 160),
        content: content.content,
        faqs: content.faqs,
        is_indexed: true,
        is_thin_content: false,
        is_optimized: true,
        word_count: content.content.split(' ').length,
        updated_at: new Date().toISOString()
      }, { onConflict: 'slug' });
    
    if (upsertError) {
      console.log(`Skipped ${slug}: ${upsertError.message}`);
      skipped++;
    } else {
      console.log(`✓ ${cityName}`);
      inserted++;
    }
  }
  
  console.log(`\nComplete! ${inserted} inserted, ${skipped} skipped`);
}

generateContent().catch(console.error);