import { NextResponse } from "next/server"
import { sendEmail } from "@/lib/email"

export async function GET() {
  console.log("Testing email sending...")
  console.log("RESEND_API_KEY present:", !!process.env.RESEND_API_KEY)
  console.log("EMAIL_FROM:", process.env.EMAIL_FROM)
  
  try {
    const result = await sendEmail({
      to: "vsawhney@wisc.edu", // Now we can send to any email since we have a verified domain
      subject: "Test Email from BadgerSublets",
      text: "This is a test email to verify the email sending functionality is working.",
      html: "<h1>Test Email</h1><p>This is a test email to verify the email sending functionality is working.</p>",
    })

    console.log("Email test result:", result)

    if (!result.success) {
      console.error("Failed to send email:", result.error)
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ 
      message: "Test email sent",
      result: result
    })
  } catch (error) {
    console.error("Test email error:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
} 