"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Calendar, DollarSign, Filter } from "lucide-react"

export default function Listings() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Store initial listings separately
  const initialListings = [
    {
      id: 1,
      title: "Spacious 2BR near State Street",
      price: 1200,
      bedrooms: 2,
      address: "123 W Gorham St",
      availableFrom: "2024-05-15",
      availableUntil: "2024-08-15",
      amenities: ["Furnished", "Washer/Dryer", "Parking"],
      imageUrl: "/placeholder.svg?height=200&width=400&text=Apartment+1",
    },
    {
      id: 2,
      title: "Cozy Studio on University Ave",
      price: 800,
      bedrooms: 0,
      address: "456 University Ave",
      availableFrom: "2024-06-01",
      availableUntil: "2024-07-31",
      amenities: ["Utilities Included", "Air Conditioning"],
      imageUrl: "/placeholder.svg?height=200&width=400&text=Apartment+2",
    },
    {
      id: 3,
      title: "3BR Apartment near Camp Randall",
      price: 1800,
      bedrooms: 3,
      address: "789 Regent St",
      availableFrom: "2024-05-20",
      availableUntil: "2024-08-20",
      amenities: ["Parking", "Washer/Dryer", "Pets Allowed"],
      imageUrl: "/placeholder.svg?height=200&width=400&text=Apartment+3",
    },
    {
      id: 4,
      title: "1BR in Lucky Apartments",
      price: 950,
      bedrooms: 1,
      address: "321 W Johnson St",
      availableFrom: "2024-06-15",
      availableUntil: "2024-08-10",
      amenities: ["Furnished", "Utilities Included"],
      imageUrl: "/placeholder.svg?height=200&width=400&text=Apartment+4",
    },
    {
      id: 5,
      title: "2BR near Engineering Campus",
      price: 1350,
      bedrooms: 2,
      address: "555 N Park St",
      availableFrom: "2024-05-25",
      availableUntil: "2024-08-25",
      amenities: ["Air Conditioning", "Washer/Dryer"],
      imageUrl: "/placeholder.svg?height=200&width=400&text=Apartment+5",
    }
  ]
  
  const [listings, setListings] = useState(initialListings)
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    bedrooms: searchParams.get("bedrooms") || "",
    availableFrom: searchParams.get("availableFrom") || "",
    availableUntil: searchParams.get("availableUntil") || "",
  })

  // Add this effect to update filters when URL changes (for back/forward navigation)
  useEffect(() => {
    setFilters({
      search: searchParams.get("search") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      bedrooms: searchParams.get("bedrooms") || "",
      availableFrom: searchParams.get("availableFrom") || "",
      availableUntil: searchParams.get("availableUntil") || "",
    })
  }, [searchParams])

  const handleInputChange = (name: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Add a date formatter helper function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: '2-digit', 
      day: '2-digit', 
      year: '2-digit'
    })
  }

  // Replace handleApplyFilters with this version that filters locally
  const handleApplyFilters = () => {
    // Update URL
    const params = new URLSearchParams()
    if (filters.search) params.set("search", filters.search)
    if (filters.minPrice) params.set("minPrice", filters.minPrice)
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice)
    if (filters.bedrooms) params.set("bedrooms", filters.bedrooms)
    if (filters.availableFrom) params.set("availableFrom", filters.availableFrom)
    if (filters.availableUntil) params.set("availableUntil", filters.availableUntil)

    // Filter listings locally
    const filteredListings = initialListings.filter(listing => {
      // Price filter
      if (filters.minPrice && listing.price < Number(filters.minPrice)) return false
      if (filters.maxPrice && listing.price > Number(filters.maxPrice)) return false

      // Bedrooms filter
      if (filters.bedrooms && filters.bedrooms !== "any") {
        if (filters.bedrooms === "studio" && listing.bedrooms !== 0) return false
        if (filters.bedrooms !== "studio" && listing.bedrooms !== Number(filters.bedrooms)) return false
      }

      // Date filter
      if (filters.availableFrom && new Date(listing.availableUntil) < new Date(filters.availableFrom)) return false
      if (filters.availableUntil && new Date(listing.availableFrom) > new Date(filters.availableUntil)) return false

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        return (
          listing.title.toLowerCase().includes(searchLower) ||
          listing.address.toLowerCase().includes(searchLower)
        )
      }

      return true
    })

    setListings(filteredListings)
    router.push(`/listings?${params.toString()}`, { scroll: false })
  }

  // Update handleReset to also reset the listings
  const handleReset = () => {
    setFilters({
      search: "",
      minPrice: "",
      maxPrice: "",
      bedrooms: "",
      availableFrom: "",
      availableUntil: "",
    })
    setListings(initialListings) // Reset to all listings
    router.push("/listings")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-red-700 text-white py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="font-bold text-xl">
            BadgerSublets
          </Link>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="outline" className="bg-white text-red-700 hover:bg-gray-100">
                Log In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-white text-red-700 hover:bg-gray-100">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold mb-4 md:mb-0">Available Sublets</h1>
          <Link href="/create-listing">
            <Button className="bg-red-700 hover:bg-red-800">+ Post Your Sublet</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <Filter className="mr-2 h-5 w-5" /> Filters
                </h2>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                      <Input 
                        className="pl-10" 
                        placeholder="Keywords..." 
                        value={filters.search}
                        onChange={(e) => handleInputChange("search", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Price Range</label>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="number"
                          placeholder="Min $"
                          value={filters.minPrice}
                          onChange={(e) => handleInputChange("minPrice", e.target.value)}
                        />
                        <Input
                          type="number"
                          placeholder="Max $"
                          value={filters.maxPrice}
                          onChange={(e) => handleInputChange("maxPrice", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bedrooms</label>
                    <Select 
                      value={filters.bedrooms} 
                      onValueChange={(value) => handleInputChange("bedrooms", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="studio">Studio</SelectItem>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Availability</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-500">From</label>
                        <Input 
                          type="date" 
                          value={filters.availableFrom}
                          onChange={(e) => handleInputChange("availableFrom", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">To</label>
                        <Input 
                          type="date"
                          value={filters.availableUntil}
                          onChange={(e) => handleInputChange("availableUntil", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Amenities</label>
                    <div className="space-y-2">
                      {[
                        "Furnished",
                        "Washer/Dryer",
                        "Parking",
                        "Air Conditioning",
                        "Pets Allowed",
                        "Utilities Included",
                      ].map((amenity) => (
                        <div key={amenity} className="flex items-center">
                          <input type="checkbox" id={amenity} className="mr-2" />
                          <label htmlFor={amenity} className="text-sm">
                            {amenity}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-red-700 hover:bg-red-800"
                    onClick={handleApplyFilters}
                  >
                    Apply Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <Card key={listing.id} className="overflow-hidden">
                  <div className="h-48 relative">
                    <img
                      src={listing.imageUrl || "/placeholder.svg"}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1 line-clamp-1">{listing.title}</h3>
                    <p className="text-red-700 font-medium mb-2">${listing.price}/month</p>
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span className="line-clamp-1">{listing.address}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span>
                          {formatDate(listing.availableFrom)} - {formatDate(listing.availableUntil)}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span>{listing.bedrooms === 0 ? "Studio" : `${listing.bedrooms} BR`}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {listing.amenities.map((amenity) => (
                        <Badge key={amenity} variant="outline" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                    <Link href={`/listing/${listing.id}`}>
                      <Button className="w-full bg-red-700 hover:bg-red-800">View Details</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
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

