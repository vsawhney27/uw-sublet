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
  console.log("=== Email Sending Debug ===")
  console.log("To:", to)
  console.log("Subject:", subject)
  console.log("RESEND_API_KEY exists:", !!process.env.RESEND_API_KEY)
  console.log("EMAIL_FROM:", process.env.EMAIL_FROM)
  
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured")
    }
    if (!process.env.EMAIL_FROM) {
      throw new Error("EMAIL_FROM is not configured")
    }

    console.log("Attempting to send email via Resend...")
    const response = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
      html,
    })
    console.log("Resend API Response:", response)
    
    if (response.error) {
      console.error("Resend API Error:", response.error)
      return { success: false, error: response.error }
    }
    
    return { success: true, data: response }
  } catch (error: any) {
    console.error("Email Sending Error:", error)
    console.error("Error details:", {
      message: error.message,
      stack: error.stack
    })
    return { success: false, error }
  }
}

export async function sendVerificationEmail(email: string, token: string) {
  console.log("=== Verification Email Debug ===")
  console.log("Sending verification email to:", email)
  console.log("Token:", token)
  console.log("APP_URL:", process.env.NEXT_PUBLIC_APP_URL)

  if (!process.env.NEXT_PUBLIC_APP_URL) {
    console.error("NEXT_PUBLIC_APP_URL is not configured")
    return { success: false, error: "APP_URL not configured" }
  }

  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`
  console.log("Generated verification URL:", verificationUrl)

  return sendEmail({
    to: email,
    subject: "Verify your BadgerSublets Account",
    text: `Please verify your email by clicking this link: ${verificationUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #c5050c; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Welcome to BadgerSublets</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none;">
          <h2>One Last Step!</h2>
          <p>Thanks for signing up for BadgerSublets. To start browsing and posting sublets, please verify your email address.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #c5050c; 
                      color: white; 
                      padding: 12px 24px; 
                      text-decoration: none; 
                      border-radius: 4px; 
                      font-weight: bold;
                      display: inline-block;">
              Verify My Email
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">This link will expire in 24 hours for security reasons.</p>
          <p style="color: #666; font-size: 14px;">If you didn't create an account, you can safely ignore this email.</p>
        </div>
        <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
          <p>© ${new Date().getFullYear()} BadgerSublets</p>
          <p>A safe way to find subleases in Madison.</p>
          <p>Not affiliated with the University of Wisconsin-Madison.</p>
        </div>
      </div>
    `,
  })
}

