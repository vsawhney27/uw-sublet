import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { sendEmail } from "@/lib/email"

// Send email to listing owner
export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get request body
    const body = await req.json()
    const { to, subject, message } = body

    // Validate required fields
    if (!to || !subject || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Send email
    await sendEmail({
      to,
      subject,
      text: message,
      html: message,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Send email error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
} 