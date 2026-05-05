export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const data = await request.formData();

    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const message = String(data.get("message") || "").trim();

    if (!name || !email || !message) {
      return new Response("Missing required fields", { status: 400 });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "Rosch Haden <hello@roschhaden.com>",
        to: ["YOUR-EMAIL-HERE"],
        reply_to: email,
        subject: `New website enquiry from ${name}`,
        html: `
          <h2>New website enquiry</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, "<br>")}</p>
        `
      })
    });

    if (!res.ok) {
      return new Response("Email failed to send", { status: 500 });
    }

    return Response.redirect(new URL("/thank-you.html", request.url), 303);
  } catch (error) {
    return new Response("Something went wrong", { status: 500 });
  }
}
