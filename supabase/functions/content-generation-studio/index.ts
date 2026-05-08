import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ==========================================
// CONTENT STUDIO - STRICT FIELD SEPARATION
// ==========================================
// This tool is ONLY allowed to write to body content fields.
// It must NEVER write to: meta_title, meta_description, og_title, og_description, faqs
// Those are managed by Meta Optimizer and FAQ Studio respectively.

const CONTENT_STUDIO_ALLOWED_FIELDS = [
  'h1', 'page_intro', 'h2_sections', 'content', 
  'internal_links_intro', 'word_count', 'is_thin_content',
  'last_content_edit_source', 'updated_at', 'is_optimized',
  'optimized_at', 'metadata_hash', 'is_duplicate', 
  'similarity_score', 'similar_to_slug', 'last_generated_at'
];

const CONTENT_STUDIO_BLOCKED_FIELDS = [
  'meta_title', 'meta_description', 'og_title', 'og_description', 'faqs'
];

function validateContentStudioWrite(fields: string[]): { valid: boolean; blockedFields: string[] } {
  const blockedFields = fields.filter(f => CONTENT_STUDIO_BLOCKED_FIELDS.includes(f));
  return { valid: blockedFields.length === 0, blockedFields };
}

interface ContentRequest {
  action: "generate_content" | "preview_content" | "apply_content" | "manual_edit" | "rollback_version";
  page_id?: string;
  slug?: string;
  version_id?: string;
  config?: {
    word_count?: number;
    rewrite_entire?: boolean;
    generate_intro?: boolean;
    generate_sections?: boolean;
    // generate_faqs REMOVED - FAQ Studio responsibility
    generate_internal_links?: boolean;
    expand_existing?: boolean;
    save_as_draft?: boolean;
    do_not_overwrite_existing?: boolean;
    rewrite_only_thin_sections?: boolean;
  };
  content?: {
    // meta_title REMOVED - Meta Optimizer responsibility
    // meta_description REMOVED - Meta Optimizer responsibility
    h1?: string;
    content?: string;
    intro_paragraph?: string;
    h2_sections?: any[];
    // faq REMOVED - FAQ Studio responsibility
    closing_paragraph?: string;
    internal_links_intro?: string;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    let AIMLAPI_KEY = Deno.env.get("AIMLAPI_KEY");
    
    // If not in env, try to get from global_settings
    if (!AIMLAPI_KEY) {
      const adminClient = createClient(supabaseUrl, supabaseServiceKey);
      const { data: settingsData } = await adminClient
        .from('global_settings')
        .select('value')
        .eq('key', 'aimlapi')
        .maybeSingle();
      
      if (settingsData?.value) {
        const settingsValue = typeof settingsData.value === 'string' 
          ? JSON.parse(settingsData.value) 
          : settingsData.value;
        AIMLAPI_KEY = settingsValue?.api_key || settingsValue?.key || settingsValue;
      }
    }

    if (!AIMLAPI_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: "AI API key not configured. Please add AIMLAPI_KEY to secrets or configure in API Control." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Debug: Check if AIMLAPI_KEY is available
    console.log("AIMLAPI_KEY available:", !!AIMLAPI_KEY);
    }

    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ success: false, error: "Authentication required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: userData, error: userError } = await userClient.auth.getUser(token);
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ success: false, error: "Invalid authentication" }), {
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

    const isAdmin = (roles ?? []).some((r) => 
      ["super_admin", "district_manager", "content_team", "seo_team"].includes(r.role)
    );
    if (!isAdmin) {
      return new Response(JSON.stringify({ success: false, error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: ContentRequest = await req.json();
    const { action, page_id, version_id, config, content } = body;
    const now = new Date().toISOString();

    // AI call helper with retries
    async function callAIWithRetry(requestBody: object, maxRetries = 4): Promise<Response> {
      let lastError: Error | null = null;
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        if (attempt > 0) {
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(r => setTimeout(r, delay));
          console.log(`content-generation-studio: Retry attempt ${attempt + 1}/${maxRetries}`);
        }
        
        try {
          const response = await fetch("https://api.aimlapi.com/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${AIMLAPI_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
          });

          if (response.ok) return response;
          
          if (response.status >= 500 || response.status === 429) {
            lastError = new Error(`AI gateway returned ${response.status}`);
            continue;
          }
          
          return response;
        } catch (networkError) {
          lastError = networkError instanceof Error ? networkError : new Error(String(networkError));
        }
      }
      throw lastError || new Error("AI gateway failed after retries");
    }

    // Master system prompt for Foster Care content (non-agency pages)
    const PLATFORM_SYSTEM_PROMPT = `You are generating SEO content ONLY for Foster Care, a UK fostering agency directory and enquiry platform.

=== CRITICAL BUSINESS CONTEXT ===
- Foster Care helps people find, compare, and enquire with fostering agencies across the UK
- We are NOT a fostering agency - we are a directory/enquiry platform
- ALL content must be written in Foster Care's first-party voice: "we", "our platform", "Foster Care helps prospective carers..."

You must NEVER write as:
- a fostering agency
- a guest author or third-party blog
- Never claim to provide fostering placements directly

=== CONTENT QUALITY STANDARDS ===
- Simple, human, friendly language
- Non-academic, conversational tone
- No keyword stuffing - natural usage only
- Written for prospective foster carers and those exploring fostering
- Clear, helpful, trustworthy
- No exaggerated claims or fake statistics

=== STRUCTURE RULES ===
- Exactly ONE H1 per page
- 4-6 H2 sections with meaningful headings
- H3 only when logically belonging under an H2
- No bullet spam, no filler text
- 3-5 contextual FAQs at bottom

=== UNIQUENESS REQUIREMENT (CRITICAL) ===
- Each page MUST be completely unique - this is non-negotiable
- NEVER reuse paragraphs, sentence structures, or phrasing patterns
- Start each section with a different approach (question, statement, scenario, statistic)
- Vary sentence lengths dramatically (some short, some complex)
- Use location-specific or context-specific details unique to this page
- Even similar pages (e.g., two city pages) must read completely differently
- Rotate opening styles: "When you're considering...", "Finding...", "Located in...", "Prospective carers seeking...", etc.
- Add unique local context: boroughs, landmarks, demographics, local authority areas
- Include varied examples and scenarios specific to the location/service

=== SEO COMPLIANCE ===
- Meta title under 60 characters, keyword near beginning
- Meta description under 155 characters with clear CTA
- Google E-E-A-T compliance
- No AI footprints or repetitive patterns

=== UK-SPECIFIC CONTEXT ===
- All content must be UK-focused (England, Scotland, Wales, Northern Ireland)
- Reference Ofsted (England), Care Inspectorate (Scotland), CIW (Wales), RQIA (NI)
- Use British English spelling throughout
- Currency in GBP (£) where applicable
- Reference UK fostering allowances, not salaries

=== CALL TO ACTION ===
End with calm, helpful CTA encouraging users to:
- Explore fostering agencies on Foster Care
- Submit enquiries through our platform`;

    // AGENCY-SPECIFIC system prompt - focuses on the agency itself for branded SEO
    const CLINIC_SYSTEM_PROMPT = `You are generating SEO content for a FOSTERING AGENCY profile page on Foster Care.

=== CRITICAL BUSINESS CONTEXT ===
- This content is for the agency's profile page to help it RANK for the agency name
- Write as a neutral, informative third-party describing THIS agency
- DO NOT mention "Foster Care", "our platform", or any directory references
- Focus 100% on the AGENCY: its services, location, team, carer support
- Goal: When someone searches the agency name on Google, this page should rank

=== VOICE & TONE ===
- Write ABOUT the agency, not FOR the agency (neutral third-party perspective)
- Use the agency name naturally throughout the content
- "This agency offers...", "[Agency Name] provides...", "Foster carers with [Agency Name] can expect..."
- DO NOT use "we", "our" (that would imply you ARE the agency)
- DO NOT use "they" excessively - use the agency name for SEO

=== CONTENT QUALITY STANDARDS ===
- Simple, human, friendly language
- Professional but approachable tone
- No keyword stuffing - natural agency name usage
- Written for people researching this specific agency
- Helpful, informative, trustworthy
- No exaggerated claims or fake testimonials

=== STRUCTURE RULES ===
- Exactly ONE H1 (should include agency name)
- 4-6 H2 sections covering: About, Fostering Types, Location, Carer Support, etc.
- H3 only when logically belonging under an H2
- No bullet spam, no filler text
- 3-5 FAQs specific to this agency

=== UNIQUENESS REQUIREMENT ===
- Each agency page must be completely unique
- NEVER reuse generic fostering content across agencies
- Personalise based on agency name, location, and any known details
- Even similar agencies must read differently

=== SEO COMPLIANCE (BRANDED SEARCH) ===
- Meta title: "[Agency Name] | Fostering Agency in [City]" (under 60 chars)
- Meta description: Unique description mentioning agency name (under 155 chars)
- Include agency name naturally 3-5 times in content
- Location references (city, county, region) for local SEO
- Google E-E-A-T compliance

=== WHAT TO INCLUDE ===
- Agency overview and what makes it notable
- Types of fostering offered (emergency, respite, long-term, therapeutic, parent & child)
- Location and areas covered
- What foster carers can expect (training, support, allowances)
- FAQs about the agency specifically

=== WHAT TO AVOID ===
- Do NOT invent specific facts (founding year, staff names, awards)
- Do NOT make up carer testimonials
- Do NOT claim specific Ofsted ratings unless provided
- Do NOT mention Foster Care or any directory platform`;

    // Generate unique anti-duplication seed based on slug and random factors
    function generateUniquenessSeed(slug: string, pageType: string): string {
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 8);
      
      // Opening style variations
      const openingStyles = [
        "Start with a compelling question that addresses the reader's immediate concern about fostering.",
        "Open with a local statistic or fact about fostering in this specific area.",
        "Begin with a prospective carer scenario that resonates with local residents.",
        "Start by describing what makes fostering in this location/through this agency unique.",
        "Open with a brief context about the need for foster carers in this area.",
        "Begin with a direct statement addressing the primary motivation for fostering.",
        "Start with a comparison or contrast that highlights key differences between agencies.",
        "Open with an engaging story about the impact fostering has on communities."
      ];
      
      // Structure variations
      const structureStyles = [
        "Use a problem-solution framework throughout.",
        "Organise around the fostering journey stages (enquiry, assessment, approval, placement).",
        "Structure as a comprehensive guide with numbered steps.",
        "Use a Q&A conversational format within sections.",
        "Organise by carer type (single carers, couples, families, retirees).",
        "Structure around common concerns and how fostering agencies address them.",
        "Use a comparison framework highlighting different fostering types.",
        "Organise chronologically from initial interest to ongoing support."
      ];
      
      const selectedOpening = openingStyles[timestamp % openingStyles.length];
      const selectedStructure = structureStyles[(timestamp + 3) % structureStyles.length];
      
      return `
=== UNIQUENESS DIRECTIVE (ID: ${randomId}) ===
This content MUST be completely different from all other pages. Use these specific instructions:

OPENING STYLE: ${selectedOpening}
STRUCTURE APPROACH: ${selectedStructure}
UNIQUE IDENTIFIER: ${slug.toUpperCase()}-${randomId}

MANDATORY DIFFERENTIATION:
- Do NOT use generic fostering industry phrases
- Include specific local context (borough references, regional characteristics)
- Use varied sentence structures (mix short punchy sentences with longer explanatory ones)
- Include at least 3 unique examples or scenarios not used elsewhere
- Vary paragraph lengths dramatically (some 2-3 sentences, some 5-6)
- Use different transitional phrases than typical SEO content
`;
    }

    // Generate content for a page
    async function generateContent(pageData: any, wordCount: number, clinicData?: any) {
      const { page_type, slug, title, content: existingContent } = pageData;
      
      // Determine if this is a clinic page (uses different voice/strategy)
      const isClinicPage = page_type === "clinic" || page_type === "dentist";
      
      // Generate uniqueness seed
      const uniquenessSeed = generateUniquenessSeed(slug, page_type);
      
      // Build context based on page type
      let pageContext = "";
      const parts = slug.split("/").filter(Boolean);
      
      switch (page_type) {
        case "state":
          const stateName = title || parts[0]?.replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()) || "this region";
          pageContext = `This is a REGION/COUNTRY directory page for ${stateName} (UK).
Context: Show all fostering agencies in ${stateName}. Explain how Foster Care helps prospective carers find agencies across the region.
Include: Overview of fostering landscape, how to find an agency, what Foster Care offers, types of fostering available, Ofsted/regulatory context.`;
          break;
          
        case "city":
          const cityName = title || parts[1] || parts[0] || "this city";
          const regionName = parts[0]?.replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()) || "";
          pageContext = `This is a CITY/AREA directory page for ${cityName}, ${regionName} (UK).
Context: Show fostering agencies in ${cityName}. Explain how Foster Care helps local residents explore fostering.
Include: Local fostering landscape overview, finding the right agency, types of fostering available, support and allowances.
LOCAL SPECIFICITY: Mention specific aspects of ${cityName} - its boroughs, community character, local authority, or regional fostering needs.`;
          break;
          
        case "treatment":
        case "service":
          const serviceName = title || slug.replace(/-/g, " ");
          pageContext = `This is a FOSTERING TYPE page for ${serviceName}.
Context: Explain what ${serviceName} fostering is, who it's for, what to expect.
Include: What is this type of fostering, who can apply, the process, support available, how Foster Care helps find agencies offering it.`;
          break;
          
        case "service_location":
        case "city_treatment":
          const fosteringType = title || parts[parts.length - 1]?.replace(/-/g, " ") || "fostering";
          const locationCity = parts[1]?.replace(/-/g, " ") || "this city";
          const locationRegion = parts[0]?.replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()) || "";
          pageContext = `This is a FOSTERING TYPE + LOCATION page for ${fosteringType} in ${locationCity}, ${locationRegion} (UK).
Context: Explain ${fosteringType} and how to find agencies offering it in ${locationCity}.
Include: What is ${fosteringType}, local availability, allowances in this area, how to choose an agency, Foster Care's role.
IMPORTANT: Make this unique - combine local ${locationCity} context with ${fosteringType} specifics. Don't just merge generic content.`;
          break;
          
        case "clinic":
        case "dentist":
          // For agency pages, extract agency name and location for branded SEO
          const agencyName = clinicData?.name || title || "this fostering agency";
          const agencyCity = clinicData?.city || "";
          const agencyRegion = clinicData?.state || "";
          const agencyAddress = clinicData?.address || "";
          const agencyServices = clinicData?.services?.join(", ") || "various fostering types";
          
          pageContext = `This is an AGENCY PROFILE page for: ${agencyName}
${agencyCity ? `Location: ${agencyCity}${agencyRegion ? `, ${agencyRegion}` : ""}` : ""}
${agencyAddress ? `Address: ${agencyAddress}` : ""}
${agencyServices ? `Fostering types: ${agencyServices}` : ""}

GOAL: Help this page RANK when someone searches for "${agencyName}" on Google.

Content Focus:
- Use "${agencyName}" naturally 3-5 times throughout the content
- Write ABOUT the agency from a neutral third-party perspective
- Include: About ${agencyName}, Fostering types offered, Location & areas covered, Carer experience, FAQs about ${agencyName}
- DO NOT invent specific facts (founding year, staff names, awards, carer counts)
- DO NOT create fake testimonials
- Focus on what people searching for this agency would want to know`;
          break;
          
        case "static":
          pageContext = `This is a STATIC page (About, Features, Policy, etc.) on Foster Care.
Context: Write informative content appropriate for the page's purpose.
Include: Clear explanation of the topic, how it relates to Foster Care, user benefits.`;
          break;
          
        default:
          pageContext = `This is a general page on Foster Care.
Context: Write helpful, informative content for prospective foster carers in the UK.
Include: Clear explanations, how Foster Care helps, relevant information for the topic.`;
      }

      // Select the appropriate system prompt
      const systemPrompt = isClinicPage ? CLINIC_SYSTEM_PROMPT : PLATFORM_SYSTEM_PROMPT;
      
      // Build user prompt - include uniqueness seed for differentiation
      const userPrompt = isClinicPage 
        ? `Generate SEO-optimized content for this CLINIC profile page:

PAGE URL: /${slug}
PAGE TYPE: ${page_type}
TARGET WORD COUNT: ${wordCount} words

${pageContext}

${existingContent ? `EXISTING CONTENT (for reference, improve upon it):
${existingContent.slice(0, 500)}...` : "No existing content - create from scratch."}

${uniquenessSeed}

Generate comprehensive, unique content that helps this clinic rank for its name. Remember: NO Foster Care mentions, write about the clinic only.`
        : `Generate SEO-optimized content for this page:

PAGE URL: /${slug}
PAGE TYPE: ${page_type}
TARGET WORD COUNT: ${wordCount} words

${pageContext}

${existingContent ? `EXISTING CONTENT (for reference, but write COMPLETELY NEW unique content):
${existingContent.slice(0, 500)}...` : "No existing content - create from scratch."}

${uniquenessSeed}

CRITICAL: This content MUST be 100% unique. Do not reuse any phrases, structures, or patterns from other pages. Generate fresh, original content following the uniqueness directive above.`;

      const requestBody = {
        model: "gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        // STRICT TOOL SEPARATION: Content Studio does NOT generate meta_title, meta_description, or FAQs
        // Those are handled by Meta Optimizer and FAQ Studio respectively
        tools: [
          {
            type: "function",
            function: {
              name: "generate_page_content",
              description: isClinicPage 
                ? "Generate BODY CONTENT ONLY for a fostering agency profile page (no meta tags, no FAQs)" 
                : "Generate BODY CONTENT ONLY for SEO page (no meta tags, no FAQs - those are handled separately)",
              parameters: {
                type: "object",
                properties: {
                  // meta_title REMOVED - Meta Optimizer responsibility
                  // meta_description REMOVED - Meta Optimizer responsibility
                  h1: { type: "string", description: isClinicPage ? "Main H1 with clinic name" : "Main H1 heading" },
                  intro_paragraph: { type: "string", description: "Opening paragraph 50-100 words" },
                  h2_sections: {
                    type: "array",
                    description: "4-6 H2 sections covering the page topic comprehensively",
                    items: {
                      type: "object",
                      properties: {
                        heading: { type: "string", description: "H2 section heading" },
                        content: { type: "string", description: "Section content 80-150 words" },
                        h3_subsections: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              heading: { type: "string" },
                              content: { type: "string" }
                            }
                          }
                        }
                      }
                    }
                  },
                  // faq REMOVED - FAQ Studio responsibility (strict separation)
                  closing_paragraph: { type: "string", description: isClinicPage ? "Closing paragraph (no CTA to external platforms)" : "Closing with CTA" },
                  internal_links_intro: { type: "string", description: "Optional bridge sentence before internal links section" }
                },
                required: ["h1", "intro_paragraph", "h2_sections", "closing_paragraph"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_page_content" } }
      };
      const response = await callAIWithRetry(requestBody);

      if (!response.ok) {
        if (response.status === 429) throw new Error("Rate limit exceeded. Please wait and try again.");
        if (response.status === 402) throw new Error("AI credits exhausted. Please add credits.");
        throw new Error(`AI service error (${response.status})`);
      }

      const aiJson = await response.json();
      
      // Extract from tool call
      if (aiJson.choices?.[0]?.message?.tool_calls?.[0]) {
        const toolCall = aiJson.choices[0].message.tool_calls[0];
        if (toolCall.function?.arguments) {
          try {
            return JSON.parse(toolCall.function.arguments);
          } catch (e) {
            console.error("Failed to parse tool arguments:", e);
          }
        }
      }
      
      // Fallback: try parsing content
      const content = aiJson.choices?.[0]?.message?.content;
      if (content) {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }

      throw new Error("Failed to generate content");
    }

    // Build full content markdown from generated sections
    // NOTE: FAQs are NOT included here - they are managed separately by FAQ Studio
    function buildContentMarkdown(generated: any): string {
      let markdown = "";
      
      if (generated.intro_paragraph) {
        markdown += generated.intro_paragraph + "\n\n";
      }
      
      if (generated.h2_sections && Array.isArray(generated.h2_sections)) {
        for (const section of generated.h2_sections) {
          markdown += `## ${section.heading}\n\n${section.content}\n\n`;
          
          if (section.h3_subsections && Array.isArray(section.h3_subsections)) {
            for (const subsection of section.h3_subsections) {
              markdown += `### ${subsection.heading}\n\n${subsection.content}\n\n`;
            }
          }
        }
      }
      
      // FAQs REMOVED - FAQ Studio is responsible for FAQs (strict tool separation)
      // The FAQ section will be rendered from the dedicated `faqs` JSONB column
      
      if (generated.closing_paragraph) {
        markdown += generated.closing_paragraph + "\n";
      }
      
      // Add internal links intro if provided
      if (generated.internal_links_intro) {
        markdown += "\n" + generated.internal_links_intro + "\n";
      }
      
      return markdown;
    }

    // Count words in content
    function countWords(text: string): number {
      if (!text) return 0;
      return text.split(/\s+/).filter(Boolean).length;
    }

    // Simple hash for content fingerprinting
    function hashContent(content: string): string {
      let hash = 0;
      const normalized = content.toLowerCase().replace(/\s+/g, ' ').trim();
      for (let i = 0; i < normalized.length; i++) {
        const char = normalized.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return hash.toString(16);
    }

    // Check content uniqueness against existing pages - ENHANCED with stricter checks
    async function checkContentUniqueness(content: string, pageId: string, pageType: string): Promise<{
      isUnique: boolean;
      similarity: number;
      similarSlug: string | null;
    }> {
      // Get more candidates for comparison (100 instead of 50)
      const { data: candidates } = await supabaseAdmin
        .from('seo_pages')
        .select('id, slug, content')
        .eq('page_type', pageType)
        .neq('id', pageId)
        .not('content', 'is', null)
        .limit(100);
      
      let maxSimilarity = 0;
      let similarSlug: string | null = null;
      
      // Normalize content for comparison
      const normalizeText = (text: string) => text.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 3);
      
      const words1 = new Set(normalizeText(content));
      
      // Also check opening sentences (first 100 words) for intro uniqueness
      const intro1 = normalizeText(content.slice(0, 500));
      
      for (const candidate of candidates || []) {
        if (!candidate.content) continue;
        
        const words2 = new Set(normalizeText(candidate.content));
        const intro2 = normalizeText(candidate.content.slice(0, 500));
        
        if (words1.size === 0 || words2.size === 0) continue;
        
        // Calculate word overlap similarity
        let shared = 0;
        for (const word of words1) {
          if (words2.has(word)) shared++;
        }
        const wordSimilarity = shared / Math.max(words1.size, words2.size);
        
        // Calculate intro overlap (stricter check for opening)
        let introShared = 0;
        const introSet1 = new Set(intro1);
        for (const word of intro2) {
          if (introSet1.has(word)) introShared++;
        }
        const introSimilarity = intro2.length > 0 ? introShared / Math.max(intro1.length, intro2.length) : 0;
        
        // Combined similarity (weight intro more heavily as it's often most duplicated)
        const combinedSimilarity = (wordSimilarity * 0.6) + (introSimilarity * 0.4);
        
        if (combinedSimilarity > maxSimilarity) {
          maxSimilarity = combinedSimilarity;
          similarSlug = candidate.slug;
        }
      }
      
      // Stricter threshold: 70% instead of 80%
      return {
        isUnique: maxSimilarity < 0.70,
        similarity: maxSimilarity,
        similarSlug
      };
    }

    // Save content version for rollback
    async function saveContentVersion(pageId: string, contentData: any, source: string, reason: string) {
      // Get current max version
      const { data: versions } = await supabaseAdmin
        .from("seo_content_versions")
        .select("version_number")
        .eq("seo_page_id", pageId)
        .order("version_number", { ascending: false })
        .limit(1);
      
      const nextVersion = (versions?.[0]?.version_number || 0) + 1;
      
      // Mark existing versions as not current
      await supabaseAdmin
        .from("seo_content_versions")
        .update({ is_current: false })
        .eq("seo_page_id", pageId);
      
      // Insert new version
      await supabaseAdmin.from("seo_content_versions").insert({
        seo_page_id: pageId,
        version_number: nextVersion,
        meta_title: contentData.meta_title,
        meta_description: contentData.meta_description,
        h1: contentData.h1,
        content: contentData.content,
        word_count: countWords(contentData.content),
        seo_score: contentData.seo_score,
        faq: contentData.faq,
        internal_links: contentData.internal_links,
        change_source: source,
        change_reason: reason,
        changed_by: userId,
        is_current: true,
      });
    }

    // Handle actions
    switch (action) {
      case "generate_content":
      case "preview_content": {
        // Support both page_id and slug for lookup
        let page = null;
        let pageError = null;
        
        if (page_id) {
          const { data, error } = await supabaseAdmin
            .from("seo_pages")
            .select("*")
            .eq("id", page_id)
            .single();
          page = data;
          pageError = error;
        } else if (body.slug) {
          const { data, error } = await supabaseAdmin
            .from("seo_pages")
            .select("*")
            .eq("slug", body.slug)
            .single();
          page = data;
          pageError = error;
        } else {
          return new Response(JSON.stringify({ error: "page_id or slug required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        if (pageError || !page) {
          return new Response(JSON.stringify({ error: "Page not found", debug: { page_id, slug: body.slug, error: pageError } }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Use page.id for updates (works whether looked up by page_id or slug)
        const pageIdForUpdate = page.id;
        const wordCount = config?.word_count || 800;
        
        // For clinic pages, fetch additional clinic data for better content
        let clinicData = null;
        if (page.page_type === "clinic" || page.page_type === "dentist") {
          // Try to extract clinic ID from slug (e.g., /clinic/clinic-slug)
          const slugParts = page.slug.split("/").filter(Boolean);
          const clinicSlug = slugParts[slugParts.length - 1];
          
          // Fetch clinic data for richer content
          const { data: clinic } = await supabaseAdmin
            .from("clinics")
            .select("id, name, city, state, address, services, description")
            .eq("slug", clinicSlug)
            .single();
          
          if (clinic) {
            clinicData = {
              name: clinic.name,
              city: clinic.city,
              state: clinic.state,
              address: clinic.address,
              services: clinic.services || [],
              description: clinic.description,
            };
          }
        }
        
        const generated = await generateContent(page, wordCount, clinicData);
        
        // Build full content
        const fullContent = buildContentMarkdown(generated);
        const actualWordCount = countWords(fullContent);

        // For preview, just return the generated content
        if (action === "preview_content") {
          return new Response(JSON.stringify({
            ...generated,
            content: fullContent,
            word_count: actualWordCount,
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // For generate_content, save it
        if (!config?.save_as_draft) {
          // Save version for rollback
          await saveContentVersion(pageIdForUpdate, {
            meta_title: page.meta_title,
            meta_description: page.meta_description,
            h1: page.h1,
            content: page.content,
            faq: null,
          }, "ai_backup", "Auto-backup before AI generation");

          // Check uniqueness before saving
          const uniquenessResult = await checkContentUniqueness(fullContent, pageIdForUpdate, page.page_type);
          
          // Update the page with uniqueness info
          // STRICT SEPARATION: Content Studio does NOT write to meta_title, meta_description, or faqs
          const contentHash = hashContent(fullContent);
          
          // Build update object - ONLY body content fields
          const updateData: Record<string, any> = {
            // meta_title REMOVED - Meta Optimizer responsibility
            // meta_description REMOVED - Meta Optimizer responsibility
            h1: generated.h1,
            page_intro: generated.intro_paragraph || null,
            h2_sections: generated.h2_sections || null,
            internal_links_intro: generated.internal_links_intro || null,
            content: fullContent,
            word_count: actualWordCount,
            // Content status thresholds:
            // - No content: < 400 words
            // - Thin content: 400-799 words  
            // - Has content: 800-1299 words
            // - Optimal: 1300+ words (target)
            is_thin_content: actualWordCount >= 400 && actualWordCount < 800,
            is_optimized: true,
            optimized_at: now,
            updated_at: now,
            metadata_hash: contentHash,
            is_duplicate: !uniquenessResult.isUnique,
            similarity_score: uniquenessResult.similarity,
            similar_to_slug: uniquenessResult.similarSlug,
            last_generated_at: now,
            last_content_edit_source: 'content_studio',
          };
          
          // Validate we're not writing to blocked fields
          const validation = validateContentStudioWrite(Object.keys(updateData));
          if (!validation.valid) {
            console.error(`Content Studio attempted to write to blocked fields: ${validation.blockedFields.join(', ')}`);
            // Remove blocked fields from update
            for (const blocked of validation.blockedFields) {
              delete updateData[blocked];
            }
          }
          
          const { error: updateError } = await supabaseAdmin
            .from("seo_pages")
            .update(updateData)
            .eq("id", pageIdForUpdate);

          if (updateError) {
            console.error("Update error:", updateError);
            return new Response(JSON.stringify({ error: "Failed to save content" }), {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }

          // Audit log for content generation
          await supabaseAdmin.from("audit_logs").insert({
            user_id: userId,
            action: "generate_content",
            entity_type: "seo_page",
            entity_id: pageIdForUpdate,
            new_values: { word_count: actualWordCount, h1: generated.h1, is_unique: !page.is_duplicate },
          });

          // Save new version - ONLY body content fields (no meta, no faqs)
          await saveContentVersion(pageIdForUpdate, {
            h1: generated.h1,
            content: fullContent,
            seo_score: generated.seo_score,
          }, "content_studio", `Generated ${actualWordCount} words (body content only)`);
        }

        return new Response(JSON.stringify({
          success: true,
          ...generated,
          content: fullContent,
          word_count: actualWordCount,
          is_unique: !page.is_duplicate,
          similarity_score: page.similarity_score || 0,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "apply_content": {
        if (!page_id || !content) {
          return new Response(JSON.stringify({ error: "page_id and content required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Get current page for backup
        const { data: currentPage } = await supabaseAdmin
          .from("seo_pages")
          .select("*")
          .eq("id", page_id)
          .single();

        if (currentPage) {
          await saveContentVersion(page_id, {
            meta_title: currentPage.meta_title,
            meta_description: currentPage.meta_description,
            h1: currentPage.h1,
            content: currentPage.content,
          }, "ai_backup", "Auto-backup before applying preview");
        }

        // Build content if we have sections
        let fullContent = content.content || "";
        if (content.intro_paragraph || content.h2_sections) {
          fullContent = buildContentMarkdown(content);
        }
        const wordCount = countWords(fullContent);

        // Update page - STRICT SEPARATION: only body content fields
        const applyData: Record<string, any> = {
          h1: content.h1,
          content: fullContent,
          page_intro: content.intro_paragraph || null,
          h2_sections: content.h2_sections || null,
          internal_links_intro: content.internal_links_intro || null,
          word_count: wordCount,
          is_thin_content: wordCount < 800,
          is_optimized: true,
          optimized_at: now,
          updated_at: now,
          last_content_edit_source: 'content_studio',
        };
        
        // Validate strict separation
        const applyValidation = validateContentStudioWrite(Object.keys(applyData));
        if (!applyValidation.valid) {
          for (const blocked of applyValidation.blockedFields) delete applyData[blocked];
        }

        const { error: updateError } = await supabaseAdmin
          .from("seo_pages")
          .update(applyData)
          .eq("id", page_id);

        if (updateError) {
          return new Response(JSON.stringify({ error: "Failed to apply content" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Audit log
        await supabaseAdmin.from("audit_logs").insert({
          user_id: userId,
          action: "apply_content",
          entity_type: "seo_page",
          entity_id: page_id,
          new_values: { word_count: wordCount, h1: content.h1 },
        });

        // Save new version - body content only
        await saveContentVersion(page_id, {
          h1: content.h1,
          content: fullContent,
        }, "ai_applied", "Content applied from preview");

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "manual_edit": {
        if (!page_id || !content) {
          return new Response(JSON.stringify({ error: "page_id and content required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Get current page for backup
        const { data: currentPage } = await supabaseAdmin
          .from("seo_pages")
          .select("*")
          .eq("id", page_id)
          .single();

        if (currentPage) {
          await saveContentVersion(page_id, {
            meta_title: currentPage.meta_title,
            meta_description: currentPage.meta_description,
            h1: currentPage.h1,
            content: currentPage.content,
          }, "manual_backup", "Auto-backup before manual edit");
        }

        const wordCount = countWords(content.content || "");

        // Update page - manual edits can include meta since it's explicit admin action
        const manualData: Record<string, any> = {
          h1: content.h1,
          content: content.content,
          word_count: wordCount,
          is_thin_content: wordCount < 800,
          updated_at: now,
          last_content_edit_source: 'manual',
        };

        const { error: updateError } = await supabaseAdmin
          .from("seo_pages")
          .update(manualData)
          .eq("id", page_id);

        if (updateError) {
          return new Response(JSON.stringify({ error: "Failed to save edits" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Audit log
        await supabaseAdmin.from("audit_logs").insert({
          user_id: userId,
          action: "manual_edit",
          entity_type: "seo_page",
          entity_id: page_id,
          new_values: { word_count: wordCount, h1: content.h1 },
        });

        // Save new version
        await saveContentVersion(page_id, {
          h1: content.h1,
          content: content.content,
        }, "manual_edit", "Manual edit by admin");

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "rollback_version": {
        if (!page_id || !version_id) {
          return new Response(JSON.stringify({ error: "page_id and version_id required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Get the version to restore
        const { data: version, error: versionError } = await supabaseAdmin
          .from("seo_content_versions")
          .select("*")
          .eq("id", version_id)
          .single();

        if (versionError || !version) {
          return new Response(JSON.stringify({ error: "Version not found" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Get current page for backup
        const { data: currentPage } = await supabaseAdmin
          .from("seo_pages")
          .select("*")
          .eq("id", page_id)
          .single();

        if (currentPage) {
          await saveContentVersion(page_id, {
            meta_title: currentPage.meta_title,
            meta_description: currentPage.meta_description,
            h1: currentPage.h1,
            content: currentPage.content,
          }, "rollback_backup", `Backup before rollback to v${version.version_number}`);
        }

        // Update page with version content
        const { error: updateError } = await supabaseAdmin
          .from("seo_pages")
          .update({
            meta_title: version.meta_title,
            meta_description: version.meta_description,
            h1: version.h1,
            content: version.content,
            word_count: version.word_count,
            is_thin_content: (version.word_count || 0) < 800,
            updated_at: now,
          })
          .eq("id", page_id);

        if (updateError) {
          return new Response(JSON.stringify({ error: "Failed to rollback" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Mark all versions as not current
        await supabaseAdmin
          .from("seo_content_versions")
          .update({ is_current: false })
          .eq("seo_page_id", page_id);

        // Mark restored version as current
        await supabaseAdmin
          .from("seo_content_versions")
          .update({ is_current: true })
          .eq("id", version_id);

        // Audit log for rollback
        await supabaseAdmin.from("audit_logs").insert({
          user_id: userId,
          action: "rollback_content",
          entity_type: "seo_page",
          entity_id: page_id,
          new_values: { restored_version: version.version_number },
        });

        return new Response(JSON.stringify({ success: true, restored_version: version.version_number }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

  } catch (error) {
    console.error("content-generation-studio error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Internal server error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
