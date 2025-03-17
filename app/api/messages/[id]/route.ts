import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

// Validation schema for updating a message
const updateMessageSchema = z.object({
  content: z.string().min(1, "Message content cannot be empty"),
})

// GET message by ID
export async function GET(request: NextRequest) {
  try {
    // Extract ID from URL using Next.js conventions
    const id = request.nextUrl.pathname.split("/").pop()

    if (!id) {
      return NextResponse.json(
        { error: "Missing message ID" },
        { status: 400 }
      )
    }

    // Check if user is authenticated
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get message with user info
    const message = await prisma.message.findUnique({
      where: { id },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    if (!message) {
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 }
      )
    }

    // Check if user is sender or receiver
    if (message.senderId !== user.id && message.receiverId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json(message)
  } catch (error) {
    console.error("Get message error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

// PUT update a message
export async function PUT(request: NextRequest) {
  try {
    // Extract ID from URL using Next.js conventions
    const id = request.nextUrl.pathname.split("/").pop()

    if (!id) {
      return NextResponse.json(
        { error: "Missing message ID" },
        { status: 400 }
      )
    }

    // Check if user is authenticated
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get message
    const message = await prisma.message.findUnique({
      where: { id },
      select: { senderId: true },
    })

    if (!message) {
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 }
      )
    }

    // Check if user is sender
    if (message.senderId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()

    // Validate input
    const result = updateMessageSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 })
    }

    const { content } = result.data

    // Update message
    const updatedMessage = await prisma.message.update({
      where: { id },
      data: { content },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json(updatedMessage)
  } catch (error) {
    console.error("Update message error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

// DELETE message by ID
export async function DELETE(request: NextRequest) {
  try {
    // Extract ID from URL using Next.js conventions
    const id = request.nextUrl.pathname.split("/").pop()

    if (!id) {
      return NextResponse.json(
        { error: "Missing message ID" },
        { status: 400 }
      )
    }

    // Check if user is authenticated
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get message
    const message = await prisma.message.findUnique({
      where: { id },
      select: { senderId: true },
    })

    if (!message) {
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 }
      )
    }

    // Check if user is sender
    if (message.senderId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Delete message
    await prisma.message.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete message error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
} 