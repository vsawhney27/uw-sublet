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
    console.log("Session data:", {
      user: session?.user,
      email: session?.user?.email,
      id: session?.user?.id
    })

    if (!session?.user?.email) {
      console.error("No user email found in session")
      return NextResponse.json({ error: "User not found in session" }, { status: 401 })
    }

    const body = await req.json()
    console.log("Received message request:", { 
      content: body.content,
      receiverId: body.receiverId,
      listingId: body.listingId,
      senderEmail: session.user.email 
    })

    const result = messageSchema.safeParse(body)

    if (!result.success) {
      console.error("Validation error:", result.error)
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const { content, receiverId, listingId } = result.data

    // Get sender by email
    const sender = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!sender) {
      console.error("Sender not found:", session.user.email)
      return NextResponse.json({ error: "Sender not found" }, { status: 404 })
    }

    // Check if receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId }
    })

    if (!receiver) {
      console.error("Receiver not found:", receiverId)
      return NextResponse.json({ error: "Receiver not found" }, { status: 404 })
    }

    // Check if listing exists if listingId is provided
    if (listingId) {
      const listing = await prisma.listing.findUnique({
        where: { id: listingId }
      })
      
      if (!listing) {
        console.error("Listing not found:", listingId)
        return NextResponse.json({ error: "Listing not found" }, { status: 404 })
      }
    }

    // Create message
    try {
      console.log("Attempting to create message with data:", {
        content,
        senderId: sender.id,
        receiverId,
        listingId
      })

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
            }
          }
        }
      })

      console.log("Message created successfully:", message)
      return NextResponse.json(message)
    } catch (dbError) {
      console.error("Database error creating message:", dbError)
      if (dbError instanceof Error) {
        return NextResponse.json({ 
          error: "Failed to create message in database",
          details: dbError.message 
        }, { status: 500 })
      }
      return NextResponse.json({ error: "Failed to create message in database" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in message POST handler:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

