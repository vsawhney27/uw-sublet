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
import { MapPin, Calendar, DollarSign, Mail, MessageCircle, Flag, Heart, AlertCircle } from "lucide-react"
import { type Listing, User } from "@prisma/client"
import { MessageForm } from "@/components/message-form"
import { ReportForm } from "@/components/report-form"
import { EmailForm } from "@/components/email-form"
import { Map } from "@/components/map"
import { format } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

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
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()
  const router = useRouter()

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
    isDraft
  } = listing

  // Format dates
  const formattedAvailableFrom = format(new Date(availableFrom), "MMM d, yyyy")
  const formattedAvailableUntil = format(new Date(availableUntil), "MMM d, yyyy")

  const isOwner = currentUser?.id === user.id

  const downloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(objectUrl)
    } catch (error) {
      console.error('Error downloading image:', error)
    }
  }

  const downloadAllImages = async () => {
    if (!images?.length) return
    for (let i = 0; i < images.length; i++) {
      const filename = `${title.replace(/[^a-z0-9]/gi, '_')}_image_${i + 1}.jpg`
      await downloadImage(images[i], filename)
    }
  }

  const handlePublish = async () => {
    if (!currentUser) {
      setError("You must be logged in to publish a listing")
      return
    }

    try {
      setIsPublishing(true)
      setError("")

      const response = await fetch(`/api/listings/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          published: true,
          isDraft: false,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to publish listing")
      }

      toast({
        title: "Success",
        description: "Listing published successfully!",
      })
      router.refresh()
    } catch (error) {
      console.error("Error publishing listing:", error)
      setError(error instanceof Error ? error.message : "Failed to publish listing")
      toast({
        title: "Error",
        description: "Failed to publish listing. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsPublishing(false)
    }
  }

  const handleSaveAsDraft = async () => {
    if (!currentUser) {
      setError("You must be logged in to save as draft")
      return
    }

    try {
      setIsSavingDraft(true)
      setError("")

      const response = await fetch(`/api/listings/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          published: false,
          isDraft: true,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to save as draft")
      }

      toast({
        title: "Success",
        description: "Listing saved as draft!",
      })
      router.refresh()
    } catch (error) {
      console.error("Error saving as draft:", error)
      setError(error instanceof Error ? error.message : "Failed to save as draft")
      toast({
        title: "Error",
        description: "Failed to save as draft. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSavingDraft(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center">
        <Link href="/listings" className="text-red-700 hover:underline">
          &larr; Back to listings
        </Link>
        {isOwner && (
          <div className="space-x-2">
            <Link href={`/listing/${id}/edit`}>
              <Button variant="outline">Edit Listing</Button>
            </Link>
            <Link href={`/listing/${id}/delete`}>
              <Button variant="destructive">Delete Listing</Button>
            </Link>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold">{title}</h1>
                  {isDraft && (
                    <Badge variant="outline" className="mt-2">
                      Draft
                    </Badge>
                  )}
                </div>
                {onFavorite && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onFavorite(id)}
                    className={isFavorite ? "text-red-700" : ""}
                  >
                    <Heart className="h-5 w-5" />
                  </Button>
                )}
              </div>

              {/* Images */}
              <div className="space-y-4 mb-6">
                {images && images.length > 0 ? (
                  <>
                    <div className="flex justify-end mb-2">
                      <Button
                        variant="outline"
                        onClick={downloadAllImages}
                        className="text-sm"
                      >
                        Download All Images
                      </Button>
                    </div>
                    <Carousel
                      opts={{
                        align: "start",
                        loop: true,
                      }}
                      className="w-full relative"
                    >
                      <CarouselContent>
                        {images.map((image, index) => (
                          <CarouselItem key={index}>
                            <div className="relative aspect-[16/9]">
                              <img
                                src={image}
                                alt={`${title} - Image ${index + 1}`}
                                className="rounded-lg w-full h-full object-cover cursor-pointer"
                                onClick={() => {
                                  setActiveImageIndex(index);
                                  setShowImageDialog(true);
                                }}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                className="absolute bottom-2 right-2 bg-white/80 hover:bg-white"
                                onClick={() => downloadImage(image, `${title.replace(/[^a-z0-9]/gi, '_')}_image_${index + 1}.jpg`)}
                              >
                                Download
                              </Button>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white" />
                      <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white" />
                    </Carousel>
                    <div className="grid grid-cols-4 gap-2">
                      {images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`${title} - Thumbnail ${index + 1}`}
                            className={`rounded-lg w-full h-20 object-cover cursor-pointer ${
                              index === activeImageIndex ? 'ring-2 ring-red-700' : ''
                            }`}
                            onClick={() => {
                              setActiveImageIndex(index);
                              setShowImageDialog(true);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center">
                    <span className="text-gray-400">No images available</span>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="space-y-6">
                <div className="flex items-center gap-4 text-gray-600">
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-1" />
                    ${price}/month
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-1" />
                    {address}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-1" />
                    {formattedAvailableFrom} - {formattedAvailableUntil}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-600">Bedrooms:</span> {bedrooms}
                    </div>
                    <div>
                      <span className="text-gray-600">Bathrooms:</span> {bathrooms}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="whitespace-pre-wrap text-gray-600">{description}</p>
                </div>

                {amenities && amenities.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                      {amenities.map((amenity) => (
                        <Badge key={amenity} variant="secondary">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
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
            {!isOwner && (
              <div className="mt-6 space-y-4">
                <Button
                  className="w-full bg-red-700 hover:bg-red-800"
                  onClick={() => setShowMessageForm(true)}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowEmailForm(true)}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-red-700 hover:bg-red-50"
                  onClick={() => setShowReportForm(true)}
                >
                  <Flag className="h-4 w-4 mr-2" />
                  Report Listing
                </Button>
              </div>
            )}
          </Card>
        </div>
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
            isSupport={false}
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

      {/* Image Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <div className="flex justify-between items-center mb-4">
              <DialogTitle>{title} - Image {activeImageIndex + 1}</DialogTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => downloadImage(
                    images?.[activeImageIndex],
                    `${title.replace(/[^a-z0-9]/gi, '_')}_image_${activeImageIndex + 1}.jpg`
                  )}
                >
                  Download Image
                </Button>
                <Button
                  variant="outline"
                  onClick={downloadAllImages}
                >
                  Download All
                </Button>
              </div>
            </div>
          </DialogHeader>
          <div className="relative">
            <img
              src={images?.[activeImageIndex]}
              alt={`${title} - Full size image ${activeImageIndex + 1}`}
              className="w-full h-auto"
            />
            <Button
              variant="ghost"
              size="lg"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
              onClick={(e) => {
                e.preventDefault();
                setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
              }}
            >
              ←
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
              onClick={(e) => {
                e.preventDefault();
                setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
              }}
            >
              →
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

