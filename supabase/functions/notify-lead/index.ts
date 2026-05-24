// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sendSystemError(errorDetails: string) {
  try {
    const systemUrl = Deno.env.get("SYSTEM_WEBHOOK_URL")
    if (systemUrl) {
      await fetch(systemUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [{
            title: "⚠️ System Error — Edge Function",
            color: 0xEF4444,
            description: `**Error Details:**\n\`\`\`json\n${errorDetails}\n\`\`\``,
            timestamp: new Date().toISOString()
          }]
        })
      })
    }
  } catch (e) {
    console.error("Failed to send system error:", e)
  }
}

function sanitize(str: string): string {
  return (str || '')
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .slice(0, 2000)
}

serve(async (req: Request) => {
  // CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // ---- GET HANDLER: DISCORD ACTION LINKS ----
  if (req.method === "GET") {
    try {
      const url = new URL(req.url);
      const action = url.searchParams.get("action");
      const leadId = url.searchParams.get("lead_id");
      const token = url.searchParams.get("token");

      const expectedToken = Deno.env.get("STATUS_UPDATE_SECRET");
      if (!expectedToken || token !== expectedToken) {
        return new Response("Unauthorized request", { status: 401, headers: corsHeaders });
      }

      if (!leadId || !action || !["accept", "decline", "contacted"].includes(action)) {
        return new Response("Invalid request parameters", { status: 400, headers: corsHeaders });
      }

      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (!supabaseUrl || !supabaseKey) {
        return new Response("Server configuration error", { status: 500, headers: corsHeaders });
      }

      // 1. Fetch current lead info
      const leadRes = await fetch(`${supabaseUrl}/rest/v1/leads?id=eq.${leadId}&select=*`, {
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`
        }
      });

      if (!leadRes.ok) {
        return new Response("Failed to fetch lead info", { status: 500, headers: corsHeaders });
      }

      const leads = await leadRes.json();
      if (!leads || leads.length === 0) {
        return new Response("Lead not found", { status: 404, headers: corsHeaders });
      }

      const lead = leads[0];
      const newStatus = action === "accept" ? "accepted" : action === "decline" ? "declined" : "contacted";

      // 2. Update status in Supabase DB
      const updateRes = await fetch(`${supabaseUrl}/rest/v1/leads?id=eq.${leadId}`, {
        method: "PATCH",
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!updateRes.ok) {
        return new Response("Failed to update lead status", { status: 500, headers: corsHeaders });
      }

      // 3. Send corresponding client email via Resend
      let emailSent = false;
      let emailError = "";
      const resendApiKey = Deno.env.get("RESEND_API_KEY");

      if (resendApiKey && lead.email) {
        let subject = "";
        let htmlContent = "";

        if (action === "accept") {
          subject = "ARTIX — Your Project Has Been Reviewed";
          htmlContent = getAcceptanceEmailHtml(lead.name || "there");
        } else if (action === "decline") {
          subject = "ARTIX — Project Inquiry Update";
          htmlContent = getDeclineEmailHtml(lead.name || "there");
        }

        if (subject && htmlContent) {
          try {
            const emailRes = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${resendApiKey}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                from: "ARTIX MEDIA <onboarding@resend.dev>",
                to: [lead.email],
                reply_to: "contactartixmedia@gmail.com",
                subject: subject,
                html: htmlContent
              })
            });

            if (emailRes.ok) {
              emailSent = true;
            } else {
              const errBody = await emailRes.text();
              emailError = `Resend status ${emailRes.status}: ${errBody}`;
            }
          } catch (e) {
            emailError = e instanceof Error ? e.message : String(e);
          }
        }
      } else {
        emailError = "Resend API Key is missing or lead email is empty";
      }

      const htmlPage = getStatusConfirmationPageHtml(lead.name || "Client", newStatus, emailSent, emailError);
      return new Response(htmlPage, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/html"
        }
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return new Response(`Error executing status update: ${errorMsg}`, { status: 500, headers: corsHeaders });
    }
  }

  // ---- POST HANDLER: LEAD SUBMISSION & DB WEBHOOKS ----
  if (req.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const payload = await req.json()

    // Support both direct fetch (payload.type) and DB webhooks (payload.table)
    const type = payload.type || payload.table;
    const record = payload.record || payload;

    if (!record) {
      const err = "No record data provided";
      await sendSystemError(err);
      return new Response(
        JSON.stringify({ error: err }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // ---- HANDLE DATABASE WEBHOOK UPDATE EVENTS ----
    if (payload.type === 'UPDATE' && payload.table === 'leads') {
      const newStatus = record.status;
      const oldStatus = payload.old_record?.status;

      if (newStatus !== oldStatus) {
        const resendApiKey = Deno.env.get("RESEND_API_KEY");
        if (resendApiKey && record.email) {
          let subject = "";
          let htmlContent = "";

          if (newStatus === "accepted") {
            subject = "ARTIX — Your Project Has Been Reviewed";
            htmlContent = getAcceptanceEmailHtml(record.name || "there");
          } else if (newStatus === "declined") {
            subject = "ARTIX — Project Inquiry Update";
            htmlContent = getDeclineEmailHtml(record.name || "there");
          }

          if (subject && htmlContent) {
            const emailRes = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${resendApiKey}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                from: "ARTIX MEDIA <onboarding@resend.dev>",
                to: [record.email],
                reply_to: "contactartixmedia@gmail.com",
                subject: subject,
                html: htmlContent
              })
            });
            if (!emailRes.ok) {
              console.error(`Failed to send email on update webhook: ${emailRes.status}`);
            }
          }
        }
      }
      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }

    const normalizedType = type === 'INSERT' ? 'lead' : type;

    if (!normalizedType || (normalizedType !== 'lead' && normalizedType !== 'feedback')) {
      const err = `Invalid or missing type: ${type}`;
      await sendSystemError(err);
      return new Response(
        JSON.stringify({ error: err }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    const warnings: string[] = []

    // ---- LEAD-ONLY HARDENING ----
    if (normalizedType === 'lead') {

      // 1. TURNSTILE VERIFICATION (fail-open with full logging)
      const turnstileSecret = Deno.env.get("TURNSTILE_SECRET_KEY");
      console.log("Turnstile secret present:", !!turnstileSecret);

      if (turnstileSecret) {
        const token = record.cf_turnstile_response || payload.cf_turnstile_response;
        console.log("Turnstile token present:", !!token);

        if (!token) {
          console.log("No token — skipping Turnstile check");
        } else {
          try {
            const verifyRes = await fetch(
              "https://challenges.cloudflare.com/turnstile/v0/siteverify",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ secret: turnstileSecret, response: token })
              }
            );
            const verifyData = await verifyRes.json();
            console.log("Turnstile result:", JSON.stringify(verifyData));

            if (!verifyData.success) {
              return new Response(
                JSON.stringify({ error: "Verification failed. Please try again." }),
                { status: 403, headers: corsHeaders }
              );
            }
          } catch (err) {
            // fail-open: don't block on network/API errors
            console.log("Turnstile check failed, allowing through:", err);
          }
        }
      }

      // 2. INPUT SANITIZATION + VALIDATION
      const name    = sanitize(record.name    || '');
      const email   = sanitize(record.email   || '');
      const phone   = sanitize(record.phone   || '');
      const preferredContact = sanitize(record.preferred_contact || '');
      const project = sanitize(record.project_type || '');
      const budget  = sanitize(record.budget  || '');
      const message = sanitize(record.message || '');

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!name || !email || !project || !budget || !phone || !preferredContact) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          { status: 400, headers: corsHeaders }
        );
      }
      if (!emailRegex.test(email)) {
        return new Response(
          JSON.stringify({ error: 'Invalid email format' }),
          { status: 400, headers: corsHeaders }
        );
      }
      if (name.length > 80) {
        return new Response(
          JSON.stringify({ error: 'Name too long' }),
          { status: 400, headers: corsHeaders }
        );
      }
      if (message.length > 1000) {
        return new Response(
          JSON.stringify({ error: 'Message too long' }),
          { status: 400, headers: corsHeaders }
        );
      }

      // Write sanitized values back to record for downstream use
      record.name = name;
      record.email = email;
      record.phone = phone;
      record.preferred_contact = preferredContact;
      record.project_type = project;
      record.budget = budget;
      record.message = message;

      // 3. IP RATE LIMITING
      try {
        const supabaseUrl  = Deno.env.get('SUPABASE_URL');
        const supabaseKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        if (supabaseUrl && supabaseKey) {
          const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim()
            || req.headers.get('x-real-ip')
            || 'unknown';
          const windowMinutes = 60;
          const maxRequests   = 5;
          const windowStart   = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();

          const rlRes = await fetch(
            `${supabaseUrl}/rest/v1/rate_limits?ip=eq.${encodeURIComponent(ip)}&endpoint=eq.notify-lead&window_start=gt.${encodeURIComponent(windowStart)}&select=count`,
            { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'Accept': 'application/json' } }
          );
          const rlData = await rlRes.json();
          const count = Array.isArray(rlData) && rlData[0] ? parseInt(rlData[0].count || '0') : 0;

          if (count >= maxRequests) {
            return new Response(
              JSON.stringify({ error: 'Too many requests. Please try again later.' }),
              { status: 429, headers: corsHeaders }
            );
          }

          // Upsert count
          await fetch(`${supabaseUrl}/rest/v1/rate_limits`, {
            method: 'POST',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify({ ip, endpoint: 'notify-lead', count: count + 1, window_start: new Date().toISOString() })
          });
        }
      } catch (rlErr) {
        console.error('Rate limit check failed:', rlErr);
      }

      // 4. LEAD DEDUPLICATION
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        if (supabaseUrl && supabaseKey) {
          const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
          const dedupRes = await fetch(
            `${supabaseUrl}/rest/v1/leads?email=eq.${encodeURIComponent(record.email)}&created_at=gt.${encodeURIComponent(tenMinutesAgo)}&select=id&limit=1`,
            { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'Accept': 'application/json' } }
          );
          const dedupData = await dedupRes.json();
          if (Array.isArray(dedupData) && dedupData.length > 0) {
            return new Response(
              JSON.stringify({ success: true }),
              { status: 200, headers: corsHeaders }
            );
          }
        }
      } catch (dedupErr) {
        console.error('Dedup check failed:', dedupErr);
      }
    }

    // ---- DISCORD NOTIFICATIONS ----
    try {
      const webhookUrl = normalizedType === 'lead'
        ? Deno.env.get("LEADS_WEBHOOK_URL") || Deno.env.get("DISCORD_WEBHOOK_URL")
        : Deno.env.get("FEEDBACK_WEBHOOK_URL")

      if (webhookUrl) {
        let embedFields: { name: string; value: string; inline?: boolean }[] = [];
        let embedTitle = "";

        if (normalizedType === 'lead') {
          embedTitle = "🎯 New Lead — ARTIX MEDIA";
          
          // Setup Status Action links
          const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
          const statusSecret = Deno.env.get("STATUS_UPDATE_SECRET") || "";
          const acceptUrl = `${supabaseUrl}/functions/v1/notify-lead?action=accept&lead_id=${record.id || ''}&token=${statusSecret}`;
          const declineUrl = `${supabaseUrl}/functions/v1/notify-lead?action=decline&lead_id=${record.id || ''}&token=${statusSecret}`;
          const contactedUrl = `${supabaseUrl}/functions/v1/notify-lead?action=contacted&lead_id=${record.id || ''}&token=${statusSecret}`;

          embedFields = [
            { name: "👤 Client Details", value: `**Name:** ${record.name || "N/A"}\n**Email:** ${record.email || "N/A"}\n**Phone:** ${record.phone || "N/A"}`, inline: false },
            { name: "🎬 Project Specs", value: `**Type:** ${record.project_type || "N/A"}\n**Budget:** ${record.budget || "N/A"}\n**Preferred Contact:** ${record.preferred_contact || "N/A"}`, inline: false },
            { name: "💬 Message", value: record.message || "No message", inline: false }
          ];

          if (record.id) {
            embedFields.push({
              name: "⚡ Quick Actions (Manual Review)",
              value: `[🟢 Accept Lead](${acceptUrl})  |  [🔴 Decline Lead](${declineUrl})  |  [🟡 Mark Contacted](${contactedUrl})`,
              inline: false
            });
          }
        } else if (normalizedType === 'feedback') {
          embedTitle = "💬 New Feedback — ARTIX MEDIA";
          const stars = record.rating ? '⭐'.repeat(record.rating) : "N/A";
          embedFields = [
            { name: "📂 Category", value: record.category || "N/A", inline: true },
            { name: "⭐ Rating", value: `${record.rating}/5 ${stars}`, inline: true },
            { name: "💬 Message", value: record.message || "No message", inline: false }
          ];
        }

        const discordRes = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            embeds: [{
              title: embedTitle,
              color: 0x8B5CF6,
              fields: embedFields,
              footer: { text: "ARTIX MEDIA — System" },
              timestamp: new Date().toISOString()
            }]
          })
        })

        if (!discordRes.ok) {
          warnings.push("discord_failed")
          await sendSystemError(`Discord fetch failed with status ${discordRes.status}`);
        }
      } else {
        warnings.push(`${normalizedType}_webhook_url_missing`)
        await sendSystemError(`${normalizedType.toUpperCase()}_WEBHOOK_URL is missing in environment variables.`);
      }
    } catch (err) {
      warnings.push("discord_failed")
      await sendSystemError(`Discord notification error: ${err instanceof Error ? err.message : String(err)}`);
    }

    // ---- EMAIL NOTIFICATIONS via RESEND ----
    try {
      const resendApiKey = Deno.env.get("RESEND_API_KEY")
      const notificationEmail = Deno.env.get("NOTIFICATION_EMAIL")

      if (resendApiKey) {
        if (normalizedType === 'lead') {
          // 1. Notify Agency Email
          if (notificationEmail) {
            const agencySubject = `🎯 New Lead: ${record.name || 'Anonymous'}`;
            const agencyHtml = getAgencyEmailHtml(record);

            const agencyEmailRes = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${resendApiKey}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                from: "ARTIX MEDIA <onboarding@resend.dev>",
                to: [notificationEmail],
                reply_to: "contactartixmedia@gmail.com",
                subject: agencySubject,
                html: agencyHtml
              })
            });

            if (!agencyEmailRes.ok) {
              warnings.push("agency_email_failed")
              await sendSystemError(`Resend API agency notification failed: status ${agencyEmailRes.status}`);
            }
          }

          // 2. Client Auto-Acknowledgement Email
          if (record.email) {
            const clientSubject = "ARTIX — Inquiry Received";
            const clientHtml = getAcknowledgementEmailHtml(record.name || "there");

            const clientEmailRes = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${resendApiKey}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                from: "ARTIX MEDIA <onboarding@resend.dev>",
                to: [record.email],
                reply_to: "contactartixmedia@gmail.com",
                subject: clientSubject,
                html: clientHtml
              })
            });

            if (!clientEmailRes.ok) {
              warnings.push("client_email_failed")
              await sendSystemError(`Resend API client auto-acknowledgement failed: status ${clientEmailRes.status}`);
            }
          }

        } else if (normalizedType === 'feedback') {
          if (notificationEmail) {
            const feedbackSubject = `💬 New Feedback: ${record.rating}/5 - ${record.category}`;
            const feedbackHtml = `
              <div style="font-family: -apple-system, sans-serif; background: #0B0B0B; color: #fff; padding: 40px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.1);">
                <h1 style="color: #ffffff; margin-top: 0;">ARTIX<span style="color:#8B5CF6;">.</span></h1>
                <h2 style="color: #8B5CF6; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 16px;">New Feedback Received</h2>
                <p><strong>Category:</strong> ${record.category || 'N/A'}</p>
                <p><strong>Rating:</strong> ${record.rating}/5</p>
                <div style="background: #121212; padding: 20px; border-radius: 8px; margin-top: 20px;">
                  <p style="margin: 0; color: #ccc;">${record.message || 'No message'}</p>
                </div>
              </div>
            `;

            const feedbackRes = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${resendApiKey}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                from: "ARTIX MEDIA <onboarding@resend.dev>",
                to: [notificationEmail],
                reply_to: "contactartixmedia@gmail.com",
                subject: feedbackSubject,
                html: feedbackHtml
              })
            });

            if (!feedbackRes.ok) {
              warnings.push("feedback_email_failed")
              await sendSystemError(`Resend API feedback notification failed: status ${feedbackRes.status}`);
            }
          }
        }
      } else {
        warnings.push("email_env_missing")
        await sendSystemError(`RESEND_API_KEY is missing in environment variables.`);
      }
    } catch (err) {
      warnings.push("email_failed")
      await sendSystemError(`Email notification error: ${err instanceof Error ? err.message : String(err)}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        warnings: warnings.length > 0 ? warnings : undefined
      }),
      {
        status: 200,
        headers: corsHeaders,
      }
    )

  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    await sendSystemError(`Unhandled Edge Function Error:\n${errorMsg}`);

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMsg
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    )
  }
})

// ============================================================
// HTML EMAIL & CONFIRMATION TEMPLATES
// ============================================================

function getAcknowledgementEmailHtml(clientName: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background-color:#080808;color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#080808" style="background-color:#080808;padding:40px 16px;">
  <tr>
    <td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
        
        <!-- Logo Header -->
        <tr>
          <td style="padding-bottom:30px;">
            <p style="margin:0;font-size:28px;font-weight:800;letter-spacing:1px;color:#ffffff;">ARTIX<span style="color:#8B5CF6;">.</span></p>
            <p style="margin:4px 0 0 0;font-size:10px;font-weight:600;color:#555555;text-transform:uppercase;letter-spacing:4px;">Editorial Studio</p>
          </td>
        </tr>

        <!-- Divider -->
        <tr>
          <td>
            <table width="100%" height="1" style="background:linear-gradient(to right,#8B5CF6,transparent);font-size:0;line-height:0;margin-bottom:32px;"><tr><td></td></tr></table>
          </td>
        </tr>

        <!-- Main Narrative Card -->
        <tr>
          <td style="padding-bottom:32px;">
            <p style="font-size:10px;font-weight:700;color:#8B5CF6;text-transform:uppercase;letter-spacing:3px;margin:0 0 12px 0;">Inquiry Confirmed</p>
            <h1 style="font-size:32px;font-weight:700;color:#ffffff;margin:0 0 20px 0;letter-spacing:-1px;">Hello ${clientName},</h1>
            <p style="font-size:15px;color:#999999;line-height:1.7;margin:0 0 16px 0;font-weight:300;">
              We have received your project details and creative brief.
            </p>
            <p style="font-size:15px;color:#999999;line-height:1.7;margin:0 0 24px 0;font-weight:300;">
              Every film, commercial, or digital narrative we shape requires complete focus. To preserve our quality of execution, we limit our client intake. Our team is currently reviewing your submission to verify creative alignment and queue availability.
            </p>
            <p style="font-size:15px;color:#999999;line-height:1.7;margin:0 0 24px 0;font-weight:300;">
              We typically finalize reviews within 24 to 48 hours. If your project is a fit, we will reach out to organize a creative alignment call.
            </p>
          </td>
        </tr>

        <!-- CTA Box -->
        <tr>
          <td style="padding-bottom:36px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#120b24;border:1px solid #2a1f4a;border-radius:16px;">
              <tr>
                <td style="padding:28px 24px;text-align:center;">
                  <p style="margin:0 0 16px 0;font-size:14px;color:#ffffff;font-weight:400;letter-spacing:-0.2px;">Have reference videos or additional project materials to share?</p>
                  <table align="center" cellpadding="0" cellspacing="0">
                    <tr>
                      <td>
                        <a href="https://wa.me/919398501153" style="display:inline-block;background-color:#7C3AED;color:#ffffff;padding:14px 28px;border-radius:10px;text-decoration:none;font-size:14px;font-weight:600;letter-spacing:-0.2px;">
                          Continue via WhatsApp
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="border-top:1px solid #1a1a1a;padding-top:24px;text-align:center;">
            <p style="margin:0;font-size:10px;font-weight:600;color:#444444;text-transform:uppercase;letter-spacing:3px;">ARTIX MEDIA &copy; 2026</p>
            <p style="margin:4px 0 0 0;font-size:10px;color:#444444;letter-spacing:1px;font-style:italic;">Pacing is everything.</p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>
  `;
}

function getAcceptanceEmailHtml(clientName: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background-color:#080808;color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#080808" style="background-color:#080808;padding:40px 16px;">
  <tr>
    <td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
        
        <!-- Logo Header -->
        <tr>
          <td style="padding-bottom:30px;">
            <p style="margin:0;font-size:28px;font-weight:800;letter-spacing:1px;color:#ffffff;">ARTIX<span style="color:#8B5CF6;">.</span></p>
            <p style="margin:4px 0 0 0;font-size:10px;font-weight:600;color:#555555;text-transform:uppercase;letter-spacing:4px;">Editorial Studio</p>
          </td>
        </tr>

        <!-- Divider -->
        <tr>
          <td>
            <table width="100%" height="1" style="background:linear-gradient(to right,#8B5CF6,transparent);font-size:0;line-height:0;margin-bottom:32px;"><tr><td></td></tr></table>
          </td>
        </tr>

        <!-- Main Narrative Card -->
        <tr>
          <td style="padding-bottom:32px;">
            <p style="font-size:10px;font-weight:700;color:#8B5CF6;text-transform:uppercase;letter-spacing:3px;margin:0 0 12px 0;">Creative Review Complete</p>
            <h1 style="font-size:32px;font-weight:700;color:#ffffff;margin:0 0 20px 0;letter-spacing:-1px;">Hello ${clientName},</h1>
            <p style="font-size:15px;color:#999999;line-height:1.7;margin:0 0 16px 0;font-weight:300;">
              Your project inquiry has been reviewed by our creative directors. We are excited about your concept, and it aligns with our aesthetic direction. We would love to collaborate with you.
            </p>
            <p style="font-size:15px;color:#999999;line-height:1.7;margin:0 0 24px 0;font-weight:300;">
              To discuss the project's pacing, scope, technical deliverables, and visual design direction, we would like to schedule a brief creative alignment call.
            </p>
            <p style="font-size:15px;color:#999999;line-height:1.7;margin:0 0 24px 0;font-weight:300;">
              Please select a convenient time or reach out directly to coordinate.
            </p>
          </td>
        </tr>

        <!-- CTA Box -->
        <tr>
          <td style="padding-bottom:36px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#120b24;border:1px solid #2a1f4a;border-radius:16px;">
              <tr>
                <td style="padding:28px 24px;text-align:center;">
                  <p style="margin:0 0 16px 0;font-size:14px;color:#ffffff;font-weight:400;letter-spacing:-0.2px;">Schedule our creative session or chat via WhatsApp:</p>
                  <table align="center" cellpadding="0" cellspacing="0">
                    <tr>
                      <td>
                        <a href="https://wa.me/919398501153" style="display:inline-block;background-color:#7C3AED;color:#ffffff;padding:14px 28px;border-radius:10px;text-decoration:none;font-size:14px;font-weight:600;letter-spacing:-0.2px;">
                          Connect via WhatsApp
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="border-top:1px solid #1a1a1a;padding-top:24px;text-align:center;">
            <p style="margin:0;font-size:10px;font-weight:600;color:#444444;text-transform:uppercase;letter-spacing:3px;">ARTIX MEDIA &copy; 2026</p>
            <p style="margin:4px 0 0 0;font-size:10px;color:#444444;letter-spacing:1px;font-style:italic;">Let's shape your story.</p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>
  `;
}

function getDeclineEmailHtml(clientName: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background-color:#080808;color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#080808" style="background-color:#080808;padding:40px 16px;">
  <tr>
    <td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
        
        <!-- Logo Header -->
        <tr>
          <td style="padding-bottom:30px;">
            <p style="margin:0;font-size:28px;font-weight:800;letter-spacing:1px;color:#ffffff;">ARTIX<span style="color:#8B5CF6;">.</span></p>
            <p style="margin:4px 0 0 0;font-size:10px;font-weight:600;color:#555555;text-transform:uppercase;letter-spacing:4px;">Editorial Studio</p>
          </td>
        </tr>

        <!-- Divider -->
        <tr>
          <td>
            <table width="100%" height="1" style="background:linear-gradient(to right,#8B5CF6,transparent);font-size:0;line-height:0;margin-bottom:32px;"><tr><td></td></tr></table>
          </td>
        </tr>

        <!-- Main Narrative Card -->
        <tr>
          <td style="padding-bottom:32px;">
            <p style="font-size:10px;font-weight:700;color:#8B5CF6;text-transform:uppercase;letter-spacing:3px;margin:0 0 12px 0;">Project Update</p>
            <h1 style="font-size:32px;font-weight:700;color:#ffffff;margin:0 0 20px 0;letter-spacing:-1px;">Hello ${clientName},</h1>
            <p style="font-size:15px;color:#999999;line-height:1.7;margin:0 0 16px 0;font-weight:300;">
              Thank you for reaching out to us with your project details. We appreciate the opportunity to review your creative concept.
            </p>
            <p style="font-size:15px;color:#999999;line-height:1.7;margin:0 0 16px 0;font-weight:300;">
              We have carefully reviewed your brief and requirements. Unfortunately, due to our current production volume and commitments, we are unable to take on this project at this time.
            </p>
            <p style="font-size:15px;color:#999999;line-height:1.7;margin:0 0 24px 0;font-weight:300;">
              To deliver the cinematic execution our clients expect, we restrict our project queue. We wish you the best in bringing your story to life and look forward to potentially collaborating on a future narrative.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="border-top:1px solid #1a1a1a;padding-top:24px;text-align:center;">
            <p style="margin:0;font-size:10px;font-weight:600;color:#444444;text-transform:uppercase;letter-spacing:3px;">ARTIX MEDIA &copy; 2026</p>
            <p style="margin:4px 0 0 0;font-size:10px;color:#444444;letter-spacing:1px;font-style:italic;">Pacing is everything.</p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>
  `;
}

function getAgencyEmailHtml(record: any): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background-color:#080808;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#080808">
  <tr>
    <td align="center" style="padding:40px 16px;">
    <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

      <!-- HEADER -->
      <tr>
        <td style="padding-bottom:20px;">
          <p style="margin:0 0 4px 0;font-size:32px;font-weight:900;letter-spacing:1px;color:#ffffff;line-height:1;">ARTIX<span style="color:#8B5CF6;font-weight:900;">.</span></p>
          <p style="margin:0;font-size:10px;font-weight:600;color:#555555;text-transform:uppercase;letter-spacing:5px;">Studio Notification</p>
        </td>
      </tr>

      <!-- DIVIDER -->
      <tr>
        <td style="padding:0 0 32px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 32px 0;">
            <tr>
              <td width="25%" height="1" style="background:linear-gradient(to right,#1a1a1a,#8B5CF6);font-size:0;line-height:0;"></td>
              <td width="50%" height="1" style="background:#8B5CF6;font-size:0;line-height:0;"></td>
              <td width="25%" height="1" style="background:linear-gradient(to left,#1a1a1a,#8B5CF6);font-size:0;line-height:0;"></td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- HERO -->
      <tr>
        <td style="padding-bottom:36px;">
          <p style="margin:0 0 12px 0;font-size:10px;font-weight:700;color:#8B5CF6;text-transform:uppercase;letter-spacing:5px;">New Lead Received</p>
          <p style="margin:0 0 8px 0;font-size:36px;font-weight:800;color:#ffffff;letter-spacing:-1.5px;line-height:1.05;">${record.name || 'Someone'}</p>
          <p style="margin:0;font-size:15px;color:#555555;font-weight:400;letter-spacing:0.2px;">is interested in working with you.</p>
        </td>
      </tr>

      <!-- DETAILS CARD -->
      <tr>
        <td style="padding-bottom:28px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #1e1e1e;border-radius:16px;overflow:hidden;border-collapse:separate;">

            <!-- Name -->
            <tr>
              <td width="52" bgcolor="#1a1030" style="width:52px;text-align:center;font-size:18px;border-right:1px solid #1e1e1e;border-bottom:1px solid #1e1e1e;padding:16px 0;vertical-align:middle;">👤</td>
              <td width="90" bgcolor="#0f0f0f" style="width:90px;padding:16px;border-bottom:1px solid #1e1e1e;vertical-align:middle;">
                <span style="color:#444444;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:3px;">Name</span>
              </td>
              <td bgcolor="#0f0f0f" style="padding:16px;border-bottom:1px solid #1e1e1e;vertical-align:middle;">
                <span style="font-size:14px;color:#ffffff;font-weight:500;letter-spacing:-0.2px;">${record.name || 'N/A'}</span>
              </td>
            </tr>

            <!-- Email -->
            <tr>
              <td width="52" bgcolor="#1a1030" style="width:52px;text-align:center;font-size:18px;border-right:1px solid #1e1e1e;border-bottom:1px solid #1e1e1e;padding:16px 0;vertical-align:middle;">✉️</td>
              <td width="90" bgcolor="#0f0f0f" style="width:90px;padding:16px;border-bottom:1px solid #1e1e1e;vertical-align:middle;">
                <span style="color:#444444;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:3px;">Email</span>
              </td>
              <td bgcolor="#0f0f0f" style="padding:16px;border-bottom:1px solid #1e1e1e;vertical-align:middle;">
                <a href="mailto:${record.email}" style="font-size:14px;color:#9D78FA;text-decoration:none;font-weight:500;letter-spacing:-0.2px;">${record.email || 'N/A'}</a>
              </td>
            </tr>

            <!-- Phone -->
            <tr>
              <td width="52" bgcolor="#1a1030" style="width:52px;text-align:center;font-size:18px;border-right:1px solid #1e1e1e;border-bottom:1px solid #1e1e1e;padding:16px 0;vertical-align:middle;">📞</td>
              <td width="90" bgcolor="#0f0f0f" style="width:90px;padding:16px;border-bottom:1px solid #1e1e1e;vertical-align:middle;">
                <span style="color:#444444;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:3px;">Phone</span>
              </td>
              <td bgcolor="#0f0f0f" style="padding:16px;border-bottom:1px solid #1e1e1e;vertical-align:middle;">
                <span style="font-size:14px;color:#ffffff;font-weight:500;letter-spacing:-0.2px;">${record.phone || 'N/A'}</span>
              </td>
            </tr>

            <!-- Preferred Contact -->
            <tr>
              <td width="52" bgcolor="#1a1030" style="width:52px;text-align:center;font-size:18px;border-right:1px solid #1e1e1e;border-bottom:1px solid #1e1e1e;padding:16px 0;vertical-align:middle;">⚡</td>
              <td width="90" bgcolor="#0f0f0f" style="width:90px;padding:16px;border-bottom:1px solid #1e1e1e;vertical-align:middle;">
                <span style="color:#444444;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:3px;">Contact</span>
              </td>
              <td bgcolor="#0f0f0f" style="padding:16px;border-bottom:1px solid #1e1e1e;vertical-align:middle;">
                <span style="font-size:14px;color:#ffffff;font-weight:500;letter-spacing:-0.2px;">${record.preferred_contact || 'N/A'}</span>
              </td>
            </tr>

            <!-- Project -->
            <tr>
              <td width="52" bgcolor="#1a1030" style="width:52px;text-align:center;font-size:18px;border-right:1px solid #1e1e1e;border-bottom:1px solid #1e1e1e;padding:16px 0;vertical-align:middle;">💼</td>
              <td width="90" bgcolor="#0f0f0f" style="width:90px;padding:16px;border-bottom:1px solid #1e1e1e;vertical-align:middle;">
                <span style="color:#444444;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:3px;">Project</span>
              </td>
              <td bgcolor="#0f0f0f" style="padding:16px;border-bottom:1px solid #1e1e1e;vertical-align:middle;">
                <span style="font-size:14px;color:#ffffff;font-weight:500;letter-spacing:-0.2px;">${record.project_type || 'N/A'}</span>
              </td>
            </tr>

            <!-- Budget -->
            <tr>
              <td width="52" bgcolor="#1a1030" style="width:52px;text-align:center;font-size:18px;border-right:1px solid #1e1e1e;border-bottom:1px solid #1e1e1e;padding:16px 0;vertical-align:middle;">💲</td>
              <td width="90" bgcolor="#0f0f0f" style="width:90px;padding:16px;border-bottom:1px solid #1e1e1e;vertical-align:middle;">
                <span style="color:#444444;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:3px;">Budget</span>
              </td>
              <td bgcolor="#0f0f0f" style="padding:16px;border-bottom:1px solid #1e1e1e;vertical-align:middle;">
                <span style="font-size:14px;color:#ffffff;font-weight:500;letter-spacing:-0.2px;">${record.budget || 'N/A'}</span>
              </td>
            </tr>

            <!-- Message -->
            <tr>
              <td width="52" bgcolor="#1a1030" style="width:52px;text-align:center;font-size:18px;border-right:1px solid #1e1e1e;padding:16px 0;vertical-align:top;">💬</td>
              <td width="90" bgcolor="#0f0f0f" style="width:90px;padding:16px;vertical-align:top;">
                <span style="color:#444444;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:3px;">Message</span>
              </td>
              <td bgcolor="#0f0f0f" style="padding:16px;vertical-align:top;">
                <span style="font-size:14px;color:#999999;line-height:1.7;letter-spacing:-0.2px;">${record.message || 'No message provided.'}</span>
              </td>
            </tr>

          </table>
        </td>
      </tr>

      <!-- FOOTER -->
      <tr>
        <td style="border-top:1px solid #1a1a1a;padding-top:24px;text-align:center;">
          <p style="margin:0 0 6px 0;font-size:22px;font-weight:900;letter-spacing:1px;color:#ffffff;line-height:1;">ARTIX<span style="color:#8B5CF6;">.</span></p>
          <p style="margin:0 0 4px 0;font-size:10px;font-weight:600;color:#444444;text-transform:uppercase;letter-spacing:4px;">Premium Cinematic Media Agency</p>
        </td>
      </tr>

    </table>
    </td>
  </tr>
</table>
</body>
</html>
  `;
}

function getStatusConfirmationPageHtml(clientName: string, status: string, emailSent: boolean, emailError: string): string {
  const statusColor = status === "accepted" ? "#10B981" : status === "declined" ? "#EF4444" : "#F59E0B";
  const statusLabel = status.toUpperCase();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ARTIX — Action Confirmed</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #050507;
      color: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      overflow: hidden;
      position: relative;
    }
    .background-glow {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, rgba(0,0,0,0) 70%);
      transform: translate(-50%, -50%);
      z-index: 1;
      pointer-events: none;
    }
    .card {
      background: rgba(20, 20, 27, 0.6);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 24px;
      padding: 48px;
      max-width: 480px;
      width: 90%;
      text-align: center;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
      z-index: 2;
    }
    .logo {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: 2px;
      margin-bottom: 32px;
    }
    .logo span {
      color: #8B5CF6;
    }
    .status-badge {
      display: inline-block;
      padding: 6px 16px;
      border-radius: 99px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 2px;
      border: 1px solid ${statusColor};
      color: ${statusColor};
      background-color: ${statusColor}10;
      margin-bottom: 24px;
    }
    h1 {
      font-size: 28px;
      font-weight: 700;
      margin: 0 0 16px 0;
      letter-spacing: -0.5px;
    }
    p {
      font-size: 14px;
      color: #999999;
      line-height: 1.6;
      margin: 0 0 32px 0;
      font-weight: 300;
    }
    .email-status {
      padding: 16px;
      border-radius: 12px;
      background-color: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.04);
      font-size: 13px;
      text-align: left;
    }
    .email-status-title {
      font-weight: 600;
      margin-bottom: 4px;
      color: #ffffff;
    }
    .email-status-desc {
      color: #777777;
      word-break: break-all;
    }
    .close-btn {
      display: inline-block;
      margin-top: 32px;
      color: #555555;
      text-decoration: none;
      font-size: 12px;
      transition: color 0.3s;
      cursor: pointer;
    }
    .close-btn:hover {
      color: #999999;
    }
  </style>
</head>
<body>
  <div class="background-glow"></div>
  <div class="card">
    <div class="logo">ARTIX<span>.</span></div>
    <div class="status-badge">${statusLabel}</div>
    <h1>Action Confirmed</h1>
    <p>Lead for <strong>${clientName}</strong> has been marked as <strong>${status}</strong> in the database.</p>
    
    <div class="email-status">
      <div class="email-status-title">
        ${emailSent ? "🟢 Email Dispatched" : "⚠️ Email Status"}
      </div>
      <div class="email-status-desc">
        ${emailSent ? `Resend successfully notified ${clientName} of their project update.` : emailError || "No email was sent for this status action."}
      </div>
    </div>

    <a href="#" onclick="window.close(); return false;" class="close-btn">Close Tab</a>
  </div>
</body>
</html>
  `;
}
