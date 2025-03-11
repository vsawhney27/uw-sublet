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
    console.log("Form submission started")
    
    // Enhanced validation
    if (!reason) {
      console.log("Validation failed: No reason selected")
      toast({
        title: "Error",
        description: "Please select a reason for reporting",
        variant: "destructive",
      })
      return
    }

    if (!details.trim() || details.trim().length < 10) {
      console.log("Validation failed: Details too short")
      toast({
        title: "Error",
        description: "Please provide at least 10 characters of details",
        variant: "destructive",
      })
      return
    }

    console.log("Validation passed, submitting report...")
    setIsSubmitting(true)
    try {
      console.log("Making API request with data:", {
        listingId,
        reason,
        details: details.trim(),
      })
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listingId,
          reason,
          details: details.trim(),
        }),
      })

      const data = await response.json()
      console.log("API response:", { status: response.status, data })

      if (!response.ok) {
        if (data.error === "You must be logged in to report a listing") {
          console.log("Authentication error")
          toast({
            title: "Authentication Required",
            description: "Please log in to report a listing",
            variant: "destructive",
          })
          return
        }
        throw new Error(data.error || "Failed to submit report. Please try again.")
      }

      console.log("Report submitted successfully")
      toast({
        title: "Report submitted",
        description: "Thank you for helping keep our community safe. An administrator will review your report.",
      })

      // Reset form
      setReason("")
      setDetails("")
      onSuccess?.()
    } catch (error) {
      console.error("Failed to submit report:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit report. Please try again later.",
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
          <SelectTrigger id="reason">
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
          placeholder="Please provide specific details about your report (minimum 10 characters)..."
          className="min-h-[100px]"
          required
          minLength={10}
        />
      </div>

      <Button 
        type="submit" 
        className="w-full bg-red-700 hover:bg-red-800" 
        disabled={isSubmitting || !reason || !details.trim()}
      >
        {isSubmitting ? "Submitting..." : "Submit Report"}
      </Button>
    </form>
  )
}

