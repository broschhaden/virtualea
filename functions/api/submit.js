export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const formData = await request.formData();
    const data = Object.fromEntries(formData.entries());

    // 1. Send the notification email TO YOU
    const adminEmail = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Contact Form <onboarding@resend.dev>',
        to: 'broschhaden@outlook.com',
        subject: `New Lead: ${data.first_name} ${data.last_name}`,
        html: `<p><strong>Name:</strong> ${data.first_name} ${data.last_name}</p>
               <p><strong>Email:</strong> ${data.email}</p>
               <p><strong>Message:</strong> ${data.message}</p>`,
      }),
    });

    // 2. Send the AUTO-REPLY to the USER
    const autoReply = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Birgit Rosch Haden <onboarding@resend.dev>',
        to: data.email, // Sends to the email the user typed in the form
        subject: 'Thank you for reaching out!',
        html: `
          <h1>Hello ${data.first_name},</h1>
          <p>Thank you for contacting me. I have received your inquiry regarding <strong>${data.support_needed}</strong>.</p>
          <p>I typically respond within 24 hours. I look forward to connecting soon!</p>
          <p>Best regards,<br>Birgit Rosch Haden</p>
        `,
      }),
    });

    if (adminEmail.ok && autoReply.ok) {
      return new Response(null, {
        status: 302,
        headers: { 'Location': '/contact.html?success=true' },
      });
    } else {
      return new Response("Error sending emails", { status: 500 });
    }
  } catch (err) {
    return new Response("Server Error: " + err.message, { status: 500 });
  }
}
