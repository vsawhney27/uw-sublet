"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Upload, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"

export default function EditListingPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const { toast } = useToast()
  const { data: session, status } = useSession()
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [formData, setFormData] = useState({
    title: "",
    rent: "",
    bedrooms: "",
    address: "",
    description: "",
    images: [] as string[],
    emailContact: true,
    inAppContact: true,
    isDraft: false
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    const fetchListing = async () => {
      try {
        const response = await fetch(`/api/listings/${params.id}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch listing")
        }

        const listing = data.listing
        setFormData({
          title: listing.title,
          rent: listing.price.toString(),
          bedrooms: listing.bedrooms.toString(),
          address: listing.address,
          description: listing.description,
          images: listing.images || [],
          emailContact: listing.emailContact ?? true,
          inAppContact: listing.inAppContact ?? true,
          isDraft: listing.isDraft
        })
        setStartDate(new Date(listing.availableFrom))
        setEndDate(new Date(listing.availableUntil))
        setSelectedAmenities(listing.amenities || [])
      } catch (error) {
        console.error("Fetch error:", error)
        toast({
          title: "Error",
          description: "Failed to load listing. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchListing()
  }, [params.id, router, status, toast])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // In a real app, you would upload these to a storage service
    // For now, we'll create object URLs
    const imageUrls = Array.from(files).map(file => URL.createObjectURL(file))
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...imageUrls]
    }))
  }

  const validateForm = () => {
    const missingFields = [];

    if (!session?.user) {
      toast({
        title: "Error",
        description: "You must be logged in to edit a listing",
        variant: "destructive",
      })
      router.push("/login")
      return false
    }

    if (!formData.title) missingFields.push("Title");
    if (!formData.description) missingFields.push("Description");
    if (!formData.rent) missingFields.push("Rent amount");
    if (!formData.address) missingFields.push("Address");
    if (!formData.bedrooms) missingFields.push("Number of bedrooms");
    if (!startDate || !endDate) missingFields.push("Availability dates");

    if (missingFields.length > 0) {
      toast({
        title: "Please Fill All Required Fields",
        description: `Missing: ${missingFields.join(", ")}`,
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handleSubmit = async (publishAfterEdit: boolean = false) => {
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/listings/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          price: Number(formData.rent),
          address: formData.address,
          bedrooms: Number(formData.bedrooms),
          bathrooms: 1,
          availableFrom: startDate!.toISOString(),
          availableUntil: endDate!.toISOString(),
          amenities: selectedAmenities,
          images: formData.images,
          isDraft: !publishAfterEdit && formData.isDraft,
          published: publishAfterEdit || !formData.isDraft
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update listing")
      }

      toast({
        title: publishAfterEdit ? "Listing Published!" : "Listing Updated!",
        description: publishAfterEdit 
          ? "Your listing is now live and visible to other users."
          : "Your changes have been saved successfully.",
      })

      router.push(formData.isDraft && !publishAfterEdit ? "/account" : `/listing/${params.id}`)
    } catch (error) {
      console.error("Update error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update listing",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    )
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-700" />
      </div>
    )
  }

  if (status === "unauthenticated") {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <Link href={`/listing/${params.id}`} className="text-red-700 hover:underline mb-6 inline-block">
          &larr; Back to listing
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Edit Listing</CardTitle>
            <CardDescription>Update your listing details</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); }}>
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Listing Details</h3>

                <div className="space-y-2">
                  <Label htmlFor="title">Listing Title</Label>
                  <Input 
                    id="title" 
                    placeholder="e.g., Spacious 2BR near State Street" 
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rent">Monthly Rent ($)</Label>
                    <Input 
                      id="rent" 
                      type="number" 
                      placeholder="800" 
                      value={formData.rent}
                      onChange={(e) => setFormData({ ...formData, rent: e.target.value })}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">Bedrooms</Label>
                    <Select value={formData.bedrooms} onValueChange={(value) => setFormData({ ...formData, bedrooms: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Studio</SelectItem>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Available From</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Available Until</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input 
                    id="address" 
                    placeholder="123 W Dayton St" 
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your apartment, amenities, and any other important details"
                    className="min-h-[120px]"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Photos</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="photo-upload">
                      <Button variant="outline" type="button" onClick={() => document.getElementById('photo-upload')?.click()}>
                        Upload Photos
                      </Button>
                      <input
                        id="photo-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">Upload up to 8 photos. JPG, PNG or GIF. Max 5MB each.</p>
                  {formData.images.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      {formData.images.map((url, index) => (
                        <img key={index} src={url} alt={`Upload ${index + 1}`} className="rounded-lg" />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Amenities</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    "Furnished",
                    "Washer/Dryer",
                    "Parking",
                    "Air Conditioning",
                    "Pets Allowed",
                    "Utilities Included",
                  ].map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox 
                        id={amenity.toLowerCase().replace(/\s+/g, "-")}
                        checked={selectedAmenities.includes(amenity)}
                        onCheckedChange={() => toggleAmenity(amenity)}
                      />
                      <Label htmlFor={amenity.toLowerCase().replace(/\s+/g, "-")}>{amenity}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Contact Preferences</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="email-contact" 
                      checked={formData.emailContact}
                      onCheckedChange={(checked) => setFormData({ ...formData, emailContact: checked as boolean })}
                    />
                    <Label htmlFor="email-contact">Allow contact via email</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="in-app-contact"
                      checked={formData.inAppContact}
                      onCheckedChange={(checked) => setFormData({ ...formData, inAppContact: checked as boolean })}
                    />
                    <Label htmlFor="in-app-contact">Allow contact via in-app messaging</Label>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
              {formData.isDraft && (
                <Button
                  onClick={() => handleSubmit(true)}
                  disabled={isSubmitting}
                  className="bg-red-700 hover:bg-red-800"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    'Publish Now'
                  )}
                </Button>
              )}
            </div>
            <Link href={`/listing/${params.id}/delete`}>
              <Button variant="destructive" disabled={isSubmitting}>
                Delete Listing
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
} 