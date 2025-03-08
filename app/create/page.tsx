"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

const AMENITIES = [
  "Furnished",
  "Washer/Dryer",
  "Parking",
  "Air Conditioning",
  "Pets Allowed",
  "Utilities Included",
  "Dishwasher",
  "Gym",
  "Pool",
  "Balcony",
  "Elevator",
  "Security System",
]

export default function CreateListing() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRoomSublet, setIsRoomSublet] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    address: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
    availableFrom: "",
    availableUntil: "",
    amenities: [] as string[],
    // New room sublet fields
    totalRoommates: "",
    roomDetails: "",
    roommateGenders: "",
    sharedSpaces: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          isRoomSublet,
          price: Number(formData.price),
          bedrooms: Number(formData.bedrooms),
          bathrooms: Number(formData.bathrooms),
          totalRoommates: isRoomSublet ? Number(formData.totalRoommates) : undefined,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create listing")
      }

      toast({
        title: "Success!",
        description: "Your listing has been created.",
      })

      router.push("/listings")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create listing. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold mb-6">Create a New Listing</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Listing Type Selection */}
            <div>
              <Label className="text-lg font-semibold mb-4">Listing Type</Label>
              <div className="flex items-center space-x-2 mt-2">
                <Checkbox
                  id="isRoomSublet"
                  checked={isRoomSublet}
                  onCheckedChange={(checked) => setIsRoomSublet(checked as boolean)}
                />
                <Label htmlFor="isRoomSublet">This is a room sublet within a shared house/apartment</Label>
              </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={isRoomSublet ? "Private Room in 3BR House near Campus" : "Entire 2BR Apartment near State Street"}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={isRoomSublet 
                    ? "Describe your room, roommates, and living situation" 
                    : "Describe your property and its features"}
                  required
                />
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 State Street, Madison, WI"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price per Month ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="1000"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="bedrooms">{isRoomSublet ? "Total Bedrooms in House" : "Bedrooms"}</Label>
                  <Select
                    value={formData.bedrooms}
                    onValueChange={(value) => setFormData({ ...formData, bedrooms: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Studio</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="5">5+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Select
                    value={formData.bathrooms}
                    onValueChange={(value) => setFormData({ ...formData, bathrooms: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="1.5">1.5</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="2.5">2.5</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Room Sublet Specific Fields */}
              {isRoomSublet && (
                <div className="space-y-4 border-t pt-4">
                  <h3 className="text-lg font-semibold">Room & Roommate Details</h3>
                  
                  <div>
                    <Label htmlFor="totalRoommates">Current Number of Roommates</Label>
                    <Select
                      value={formData.totalRoommates}
                      onValueChange={(value) => setFormData({ ...formData, totalRoommates: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="roomDetails">Room Details</Label>
                    <textarea
                      id="roomDetails"
                      className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2"
                      value={formData.roomDetails}
                      onChange={(e) => setFormData({ ...formData, roomDetails: e.target.value })}
                      placeholder="Describe the room size, furniture, windows, etc."
                    />
                  </div>

                  <div>
                    <Label htmlFor="roommateGenders">Current Roommate Genders</Label>
                    <Select
                      value={formData.roommateGenders}
                      onValueChange={(value) => setFormData({ ...formData, roommateGenders: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-female">All Female</SelectItem>
                        <SelectItem value="all-male">All Male</SelectItem>
                        <SelectItem value="mixed">Mixed Gender</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="sharedSpaces">Shared Spaces</Label>
                    <textarea
                      id="sharedSpaces"
                      className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2"
                      value={formData.sharedSpaces}
                      onChange={(e) => setFormData({ ...formData, sharedSpaces: e.target.value })}
                      placeholder="Describe shared spaces (kitchen, living room, bathrooms, etc.)"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="availableFrom">Available From</Label>
                  <Input
                    id="availableFrom"
                    type="date"
                    value={formData.availableFrom}
                    onChange={(e) => setFormData({ ...formData, availableFrom: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="availableUntil">Available Until</Label>
                  <Input
                    id="availableUntil"
                    type="date"
                    value={formData.availableUntil}
                    onChange={(e) => setFormData({ ...formData, availableUntil: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div>
              <Label className="text-lg font-semibold mb-4">Amenities</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {AMENITIES.map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <Checkbox
                      id={amenity}
                      checked={formData.amenities.includes(amenity)}
                      onCheckedChange={() => toggleAmenity(amenity)}
                    />
                    <Label htmlFor={amenity}>{amenity}</Label>
                  </div>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full bg-red-700 hover:bg-red-800" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Listing"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 