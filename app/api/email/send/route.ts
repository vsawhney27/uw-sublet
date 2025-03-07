import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { to, subject, message, listingTitle } = await req.json()

    const emailResponse = await resend.emails.send({
      from: "Badger Sublets <notifications@badgersublets.com>",
      to: [to],
      subject: subject,
      html: `
        <div>
          <h2>New Message about "${listingTitle}"</h2>
          <p>From: ${session.user.name || session.user.email}</p>
          <p>Email: ${session.user.email}</p>
          <br/>
          <p>${message}</p>
          <br/>
          <hr/>
          <p style="color: #666; font-size: 12px;">
            This email was sent through Badger Sublets. Please do not reply to this email directly.
            Instead, contact the sender at their email address above.
          </p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Email send error:", error)
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    )
  }
} 