import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SeoPage {
  id: string;
  slug: string;
  page_type: string;
  title: string | null;
  meta_title: string | null;
  meta_description: string | null;
  h1: string | null;
  content: string | null;
}

interface Clinic {
  id: string;
  name: string;
  description: string | null;
  city: { name: string; state: { name: string; abbreviation: string } } | null;
}

async function generateContent(prompt: string, apiKey: string): Promise<string> {
  // Use AIMLAPI for Gemini API access
  const response = await fetch("https://api.aimlapi.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content: `You are an expert UK fostering SEO content writer. Write professional, informative, and engaging content that:
- Is written in a natural, human tone (not robotic or AI-sounding)
- Includes relevant fostering terminology and expertise
- Focuses on prospective carer benefits and agency support quality
- Is optimised for search engines without keyword stuffing
- Uses proper headings, paragraphs, and formatting in markdown
- Is between 400-800 words for page content
- Is between 100-200 words for agency descriptions
- Uses British English spelling throughout`
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

function generateCityTreatmentContent(treatment: string, city: string, state: string): string {
  return `## ${treatment} Fostering in ${city}, ${state}

Finding quality ${treatment.toLowerCase()} fostering agencies in ${city} doesn't have to be difficult. Foster Connect lists verified fostering agencies offering ${treatment.toLowerCase()} placements tailored to your circumstances.

### What to Expect from ${treatment} Fostering in ${city}

When you enquire with a fostering agency for ${treatment.toLowerCase()} in ${city}, ${state}, you'll receive personalised guidance from experienced social workers. The process typically begins with an initial conversation to understand your situation and discuss the fostering journey ahead.

Fostering agencies in ${city} provide comprehensive training and support to ensure foster carers feel confident and prepared. Whether you're new to fostering or experienced, local agencies are equipped to provide the highest standard of support.

### Benefits of Choosing a Local ${treatment} Agency

Working with fostering agencies in ${city} offers several advantages:

- **Local support** - Easy access to your supervising social worker
- **Community reputation** - Established agencies with Ofsted ratings and carer reviews
- **Personalised care** - Agencies who understand the local community's needs
- **Comprehensive training** - Full preparation for your fostering role

### Starting Your ${treatment} Fostering Journey

Before making an enquiry, consider what type of fostering suits your household, your availability, and any questions about the assessment process. You don't need formal qualifications - agencies look for patience, resilience, and a genuine desire to help children.

Most ${treatment.toLowerCase()} fostering agencies in ${city} offer an initial no-obligation chat to help you understand what's involved. Foster Connect makes it easy to compare agencies and submit enquiries online.`;
}

function generateCityContent(city: string, state: string, stateAbbr: string): string {
  return `## Find Fostering Agencies in ${city}, ${stateAbbr}

${city}, ${state} is home to a diverse community of fostering agencies dedicated to providing exceptional support for children and young people in care. Whether you're considering fostering for the first time or looking for a new agency, you'll find Ofsted-registered agencies ready to guide you.

### Fostering Types Available in ${city}

Local fostering agencies in ${city} offer a comprehensive range of placements including:

- **Emergency Fostering** - Short-notice placements for children who need immediate care
- **Short-term Fostering** - Temporary care while long-term plans are made
- **Long-term Fostering** - Providing a stable home for children until adulthood
- **Respite Fostering** - Giving regular foster carers a well-earned break
- **Parent and Child Fostering** - Supporting parents alongside their children

### Why Choose a ${city} Agency?

Selecting a local agency means building a long-term relationship with a support team who understands your community. ${city} fostering agencies pride themselves on:

- Comprehensive training programmes
- 24/7 support from experienced social workers
- Competitive weekly fostering allowances
- Regular supervision and peer support groups
- Accepting carers from all backgrounds

### Tips for Finding the Right Agency

When searching for a fostering agency in ${city}, consider reading carer reviews, checking Ofsted ratings, and attending an information event. Many agencies offer free, no-obligation initial chats.

Look for agencies that provide thorough training, ongoing support, and make you feel valued. A good fostering relationship is built on trust and open communication.

### Start Your Fostering Journey Today

Browse verified fostering agencies in ${city}, ${state}, compare services and reviews, and submit your enquiry online. Your fostering journey starts here.`;
}

function generateTreatmentContent(treatment: string): string {
  return `## Understanding ${treatment}: A Complete Guide

${treatment} is an important type of fostering that helps children and young people in the UK who need safe, supportive homes. Whether you're exploring this option for the first time or seeking a new agency, understanding what's involved can help you make informed decisions.

### What Is ${treatment}?

${treatment} encompasses a specific approach to foster care designed to address particular needs. Modern fostering agencies have developed comprehensive support programmes to ensure both carers and children thrive.

### Who Can Become a ${treatment} Carer?

People from all backgrounds may be eligible for ${treatment}. Common qualities agencies look for include:

- A genuine desire to help children and young people
- Patience, resilience, and empathy
- A spare bedroom and a stable home environment
- The ability to work as part of a team with social workers
- Willingness to complete training and ongoing development

### The ${treatment} Process

When you enquire about ${treatment} with a fostering agency, you can expect:

1. **Initial Conversation** - A friendly chat about your interest and circumstances
2. **Information Event** - Learning more about what ${treatment} involves
3. **Assessment (Form F)** - A thorough assessment of your suitability, typically 4-6 months
4. **Fostering Panel** - Your application is considered by an independent panel
5. **Approval & Matching** - You're matched with a child who suits your skills

### Finding the Right Agency

Choosing a qualified fostering agency for ${treatment} is crucial. Look for agencies that:

- Are registered and inspected by Ofsted (or equivalent)
- Provide comprehensive training and ongoing support
- Offer competitive fostering allowances
- Have positive reviews from existing foster carers

### Ready to Get Started?

Browse our directory of verified fostering agencies offering ${treatment} across the UK. Read reviews, compare agencies, and submit your enquiry online today.`;
}

function generateClinicDescription(name: string, city: string, state: string): string {
  return \`\${name} is a fostering agency supporting foster carers in \${city}, \${state}, and surrounding areas. The agency is committed to providing high-quality placements and comprehensive support for children and young people in care. From initial training through to ongoing supervision and 24/7 support, their experienced team helps foster carers build confidence and make a real difference. They offer competitive fostering allowances and accept enquiries from people of all backgrounds. Get in touch today to learn more about fostering with \${name}.\`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    // Use AIMLAPI for Gemini API access
    const aimlApiKey = Deno.env.get("AIMLAPI_KEY");
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, batchSize = 50, pageType } = await req.json();

    if (action === "fix_seo_pages") {
      // Get thin SEO pages - prioritize by page type if specified
      let query = supabase
        .from("seo_pages")
        .select("id, slug, page_type, title, meta_title, meta_description, h1, content")
        .or("is_thin_content.eq.true,content.is.null,content.eq.");
      
      if (pageType) {
        query = query.eq("page_type", pageType);
      }
      
      const { data: thinPages, error: pagesError } = await query.limit(batchSize);

      if (pagesError) throw pagesError;

      let fixed = 0;
      const updates: { id: string; content: string; is_thin_content: boolean; word_count: number }[] = [];

      for (const page of thinPages || []) {
        let content = "";
        
        // Parse slug to extract location/treatment info
        const slugParts = page.slug.replace(/^\/|\/$/g, "").split("/");
        
        if (page.page_type === "city_treatment" && slugParts.length >= 3) {
          const stateAbbr = slugParts[0].toUpperCase();
          const city = slugParts[1].split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
          const treatment = slugParts[2].split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
          content = generateCityTreatmentContent(treatment, city, stateAbbr);
        } else if (page.page_type === "city" && slugParts.length >= 2) {
          const stateAbbr = slugParts[0].toUpperCase();
          const city = slugParts[1].split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
          content = generateCityContent(city, stateAbbr, stateAbbr);
        } else if (page.page_type === "treatment" && slugParts.length >= 1) {
          const treatment = (page.title || slugParts[0]).split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
          content = generateTreatmentContent(treatment);
        } else if (page.page_type === "state" && slugParts.length >= 1) {
          const state = slugParts[0].toUpperCase();
          content = generateCityContent(state, state, state);
        } else if (page.page_type === "clinic") {
          const agencyName = page.title || "This fostering agency";
          content = `## About ${agencyName}\n\n${generateClinicDescription(agencyName, "your area", "")}\n\n### Our Services\n\nWe offer a comprehensive range of fostering placements including emergency, short-term, long-term, respite, and parent & child fostering. Our experienced team is dedicated to providing personalised support throughout your fostering journey.\n\n### Why Choose Us\n\n- Ofsted-registered and inspected\n- Experienced, compassionate support team\n- Comprehensive training programme\n- Competitive fostering allowances\n- 24/7 support for all foster carers`;
        } else {
          content = `## Welcome\n\nThank you for visiting Foster Connect. We're dedicated to helping you find the best fostering agencies across the UK. Browse our directory of verified agencies and submit your enquiry online today.`;
        }

        const wordCount = content.split(/\s+/).length;
        updates.push({
          id: page.id,
          content,
          is_thin_content: wordCount < 200, // Lower threshold - 200 words is acceptable
          word_count: wordCount
        });
        fixed++;
      }

      // Batch update
      for (const update of updates) {
        await supabase
          .from("seo_pages")
          .update({
            content: update.content,
            is_thin_content: update.is_thin_content,
            word_count: update.word_count,
            updated_at: new Date().toISOString()
          })
          .eq("id", update.id);
      }

      // Get remaining count
      const { count } = await supabase
        .from("seo_pages")
        .select("*", { count: "exact", head: true })
        .or("is_thin_content.eq.true,content.is.null");

      return new Response(
        JSON.stringify({ 
          success: true, 
          fixed, 
          remaining: count || 0,
          message: `Fixed ${fixed} SEO pages. ${count || 0} remaining.`
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "fix_clinic_descriptions") {
      // Get clinics without descriptions
      const { data: clinics, error: clinicsError } = await supabase
        .from("clinics")
        .select(`
          id, 
          name, 
          description,
          city:cities!clinics_city_id_fkey(
            name,
            state:states!cities_state_id_fkey(name, abbreviation)
          )
        `)
        .or("description.is.null,description.eq.")
        .limit(batchSize);

      if (clinicsError) throw clinicsError;

      let fixed = 0;

      for (const clinic of clinics || []) {
        const cityData = clinic.city as any;
        const cityName = cityData?.name || "your area";
        const stateName = cityData?.state?.name || "";
        const stateAbbr = cityData?.state?.abbreviation || "";
        
        const description = generateClinicDescription(
          clinic.name,
          cityName,
          stateAbbr || stateName
        );

        await supabase
          .from("clinics")
          .update({ 
            description,
            updated_at: new Date().toISOString()
          })
          .eq("id", clinic.id);

        fixed++;
      }

      // Get remaining count
      const { count } = await supabase
        .from("clinics")
        .select("*", { count: "exact", head: true })
        .or("description.is.null,description.eq.");

      return new Response(
        JSON.stringify({ 
          success: true, 
          fixed, 
          remaining: count || 0,
          message: `Fixed ${fixed} clinic descriptions. ${count || 0} remaining.`
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "get_stats") {
      const { count: thinSeoPages } = await supabase
        .from("seo_pages")
        .select("*", { count: "exact", head: true })
        .or("is_thin_content.eq.true,content.is.null");

      const { count: missingDescriptions } = await supabase
        .from("clinics")
        .select("*", { count: "exact", head: true })
        .or("description.is.null,description.eq.");

      return new Response(
        JSON.stringify({ 
          thinSeoPages: thinSeoPages || 0,
          missingDescriptions: missingDescriptions || 0
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
