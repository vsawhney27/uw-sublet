import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all conversations where the user is either sender or receiver
    const conversations = await prisma.$transaction(async (tx) => {
      // Get all unique users the current user has interacted with
      const users = await tx.message.findMany({
        where: {
          OR: [
            { senderId: session.user.id },
            { receiverId: session.user.id }
          ]
        },
        select: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          receiver: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        distinct: ['senderId', 'receiverId']
      })

      // Get unique users from both sender and receiver roles
      const uniqueUsers = new Map()
      users.forEach(msg => {
        const otherUser = msg.sender.id === session.user.id ? msg.receiver : msg.sender
        uniqueUsers.set(otherUser.id, otherUser)
      })

      // For each unique user, get the last message and unread count
      const conversationPromises = Array.from(uniqueUsers.values()).map(async (user) => {
        const lastMessage = await tx.message.findFirst({
          where: {
            OR: [
              { AND: [{ senderId: session.user.id }, { receiverId: user.id }] },
              { AND: [{ senderId: user.id }, { receiverId: session.user.id }] }
            ]
          },
          orderBy: { createdAt: 'desc' }
        })

        const unreadCount = await tx.message.count({
          where: {
            senderId: user.id,
            receiverId: session.user.id,
            read: false
          }
        })

        return {
          otherUser: user,
          lastMessage,
          unreadCount
        }
      })

      return Promise.all(conversationPromises)
    })

    return NextResponse.json(conversations)
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
} 