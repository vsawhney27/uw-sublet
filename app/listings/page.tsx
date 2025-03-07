"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SearchFilterBar } from "@/components/search-filter-bar"
import { ListingCard } from "@/components/listing-card"
import type { Listing, User } from "@prisma/client"

type ListingWithUser = Listing & {
  user: Pick<User, "id" | "name" | "email" | "image">
}

function ListingsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [listings, setListings] = useState<ListingWithUser[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchListings = async (params = searchParams) => {
    try {
      setIsLoading(true)
      const queryString = params.toString()
      const response = await fetch(`/api/listings${queryString ? `?${queryString}` : ''}`)
      const data = await response.json()
      setListings(data.listings)
    } catch (error) {
      console.error('Error fetching listings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchListings()
  }, [searchParams])

  const handleFilterChange = () => {
    // The SearchFilterBar component handles the URL updates
    // The useEffect above will trigger a new fetch when the URL changes
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">Available Sublets</h1>
            <SearchFilterBar onFilterChange={handleFilterChange} />
          </div>
          <div className="text-center py-12">Loading listings...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Available Sublets</h1>
          <SearchFilterBar onFilterChange={handleFilterChange} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <SearchFilterBar vertical onFilterChange={handleFilterChange} />
          </div>

          <div className="lg:col-span-3">
            {listings.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-2">No listings found</h2>
                <p className="text-gray-600">Try adjusting your filters or search criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <footer className="bg-gray-100 py-4 mt-8">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          A safe way to find subleases in Madison. Badger Sublets is an independent platform and is not affiliated with, endorsed by, or sponsored by the University of Wisconsin-Madison. All trademarks and copyrights are property of their respective owners.
        </div>
      </footer>
    </div>
  )
}

export default function Listings() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ListingsContent />
    </Suspense>
  )
}

