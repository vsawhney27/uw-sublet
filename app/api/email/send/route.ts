import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Resend } from "resend"
import { getSupportEmail } from "@/lib/email"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { to, subject, message, listingTitle, isSupport } = await req.json()

    // If it's a support inquiry, send to support email
    const recipientEmail = isSupport ? getSupportEmail() : to

    const emailResponse = await resend.emails.send({
      from: "Badger Sublets <support@badgersublets.com>",
      to: [recipientEmail],
      subject: isSupport ? `Support Inquiry: ${subject}` : subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #c5050c; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">${isSupport ? 'Support Inquiry' : `Message about "${listingTitle}"`}</h1>
          </div>
          <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none;">
            <p><strong>From:</strong> ${session.user.name || session.user.email}</p>
            <p><strong>Email:</strong> ${session.user.email}</p>
            ${listingTitle ? `<p><strong>Listing:</strong> ${listingTitle}</p>` : ''}
            <br/>
            <p>${message}</p>
            <br/>
            <hr/>
            <p style="color: #666; font-size: 12px;">
              ${isSupport 
                ? 'This is a support inquiry sent through Badger Sublets.' 
                : 'This email was sent through Badger Sublets. Please do not reply to this email directly. Instead, contact the sender at their email address above.'}
            </p>
          </div>
        </div>
      `,
      replyTo: session.user.email,
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