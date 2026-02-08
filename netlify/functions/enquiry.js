import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers };
  }

  try {
    const { name, email, phone, message } = JSON.parse(event.body || "{}");

    await resend.emails.send({
      from: "AI Smart Hub <noreply@aismarthub.online>",
      to: ["chat@aismarthub.biz"],
      subject: "Enquiry From Website",
      html: `
        <h2>New Enquiry</h2>
        <p><strong>Name:</strong> ${name || ""}</p>
        <p><strong>Email:</strong> ${email || ""}</p>
        <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
        <p><strong>Message:</strong><br/>${message || ""}</p>
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
      body: JSON.stringify({ ok: false, error: "send_failed" })
    };
  }
}
