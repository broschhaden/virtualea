export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const formData = await request.formData();
    const data = Object.fromEntries(formData.entries());

    // This calls the Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Contact Form <onboarding@resend.dev>',
        to: 'broschhaden@outlook.com',
        subject: `New Lead: ${data.name}`,
        html: `
          <h1>New Contact Form Submission</h1>
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Company:</strong> ${data.company}</p>
          <p><strong>Hours Required:</strong> ${data.hours_required}</p>
          <p><strong>Support Needed:</strong> ${data.support_needed}</p>
          <p><strong>Message:</strong> ${data.message}</p>
        `,
      }),
    });

    if (response.ok) {
      // Redirect to a thank you page or back to contact with success
      return new Response(null, {
        status: 302,
        headers: { 'Location': '/contact.html?success=true' },
      });
    } else {
      const error = await response.text();
      return new Response("Error sending email: " + error, { status: 500 });
    }
  } catch (err) {
    return new Response("Server Error: " + err.message, { status: 500 });
  }
}
