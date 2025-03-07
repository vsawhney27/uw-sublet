"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Send } from "lucide-react"

interface Message {
  id: string
  content: string
  senderId: string
  receiverId: string
  createdAt: Date
  sender: {
    name: string | null
    email: string
  }
}

interface Conversation {
  otherUser: {
    id: string
    name: string | null
    email: string
  }
  lastMessage: Message | null
  unreadCount: number
}

export default function MessagesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch("/api/messages/conversations")
        const data = await response.json()
        setConversations(data)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching conversations:", error)
      }
    }

    if (session?.user) {
      fetchConversations()
    }
  }, [session])

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation) return

      try {
        const response = await fetch(`/api/messages/${selectedConversation.otherUser.id}`)
        const data = await response.json()
        setMessages(data)
      } catch (error) {
        console.error("Error fetching messages:", error)
      }
    }

    fetchMessages()
  }, [selectedConversation])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation) return

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newMessage,
          receiverId: selectedConversation.otherUser.id,
        }),
      })

      if (response.ok) {
        const message = await response.json()
        setMessages((prev) => [...prev, message])
        setNewMessage("")
        
        // Update conversation list
        setConversations((prev) =>
          prev.map((conv) =>
            conv.otherUser.id === selectedConversation.otherUser.id
              ? { ...conv, lastMessage: message }
              : conv
          )
        )
      }
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Conversations List */}
        <Card className="p-4 md:col-span-1 h-[calc(100vh-12rem)] overflow-y-auto">
          <h2 className="font-semibold mb-4">Conversations</h2>
          <div className="space-y-2">
            {conversations.map((conversation) => (
              <div
                key={conversation.otherUser.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedConversation?.otherUser.id === conversation.otherUser.id
                    ? "bg-red-50"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => setSelectedConversation(conversation)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">
                      {conversation.otherUser.name || conversation.otherUser.email.split("@")[0]}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {conversation.lastMessage?.content || "No messages yet"}
                    </p>
                  </div>
                  {conversation.unreadCount > 0 && (
                    <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {conversations.length === 0 && (
              <p className="text-gray-500 text-center py-4">No conversations yet</p>
            )}
          </div>
        </Card>

        {/* Messages */}
        <Card className="p-4 md:col-span-2 h-[calc(100vh-12rem)] flex flex-col">
          {selectedConversation ? (
            <>
              <div className="border-b pb-4 mb-4">
                <h2 className="font-semibold">
                  {selectedConversation.otherUser.name ||
                    selectedConversation.otherUser.email.split("@")[0]}
                </h2>
                <p className="text-sm text-gray-500">{selectedConversation.otherUser.email}</p>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.senderId === session?.user?.id ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        message.senderId === session?.user?.id
                          ? "bg-red-600 text-white"
                          : "bg-gray-100"
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                {messages.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No messages yet</p>
                )}
              </div>

              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button type="submit" className="bg-red-600 hover:bg-red-700">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a conversation to start messaging
            </div>
          )}
        </Card>
      </div>
    </div>
  )
} 