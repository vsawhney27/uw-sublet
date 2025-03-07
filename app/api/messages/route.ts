import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import prisma from "@/lib/prisma"
import { getCurrentUser, isEmailVerified } from "@/lib/auth"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Validation schema for creating a message
const messageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty"),
  receiverId: z.string().min(1, "Receiver ID is required"),
  listingId: z.string().optional(),
})

// GET all messages for the current user
export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated
    const user = await getCurrentUser(req)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get query parameters
    const searchParams = req.nextUrl.searchParams
    const conversationWith = searchParams.get("conversationWith") || undefined
    const listingId = searchParams.get("listingId") || undefined

    // Build where clause
    let where: any = {
      OR: [{ senderId: user.id }, { receiverId: user.id }],
    }

    if (conversationWith) {
      where = {
        OR: [
          { AND: [{ senderId: user.id }, { receiverId: conversationWith }] },
          { AND: [{ senderId: conversationWith }, { receiverId: user.id }] },
        ],
      }
    }

    if (listingId) {
      where = {
        ...where,
        listingId,
      }
    }

    // Get messages
    const messages = await prisma.message.findMany({
      where,
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
        listing: {
          select: {
            id: true,
            title: true,
            images: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    return NextResponse.json({ messages })
  } catch (error) {
    console.error("Get messages error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

// POST create a new message
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const result = messageSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const { content, receiverId } = result.data

    // Check if receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId }
    })

    if (!receiver) {
      return NextResponse.json({ error: "Receiver not found" }, { status: 404 })
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        content,
        senderId: session.user.id,
        receiverId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

