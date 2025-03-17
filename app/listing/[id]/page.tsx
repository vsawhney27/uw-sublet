"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ListingDetail } from "@/components/listing-detail"

interface PageProps {
  params: {
    id: string
  }
}

export default function ListingPage({ params }: PageProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [listing, setListing] = useState<any>(null)
  const [error, setError] = useState("")
  const [isPublishing, setIsPublishing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handlePublish = async () => {
    try {
      setIsPublishing(true)
      setError("")

      const response = await fetch(`/api/listings/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          published: true,
          isDraft: false,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to publish listing")
      }

      const data = await response.json()
      setListing(data)
      toast({
        title: "Success",
        description: "Listing published successfully",
      })
    } catch (error) {
      console.error("Publish error:", error)
      setError("Failed to publish listing")
    } finally {
      setIsPublishing(false)
    }
  }

  const handleSaveAsDraft = async () => {
    try {
      setIsSaving(true)
      setError("")

      const response = await fetch(`/api/listings/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          published: false,
          isDraft: true,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save listing as draft")
      }

      const data = await response.json()
      setListing(data)
      toast({
        title: "Success",
        description: "Listing saved as draft",
      })
    } catch (error) {
      console.error("Save as draft error:", error)
      setError("Failed to save listing as draft")
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setError("")
        const response = await fetch(`/api/listings/${params.id}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch listing")
        }

        setListing(data)
      } catch (error) {
        console.error("Fetch error:", error)
        setError("Failed to fetch listing")
        toast({
          title: "Error",
          description: "Failed to fetch listing",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchListing()
  }, [params.id, toast])

  if (isLoading) {
    return (
      <div className="container py-10">
        <div>Loading...</div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="container py-10">
        <div>Listing not found</div>
      </div>
    )
  }

  const currentUser = session?.user ? {
    id: session.user.id,
    name: session.user.name || null,
    email: session.user.email || null,
    image: session.user.image || null,
  } : null

  return (
    <div className="container py-10">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {listing.isDraft && listing.userId === session?.user?.id && (
        <div className="mb-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Draft Listing</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>This listing is currently in draft mode and is only visible to you.</span>
              <Button
                onClick={handlePublish}
                disabled={isPublishing}
                className="ml-4 bg-green-600 hover:bg-green-700"
              >
                {isPublishing ? "Publishing..." : "Publish Listing"}
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {!listing.isDraft && listing.userId === session?.user?.id && (
        <div className="mb-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Published Listing</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>This listing is currently published and visible to everyone.</span>
              <Button
                onClick={handleSaveAsDraft}
                disabled={isSaving}
                variant="outline"
                className="ml-4"
              >
                {isSaving ? "Saving..." : "Save as Draft"}
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}

      <ListingDetail
        listing={listing}
        currentUser={currentUser}
      />
    </div>
  )
}

