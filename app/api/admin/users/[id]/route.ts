import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import prisma from "@/lib/prisma"
import { getCurrentUser, isAdmin } from "@/lib/auth"

// Validation schema for updating a user
const updateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  role: z.enum(["USER", "ADMIN"]).optional(),
})

// GET a single user by ID (admin only)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Check if user is authenticated and is an admin
    const user = await getCurrentUser(req)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userIsAdmin = await isAdmin(req)

    if (!userIsAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get user
    const targetUser = await prisma.user.findUnique({
      where: { id },
      include: {
        listings: true,
        _count: {
          select: {
            sentMessages: true,
            receivedMessages: true,
            reports: true,
          },
        },
      },
    })

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = targetUser

    return NextResponse.json({ user: userWithoutPassword })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

// PUT update a user (admin only)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Check if user is authenticated and is an admin
    const user = await getCurrentUser(req)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userIsAdmin = await isAdmin(req)

    if (!userIsAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()

    // Validate input
    const result = updateUserSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 })
    }

    const { name, role } = result.data

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(role && { role }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

// DELETE a user (admin only)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Check if user is authenticated and is an admin
    const user = await getCurrentUser(req)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userIsAdmin = await isAdmin(req)

    if (!userIsAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Delete user
    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Delete user error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

