import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface MessageFormProps {
  receiverId: string
  listingId?: string
  placeholder?: string
}

export function MessageForm({ receiverId, listingId, placeholder = "Write your message..." }: MessageFormProps) {
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    setIsSending(true)
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: message,
          receiverId,
          listingId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      setMessage("")
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000) // Hide success after 2 seconds
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setIsSending(false)
    }
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
            "w-full h-full absolute inset-0 transition-colors duration-300",
            showSuccess ? "bg-green-600 hover:bg-green-700" : "bg-red-700 hover:bg-red-800"
          )}
        >
          <div className="relative w-full h-full overflow-hidden">
            <div 
              className={cn(
                "absolute inset-0 flex items-center justify-center transition-transform duration-300 ease-out",
                showSuccess ? "-translate-y-full" : "translate-y-0"
              )}
            >
              {isSending ? "Sending..." : "Send Message"}
            </div>
            <div 
              className={cn(
                "absolute inset-0 flex items-center justify-center transition-transform duration-300 ease-out",
                showSuccess ? "translate-y-0" : "translate-y-full"
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