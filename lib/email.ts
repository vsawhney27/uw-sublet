import { Resend } from 'resend'

// Setup Resend client
const resend = new Resend(process.env.RESEND_API_KEY)

// Core email settings
const EMAIL_CONFIG = {
  from: "Badger Sublets <notifications@badgersublets.com>",
  support: "badgersublets@gmail.com",
  testMode: process.env.NODE_ENV === 'development',
  allowedTestEmails: [
    'badgersublets@gmail.com',
    'vsawhney@wisc.edu'
  ]
}

// Get support email address
export function getSupportEmail() {
  return EMAIL_CONFIG.support
}

// Map email addresses to actual recipients
export function getActualEmail(email: string): string {
  if (email.endsWith('@badgersublets.com')) {
    return EMAIL_CONFIG.support;
  }
  return email;
}

// Send an email with proper error handling
async function sendEmail({ to, subject, text, html }: { to: string, subject: string, text: string, html: string }) {
  // Log instead of sending in test mode
  if (EMAIL_CONFIG.testMode) {
    const actualRecipient = getActualEmail(to)
    if (!EMAIL_CONFIG.allowedTestEmails.includes(actualRecipient)) {
      console.log('Test mode: Email would have been sent:', {
        to: actualRecipient,
        subject,
        text
      })
      return { 
        success: true, 
        data: { id: 'test_' + Date.now() } 
      }
    }
  }

  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured")
    }

    const actualRecipient = getActualEmail(to)
    const { data, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: actualRecipient,
      subject,
      text,
      html,
    })

    if (error) {
      console.error("Email error:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Email sending error:", error)
    return { success: false, error }
  }
}

export { sendEmail }

// Send verification email to new users
export async function sendVerificationEmail(email: string, token: string) {
  if (!process.env.NEXT_PUBLIC_APP_URL) {
    console.error("NEXT_PUBLIC_APP_URL is not configured")
    return { success: false, error: "APP_URL not configured" }
  }

  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`
  
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
      </div>
    `,
  })
}

// Send password reset email
export async function sendPasswordResetEmail(email: string, token: string) {
  if (!process.env.NEXT_PUBLIC_APP_URL) {
    console.error("NEXT_PUBLIC_APP_URL is not configured")
    return { success: false, error: "APP_URL not configured" }
  }

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`

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
      </div>
    `,
  })
}

