import { NextResponse } from 'next/server'
import twilio from 'twilio'

export async function POST(request: Request) {
  const { to, body, accountSid, authToken, twilioPhoneNumber } = await request.json()

  if (!to || !body || !accountSid || !authToken || !twilioPhoneNumber) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
  }

  const client = twilio(accountSid, authToken)

  try {
    const message = await client.messages.create({
      body: body,
      from: `whatsapp:${twilioPhoneNumber}`,
      to: `whatsapp:${to}`
    })

    return NextResponse.json({ success: true, messageSid: message.sid })
  } catch (error) {
    console.error('Error sending WhatsApp message:', error)
    return NextResponse.json({ error: 'Failed to send WhatsApp message' }, { status: 500 })
  }
}

