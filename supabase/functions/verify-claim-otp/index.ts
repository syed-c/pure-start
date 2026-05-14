import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const VerifyOTPSchema = z.object({
  entityType: z.enum(["agencies", "clinics"]).default("agencies"),
  entityId: z.string().uuid("Invalid entity ID format"),
  code: z.string().length(6, "Verification code must be 6 digits").regex(/^\d{6}$/, "Verification code must contain only digits"),
});

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid authentication" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = await req.json();
    const validated = VerifyOTPSchema.safeParse(body);
    if (!validated.success) {
      return new Response(JSON.stringify({ error: "Invalid request. Please check your input." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { entityType, entityId, code } = validated.data;
    const conflictField = entityType === 'clinics' ? 'clinic_id' : 'agency_id';

    const { data: claimRequest, error: claimError } = await supabaseClient
      .from("claim_requests")
      .select("*")
      .eq(conflictField, entityId)
      .eq("user_id", user.id)
      .eq("status", "pending")
      .single();

    if (claimError || !claimRequest) {
      return new Response(JSON.stringify({ error: "No pending claim request found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (new Date(claimRequest.verification_expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: "Verification code has expired" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (claimRequest.verification_attempts >= 5) {
      return new Response(JSON.stringify({ error: "Too many attempts. Please request a new code." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    await supabaseClient
      .from("claim_requests")
      .update({ verification_attempts: (claimRequest.verification_attempts || 0) + 1 })
      .eq("id", claimRequest.id);

    if (claimRequest.verification_code !== code) {
      return new Response(JSON.stringify({ error: "Invalid verification code" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    await supabaseClient.from("claim_requests").update({ status: "approved" }).eq("id", claimRequest.id);

    await supabaseClient
      .from(entityType)
      .update({ claim_status: "claimed", claimed_by: user.id, claimed_at: new Date().toISOString() })
      .eq("id", entityId);

    const roleName = entityType === 'clinics' ? 'dentist' : 'agency_admin';
    const { data: existingRole } = await supabaseClient
      .from("user_roles")
      .select("id")
      .eq("user_id", user.id)
      .eq("role", roleName)
      .single();

    if (!existingRole) {
      await supabaseClient.from("user_roles").insert({ user_id: user.id, role: roleName });
    }

    return new Response(JSON.stringify({ success: true, message: "Profile claimed successfully!" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error: any) {
    console.error("Error in verify-claim-otp:", error);
    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
};

serve(handler);
