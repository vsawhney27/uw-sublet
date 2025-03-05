import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPin, Calendar, DollarSign, User, Mail, MessageCircle } from "lucide-react"

export default function ListingDetail({ params }: { params: { id: string } }) {
  // In a real app, this would come from a database lookup using params.id
  const listing = {
    id: params.id,
    title: "Spacious 2BR near State Street",
    price: 1200,
    bedrooms: 2,
    bathrooms: 1,
    address: "123 W Gorham St",
    availableFrom: "May 15, 2025",
    availableUntil: "Aug 15, 2025",
    description:
      "This beautiful 2-bedroom apartment is located just steps away from State Street and the UW campus. It features hardwood floors, a fully equipped kitchen, and a spacious living room. The apartment is fully furnished and includes all utilities. Perfect for summer sublet!",
    amenities: ["Furnished", "Washer/Dryer", "Parking", "Air Conditioning", "Utilities Included"],
    images: [
      "/placeholder.svg?height=400&width=600&text=Living+Room",
      "/placeholder.svg?height=400&width=600&text=Bedroom",
      "/placeholder.svg?height=400&width=600&text=Kitchen",
      "/placeholder.svg?height=400&width=600&text=Bathroom",
    ],
    owner: {
      name: "Alex Johnson",
      email: "alex@wisc.edu",
      avatar: "/placeholder.svg?height=100&width=100&text=AJ",
    },
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
        <Link href="/listings" className="text-red-700 hover:underline mb-6 inline-block">
          &larr; Back to listings
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold mb-4">{listing.title}</h1>

            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center text-gray-600">
                <DollarSign className="h-5 w-5 mr-1" />
                <span className="text-xl font-semibold">${listing.price}/month</span>
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="h-5 w-5 mr-1" />
                <span>{listing.address}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Calendar className="h-5 w-5 mr-1" />
                <span>
                  {listing.availableFrom} - {listing.availableUntil}
                </span>
              </div>
              <div className="flex items-center text-gray-600">
                <User className="h-5 w-5 mr-1" />
                <span>
                  {listing.bedrooms} BR / {listing.bathrooms} BA
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {listing.images.map((image, index) => (
                <div key={index} className={index === 0 ? "col-span-2" : ""}>
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`${listing.title} - Image ${index + 1}`}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              ))}
            </div>

            <Tabs defaultValue="details">
              <TabsList className="mb-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="amenities">Amenities</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Description</h2>
                    <p className="text-gray-700 whitespace-pre-line">{listing.description}</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="amenities">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Amenities</h2>
                    <div className="grid grid-cols-2 gap-4">
                      {listing.amenities.map((amenity) => (
                        <div key={amenity} className="flex items-center">
                          <div className="h-2 w-2 bg-red-700 rounded-full mr-2"></div>
                          <span>{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="location">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Location</h2>
                    <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
                      <p className="text-gray-600">Map would be displayed here</p>
                    </div>
                    <p className="mt-4 text-gray-700">
                      Located at {listing.address}, this apartment is conveniently situated near campus and local
                      amenities.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Contact Lister</h2>
                <div className="flex items-center mb-6">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage src={listing.owner.avatar} alt={listing.owner.name} />
                    <AvatarFallback>
                      {listing.owner.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{listing.owner.name}</p>
                    <p className="text-sm text-gray-500">Verified UW Student</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <Button className="w-full bg-red-700 hover:bg-red-800">
                    <MessageCircle className="mr-2 h-4 w-4" /> Message
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Mail className="mr-2 h-4 w-4" /> Email
                  </Button>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-medium mb-2">Availability</h3>
                  <p className="text-gray-700 mb-4">
                    This sublet is available from <strong>{listing.availableFrom}</strong> to{" "}
                    <strong>{listing.availableUntil}</strong>
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {listing.amenities.map((amenity) => (
                      <Badge key={amenity} variant="outline">
                        {amenity}
                      </Badge>
                    ))}
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                      <strong>Safety Tip:</strong> Only communicate with verified UW students through our platform.
                      Never send money before signing a proper sublease agreement.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

