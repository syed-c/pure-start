import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { agencyId, agencyName, requesterName, requesterEmail } = await req.json();

    if (!agencyId || !agencyName || !requesterName) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Get admin emails to notify
    const { data: adminUsers } = await supabaseClient
      .from("user_profiles")
      .select("email")
      .in("role", ["super_admin", "admin"])
      .limit(10);

    if (!adminUsers || adminUsers.length === 0) {
      console.log("No admin users found to notify");
      return new Response(JSON.stringify({ success: true, notified: 0 }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const adminEmails = adminUsers.map(u => u.email).filter(Boolean) as string[];
    if (adminEmails.length === 0) {
      return new Response(JSON.stringify({ success: true, notified: 0 }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const subject = `New Claim Request: ${agencyName}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#f4f4f5;">
        <table cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;margin:0 auto;background-color:#ffffff;">
          <tr><td style="padding:30px;text-align:center;background:linear-gradient(135deg,#0d9488 0%,#14b8a6 100%);"><h1 style="margin:0;color:#ffffff;font-size:22px;">New Claim Request</h1></td></tr>
          <tr><td style="padding:30px;">
            <p style="margin:0 0 20px;color:#374151;font-size:16px;">A new claim request has been submitted:</p>
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:600;color:#374151;">Agency</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#374151;">${agencyName}</td></tr>
              <tr><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:600;color:#374151;">Requested By</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#374151;">${requesterName}</td></tr>
              <tr><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:600;color:#374151;">Email</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#374151;">${requesterEmail || 'Not provided'}</td></tr>
            </table>
            <p style="margin:24px 0 0;color:#6b7280;font-size:14px;">Review this claim in your admin dashboard.</p>
          </td></tr>
          <tr><td style="padding:20px 30px;background-color:#f4f4f5;text-align:center;font-size:12px;color:#6b7280;">© 2024 Foster Care</td></tr>
        </table>
      </body>
      </html>`;

    // Try SMTP
    const { data: smtpSettings } = await supabaseClient
      .from('global_settings')
      .select('value')
      .eq('key', 'smtp')
      .single();

    if (smtpSettings?.value) {
      const smtp = smtpSettings.value as Record<string, any>;
      if (smtp.host && smtp.username && smtp.password) {
        const client = new SMTPClient({
          connection: {
            hostname: smtp.host,
            port: parseInt(smtp.port?.toString() || '587'),
            tls: smtp.port === 465,
            auth: { username: smtp.username, password: smtp.password },
          },
        });
        const from = smtp.from_email ? `${smtp.from_name || 'Foster Care'} <${smtp.from_email}>` : 'Foster Care <no-reply@foster-care.co.uk>';
        for (const email of adminEmails) {
          try {
            await client.send({ from, to: email, subject, content: "auto", html });
          } catch (e) {
            console.error(`Failed to send to ${email}:`, e);
          }
        }
        await client.close();
      }
    }

    // Fallback to Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (resendApiKey) {
      for (const email of adminEmails) {
        try {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { "Authorization": `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({ from: "Foster Care <no-reply@foster-care.co.uk>", to: [email], subject, html }),
          });
        } catch (e) {
          console.error(`Failed to send via Resend to ${email}:`, e);
        }
      }
    }

    return new Response(JSON.stringify({ success: true, notified: adminEmails.length }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error: any) {
    console.error("Error in notify-admin-claim:", error);
    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
};

serve(handler);
