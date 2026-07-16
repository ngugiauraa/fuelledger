import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  const { driverName, driverEmail, companyName, companySlug } = await request.json()

  try {
    await resend.emails.send({
      from: 'FuelLedger <onboarding@resend.dev>',
      to: driverEmail,
      subject: `You've been added as a driver at ${companyName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
          <h2>Welcome to FuelLedger, ${driverName}! 🚛</h2>
          <p>${companyName} has added you as a driver on FuelLedger.</p>
          <p>You can access your driver portal here:</p>
          <a href="https://project-7tqdo-navy.vercel.app/${companySlug}/driver" 
             style="background: #22c55e; color: black; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block; margin: 16px 0;">
            Open Driver Portal →
          </a>
          <p style="color: #666; font-size: 14px;">Sign in with this email address to access your trips.</p>
        </div>
      `,
    })

    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}