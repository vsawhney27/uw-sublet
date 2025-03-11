import { NextResponse } from "next/server"
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET() {
  console.log('Starting email test...')
  console.log('Using email configuration:', {
    from: process.env.EMAIL_FROM,
    to: process.env.SUPPORT_EMAIL
  })
  
  try {
    console.log('Attempting to send email...')
    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM || "support@badgersublets.com",
      to: process.env.SUPPORT_EMAIL || "badgersublets@gmail.com",
      subject: "Test Email - BadgerSublets Support",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #c5050c; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">BadgerSublets Support Test</h1>
          </div>
          <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none;">
            <h2>Test Email</h2>
            <p>This is a test email to verify that the support email system is working correctly.</p>
            <p>If you received this email at badgersublets@gmail.com, the email forwarding is set up correctly!</p>
            <p>Time sent: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `,
    })

    console.log('Email sent successfully:', data)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error sending test email:', error)
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
} 