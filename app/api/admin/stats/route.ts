import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser, isAdmin } from "@/lib/auth"

// GET admin dashboard stats
export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated and is an admin
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userIsAdmin = await isAdmin()
    if (!userIsAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get counts
    const [userCount, listingCount, reportCount] = await Promise.all([
      prisma.user.count(),
      prisma.listing.count(),
      prisma.report.count(),
    ])

    // Get recent reports
    const recentReports = await prisma.report.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
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

    return NextResponse.json({
      stats: {
        userCount,
        listingCount,
        reportCount,
      },
      recentReports,
    })
  } catch (error) {
    console.error("Get stats error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
} 