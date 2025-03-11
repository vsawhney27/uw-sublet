import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    config: {
      resendApiKey: process.env.RESEND_API_KEY ? "present" : "missing",
      emailFrom: process.env.EMAIL_FROM,
      supportEmail: process.env.SUPPORT_EMAIL,
      nodeEnv: process.env.NODE_ENV,
    }
  })
} 