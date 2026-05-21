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
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

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
      const project = sanitize(record.project_type || '');
      const budget  = sanitize(record.budget  || '');
      const message = sanitize(record.message || '');

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!name || !email || !project || !budget) {
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
        // Rate limit errors are non-fatal — log and continue
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
            // Silent success — don't reveal to user
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
          embedFields = [
            { name: "👤 Name", value: record.name || "N/A", inline: true },
            { name: "📧 Email", value: record.email || "N/A", inline: true },
            { name: "🎬 Project", value: record.project_type || "N/A", inline: true },
            { name: "💰 Budget", value: record.budget || "N/A", inline: true },
            { name: "💬 Message", value: record.message || "No message", inline: false }
          ];
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

    // ---- EMAIL NOTIFICATION via RESEND ----
    try {
      const resendApiKey = Deno.env.get("RESEND_API_KEY")
      const notificationEmail = Deno.env.get("NOTIFICATION_EMAIL")

      if (resendApiKey && notificationEmail) {
        let emailSubject = "";
        let emailHtml = "";

        if (normalizedType === 'lead') {
          emailSubject = `🎯 New Lead: ${record.name || 'Anonymous'}`;
          emailHtml = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width,initial-scale=1">
              <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
            </head>
            <body style="margin:0;padding:0;background-color:#080808;">
            <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#080808">
              <tr>
                <td align="center" style="padding:40px 16px;">
                <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;font-family:ui-sans-serif,'SF Pro Display','Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;">

                  <!-- HEADER -->
                  <tr>
                    <td style="padding-bottom:20px;">
                      <p style="margin:0 0 4px 0;font-family:ui-sans-serif,'SF Pro Display','Inter',-apple-system,sans-serif;font-size:32px;font-weight:900;letter-spacing:1px;color:#ffffff;line-height:1;">ARTIX<span style="color:#8B5CF6;font-weight:900;">.</span></p>
                      <p style="margin:0;font-family:ui-sans-serif,'SF Pro Display','Inter',-apple-system,sans-serif;font-size:10px;font-weight:600;color:#555555;text-transform:uppercase;letter-spacing:5px;">Studio Notification</p>
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
                      <p style="margin:0 0 12px 0;font-family:ui-sans-serif,'SF Pro Display','Inter',-apple-system,sans-serif;font-size:10px;font-weight:700;color:#8B5CF6;text-transform:uppercase;letter-spacing:5px;">New Lead Received</p>
                      <p style="margin:0 0 8px 0;font-family:ui-sans-serif,'SF Pro Display','Inter',-apple-system,sans-serif;font-size:36px;font-weight:800;color:#ffffff;letter-spacing:-1.5px;line-height:1.05;">${record.name || 'Someone'}</p>
                      <p style="margin:0;font-family:ui-sans-serif,'SF Pro Display','Inter',-apple-system,sans-serif;font-size:15px;color:#555555;font-weight:400;letter-spacing:0.2px;">is interested in working with you.</p>
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
                            <span style="font-family:ui-sans-serif,'SF Pro Display','Inter',-apple-system,sans-serif;color:#444444;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:3px;">Name</span>
                          </td>
                          <td bgcolor="#0f0f0f" style="padding:16px;border-bottom:1px solid #1e1e1e;vertical-align:middle;">
                            <span style="font-family:ui-sans-serif,'SF Pro Display','Inter',-apple-system,sans-serif;font-size:14px;color:#ffffff;font-weight:500;letter-spacing:-0.2px;">${record.name || 'N/A'}</span>
                          </td>
                        </tr>

                        <!-- Email -->
                        <tr>
                          <td width="52" bgcolor="#1a1030" style="width:52px;text-align:center;font-size:18px;border-right:1px solid #1e1e1e;border-bottom:1px solid #1e1e1e;padding:16px 0;vertical-align:middle;">✉️</td>
                          <td width="90" bgcolor="#0f0f0f" style="width:90px;padding:16px;border-bottom:1px solid #1e1e1e;vertical-align:middle;">
                            <span style="font-family:ui-sans-serif,'SF Pro Display','Inter',-apple-system,sans-serif;color:#444444;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:3px;">Email</span>
                          </td>
                          <td bgcolor="#0f0f0f" style="padding:16px;border-bottom:1px solid #1e1e1e;vertical-align:middle;">
                            <a href="mailto:${record.email}" style="font-family:ui-sans-serif,'SF Pro Display','Inter',-apple-system,sans-serif;font-size:14px;color:#9D78FA;text-decoration:none;font-weight:500;letter-spacing:-0.2px;">${record.email || 'N/A'}</a>
                          </td>
                        </tr>

                        <!-- Project -->
                        <tr>
                          <td width="52" bgcolor="#1a1030" style="width:52px;text-align:center;font-size:18px;border-right:1px solid #1e1e1e;border-bottom:1px solid #1e1e1e;padding:16px 0;vertical-align:middle;">💼</td>
                          <td width="90" bgcolor="#0f0f0f" style="width:90px;padding:16px;border-bottom:1px solid #1e1e1e;vertical-align:middle;">
                            <span style="font-family:ui-sans-serif,'SF Pro Display','Inter',-apple-system,sans-serif;color:#444444;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:3px;">Project</span>
                          </td>
                          <td bgcolor="#0f0f0f" style="padding:16px;border-bottom:1px solid #1e1e1e;vertical-align:middle;">
                            <span style="font-family:ui-sans-serif,'SF Pro Display','Inter',-apple-system,sans-serif;font-size:14px;color:#ffffff;font-weight:500;letter-spacing:-0.2px;">${record.project_type || 'N/A'}</span>
                          </td>
                        </tr>

                        <!-- Budget -->
                        <tr>
                          <td width="52" bgcolor="#1a1030" style="width:52px;text-align:center;font-size:18px;border-right:1px solid #1e1e1e;border-bottom:1px solid #1e1e1e;padding:16px 0;vertical-align:middle;">💲</td>
                          <td width="90" bgcolor="#0f0f0f" style="width:90px;padding:16px;border-bottom:1px solid #1e1e1e;vertical-align:middle;">
                            <span style="font-family:ui-sans-serif,'SF Pro Display','Inter',-apple-system,sans-serif;color:#444444;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:3px;">Budget</span>
                          </td>
                          <td bgcolor="#0f0f0f" style="padding:16px;border-bottom:1px solid #1e1e1e;vertical-align:middle;">
                            <span style="font-family:ui-sans-serif,'SF Pro Display','Inter',-apple-system,sans-serif;font-size:14px;color:#ffffff;font-weight:500;letter-spacing:-0.2px;">${record.budget || 'N/A'}</span>
                          </td>
                        </tr>

                        <!-- Message -->
                        <tr>
                          <td width="52" bgcolor="#1a1030" style="width:52px;text-align:center;font-size:18px;border-right:1px solid #1e1e1e;padding:16px 0;vertical-align:top;">💬</td>
                          <td width="90" bgcolor="#0f0f0f" style="width:90px;padding:16px;vertical-align:top;">
                            <span style="font-family:ui-sans-serif,'SF Pro Display','Inter',-apple-system,sans-serif;color:#444444;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:3px;">Message</span>
                          </td>
                          <td bgcolor="#0f0f0f" style="padding:16px;vertical-align:top;">
                            <span style="font-family:ui-sans-serif,'SF Pro Display','Inter',-apple-system,sans-serif;font-size:14px;color:#999999;line-height:1.7;letter-spacing:-0.2px;">${record.message || 'No message provided.'}</span>
                          </td>
                        </tr>

                      </table>
                    </td>
                  </tr>

                  <!-- CTA BLOCK -->
                  <tr>
                    <td style="padding-bottom:32px;">
                      <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0b1a" style="border:1px solid #2a1f4a;border-radius:18px;">
                        <tr>
                          <td style="padding:36px 28px;text-align:center;">
                            <p style="margin:0 0 8px 0;font-family:ui-sans-serif,'SF Pro Display','Inter',-apple-system,sans-serif;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.8px;">Ready to respond?</p>
                            <p style="margin:0 0 24px 0;font-family:ui-sans-serif,'SF Pro Display','Inter',-apple-system,sans-serif;font-size:13px;color:#555555;font-weight:400;letter-spacing:0.2px;">Reply directly to this lead</p>
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td align="center">
                                  <a href="mailto:${record.email}" style="display:block;background-color:#7C3AED;color:#ffffff;padding:16px 0;border-radius:12px;text-decoration:none;font-family:ui-sans-serif,'SF Pro Display','Inter',-apple-system,sans-serif;font-size:15px;font-weight:700;letter-spacing:-0.3px;text-align:center;">Reply to ${record.name || 'this lead'}</a>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- FOOTER -->
                  <tr>
                    <td style="border-top:1px solid #1a1a1a;padding-top:24px;text-align:center;">
                      <p style="margin:0 0 6px 0;font-family:ui-sans-serif,'SF Pro Display','Inter',-apple-system,sans-serif;font-size:22px;font-weight:900;letter-spacing:1px;color:#ffffff;line-height:1;">ARTIX<span style="color:#8B5CF6;">.</span></p>
                      <p style="margin:0 0 4px 0;font-family:ui-sans-serif,'SF Pro Display','Inter',-apple-system,sans-serif;font-size:10px;font-weight:600;color:#444444;text-transform:uppercase;letter-spacing:4px;">Premium Cinematic Media Agency</p>
                      <a href="https://artix-media.vercel.app/" style="font-family:ui-sans-serif,'SF Pro Display','Inter',-apple-system,sans-serif;font-size:10px;font-weight:600;color:#444444;text-decoration:none;text-transform:uppercase;letter-spacing:4px;">ARTIXMEDIA.IN</a>
                    </td>
                  </tr>

                </table>
                </td>
              </tr>
            </table>
            </body>
            </html>
          `;


        } else if (normalizedType === 'feedback') {
          emailSubject = `💬 New Feedback: ${record.rating}/5 - ${record.category}`;
          emailHtml = `
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
        }

        const emailPayload = {
          from: "ARTIX MEDIA <onboarding@resend.dev>",
          to: [notificationEmail],
          subject: emailSubject,
          html: emailHtml
        }

        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(emailPayload)
        })

        if (!emailRes.ok) {
          warnings.push("email_failed")
          await sendSystemError(`Resend API failed with status ${emailRes.status}`);
        }
      } else {
        warnings.push("email_env_missing")
        await sendSystemError(`RESEND_API_KEY or NOTIFICATION_EMAIL missing in environment variables.`);
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
