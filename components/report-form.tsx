"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

interface ReportFormProps {
  listingId: string
  onSuccess?: () => void
}

const REPORT_REASONS = [
  "Inappropriate content",
  "Spam or misleading",
  "Incorrect information",
  "Scam or fraud",
  "Other",
] as const

export function ReportForm({ listingId, onSuccess }: ReportFormProps) {
  const { toast } = useToast()
  const [reason, setReason] = useState<string>("")
  const [details, setDetails] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason || !details.trim()) {
      toast({
        title: "Error",
        description: "Please select a reason and provide details",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listingId,
          reason,
          details,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to submit report")
      }

      toast({
        title: "Report submitted",
        description: "Thank you for helping keep our community safe",
      })

      onSuccess?.()
    } catch (error) {
      console.error("Failed to submit report:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit report",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="reason">Reason for reporting</Label>
        <Select value={reason} onValueChange={setReason}>
          <SelectTrigger>
            <SelectValue placeholder="Select a reason" />
          </SelectTrigger>
          <SelectContent>
            {REPORT_REASONS.map((reason) => (
              <SelectItem key={reason} value={reason}>
                {reason}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="details">Additional details</Label>
        <Textarea
          id="details"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Please provide more information about your report..."
          className="min-h-[100px]"
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || !reason || !details.trim()}
        className="w-full bg-red-700 hover:bg-red-800"
      >
        {isSubmitting ? "Submitting..." : "Submit Report"}
      </Button>
    </form>
  )
}

