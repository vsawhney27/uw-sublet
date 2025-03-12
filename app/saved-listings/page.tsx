"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { ListingCard } from "@/components/listing-card"
import { Loader2 } from "lucide-react"
import type { Listing } from "@prisma/client"

type ListingWithDates = Listing & {
  availableFrom: string
  availableUntil: string
  createdAt: string
  isSaved?: boolean
}

export default function SavedListingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [listings, setListings] = useState<ListingWithDates[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    const fetchListings = async () => {
      try {
        const response = await fetch("/api/saved-listings")
        if (!response.ok) {
          throw new Error("Failed to fetch listings")
        }
        const data = await response.json()
        setListings(data.listings)
      } catch (error) {
        console.error("Error fetching saved listings:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (status === "authenticated") {
      fetchListings()
    }
  }, [status, router])

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Saved Listings</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <ListingCard 
                key={listing.id} 
                {...listing} 
                totalRoommates={listing.totalRoommates || undefined}
                roommateGenders={listing.roommateGenders || undefined}
                isSaved={true} 
              />
            ))}
            {listings.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">No saved listings yet.</p>
                <p className="text-gray-400 mt-2">
                  Browse listings and click the bookmark icon to save them for later.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 