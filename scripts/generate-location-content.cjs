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
  // Generic content for other cities
  default: (cityName, region) => ({
    h1: `Fostering Agencies in ${cityName} | Find Approved Foster Care`,
    content: `${cityName} has Ofsted-registered fostering agencies ready to support your fostering journey. ${region ? `As part of ${region}, ` : ''}${cityName} offers excellent support for foster families, with agencies providing comprehensive training, 24/7 support, and competitive allowances.

Fostering in ${cityName} provides an opportunity to make a real difference to children's lives. Agencies here work closely with local authorities and have strong connections with community services.

Whether you're interested in short-term respite care, long-term fostering, or specialist placements, ${cityName}'s agencies can guide you through the process. Most agencies offer free information sessions and home visits.`,
    faqs: [
      { question: `How do I start fostering in ${cityName}?`, answer: "Contact local agencies for an information visit. They'll explain the process and requirements." },
      { question: `What support do ${cityName} foster carers receive?`, answer: "All agencies provide training, allowances, 24/7 support, and access to support groups." },
      { question: `Can I foster if I work full-time in ${cityName}?`, answer: "Many foster families work flexibly or part-time. Discuss your situation with agencies." }
    ]
  })
};

// Get all cities and generate content
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
    
    // Determine content based on city
    let content;
    if (cityContent[slug]) {
      content = cityContent[slug];
    } else {
      content = cityContent.default(cityName, null);
    }
    
    const pageSlug = `fostering-agencies/${slug}`;
    
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