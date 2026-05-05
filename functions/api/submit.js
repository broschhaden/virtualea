export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const formData = await request.formData();
    const data = Object.fromEntries(formData.entries());

    const firstName = String(data.first_name || "").trim();
    const lastName = String(data.last_name || "").trim();
    const email = String(data.email || "").trim();
    const message = String(data.message || "").trim();
    const supportNeeded = String(data.support_needed || "Not specified").trim();

    if (!firstName || !email || !message) {
      return new Response("Missing required fields", { status: 400 });
    }

    const adminEmail = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Rosch Haden <onboarding@resend.dev>",
        to: ["broschhaden@outlook.com"],
        reply_to: email,
        subject: `New website enquiry: ${firstName} ${lastName}`,
        html: `
  <h2>New website enquiry</h2>
  <p><strong>Name:</strong> ${firstName} ${lastName}</p>
  <p><strong>Email:</strong> ${email}</p>
  <p><strong>Phone:</strong> ${data.phone || "Not provided"}</p>
  <p><strong>Company:</strong> ${data.company || "Not provided"}</p>
  <p><strong>Heard about:</strong> ${data.hear_about || "Not provided"}</p>
  <p><strong>Hours needed:</strong> ${data.hours_required || "Not provided"}</p>
  <p><strong>Support needed:</strong></p>
  <p>${supportNeeded.replace(/\n/g, "<br>")}</p>
  <p><strong>Message:</strong></p>
  <p>${message.replace(/\n/g, "<br>")}</p>
        `,
      }),
    });

    if (!adminEmail.ok) {
      const errorText = await adminEmail.text();
      return new Response("Resend Error: " + errorText, { status: 500 });
    }

    return Response.redirect(new URL("/thank-you.html", request.url), 303);
  } catch (err) {
    return new Response("Server Error: " + err.message, { status: 500 });
  }
}
