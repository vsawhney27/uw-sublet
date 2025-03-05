import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Calendar, DollarSign, Filter } from "lucide-react"

export default function Listings() {
  // In a real app, this would come from a database
  const listings = [
    {
      id: 1,
      title: "Spacious 2BR near State Street",
      price: 1200,
      bedrooms: 2,
      address: "123 W Gorham St",
      availableFrom: "May 15, 2025",
      availableUntil: "Aug 15, 2025",
      amenities: ["Furnished", "Washer/Dryer", "Parking"],
      imageUrl: "/placeholder.svg?height=200&width=400&text=Apartment+1",
    },
    {
      id: 2,
      title: "Cozy Studio on University Ave",
      price: 800,
      bedrooms: 0,
      address: "456 University Ave",
      availableFrom: "Jun 1, 2025",
      availableUntil: "Jul 31, 2025",
      amenities: ["Utilities Included", "Air Conditioning"],
      imageUrl: "/placeholder.svg?height=200&width=400&text=Apartment+2",
    },
    {
      id: 3,
      title: "3BR Apartment near Camp Randall",
      price: 1800,
      bedrooms: 3,
      address: "789 Regent St",
      availableFrom: "May 20, 2025",
      availableUntil: "Aug 20, 2025",
      amenities: ["Parking", "Washer/Dryer", "Pets Allowed"],
      imageUrl: "/placeholder.svg?height=200&width=400&text=Apartment+3",
    },
    {
      id: 4,
      title: "1BR in Lucky Apartments",
      price: 950,
      bedrooms: 1,
      address: "321 W Johnson St",
      availableFrom: "Jun 15, 2025",
      availableUntil: "Aug 10, 2025",
      amenities: ["Furnished", "Utilities Included"],
      imageUrl: "/placeholder.svg?height=200&width=400&text=Apartment+4",
    },
    {
      id: 5,
      title: "2BR near Engineering Campus",
      price: 1350,
      bedrooms: 2,
      address: "555 N Park St",
      availableFrom: "May 25, 2025",
      availableUntil: "Aug 25, 2025",
      amenities: ["Air Conditioning", "Washer/Dryer"],
      imageUrl: "/placeholder.svg?height=200&width=400&text=Apartment+5",
    },
    {
      id: 6,
      title: "Luxury 1BR Downtown",
      price: 1100,
      bedrooms: 1,
      address: "777 State St",
      availableFrom: "Jun 1, 2025",
      availableUntil: "Aug 15, 2025",
      amenities: ["Furnished", "Parking", "Air Conditioning"],
      imageUrl: "/placeholder.svg?height=200&width=400&text=Apartment+6",
    },
  ]

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
                      <Input className="pl-10" placeholder="Keywords..." />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Price Range</label>
                    <div className="space-y-4">
                      <Slider defaultValue={[1000]} max={3000} step={50} />
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>$0</span>
                        <span>$3000+</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bedrooms</label>
                    <Select>
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
                        <Input type="date" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">To</label>
                        <Input type="date" />
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

                  <Button className="w-full bg-red-700 hover:bg-red-800">Apply Filters</Button>
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
                          {listing.availableFrom} - {listing.availableUntil}
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
    </div>
  )
}

