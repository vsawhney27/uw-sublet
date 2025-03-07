import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    // Get messages between current user and specified user
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { AND: [{ senderId: session.user.id }, { receiverId: id }] },
          { AND: [{ senderId: id }, { receiverId: session.user.id }] }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: "asc"
      }
    })

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        senderId: id,
        receiverId: session.user.id,
        read: false
      },
      data: {
        read: true
      }
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
} 