"use client"

import React from 'react'
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { ListingDetail } from "@/components/listing-detail"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [listing, setListing] = useState<any>(null)
  const [saved, setSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [error, setError] = useState("")
  const { id } = React.use(params)

  const handlePublish = async () => {
    if (!session?.user) {
      setError("You must be logged in to publish a listing")
      return
    }

    try {
      setIsPublishing(true)
      setError("")

      const response = await fetch(`/api/listings/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          published: true,
          isDraft: false,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.missingFields) {
          throw new Error(`Please fill in all required fields: ${data.missingFields.join(', ')}`)
        }
        throw new Error(data.error || "Failed to publish listing")
      }

      setListing(data)
      toast({
        title: "Success",
        description: "Listing published successfully!",
      })
      router.refresh()
    } catch (error) {
      console.error("Error publishing listing:", error)
      setError(error instanceof Error ? error.message : "Failed to publish listing")
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to publish listing",
        variant: "destructive",
      })
    } finally {
      setIsPublishing(false)
    }
  }

  const handleSaveAsDraft = async () => {
    if (!session?.user) {
      setError("You must be logged in to save a listing as draft")
      return
    }

    try {
      setIsSaving(true)
      setError("")

      const response = await fetch(`/api/listings/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          published: false,
          isDraft: true,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to save listing as draft")
      }

      setListing(data)
      toast({
        title: "Success",
        description: "Listing saved as draft successfully!",
      })
      router.refresh()
    } catch (error) {
      console.error("Error saving listing as draft:", error)
      setError(error instanceof Error ? error.message : "Failed to save listing as draft")
      toast({
        title: "Error",
        description: "Failed to save listing as draft",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setError("")
        const response = await fetch(`/api/listings/${id}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch listing")
        }

        setListing(data.listing)
        setSaved(data.listing.isSaved)
      } catch (error) {
        console.error("Error fetching listing:", error)
        setError(error instanceof Error ? error.message : "Failed to fetch listing")
        toast({
          title: "Error",
          description: "Failed to load listing. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchListing()
  }, [id, toast])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card>
            <CardContent className="p-6 text-center">
              <h1 className="text-2xl font-bold mb-4">Loading...</h1>
              <p className="text-gray-500 mb-4">Please wait while we load the listing.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card>
            <CardContent className="p-6 text-center">
              <h1 className="text-2xl font-bold mb-4">Listing Not Found</h1>
              <p className="text-gray-500 mb-4">The listing you're looking for doesn't exist or has been removed.</p>
              <Link href="/">
                <Button className="bg-red-700 hover:bg-red-800">
                  Back to Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // If the listing is a draft and the viewer is not the owner, show not available message
  if (listing.isDraft && listing.userId !== session?.user?.id) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card>
            <CardContent className="p-6 text-center">
              <h1 className="text-2xl font-bold mb-4">Listing Not Available</h1>
              <p className="text-gray-500 mb-4">This listing is currently not available for viewing.</p>
              <Link href="/">
                <Button className="bg-red-700 hover:bg-red-800">
                  Back to Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
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
          currentUser={session?.user || null}
        />
      </div>
    </div>
  )
}

