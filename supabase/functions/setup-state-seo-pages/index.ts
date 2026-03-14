import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SetupRequest {
  state_id?: string;
  action?: "setup_state" | "setup_all";
}

// Static pages to create
const STATIC_PAGES = [
  { slug: "/", page_type: "static", title: "Foster Connect – UK Fostering Agency Directory", h1: "Find Trusted Fostering Agencies Near You", meta_title: "Foster Connect | UK Fostering Agency Directory", meta_description: "Compare Ofsted-rated fostering agencies across the UK. Read carer reviews, check ratings, and start your fostering journey with Foster Connect." },
  { slug: "about", page_type: "static", title: "About Foster Connect", h1: "About Foster Connect", meta_title: "About Us | Foster Connect", meta_description: "Learn about Foster Connect's mission to help prospective foster carers find the right agency across England, Scotland, Wales, and Northern Ireland." },
  { slug: "contact", page_type: "static", title: "Contact Foster Connect", h1: "Contact Us", meta_title: "Contact Us | Foster Connect", meta_description: "Get in touch with the Foster Connect team. We're here to help you find the right fostering agency." },
  { slug: "faq", page_type: "static", title: "Frequently Asked Questions", h1: "Fostering FAQ", meta_title: "Fostering FAQ | Foster Connect", meta_description: "Answers to common questions about fostering in the UK, from eligibility to allowances and the assessment process." },
  { slug: "how-it-works", page_type: "static", title: "How Foster Connect Works", h1: "How It Works", meta_title: "How It Works | Foster Connect", meta_description: "Discover how Foster Connect helps you compare fostering agencies, read reviews, and start your fostering journey." },
  { slug: "blog", page_type: "blog", title: "Fostering Blog", h1: "Foster Connect Blog", meta_title: "Fostering Blog | Foster Connect", meta_description: "Expert articles, carer stories, and guidance on fostering in the UK." },
  { slug: "privacy", page_type: "static", title: "Privacy Policy", h1: "Privacy Policy", meta_title: "Privacy Policy | Foster Connect", meta_description: "Foster Connect privacy policy – how we handle your data." },
  { slug: "terms", page_type: "static", title: "Terms of Service", h1: "Terms of Service", meta_title: "Terms of Service | Foster Connect", meta_description: "Foster Connect terms of service for users and agencies." },
  { slug: "pricing", page_type: "static", title: "Pricing for Agencies", h1: "Agency Pricing Plans", meta_title: "Pricing | Foster Connect", meta_description: "View Foster Connect pricing plans for fostering agencies looking to increase visibility and attract carers." },
  { slug: "services", page_type: "static", title: "Fostering Services", h1: "Fostering Services & Types", meta_title: "Fostering Types & Services | Foster Connect", meta_description: "Explore different types of fostering including emergency, respite, therapeutic, long-term, and short-term fostering across the UK." },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body: SetupRequest = await req.json();
    const action = body.action || "setup_state";

    if (action === "setup_all") {
      return await setupAll(supabaseAdmin);
    }

    // Original state setup
    const { state_id } = body;
    if (!state_id) {
      return new Response(
        JSON.stringify({ error: "state_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return await setupState(supabaseAdmin, state_id);
  } catch (error) {
    console.error("Setup error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function setupAll(supabaseAdmin: any) {
  const results = {
    static_pages: 0,
    region_pages: 0,
    treatment_pages: 0,
    city_pages: 0,
    service_location_pages: 0,
    errors: [] as string[],
  };

  // 1. Create static pages
  for (const page of STATIC_PAGES) {
    try {
      const { error } = await supabaseAdmin.from("seo_pages").upsert({
        slug: page.slug,
        page_type: page.page_type,
        title: page.title,
        h1: page.h1,
        meta_title: page.meta_title,
        meta_description: page.meta_description,
        canonical_url: `/${page.slug}`,
        is_indexed: true,
        is_thin_content: true,
        needs_optimization: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: "slug" });
      if (error) results.errors.push(`Static ${page.slug}: ${error.message}`);
      else results.static_pages++;
    } catch (e) {
      results.errors.push(`Static ${page.slug}: ${e instanceof Error ? e.message : "Unknown"}`);
    }
  }

  // 2. Get all active states
  const { data: states } = await supabaseAdmin
    .from("states")
    .select("id, name, slug")
    .eq("is_active", true);

  // 3. Create region pages
  for (const state of states || []) {
    try {
      const { error } = await supabaseAdmin.from("seo_pages").upsert({
        slug: state.slug,
        page_type: "state",
        title: `Fostering Agencies in ${state.name}`,
        h1: `Fostering Agencies in ${state.name}`,
        meta_title: `Fostering Agencies in ${state.name} | Foster Connect`,
        meta_description: `Find Ofsted-rated fostering agencies in ${state.name}. Compare agencies, read carer reviews, and start your fostering journey with Foster Connect.`,
        canonical_url: `/${state.slug}`,
        is_indexed: true,
        is_thin_content: true,
        needs_optimization: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: "slug" });
      if (error) results.errors.push(`Region ${state.name}: ${error.message}`);
      else results.region_pages++;
    } catch (e) {
      results.errors.push(`Region ${state.name}: ${e instanceof Error ? e.message : "Unknown"}`);
    }
  }

  // 4. Get all active treatments
  const { data: treatments } = await supabaseAdmin
    .from("treatments")
    .select("id, name, slug")
    .eq("is_active", true);

  // 5. Create treatment/service pages
  for (const t of treatments || []) {
    try {
      const { error } = await supabaseAdmin.from("seo_pages").upsert({
        slug: `services/${t.slug}`,
        page_type: "treatment",
        title: `${t.name} – Fostering Services`,
        h1: t.name,
        meta_title: `${t.name} | Foster Connect`,
        meta_description: `Learn about ${t.name.toLowerCase()} across the UK. Find specialised agencies, understand the process, and explore your options with Foster Connect.`,
        canonical_url: `/services/${t.slug}`,
        is_indexed: true,
        is_thin_content: true,
        needs_optimization: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: "slug" });
      if (error) results.errors.push(`Treatment ${t.name}: ${error.message}`);
      else results.treatment_pages++;
    } catch (e) {
      results.errors.push(`Treatment ${t.name}: ${e instanceof Error ? e.message : "Unknown"}`);
    }
  }

  // 6. Get all active cities and create city + service_location pages
  const { data: cities } = await supabaseAdmin
    .from("cities")
    .select("id, name, slug, state_id")
    .eq("is_active", true);

  // Build state lookup
  const stateMap = new Map((states || []).map((s: any) => [s.id, s]));

  for (const city of cities || []) {
    const state = stateMap.get(city.state_id);
    if (!state) continue;

    const citySlug = `${state.slug}/${city.slug}`;
    try {
      const { error } = await supabaseAdmin.from("seo_pages").upsert({
        slug: citySlug,
        page_type: "city",
        title: `Fostering Agencies in ${city.name}, ${state.name}`,
        h1: `Fostering Agencies in ${city.name}, ${state.name}`,
        meta_title: `Find Fostering Agencies in ${city.name} | Foster Connect`,
        meta_description: `Discover trusted fostering agencies in ${city.name}, ${state.name}. Compare Ofsted ratings, read carer reviews, and start your fostering journey.`,
        canonical_url: `/${citySlug}`,
        is_indexed: true,
        is_thin_content: true,
        needs_optimization: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: "slug" });
      if (error) results.errors.push(`City ${city.name}: ${error.message}`);
      else results.city_pages++;
    } catch (e) {
      results.errors.push(`City ${city.name}: ${e instanceof Error ? e.message : "Unknown"}`);
    }

    // Service + location pages
    for (const t of treatments || []) {
      const slSlug = `${state.slug}/${city.slug}/${t.slug}`;
      try {
        const { error } = await supabaseAdmin.from("seo_pages").upsert({
          slug: slSlug,
          page_type: "service_location",
          title: `${t.name} in ${city.name}, ${state.name}`,
          h1: `${t.name} in ${city.name}, ${state.name}`,
          meta_title: `${t.name} in ${city.name} | Foster Connect`,
          meta_description: `Find ${t.name.toLowerCase()} services in ${city.name}, ${state.name}. Compare agencies, read reviews, and begin your fostering journey.`,
          canonical_url: `/${slSlug}`,
          is_indexed: true,
          is_thin_content: true,
          needs_optimization: true,
          updated_at: new Date().toISOString(),
        }, { onConflict: "slug" });
        if (error) results.errors.push(`${t.name} in ${city.name}: ${error.message}`);
        else results.service_location_pages++;
      } catch (e) {
        results.errors.push(`${t.name} in ${city.name}: ${e instanceof Error ? e.message : "Unknown"}`);
      }
    }
  }

  const total = results.static_pages + results.region_pages + results.treatment_pages + results.city_pages + results.service_location_pages;

  return new Response(
    JSON.stringify({
      success: true,
      results,
      message: `Created ${total} total SEO pages: ${results.static_pages} static, ${results.region_pages} region, ${results.treatment_pages} fostering type, ${results.city_pages} city, ${results.service_location_pages} service+location pages. ${results.errors.length} errors.`,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function setupState(supabaseAdmin: any, state_id: string) {
  const { data: state, error: stateError } = await supabaseAdmin
    .from("states")
    .select("id, name, slug, abbreviation")
    .eq("id", state_id)
    .single();

  if (stateError || !state) {
    return new Response(
      JSON.stringify({ error: "State not found" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const { data: cities } = await supabaseAdmin
    .from("cities").select("id, name, slug").eq("state_id", state_id).eq("is_active", true);

  const { data: treatments } = await supabaseAdmin
    .from("treatments").select("id, name, slug").eq("is_active", true);

  const results = { state: state.name, region_page: 0, city_pages_created: 0, service_location_pages_created: 0, treatment_pages: 0, errors: [] as string[] };

  // Create region page
  try {
    const { error } = await supabaseAdmin.from("seo_pages").upsert({
      slug: state.slug,
      page_type: "state",
      title: `Fostering Agencies in ${state.name}`,
      h1: `Fostering Agencies in ${state.name}`,
      meta_title: `Fostering Agencies in ${state.name} | Foster Connect`,
      meta_description: `Find Ofsted-rated fostering agencies in ${state.name}. Compare agencies, read carer reviews, and start your fostering journey.`,
      canonical_url: `/${state.slug}`,
      is_indexed: true, is_thin_content: true, needs_optimization: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: "slug" });
    if (!error) results.region_page = 1;
  } catch (e) { results.errors.push(`Region: ${e instanceof Error ? e.message : "Unknown"}`); }

  // Create treatment pages
  for (const t of treatments || []) {
    try {
      const { error } = await supabaseAdmin.from("seo_pages").upsert({
        slug: `services/${t.slug}`,
        page_type: "treatment",
        title: `${t.name} – Fostering Services`,
        h1: t.name,
        meta_title: `${t.name} | Foster Connect`,
        meta_description: `Learn about ${t.name.toLowerCase()} across the UK. Find specialised agencies with Foster Connect.`,
        canonical_url: `/services/${t.slug}`,
        is_indexed: true, is_thin_content: true, needs_optimization: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: "slug" });
      if (!error) results.treatment_pages++;
    } catch (e) { results.errors.push(`Treatment ${t.name}: ${e instanceof Error ? e.message : "Unknown"}`); }
  }

  // City + service_location pages
  for (const city of cities || []) {
    const citySlug = `${state.slug}/${city.slug}`;
    try {
      const { error } = await supabaseAdmin.from("seo_pages").upsert({
        slug: citySlug, page_type: "city",
        title: `Fostering Agencies in ${city.name}, ${state.name}`,
        meta_title: `Find Fostering Agencies in ${city.name} | Foster Connect`,
        meta_description: `Discover trusted fostering agencies in ${city.name}, ${state.name}. Compare Ofsted ratings, read carer reviews, and start your fostering journey.`,
        h1: `Fostering Agencies in ${city.name}, ${state.name}`,
        canonical_url: `/${citySlug}`,
        is_indexed: true, is_thin_content: true, needs_optimization: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: "slug" });
      if (!error) results.city_pages_created++;
      else results.errors.push(`City ${city.name}: ${error.message}`);
    } catch (e) { results.errors.push(`City ${city.name}: ${e instanceof Error ? e.message : "Unknown"}`); }

    for (const t of treatments || []) {
      const slSlug = `${state.slug}/${city.slug}/${t.slug}`;
      try {
        const { error } = await supabaseAdmin.from("seo_pages").upsert({
          slug: slSlug, page_type: "service_location",
          title: `${t.name} in ${city.name}, ${state.name}`,
          meta_title: `${t.name} in ${city.name} | Foster Connect`,
          meta_description: `Find ${t.name.toLowerCase()} services in ${city.name}, ${state.name}. Compare agencies and begin your fostering journey.`,
          h1: `${t.name} in ${city.name}, ${state.name}`,
          canonical_url: `/${slSlug}`,
          is_indexed: true, is_thin_content: true, needs_optimization: true,
          updated_at: new Date().toISOString(),
        }, { onConflict: "slug" });
        if (!error) results.service_location_pages_created++;
        else results.errors.push(`${t.name} in ${city.name}: ${error.message}`);
      } catch (e) { results.errors.push(`${t.name} in ${city.name}: ${e instanceof Error ? e.message : "Unknown"}`); }
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      results,
      message: `Created ${results.region_page} region page, ${results.treatment_pages} fostering type pages, ${results.city_pages_created} city pages and ${results.service_location_pages_created} service+location pages for ${state.name}`,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
