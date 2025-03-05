import { Resend } from 'resend';

// Initialize Resend with API key
console.log("Initializing Resend with API key:", process.env.RESEND_API_KEY ? "Present" : "Missing")
const resend = new Resend(process.env.RESEND_API_KEY)

type EmailData = {
  to: string
  subject: string
  text: string
  html: string
}

export async function sendEmail({ to, subject, text, html }: EmailData) {
  console.log("Preparing to send email to:", to)
  console.log("Using sender email:", process.env.EMAIL_FROM)
  
  try {
    console.log("Sending email via Resend...")
    const response = await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to,
      subject,
      text,
      html,
    })
    console.log("Resend response:", response)
    
    if (response.error) {
      console.error("Resend returned an error:", response.error)
      return { success: false, error: response.error }
    }
    
    return { success: true, data: response }
  } catch (error: any) {
    console.error("Error sending email:", error)
    return { success: false, error }
  }
}

export async function sendVerificationEmail(email: string, token: string) {
  console.log("Preparing verification email for:", email)
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`
  console.log("Verification URL:", verificationUrl)

  return sendEmail({
    to: email,
    subject: "Verify your email for BadgerSublets",
    text: `Please verify your email by clicking on the following link: ${verificationUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #c5050c; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">BadgerSublets</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none;">
          <h2>Verify Your Email</h2>
          <p>Thank you for signing up for BadgerSublets! Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #c5050c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email</a>
          </div>
          <p>If you didn't create an account on BadgerSublets, you can safely ignore this email.</p>
          <p>This link will expire in 24 hours.</p>
        </div>
        <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
          <p>© ${new Date().getFullYear()} BadgerSublets. Not affiliated with the University of Wisconsin-Madison.</p>
        </div>
      </div>
    `,
  })
}

