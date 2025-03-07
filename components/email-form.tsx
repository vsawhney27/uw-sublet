"use client"

import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"

export interface EmailFormProps {
  recipientEmail: string
  listingTitle: string
}

export function EmailForm({ recipientEmail, listingTitle }: EmailFormProps) {
  const handleEmailClick = () => {
    const subject = encodeURIComponent(`Inquiry about: ${listingTitle}`)
    const body = encodeURIComponent(`Hi,\n\nI'm interested in your listing for "${listingTitle}". Could you please provide more information?\n\nThanks!`)
    window.location.href = `mailto:${recipientEmail}?subject=${subject}&body=${body}`
  }

  return (
    <Button variant="outline" className="w-full" onClick={handleEmailClick}>
      <Mail className="mr-2 h-4 w-4" /> Email
    </Button>
  )
} 