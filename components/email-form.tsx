"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface EmailFormProps {
  receiverEmail?: string
  listingTitle?: string
  isSupport?: boolean
}

export function EmailForm({ receiverEmail, listingTitle, isSupport = false }: EmailFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    setIsSending(true)
    try {
      const response = await fetch("/api/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: receiverEmail,
          subject: isSupport ? "Support Request" : `Question about your listing: ${listingTitle}`,
          message: message,
          listingTitle,
          isSupport
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to send email")
      }

      setMessage("")
      setShowSuccess(true)
      toast({
        title: "Email sent",
        description: isSupport 
          ? "Your support request has been sent. We'll get back to you soon."
          : "Your email has been sent successfully",
      })
      
      // Redirect to homepage if it's a support email
      if (isSupport) {
        setTimeout(() => {
          router.push("/")
        }, 1500)
      } else {
        setTimeout(() => {
          setShowSuccess(false)
        }, 2000)
      }
    } catch (error) {
      console.error("Failed to send email:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send email",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={isSupport 
          ? "Describe your issue or question..." 
          : "Write your message..."}
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
              {isSending ? "Sending..." : isSupport ? "Send Support Request" : "Send Email"}
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