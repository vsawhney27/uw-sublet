import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

// PUT mark a message as read
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Check if user is authenticated
    const user = await getCurrentUser(req)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the message
    const message = await prisma.message.findUnique({
      where: { id },
    })

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }

    // Check if user is the receiver
    if (message.receiverId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Mark message as read
    const updatedMessage = await prisma.message.update({
      where: { id },
      data: { read: true },
    })

    return NextResponse.json({ message: updatedMessage })
  } catch (error) {
    console.error("Mark message as read error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

// DELETE a message
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Check if user is authenticated
    const user = await getCurrentUser(req)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the message
    const message = await prisma.message.findUnique({
      where: { id },
    })

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }

    // Check if user is the sender
    if (message.senderId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Delete message
    await prisma.message.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Message deleted successfully" })
  } catch (error) {
    console.error("Delete message error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

