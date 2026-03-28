import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============================================================
// PHASE 3 CONTENT GENERATOR
// Sprint 3.1: Content Scaling (100+ blog posts)
// Sprint 3.2: Neighborhood Pages (150-200 pages)
// ============================================================

interface Phase3Request {
  action: "generate-blog" | "generate-neighborhood";
  category?: string;
  template?: string;
  city?: string;
  neighborhood?: string;
  target_word_count?: number;
}

// ========================================
// BLOG TEMPLATES BY CATEGORY
// ========================================

const INFORMATIONAL_TEMPLATE = `You are writing an INFORMATIONAL DEEP DIVE blog post for Foster Connect, the UK fostering agency directory.

=== TEMPLATE: "What to Expect During Your Fostering Assessment" ===
Target: 1,800-2,200 words

H1: What to Expect During Your Fostering Assessment: Complete Guide [2026]

1. INTRODUCTION (200 words)
   - The importance of the assessment process
   - Common prospective carer concerns
   - What this guide covers

2. H2: Before Your Assessment Begins (300 words)
   - What to prepare (documents, references, DBS check)
   - How to get ready
   - Questions to have ready
   - What your home needs

3. H2: What Happens During the Assessment (400 words)
   - Initial home visit
   - Form F assessment stages
   - Working with your assessing social worker
   - Training requirements (Skills to Foster)
   - Panel preparation

4. H2: Key Areas Covered in Assessment (300 words)
   - Personal history and motivation
   - Parenting capacity assessment
   - Health and safety checks
   - Support network evaluation

5. H2: Questions Your Social Worker Will Ask (250 words)
   - About your motivations for fostering
   - About your parenting experience
   - About your support network
   - About managing challenging behaviours

6. H2: After Your Assessment (200 words)
   - What to expect at panel
   - Approval process
   - Matching and placement

7. H2: Timeline & Expectations (250 words)
   - Typical assessment timeline (4-6 months)
   - What agencies provide during this period
   - Financial considerations

8. H2: Find an Agency on Foster Connect (150 words)
   - CTA to Foster Connect
   - Benefits of using directory

9. H2: FAQs (200 words)
   - 5-6 common assessment questions`;

const PROBLEM_SOLVING_TEMPLATE = `You are writing a PROBLEM-SOLVING blog post for Foster Connect.

=== TEMPLATE: Challenging Situations in Fostering ===
Target: 1,200-1,800 words

H1: [Challenge]: Understanding, Managing & Getting Support [2026]

1. INTRODUCTION (150 words)
   - Acknowledge the challenge
   - Quick summary of how to approach it
   - When to seek additional support

2. H2: Understanding [Challenge] (250 words)
   - What causes it
   - Common signs and behaviours
   - Context and background

3. H2: Practical Strategies: What You Can Do (300 words)
   - Step-by-step approaches
   - Evidence-based techniques
   - What works and what doesn't

4. H2: When to Seek Additional Support (200 words)
   - Warning signs that more help is needed
   - Emergency situations
   - What support is available

5. H2: How Agencies Support Carers (300 words)
   - What your agency can provide
   - Specialist training available
   - Therapeutic support options
   - Respite and breaks

6. H2: Financial and Practical Support (200 words)
   - Additional allowances available
   - Equipment and resources
   - Local authority support

7. H2: Find Supportive Agencies on Foster Connect (150 words)
   - CTA to find agencies with specialist support
   - Compare agency support packages

8. H2: FAQs (150 words)
   - 5 practical questions`;

const INSURANCE_TEMPLATE = `You are writing an INSURANCE & FINANCIAL blog post for AppointPanda.

=== TEMPLATE: "Fostering Allowances: What You Need to Know" ===
Target: 1,800-2,200 words

H1: Fostering Allowances in [Region]: Complete Guide [2026]

1. INTRODUCTION (200 words)
   - Quick overview of fostering allowances
   - Why rates vary
   - How to find out your potential allowance

2. H2: How Fostering Allowances Work (300 words)
   - National minimum allowance explained
   - How IFAs vs local authorities differ
   - What's included in the allowance

3. H2: Allowance Rates by Region (400 words)
   - TABLE: Regions with typical rates
   - Age-related adjustments
   - Additional payments available

4. H2: What's Covered vs What's Extra (300 words)
   - TABLE: Covered vs. Additional costs
   - Holiday and birthday allowances
   - Equipment and bedroom costs

5. H2: Tax Implications for Foster Carers (250 words)
   - Qualifying care relief explained
   - Tax-free thresholds
   - Record-keeping requirements

6. H2: Additional Financial Support (250 words)
   - Skills-based fees
   - Retainer fees between placements
   - Travel expenses

7. H2: How to Compare Agency Allowances (200 words)
   - Using Foster Connect to compare
   - Questions to ask agencies

8. H2: Find Agencies with Competitive Allowances (150 words)
   - CTA to Foster Connect

9. H2: FAQs (150 words)
   - 5 financial questions`;

const NEIGHBORHOOD_TEMPLATE = `You are generating a NEIGHBOURHOOD/AREA landing page for Foster Connect.

=== TEMPLATE: Fostering Agencies in [Area], [City] ===
Target: 1,500-2,000 words

H1: Fostering Agencies in [Area], [City] | Local Agencies [2026]

1. INTRODUCTION (150 words)
   - Overview of fostering in [Area]
   - What makes this area unique
   - Number of agencies available

2. H2: Top Fostering Agencies in [Area] (250 words)
   - What to look for
   - Types of agencies in the area
   - CTA: View all agencies

3. H2: Why Choose an Agency in [Area]? (200 words)
   - Local support benefits
   - Community character
   - Accessibility

4. H2: Types of Fostering in [Area] (250 words)
   - Fostering types offered
   - Specialist placements
   - Emergency availability

5. H2: Fostering Allowances in [Area] (300 words)
   - ALLOWANCE TABLE: by fostering type
   - How [Area] compares to [City] average
   - Factors affecting local rates

6. H2: Assessment & Training (150 words)
   - Local training availability
   - Assessment timeline

7. H2: Nearby Areas (200 words)
   - Links to adjacent areas

8. H2: Start Your Fostering Journey in [Area] (100 words)
   - CTA to filtered search
   - Submit enquiry

9. H2: FAQs (200 words)
   - 5 area-specific questions

=== REQUIREMENTS ===
- Mention specific [Area] landmarks or character
- Reference nearby transport or community facilities
- Local allowance context
- Natural internal links
- Schema-ready FAQ format
- British English spelling`;

// AI generation function
async function generateContent(
  prompt: string,
  targetWordCount: number,
  aimlApiKey: string
): Promise<{ content: string; word_count: number }> {
  const systemPrompt = `You are an expert UK fostering content writer for Foster Connect, a leading fostering agency directory.

VOICE: Write in Foster Connect's first-party platform voice ("we", "our directory", "on Foster Connect").
STYLE: Professional yet accessible, carer-focused, factually accurate but not bureaucratic.
FORMAT: Use markdown with proper heading hierarchy (H1, H2, H3).
TABLES: Use markdown tables for allowance comparisons and structured data.
LENGTH: Target ${targetWordCount} words minimum. Be comprehensive.
E-E-A-T: Demonstrate expertise, experience, authoritativeness, trustworthiness.
CTAs: Include natural calls-to-action to Foster Connect directory throughout.
LANGUAGE: British English spelling throughout.

CRITICAL RULES:
- NO false promises or guarantees about placements
- Use allowance RANGES in £, not exact figures
- Include "speak to your agency" disclaimers where appropriate
- Format FAQs for schema markup
- Natural keyword usage (no stuffing)`;

  const response = await fetch("https://api.aimlapi.com/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${aimlApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      max_tokens: 8000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";
  const wordCount = content.split(/\s+/).filter(Boolean).length;

  return { content, word_count: wordCount };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const AIMLAPI_KEY = Deno.env.get("AIMLAPI_KEY");

    if (!AIMLAPI_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: "AIMLAPI_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Invalid authentication" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = userData.user.id;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify admin role
    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    const isAdmin = (roles ?? []).some((r: any) =>
      ["super_admin", "district_manager", "content_team", "seo_team"].includes(r.role)
    );
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: Phase3Request = await req.json();
    const { action, category, template, city, neighborhood, target_word_count = 1800 } = body;

    console.log(`Phase 3 action: ${action}`, { category, template, city, neighborhood });

    if (action === "generate-blog") {
      // Select template based on category
      let baseTemplate = INFORMATIONAL_TEMPLATE;
      if (category === "problem-solving") baseTemplate = PROBLEM_SOLVING_TEMPLATE;
      if (category === "insurance") baseTemplate = INSURANCE_TEMPLATE;

      const prompt = `${baseTemplate}

=== SPECIFIC TOPIC ===
Generate content for: "${template}"

Replace all placeholders with appropriate content for this specific topic.
Ensure the content is unique, comprehensive, and targets ${target_word_count}+ words.
Include real-world examples and actionable advice.`;

      const { content, word_count } = await generateContent(prompt, target_word_count, AIMLAPI_KEY);

      // Extract title from content
      const titleMatch = content.match(/^#\s+(.+)/m);
      const title = titleMatch ? titleMatch[1].trim() : template;

      // Create slug
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 100);

      // Save to blog_posts
      const { data: savedPost, error: saveError } = await supabaseAdmin
        .from("blog_posts")
        .insert({
          title,
          slug,
          content: { body: content },
          category,
          status: "draft",
          tags: [category, "phase-3"],
          seo_title: title,
          seo_description: content.slice(0, 160).replace(/[#*]/g, "").trim(),
        })
        .select()
        .single();

      if (saveError) {
        console.error("Save error:", saveError);
        throw new Error(`Failed to save post: ${saveError.message}`);
      }

      return new Response(
        JSON.stringify({
          success: true,
          post_id: savedPost.id,
          word_count,
          title,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "generate-neighborhood") {
      if (!city || !neighborhood) {
        return new Response(
          JSON.stringify({ success: false, error: "City and neighborhood required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get state for this city
      const { data: cityData } = await supabaseAdmin
        .from("cities")
        .select("state_id, states(name, abbreviation)")
        .eq("slug", city)
        .single();

      const stateName = (cityData?.states as any)?.name || "California";
      const stateAbbr = (cityData?.states as any)?.abbreviation || "CA";
      const cityName = city.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
      const neighborhoodName = neighborhood.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

      // Count agencies in city for context
      const { count: dentistCount } = await supabaseAdmin
        .from("clinics")
        .select("id", { count: "exact", head: true })
        .eq("city", cityName)
        .eq("is_active", true);

      const prompt = `${NEIGHBORHOOD_TEMPLATE}

=== SPECIFIC LOCATION ===
City: ${cityName}, ${stateName} (${stateAbbr})
Neighborhood: ${neighborhoodName}
Approximate agencies in city: ${dentistCount || 50}

Generate a comprehensive neighborhood page for ${neighborhoodName} in ${cityName}.
Include local context, cost estimates, and natural CTAs to AppointPanda.
Target ${target_word_count}+ words.`;

      const { content, word_count } = await generateContent(prompt, target_word_count, AIMLAPI_KEY);

      // Create slug
      const slug = `${stateAbbr.toLowerCase()}/${city}/${neighborhood}-agencies`;

      // Save to seo_pages
      const { data: savedPage, error: saveError } = await supabaseAdmin
        .from("seo_pages")
        .upsert(
          {
            slug,
            page_type: "neighborhood",
            h1: `Best Agencies in ${neighborhoodName}, ${cityName}`,
            content,
            word_count,
            is_optimized: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "slug" }
        )
        .select()
        .single();

      if (saveError) {
        console.error("Save error:", saveError);
        throw new Error(`Failed to save page: ${saveError.message}`);
      }

      return new Response(
        JSON.stringify({
          success: true,
          page_id: savedPage?.id,
          word_count,
          slug,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: "Unknown action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Phase 3 generator error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
