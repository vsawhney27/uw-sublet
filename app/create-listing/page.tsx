"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
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
import { useSession } from "next-auth/react"
import { useEffect } from "react"

export default function CreateListing() {
  const router = useRouter()
  const { toast } = useToast()
  const { data: session, status } = useSession()
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()
  const [isSubmitting, setIsSubmitting] = useState(false)
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
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

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
    console.log("Validating form with session:", session?.user);
    console.log("Form data:", formData);
    console.log("Dates:", { startDate, endDate });

    const errors = [];

    if (!session?.user) {
      console.log("Validation failed: No user session");
      toast({
        title: "Error",
        description: "You must be logged in to create a listing",
        variant: "destructive",
      })
      router.push("/login")
      return false
    }

    if (!formData.title || formData.title.length < 5) errors.push("Title must be at least 5 characters");
    if (!formData.description || formData.description.length < 20) errors.push("Description must be at least 20 characters");
    if (!formData.rent) errors.push("Rent amount is required");
    if (!formData.address || formData.address.length < 5) errors.push("Address must be at least 5 characters");
    if (!formData.bedrooms) errors.push("Number of bedrooms is required");
    if (!startDate || !endDate) errors.push("Availability dates are required");

    if (errors.length > 0) {
      console.log("Validation failed:", errors);
      toast({
        title: "Please Fix the Following Issues",
        description: errors.join("\n"),
        variant: "destructive",
      })
      return false
    }

    console.log("Form validation passed");
    return true
  }

  const handleSubmit = async (isDraft: boolean = false) => {
    console.log("Submit button clicked", { isDraft });
    
    if (!validateForm()) {
      console.log("Form validation failed");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("Submitting form data:", {
        title: formData.title,
        description: formData.description,
        price: Number(formData.rent),
        address: formData.address,
        bedrooms: Number(formData.bedrooms),
        bathrooms: 1,
        availableFrom: startDate,
        availableUntil: endDate,
        amenities: selectedAmenities,
        images: formData.images,
        isDraft,
        published: !isDraft
      });

      const response = await fetch("/api/listings", {
        method: "POST",
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
          availableFrom: startDate?.toISOString(),
          availableUntil: endDate?.toISOString(),
          amenities: selectedAmenities,
          images: formData.images,
          isDraft: isDraft,
          published: !isDraft
        }),
      });

      const data = await response.json();
      console.log("API Response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to create listing");
      }

      toast({
        title: isDraft ? "Draft Saved!" : "Listing Published!",
        description: isDraft 
          ? "Your listing has been saved as a draft. You can find it in your account page." 
          : "Your listing is now live and visible to other users.",
      });

      // Always redirect to account page after creating a listing
      router.push("/account");
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create listing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    )
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-700" />
      </div>
    )
  }

  if (status === "unauthenticated") {
    return null // useEffect will handle redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <Link href="/" className="text-red-700 hover:underline mb-6 inline-block">
          &larr; Back to home
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Create a New Listing</CardTitle>
            <CardDescription>List your apartment for sublet to other UW-Madison students</CardDescription>
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
            <Button
              variant="outline"
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save as Draft'
              )}
            </Button>
            <Button
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
              className="bg-red-700 hover:bg-red-800"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                'Publish Listing'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

