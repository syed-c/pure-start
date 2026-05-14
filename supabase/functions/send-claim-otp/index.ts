import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SendOTPSchema = z.object({
  entityType: z.enum(["agencies", "clinics"]).default("agencies"),
  entityId: z.string().uuid("Invalid entity ID format"),
  method: z.enum(["email", "phone"], { errorMap: () => ({ message: "Method must be 'email' or 'phone'" }) }),
  email: z.string().email().max(255).optional(),
  businessEmail: z.string().email().max(255).optional(),
  businessPhone: z.string().max(30).optional(),
});

interface SMTPSettings {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  secure: boolean;
}

async function getSmtpSettings(supabaseClient: any): Promise<SMTPSettings | null> {
  const { data: settings } = await supabaseClient
    .from('global_settings')
    .select('key, value')
    .eq('key', 'smtp')
    .single();
  if (!settings?.value) return null;
  const smtp = settings.value as Record<string, any>;
  if (!smtp.host || !smtp.username || !smtp.password) return null;
  return {
    host: smtp.host,
    port: parseInt(smtp.port?.toString() || '587'),
    user: smtp.username,
    pass: smtp.password,
    from: smtp.from_email ? `${smtp.from_name || 'Foster Care'} <${smtp.from_email}>` : 'Foster Care <no-reply@foster-care.co.uk>',
    secure: smtp.port === 465,
  };
}

async function sendEmailViaSMTP(settings: SMTPSettings, to: string, subject: string, html: string): Promise<{ success: boolean; error?: string }> {
  try {
    const client = new SMTPClient({
      connection: {
        hostname: settings.host, port: settings.port, tls: settings.secure,
        auth: { username: settings.user, password: settings.pass },
      },
    });
    await client.send({ from: settings.from, to, subject, content: "auto", html });
    await client.close();
    return { success: true };
  } catch (error: any) {
    console.error("SMTP error:", error);
    return { success: false, error: error.message };
  }
}

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
    const validated = SendOTPSchema.safeParse(body);
    if (!validated.success) {
      return new Response(JSON.stringify({ error: "Invalid request. Please check your input." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { entityType, entityId, method, email, businessEmail, businessPhone } = validated.data;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const { data: entity } = await supabaseClient
      .from(entityType)
      .select("name, email")
      .eq("id", entityId)
      .single();

    if (!entity) {
      return new Response(JSON.stringify({ error: "Entity not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const targetVerificationEmail = businessEmail || email || entity.email;
    const conflictField = entityType === 'clinics' ? 'clinic_id' : 'agency_id';

    const { error: upsertError } = await supabaseClient
      .from("claim_requests")
      .upsert({
        [conflictField]: entityId,
        user_id: user.id,
        verification_code: otp,
        verification_expires_at: expiresAt.toISOString(),
        verification_method: method,
        verification_sent_at: new Date().toISOString(),
        verification_attempts: 0,
        status: "pending",
        business_email: targetVerificationEmail,
        requester_phone: businessPhone || null,
      }, { onConflict: `${conflictField},user_id` });

    if (upsertError) {
      await supabaseClient.from("claim_requests").insert({
        [conflictField]: entityId,
        user_id: user.id,
        verification_code: otp,
        verification_expires_at: expiresAt.toISOString(),
        verification_method: method,
        verification_sent_at: new Date().toISOString(),
        verification_attempts: 0,
        status: "pending",
        business_email: targetVerificationEmail,
        requester_phone: businessPhone || null,
      });
    }

    const emailToSend = targetVerificationEmail || user.email;
    if (!emailToSend) {
      return new Response(JSON.stringify({ success: false, error: "No email address available for verification." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f4f4f5;">
        <table cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;margin:0 auto;background-color:#ffffff;">
          <tr><td style="padding:40px 40px 20px;text-align:center;background:linear-gradient(135deg,#0d9488 0%,#14b8a6 100%);"><h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:bold;">Verification Code</h1></td></tr>
          <tr><td style="padding:40px;text-align:center;">
            <p style="margin:0 0 20px;color:#374151;font-size:16px;">Your verification code to claim <strong>${entity.name}</strong> is:</p>
            <div style="background-color:#f0fdfa;border-radius:12px;padding:24px;margin:20px 0;"><span style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#0d9488;">${otp}</span></div>
            <p style="margin:20px 0;color:#6b7280;font-size:14px;">This code expires in 10 minutes.</p>
            <p style="margin:0;color:#6b7280;font-size:12px;">If you didn't request this code, please ignore this email.</p>
          </td></tr>
          <tr><td style="padding:30px 40px;background-color:#f4f4f5;text-align:center;"><p style="margin:0;color:#6b7280;font-size:12px;">© 2024 Foster Care. All rights reserved.</p></td></tr>
        </table>
      </body>
      </html>`;

    const smtpSettings = await getSmtpSettings(supabaseClient);
    if (smtpSettings) {
      const smtpResult = await sendEmailViaSMTP(smtpSettings, emailToSend, `Your Verification Code: ${otp} - Foster Care`, emailHtml);
      if (smtpResult.success) {
        return new Response(JSON.stringify({ success: true, message: `Verification code sent to ${method}` }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (resendApiKey) {
      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: "Foster Care <no-reply@foster-care.co.uk>", to: [emailToSend], subject: `Your Verification Code: ${otp} - Foster Care`, html: emailHtml }),
      });
      await emailResponse.json();
      return new Response(JSON.stringify({ success: true, message: `Verification code sent to ${method}` }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ success: false, error: "Email service not configured. Please configure SMTP settings in admin." }), { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error: any) {
    console.error("Error in send-claim-otp:", error);
    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
};

serve(handler);
