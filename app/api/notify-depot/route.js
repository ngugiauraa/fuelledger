import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

const resend = new Resend(process.env.RESEND_API_KEY)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(request) {
  const { tripId, depotEmail, depotName, driverName, truckId, litresLoaded, companyName } = await request.json()

  const token = randomUUID()

  await supabase
    .from('trips')
    .update({ confirm_token: token })
    .eq('id', tripId)

  const confirmUrl = `${process.env.NEXT_PUBLIC_APP_URL}/confirm/${token}`

  try {
    await resend.emails.send({
      from: 'FuelLedger <onboarding@resend.dev>',
      to: depotEmail,
      subject: `Fuel delivery from ${companyName} has arrived — please confirm`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
          <h2>⛽ Delivery Arrived at ${depotName}</h2>
          <p>A fuel delivery from <strong>${companyName}</strong> has arrived and is waiting for your confirmation.</p>
          <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p><strong>Driver:</strong> ${driverName}</p>
            <p><strong>Truck:</strong> ${truckId}</p>
            <p><strong>Litres loaded at source:</strong> ${litresLoaded.toLocaleString()} L</p>
          </div>
          <p>Please click the button below to confirm how many litres you actually received:</p>
          <a href="${confirmUrl}"
             style="background: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block; margin: 16px 0;">
            Confirm Litres Received →
          </a>
          <p style="color: #666; font-size: 12px;">This link expires after use. Do not share it.</p>
        </div>
      `,
    })

    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}