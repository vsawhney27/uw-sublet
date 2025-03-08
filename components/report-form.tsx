"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { AlertCircle, Loader2 } from "lucide-react"

interface ReportFormProps {
  listingId: string
  onSuccess?: () => void
}

const REPORT_REASONS = [
  "Fraudulent listing",
  "Inappropriate content",
  "Misleading information",
  "Duplicate listing",
  "Not a UW student",
  "Other",
]

export function ReportForm({ listingId, onSuccess }: ReportFormProps) {
  const [reason, setReason] = useState<string>("")
  const [details, setDetails] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!reason) {
      setError("Please select a reason")
      return
    }

    if (!details.trim() || details.length < 10) {
      setError("Please provide more details about the issue")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason,
          details,
          listingId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit report")
      }

      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        <Label>Reason for reporting</Label>
        <RadioGroup value={reason} onValueChange={setReason}>
          {REPORT_REASONS.map((reportReason) => (
            <div key={reportReason} className="flex items-center space-x-2">
              <RadioGroupItem value={reportReason} id={`reason-${reportReason}`} />
              <Label htmlFor={`reason-${reportReason}`}>{reportReason}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="details">Details</Label>
        <Textarea
          id="details"
          placeholder="Please provide more information about the issue..."
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          className="min-h-[120px]"
          disabled={isLoading}
        />
      </div>

      <Button type="submit" className="w-full bg-red-700 hover:bg-red-800" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Report"
        )}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        Thank you for helping keep Badger Sublets safe. We'll review your report as soon as possible.
      </p>
    </form>
  )
}

