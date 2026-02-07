import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

export async function handler(event) {
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers
    };
  }

  try {
    const { name, email, message } = JSON.parse(event.body || "{}");

    await resend.emails.send({
      from: "AI Smart Hub <noreply@aismarthub.biz>",
      to: ["demo@aismarthub.biz"],
      subject: "New Chat Enquiry",
      html: `
        <h2>New Enquiry</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong><br/>${message}</p>
      `
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true })
    };
  } catch (err) {
    console.error("Enquiry error:", err);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to send email" })
    };
  }
}
