import { Resend } from 'resend'

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY)

// Email configuration
const EMAIL_CONFIG = {
  from: process.env.EMAIL_FROM || "BadgerSublets <onboarding@resend.dev>",
  testMode: process.env.NODE_ENV === 'development',
  allowedTestEmails: [
    'veersawhney12345@gmail.com',
    // Add any other test email addresses here
  ]
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
    subject: "Verify your Badger Sublets Account",
    text: `Please verify your email by clicking this link: ${verificationUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #c5050c; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Welcome to Badger Sublets</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none;">
          <h2>One Last Step!</h2>
          <p>Thanks for signing up for Badger Sublets. To start browsing and posting sublets, please verify your email address.</p>
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
          <p>© ${new Date().getFullYear()} Badger Sublets</p>
          <p>A safe way to find subleases in Madison.</p>
          <p>Not affiliated with the University of Wisconsin-Madison.</p>
        </div>
      </div>
    `,
  })
}

export async function sendPasswordResetEmail(email: string, token: string) {
  console.log("=== Password Reset Email Debug ===")
  console.log("Sending reset email to:", email)
  console.log("Token:", token)
  console.log("APP_URL:", process.env.NEXT_PUBLIC_APP_URL)

  if (!process.env.NEXT_PUBLIC_APP_URL) {
    console.error("NEXT_PUBLIC_APP_URL is not configured")
    return { success: false, error: "APP_URL not configured" }
  }

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`
  console.log("Generated reset URL:", resetUrl)

  return sendEmail({
    to: email,
    subject: "Reset Your Badger Sublets Password",
    text: `Reset your password by clicking this link: ${resetUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #c5050c; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Badger Sublets Password Reset</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none;">
          <h2>Reset Your Password</h2>
          <p>We received a request to reset your password. Click the button below to choose a new password.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #c5050c; 
                      color: white; 
                      padding: 12px 24px; 
                      text-decoration: none; 
                      border-radius: 4px; 
                      font-weight: bold;
                      display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">This link will expire in 1 hour for security reasons.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request this reset, you can safely ignore this email.</p>
        </div>
        <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
          <p>© ${new Date().getFullYear()} Badger Sublets</p>
          <p>A safe way to find subleases in Madison.</p>
          <p>Not affiliated with the University of Wisconsin-Madison.</p>
        </div>
      </div>
    `,
  })
}

async function sendEmail({ to, subject, text, html }: { to: string, subject: string, text: string, html: string }) {
  console.log("=== Email Sending Debug ===")
  console.log("To:", to)
  console.log("Subject:", subject)
  console.log("RESEND_API_KEY exists:", !!process.env.RESEND_API_KEY)
  console.log("RESEND_API_KEY length:", process.env.RESEND_API_KEY?.length)
  console.log("Test mode:", EMAIL_CONFIG.testMode)
  console.log("Environment variables:", {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    EMAIL_FROM: process.env.EMAIL_FROM,
  })

  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured")
    }

    // In test mode, only allow emails to specified test addresses
    if (EMAIL_CONFIG.testMode && !EMAIL_CONFIG.allowedTestEmails.includes(to)) {
      console.log("Test mode: Simulating email send to", to)
      return {
        success: true,
        data: {
          id: 'test_' + Date.now(),
          from: EMAIL_CONFIG.from,
          to,
          subject,
          text,
          html,
        }
      }
    }

    console.log("Attempting to send email via Resend...")
    const { data, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to,
      subject,
      text,
      html,
    })

    if (error) {
      console.error("Resend API Error:", JSON.stringify(error, null, 2))
      return { success: false, error }
    }

    console.log("Email sent successfully:", data)
    return { success: true, data }
  } catch (error: any) {
    console.error("Email Sending Error:", error)
    console.error("Error details:", JSON.stringify({
      message: error.message,
      stack: error.stack,
      code: error.code,
      response: error.response
    }, null, 2))
    return { success: false, error }
  }
}

