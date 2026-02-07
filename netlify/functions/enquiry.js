import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function handler(event) {
  try {
    const data = JSON.parse(event.body);

    const { name, email, message } = data;

    await resend.emails.send({
      from: "AI Smart Hub <noreply@aismarthub.biz>",
      to: ["info@aismarthub.biz"], // change later if needed
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
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    console.error("Enquiry error:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to send email" })
    };
  }
}

