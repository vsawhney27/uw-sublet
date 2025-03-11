"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

interface MessageFormProps {
  receiverId: string
  listingId?: string
  placeholder?: string
}

export function MessageForm({ receiverId, listingId, placeholder = "Write your message..." }: MessageFormProps) {
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Debug session status
  useEffect(() => {
    console.log("Session status:", status)
    console.log("Session data:", session)
  }, [session, status])

  const sendMessage = async (content: string): Promise<void> => {
    if (!session?.user) {
      throw new Error("You must be logged in to send messages")
    }

    const response = await fetch("/api/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content,
        receiverId,
        listingId,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to send message")
    }

    return Promise.resolve()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    if (!session?.user) {
      toast({
        title: "Not logged in",
        description: "You must be logged in to send messages",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)
    try {
      await sendMessage(message)
      setMessage("")
      setShowSuccess(true)
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully",
      })
      setTimeout(() => {
        setShowSuccess(false)
      }, 2000)
    } catch (error) {
      console.error("Failed to send message:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  // Show loading state while checking session
  if (status === "loading") {
    return (
      <div className="p-4 text-center bg-gray-100 rounded-lg">
        <p>Loading...</p>
      </div>
    )
  }

  // Show login message if not authenticated
  if (status === "unauthenticated" || !session?.user) {
    return (
      <div className="p-4 text-center bg-gray-100 rounded-lg">
        <p>Please log in to send messages</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={placeholder}
        className="min-h-[100px]"
        disabled={isSending}
      />
      <div className="relative h-12">
        <Button
          type="submit"
          disabled={!message.trim() || isSending}
          className={cn(
            "w-full h-full absolute inset-0 transition-all duration-300 ease-in-out",
            showSuccess ? "bg-green-600 hover:bg-green-700" : "bg-red-700 hover:bg-red-800"
          )}
        >
          <div className="relative w-full h-full overflow-hidden">
            <div 
              className={cn(
                "absolute inset-0 flex items-center justify-center transition-all transform duration-300 ease-in-out",
                showSuccess ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"
              )}
            >
              {isSending ? "Sending..." : "Send Message"}
            </div>
            <div 
              className={cn(
                "absolute inset-0 flex items-center justify-center transition-all transform duration-300 ease-in-out",
                showSuccess ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
              )}
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Sent!
            </div>
          </div>
        </Button>
      </div>
    </form>
  )
}

