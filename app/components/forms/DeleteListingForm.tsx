"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface DeleteListingFormProps {
  listing: {
    id: string
    title: string
    userId: string
  }
}

export function DeleteListingForm({ listing }: DeleteListingFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/listings/${listing.id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete listing")
      }

      toast({
        title: "Listing Deleted",
        description: "Your listing has been successfully deleted.",
      })

      router.push("/account")
    } catch (error) {
      console.error("Delete error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete listing",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Delete Listing</CardTitle>
        <CardDescription className="text-center">
          Are you sure you want to delete &quot;{listing.title}&quot;? This action cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-gray-500">
          All information associated with this listing will be permanently removed.
        </p>
      </CardContent>
      <CardFooter className="flex justify-center space-x-4">
        <Link href={`/listing/${listing.id}`}>
          <Button variant="outline" disabled={isDeleting}>
            Cancel
          </Button>
        </Link>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Deleting...
            </>
          ) : (
            "Delete Listing"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
} 