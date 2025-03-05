"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { MapPin, Calendar, DollarSign, Mail, MessageCircle, Flag, Heart } from "lucide-react"
import { type Listing, User } from "@prisma/client"
import { MessageForm } from "@/components/message-form"
import { ReportForm } from "@/components/report-form"

type ListingWithUser = Listing & {
  user: Pick<User, "id" | "name" | "email" | "image">
}

interface ListingDetailProps {
  listing: ListingWithUser
  currentUser: Pick<User, "id" | "name" | "email" | "image"> | null
  onFavorite?: (id: string) => void
  isFavorite?: boolean
}

export function ListingDetail({ listing, currentUser, onFavorite, isFavorite = false }: ListingDetailProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [showMessageForm, setShowMessageForm] = useState(false)
  const [showReportForm, setShowReportForm] = useState(false)

  const {
    id,
    title,
    description,
    price,
    address,
    bedrooms,
    bathrooms,
    availableFrom,
    availableUntil,
    amenities,
    images,
    user,
  } = listing

  // Format dates
  const formattedAvailableFrom = new Date(availableFrom).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  const formattedAvailableUntil = new Date(availableUntil).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  const isOwner = currentUser?.id === user.id

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold">{title}</h1>
          {onFavorite && (
            <Button
              variant="outline"
              size="sm"
              className={isFavorite ? "text-red-500 border-red-500" : ""}
              onClick={() => onFavorite(id)}
            >
              <Heart className={`mr-2 h-4 w-4 ${isFavorite ? "fill-red-500" : ""}`} />
              {isFavorite ? "Saved" : "Save"}
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center text-gray-600">
            <DollarSign className="h-5 w-5 mr-1" />
            <span className="text-xl font-semibold">${price.toFixed(2)}/month</span>
          </div>
          <div className="flex items-center text-gray-600">
            <MapPin className="h-5 w-5 mr-1" />
            <span>{address}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Calendar className="h-5 w-5 mr-1" />
            <span>
              {formattedAvailableFrom} - {formattedAvailableUntil}
            </span>
          </div>
          <div className="flex items-center text-gray-600">
            <User className="h-5 w-5 mr-1" />
            <span>
              {bedrooms === 0 ? "Studio" : `${bedrooms} BR`} / {bathrooms} BA
            </span>
          </div>
        </div>

        <div className="mb-8">
          <Carousel>
            <CarouselContent>
              {images.length > 0 ? (
                images.map((image, index) => (
                  <CarouselItem key={index}>
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`${title} - Image ${index + 1}`}
                      className="w-full h-[400px] object-cover rounded-lg"
                    />
                  </CarouselItem>
                ))
              ) : (
                <CarouselItem>
                  <div className="w-full h-[400px] bg-gray-200 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">No images available</p>
                  </div>
                </CarouselItem>
              )}
            </CarouselContent>
            {images.length > 1 && (
              <>
                <CarouselPrevious />
                <CarouselNext />
              </>
            )}
          </Carousel>

          {images.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${
                    activeImageIndex === index ? "border-red-700" : "border-transparent"
                  }`}
                >
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
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
                <p className="text-gray-700 whitespace-pre-line">{description}</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="amenities">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Amenities</h2>
                <div className="grid grid-cols-2 gap-4">
                  {amenities.map((amenity) => (
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
                  Located at {address}, this apartment is conveniently situated near campus and local amenities.
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
                <AvatarImage src={user.image || ""} alt={user.name || ""} />
                <AvatarFallback>
                  {user.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("") || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-gray-500">Verified UW Student</p>
              </div>
            </div>

            {!isOwner && currentUser && (
              <div className="space-y-4">
                <Button className="w-full bg-red-700 hover:bg-red-800" onClick={() => setShowMessageForm(true)}>
                  <MessageCircle className="mr-2 h-4 w-4" /> Message
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => (window.location.href = `mailto:${user.email}`)}
                >
                  <Mail className="mr-2 h-4 w-4" /> Email
                </Button>
              </div>
            )}

            {!currentUser && (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-4">
                <p className="text-sm text-yellow-800">
                  <Link href="/login" className="font-bold underline">
                    Log in
                  </Link>{" "}
                  or{" "}
                  <Link href="/signup" className="font-bold underline">
                    sign up
                  </Link>{" "}
                  to contact this lister.
                </p>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-medium mb-2">Availability</h3>
              <p className="text-gray-700 mb-4">
                This sublet is available from <strong>{formattedAvailableFrom}</strong> to{" "}
                <strong>{formattedAvailableUntil}</strong>
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {amenities.map((amenity) => (
                  <Badge key={amenity} variant="outline">
                    {amenity}
                  </Badge>
                ))}
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  <strong>Safety Tip:</strong> Only communicate with verified UW students through our platform. Never
                  send money before signing a proper sublease agreement.
                </p>
              </div>

              {currentUser && !isOwner && (
                <Button variant="ghost" className="w-full mt-4 text-red-700" onClick={() => setShowReportForm(true)}>
                  <Flag className="mr-2 h-4 w-4" /> Report Listing
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Message Dialog */}
      <Dialog open={showMessageForm} onOpenChange={setShowMessageForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Message to {user.name}</DialogTitle>
          </DialogHeader>
          <MessageForm receiverId={user.id} listingId={id} onSuccess={() => setShowMessageForm(false)} />
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={showReportForm} onOpenChange={setShowReportForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Listing</DialogTitle>
          </DialogHeader>
          <ReportForm listingId={id} onSuccess={() => setShowReportForm(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

