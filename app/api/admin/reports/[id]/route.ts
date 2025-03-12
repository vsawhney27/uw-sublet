import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import prisma from "@/lib/prisma"
import { getCurrentUser, isAdmin } from "@/lib/auth"

// Validation schema for updating a report
const updateReportSchema = z.object({
  status: z.enum(["PENDING", "RESOLVED", "DISMISSED"]),
})

// GET a single report by ID (admin only)
export async function GET(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params

    // Check if user is authenticated and is an admin
    const user = await getCurrentUser(req as NextRequest)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userIsAdmin = await isAdmin(req as NextRequest)

    if (!userIsAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get report
    const report = await prisma.report.findUnique({
      where: { id },
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
    })

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    return NextResponse.json({ report })
  } catch (error) {
    console.error("Get report error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

// PUT update a report status (admin only)
export async function PUT(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params

    // Check if user is authenticated and is an admin
    const user = await getCurrentUser(req as NextRequest)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userIsAdmin = await isAdmin(req as NextRequest)

    if (!userIsAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()

    // Validate input
    const result = updateReportSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 })
    }

    const { status } = result.data

    // Update report
    const updatedReport = await prisma.report.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json({ report: updatedReport })
  } catch (error) {
    console.error("Update report error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

