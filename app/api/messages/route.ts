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
    // Get session and validate user
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      console.error("No authenticated user found")
      return NextResponse.json({ error: "You must be logged in to send messages" }, { status: 401 })
    }

    // Parse and validate request body
    const body = await req.json()
    const result = messageSchema.safeParse(body)

    if (!result.success) {
      const errorMessage = result.error.errors[0].message
      console.error("Message validation error:", errorMessage)
      return NextResponse.json({ error: errorMessage }, { status: 400 })
    }

    const { content, receiverId, listingId } = result.data

    // Get sender
    const sender = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
      }
    })

    if (!sender) {
      console.error("Sender not found:", session.user.email)
      return NextResponse.json({ error: "User account not found" }, { status: 404 })
    }

    if (!sender.emailVerified) {
      console.error("Sender email not verified:", session.user.email)
      return NextResponse.json({ error: "Please verify your email before sending messages" }, { status: 403 })
    }

    // Check if receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      select: { id: true, email: true }
    })

    if (!receiver) {
      console.error("Receiver not found:", receiverId)
      return NextResponse.json({ error: "Recipient not found" }, { status: 404 })
    }

    // Check if listing exists if listingId is provided
    if (listingId) {
      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
        select: { id: true }
      })
      
      if (!listing) {
        console.error("Listing not found:", listingId)
        return NextResponse.json({ error: "Listing not found" }, { status: 404 })
      }
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        content,
        senderId: sender.id,
        receiverId,
        listingId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        }
      }
    })

    console.log("Message sent successfully:", {
      messageId: message.id,
      sender: message.sender.email,
      receiver: message.receiver.email,
      listingId
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error("Error in message POST handler:", error)
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 500 }
    )
  }
}

