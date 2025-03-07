import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getCurrentUser, isAdmin } from "@/lib/auth"

export const dynamic = 'force-dynamic'

// GET all users (admin only)
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
    const search = searchParams.get("search") || undefined
    const verified =
      searchParams.get("verified") === "true" ? true : searchParams.get("verified") === "false" ? false : undefined

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ]
    }

    if (verified !== undefined) {
      where.emailVerified = verified ? { not: null } : null
    }

    // Get users
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            listings: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Get users error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

