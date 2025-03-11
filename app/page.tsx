"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { SearchFilterBar } from "@/components/search-filter-bar"
import { ListingCard } from "@/components/listing-card"
import type { Listing, User } from "@prisma/client"

type ListingWithUser = Omit<Listing, 'availableFrom' | 'availableUntil' | 'createdAt'> & {
  user: Pick<User, "id" | "name" | "email" | "image">
  availableFrom: string
  availableUntil: string
  createdAt: string
}

export default function Home() {
  const [featuredListings, setFeaturedListings] = useState<ListingWithUser[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedListings = async () => {
      try {
        const response = await fetch('/api/listings?limit=3&featured=true')
        const data = await response.json()
        setFeaturedListings(data.listings)
      } catch (error) {
        console.error('Error fetching featured listings:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeaturedListings()
  }, [])

  return (
    <main>
      <div className="relative h-[700px] bg-cover bg-center" style={{
        backgroundImage: 'url("/madison-capitol-lake.jpg")',
        backgroundPosition: 'center 40%',
        backgroundSize: 'cover'
      }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
          <div className="container mx-auto px-4 h-full flex flex-col justify-center items-center text-center text-white pt-16">
            <h1 className="text-6xl font-bold mb-6 drop-shadow-xl">Find Your Perfect Sublet in Madison</h1>
            <p className="text-2xl mb-12 drop-shadow-lg max-w-2xl">Browse verified listings near UW-Madison campus and downtown</p>
            <div className="w-full max-w-4xl">
              <SearchFilterBar 
                className="bg-white/95 backdrop-blur-sm shadow-xl rounded-xl border border-white/20"
                onFilterChange={(filters) => {
                  // Only handle filter changes if needed
                  console.log('Filters changed:', filters)
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Why Choose BadgerSublets?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The easiest way to find and list sublets near UW-Madison campus
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center p-6">
              <div className="mb-4 flex justify-center">
                <svg className="w-12 h-12 text-red-700" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 8L16 10V14L12 16L8 14V10L12 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Verified Students</h3>
              <p className="text-gray-600">
                All listings are from verified UW-Madison students
              </p>
            </div>
            <div className="text-center p-6">
              <div className="mb-4 flex justify-center">
                <svg className="w-12 h-12 text-red-700" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 5.02944 7.02944 1 12 1C16.9706 1 21 5.02944 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Prime Locations</h3>
              <p className="text-gray-600">
                Find sublets near campus and popular student areas
              </p>
            </div>
            <div className="text-center p-6">
              <div className="mb-4 flex justify-center">
                <svg className="w-12 h-12 text-red-700" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Communication</h3>
              <p className="text-gray-600">
                Message hosts directly through our platform
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Featured Listings</h2>
          {isLoading ? (
            <div className="text-center text-gray-500">Loading featured listings...</div>
          ) : featuredListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  id={listing.id}
                  title={listing.title}
                  description={listing.description}
                  address={listing.address}
                  price={listing.price}
                  bedrooms={listing.bedrooms}
                  bathrooms={listing.bathrooms}
                  amenities={listing.amenities}
                  availableFrom={listing.availableFrom}
                  availableUntil={listing.availableUntil}
                  images={listing.images}
                  isRoomSublet={listing.isRoomSublet}
                  totalRoommates={listing.totalRoommates || undefined}
                  roommateGenders={listing.roommateGenders || undefined}
                  createdAt={listing.createdAt}
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">No featured listings available</div>
          )}
          <div className="text-center mt-8">
            <Link href="/listings">
              <Button variant="outline" className="text-red-700 hover:text-red-800">
                View All Listings <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-8">Ready to List Your Space?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Create your listing in minutes and reach thousands of UW-Madison students looking for sublets.
          </p>
          <Link href="/create-listing">
            <Button className="bg-red-700 hover:bg-red-800 text-lg px-8 py-6">
              Create Your Listing <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </main>
  )
}

