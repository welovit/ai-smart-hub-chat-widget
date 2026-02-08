import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// 🔑 ACCOUNT → EMAIL ROUTING
const ACCOUNT_EMAILS = {
  fred_bloggs: "frintonbuzz@gmail.com",
  roofer_demo: "chat@aismarthub.biz"
};

// 🌍 CORS HEADERS
const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

export async function handler(event) {
  // Handle preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers };
  }

  try {
    const data = JSON.parse(event.body || "{}");

    const {
      name,
      email,
      phone,
      message,
      accountId,
      pageUrl,
      timestamp,
      honeypot
    } = data;

    // 🛑 Honeypot spam check
    if (honeypot) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ ok: true })
      };
    }

    // 🧭 Resolve destination email
    const cleanAccountId = (accountId || "").trim();
    const toEmail =
      ACCOUNT_EMAILS[cleanAccountId] || ACCOUNT_EMAILS["roofer_demo"];

    // 🔍 Log routing (for debugging)
    console.log("Routing enquiry", {
      accountId: cleanAccountId,
      toEmail
    });

    // ✉️ Send email
    await resend.emails.send({
      from: "AI Smart Hub <noreply@aismarthub.online>",
      to: toEmail,
      subject: `Enquiry From Website For (${cleanAccountId || "unknown"})`,
      html: `
        <h2>Website Enquiry</h2>
        <p><strong>Name:</strong> ${name || "-"}</p>
        <p><strong>Email:</strong> ${email || "-"}</p>
        <p><strong>Phone:</strong> ${phone || "-"}</p>
        <p><strong>Message:</strong><br>${message || "-"}</p>
        <hr>
        <p><strong>Account ID:</strong> ${cleanAccountId || "none"}</p>
        <p><strong>Page:</strong> ${pageUrl || "-"}</p>
        <p><strong>Time:</strong> ${timestamp || new Date().toISOString()}</p>
      `
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true })
    };
  } catch (err) {
    console.error("Enquiry error:", err);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        ok: false,
        error: "Failed to send enquiry"
      })
    };
  }
}
