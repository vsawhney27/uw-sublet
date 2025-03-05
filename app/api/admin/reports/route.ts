import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import prisma from "@/lib/prisma"
import { getCurrentUser, isAdmin, isEmailVerified } from "@/lib/auth"

// Validation schema for creating a report
const reportSchema = z.object({
  reason: z.string().min(1, "Reason is required"),
  details: z.string().min(10, "Please provide more details"),
  listingId: z.string().min(1, "Listing ID is required"),
})

// GET all reports (admin only)
export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated and is an admin
    const user = await getCurrentUser(req)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userIsAdmin = await isAdmin(req)

    if (!userIsAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get query parameters
    const searchParams = req.nextUrl.searchParams
    const status = searchParams.get("status") || undefined

    // Build where clause
    const where: any = {}

    if (status) {
      where.status = status
    }

    // Get reports
    const reports = await prisma.report.findMany({
      where,
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        listing: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ reports })
  } catch (error) {
    console.error("Get reports error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

// POST create a new report
export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated and email is verified
    const user = await getCurrentUser(req)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const isVerified = await isEmailVerified(req)

    if (!isVerified) {
      return NextResponse.json({ error: "Email not verified" }, { status: 403 })
    }

    const body = await req.json()

    // Validate input
    const result = reportSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 })
    }

    const { reason, details, listingId } = result.data

    // Check if listing exists
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    })

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 })
    }

    // Create report
    const report = await prisma.report.create({
      data: {
        reason,
        details,
        reporterId: user.id,
        listingId,
      },
    })

    return NextResponse.json({ report }, { status: 201 })
  } catch (error) {
    console.error("Create report error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

