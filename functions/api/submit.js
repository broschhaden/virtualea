export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const formData = await request.formData();
    const data = Object.fromEntries(formData.entries());

    // 1. Send the notification email TO YOU (This part stays active)
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

    /* -----------------------------------------------------------
       PHASE 2: AUTO-REPLY (COMMENTED OUT UNTIL DOMAIN IS VERIFIED)
       -----------------------------------------------------------
    const autoReply = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Birgit Rosch Haden <onboarding@resend.dev>',
        to: data.email, 
        subject: 'Thank you for reaching out!',
        html: `
          <h1>Hello ${data.first_name},</h1>
          <p>Thank you for contacting me. I have received your inquiry regarding <strong>${data.support_needed}</strong>.</p>
          <p>I typically respond within 24 hours. I look forward to connecting soon!</p>
          <p>Best regards,<br>Birgit Rosch Haden</p>
        `,
      }),
    });
    ----------------------------------------------------------- */

    // Since Auto-Reply is off, we only check if the adminEmail was successful
    if (adminEmail.ok) {
      return new Response(null, {
        status: 302,
        headers: { 'Location': '/contact.html?success=true' },
      });
    } else {
      const errorText = await adminEmail.text();
      return new Response("Resend Error: " + errorText, { status: 500 });
    }
  } catch (err) {
    return new Response("Server Error: " + err.message, { status: 500 });
  }
}
