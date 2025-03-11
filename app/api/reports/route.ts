import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"
import { getSupportEmail } from "@/lib/email"
import { Resend } from "resend"

const reportSchema = z.object({
  listingId: z.string(),
  reason: z.string(),
  details: z.string().min(10, "Please provide more details"),
})

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to report a listing" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const result = reportSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const { listingId, reason, details } = result.data

    // Check if listing exists
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    })

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      )
    }

    // Create report
    const report = await prisma.report.create({
      data: {
        reason,
        details,
        reporterId: session.user.id,
        listingId,
      },
    })

    // Send email notification to support
    try {
      const supportEmail = getSupportEmail()
      const { data, error } = await resend.emails.send({
        from: "Badger Sublets <notifications@badgersublets.com>",
        to: supportEmail,
        subject: `New Listing Report: ${listing.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #c5050c; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">New Listing Report</h1>
            </div>
            <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none;">
              <h2>Report Details</h2>
              <p><strong>Listing:</strong> ${listing.title}</p>
              <p><strong>Listing URL:</strong> ${process.env.NEXT_PUBLIC_APP_URL}/listings/${listing.id}</p>
              <p><strong>Owner:</strong> ${listing.user.name} (${listing.user.email})</p>
              <p><strong>Reason:</strong> ${reason}</p>
              <p><strong>Details:</strong> ${details}</p>
              <p><strong>Reporter:</strong> ${session.user.email}</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/dashboard" 
                   style="background-color: #c5050c; 
                          color: white; 
                          padding: 12px 24px; 
                          text-decoration: none; 
                          border-radius: 4px; 
                          font-weight: bold;
                          display: inline-block;">
                  View in Admin Dashboard
                </a>
              </div>
            </div>
            <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
              <p>© ${new Date().getFullYear()} Badger Sublets</p>
              <p>A safe way to find subleases in Madison.</p>
              <p>Not affiliated with the University of Wisconsin-Madison.</p>
              <p>For support, contact us at ${supportEmail}</p>
            </div>
          </div>
        `,
      })

      if (error) {
        console.error("Failed to send report notification:", error)
      }
    } catch (error) {
      console.error("Failed to send report notification:", error)
      // Don't fail the request if email fails
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error("Error in report POST handler:", error)
    return NextResponse.json(
      { error: "Failed to submit report. Please try again." },
      { status: 500 }
    )
  }
} 