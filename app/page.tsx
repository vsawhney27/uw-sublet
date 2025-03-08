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
  isRoomSublet?: boolean
  totalRoommates?: number
  roommateGenders?: string
}

export default function Home() {
  const [featuredListings, setFeaturedListings] = useState<ListingWithUser[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedListings = async () => {
      try {
        const response = await fetch('/api/listings?limit=3')
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
    <>
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
                <SearchFilterBar className="bg-white/95 backdrop-blur-sm shadow-xl rounded-xl border border-white/20" />
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          <section className="bg-gradient-to-b from-red-700 to-red-800 text-white py-20">
            <div className="container mx-auto px-4 text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">Find Your Perfect Sublet at UW-Madison</h1>
              <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
                A safe and secure platform exclusively for UW students to sublet apartments
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/listings">
                  <Button size="lg" className="bg-white text-red-700 hover:bg-gray-100">
                    Browse Listings
                  </Button>
                </Link>
                <Link href="/create-listing">
                  <Button size="lg" className="bg-white text-red-700 hover:bg-gray-100">
                    Post Your Sublet
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-gray-50 p-6 rounded-lg text-center">
                  <div className="w-16 h-16 bg-red-700 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                    1
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Verify Your UW Email</h3>
                  <p className="text-gray-600">
                    Sign up with your @wisc.edu email to confirm you're a UW-Madison student.
                  </p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg text-center">
                  <div className="w-16 h-16 bg-red-700 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                    2
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Create or Browse Listings</h3>
                  <p className="text-gray-600">
                    Post your apartment for sublet or browse available options from fellow Badgers.
                  </p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg text-center">
                  <div className="w-16 h-16 bg-red-700 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                    3
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Connect Safely</h3>
                  <p className="text-gray-600">Message verified UW students and arrange your sublet with confidence.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-12">Featured Listings</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {isLoading ? (
                  <div className="col-span-3 text-center py-12">Loading listings...</div>
                ) : featuredListings.length > 0 ? (
                  featuredListings.map((listing) => (
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
                      totalRoommates={listing.totalRoommates}
                      roommateGenders={listing.roommateGenders}
                      createdAt={listing.createdAt}
                    />
                  ))
                ) : (
                  <div className="col-span-3 text-center py-12">
                    <p className="text-gray-600">No listings available at the moment.</p>
                  </div>
                )}
              </div>
              <div className="text-center mt-8">
                <Link href="/listings">
                  <Button variant="outline" className="border-red-700 text-red-700 hover:bg-red-50">
                    View All Listings <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Badger Sublets</h3>
              <p className="text-gray-300">The safe way for UW-Madison students to find and list sublets.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/listings" className="text-gray-300 hover:text-white">
                    Browse Listings
                  </Link>
                </li>
                <li>
                  <Link href="/create-listing" className="text-gray-300 hover:text-white">
                    Post a Sublet
                  </Link>
                </li>
                <li>
                  <Link href="/how-it-works" className="text-gray-300 hover:text-white">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-gray-300 hover:text-white">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <p className="text-gray-300">Questions or feedback? Reach out to us at support@badger-sublets.com</p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
            <p>© {new Date().getFullYear()} Badger Sublets. Not affiliated with the University of Wisconsin-Madison.</p>
          </div>
        </div>
      </footer>
    </>
  )
}

