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

    if (!type || (type !== 'lead' && type !== 'feedback')) {
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

    // ---- DISCORD NOTIFICATIONS ----
    try {
      const webhookUrl = type === 'lead' 
        ? Deno.env.get("LEADS_WEBHOOK_URL") || Deno.env.get("DISCORD_WEBHOOK_URL")
        : Deno.env.get("FEEDBACK_WEBHOOK_URL")

      if (webhookUrl) {
        let embedFields: Record<string, any>[] = [];
        let embedTitle = "";

        if (type === 'lead') {
          embedTitle = "🎯 New Lead — ARTIX MEDIA";
          embedFields = [
            { name: "👤 Name", value: record.name || "N/A", inline: true },
            { name: "📧 Email", value: record.email || "N/A", inline: true },
            { name: "🎬 Project", value: record.project_type || "N/A", inline: true },
            { name: "💰 Budget", value: record.budget || "N/A", inline: true },
            { name: "💬 Message", value: record.message || "No message", inline: false }
          ];
        } else if (type === 'feedback') {
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
        warnings.push(`${type}_webhook_url_missing`)
        await sendSystemError(`${type.toUpperCase()}_WEBHOOK_URL is missing in environment variables.`);
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

        if (type === 'lead') {
          emailSubject = `🎯 New Lead: ${record.name || 'Anonymous'}`;
          emailHtml = `
            <div style="font-family: -apple-system, sans-serif; background: #0B0B0B; color: #fff; padding: 40px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.1);">
              <h1 style="color: #ffffff; margin-top: 0;">ARTIX<span style="color:#8B5CF6;">.</span></h1>
              <h2 style="color: #8B5CF6; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 16px;">New Lead Details</h2>
              <p><strong>Name:</strong> ${record.name || 'N/A'}</p>
              <p><strong>Email:</strong> ${record.email || 'N/A'}</p>
              <p><strong>Project:</strong> ${record.project_type || 'N/A'}</p>
              <p><strong>Budget:</strong> ${record.budget || 'N/A'}</p>
              <div style="background: #121212; padding: 20px; border-radius: 8px; margin-top: 20px;">
                <p style="margin: 0; color: #ccc;">${record.message || 'No message'}</p>
              </div>
            </div>
          `;
        } else if (type === 'feedback') {
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
