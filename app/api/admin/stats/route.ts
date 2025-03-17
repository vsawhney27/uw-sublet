import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getCurrentUser, isAdmin } from "@/lib/auth"

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

    // Get stats
    const [
      totalUsers,
      verifiedUsers,
      totalListings,
      activeListings,
      pendingReports,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: { emailVerified: { not: null } },
      }),
      prisma.listing.count(),
      prisma.listing.count({
        where: { published: true, isDraft: false },
      }),
      prisma.report.count({
        where: { status: "PENDING" },
      }),
    ])

    return NextResponse.json({
      totalUsers,
      verifiedUsers,
      totalListings,
      activeListings,
      pendingReports,
    })
  } catch (error) {
    console.error("Get stats error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
} 