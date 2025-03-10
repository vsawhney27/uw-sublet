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
import { EmailForm } from "@/components/email-form"
import { Map } from "@/components/map"
import { formatDate } from "@/lib/utils"

type ListingWithUser = Listing & {
  user: Pick<User, "id" | "name" | "email" | "image">
}

interface ListingDetailProps {
  listing: ListingWithUser
  currentUser: {
    id: string
    name: string | null
    email: string | null
    image: string | null
  } | null
  onFavorite?: (id: string) => void
  isFavorite?: boolean
}

export function ListingDetail({ listing, currentUser, onFavorite, isFavorite = false }: ListingDetailProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [showMessageForm, setShowMessageForm] = useState(false)
  const [showEmailForm, setShowEmailForm] = useState(false)
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
  const formattedAvailableFrom = formatDate(availableFrom)
  const formattedAvailableUntil = formatDate(availableUntil)

  const isOwner = currentUser?.id === user.id

  return (
    <div className="grid md:grid-cols-3 gap-8">
      {/* Main Content */}
      <div className="md:col-span-2 space-y-6">
        <Card className="overflow-hidden">
          <div className="relative h-96">
            {images && images[0] ? (
              <img
                src={images[0]}
                alt={title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">No image available</span>
              </div>
            )}
          </div>
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">{title}</h1>
            <div className="flex items-center gap-4 text-gray-600 mb-4">
              <span>${price}/month</span>
              <span>•</span>
              <span>{bedrooms} {bedrooms === 1 ? "Bedroom" : "Bedrooms"}</span>
              <span>•</span>
              <span>{bathrooms} {bathrooms === 1 ? "Bathroom" : "Bathrooms"}</span>
            </div>
            <div className="text-gray-600 mb-6">
              <p>Available from {formattedAvailableFrom} to {formattedAvailableUntil}</p>
            </div>
            <div className="prose max-w-none">
              <p>{description}</p>
            </div>
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Map */}
        <Card className="overflow-hidden">
          <div className="h-96">
            <Map address={address} className="w-full h-full" />
          </div>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
          <div className="space-y-4">
            <div>
              <p className="font-medium">Listed by</p>
              <p>{user.name}</p>
            </div>
            <div>
              <p className="font-medium">Location</p>
              <p>{address}</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            <MessageForm 
              receiverId={user.id}
              listingId={id}
              placeholder="Write your message to the host..."
            />
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or</span>
              </div>
            </div>
            <EmailForm 
              receiverEmail={user.email} 
              listingTitle={title}
            />
          </div>
        </Card>
      </div>

      {/* Message Dialog */}
      <Dialog open={showMessageForm} onOpenChange={setShowMessageForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Message to {user.name}</DialogTitle>
          </DialogHeader>
          <MessageForm 
            receiverId={user.id}
            listingId={id}
            placeholder="Write your message..."
          />
        </DialogContent>
      </Dialog>

      {/* Email Dialog */}
      <Dialog open={showEmailForm} onOpenChange={setShowEmailForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Email to {user.name}</DialogTitle>
          </DialogHeader>
          <EmailForm 
            receiverEmail={user.email} 
            listingTitle={title}
          />
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

