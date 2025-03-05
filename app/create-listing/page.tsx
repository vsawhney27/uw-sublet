"use client"

import { useState } from "react"
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
import { CalendarIcon, Upload } from "lucide-react"

export default function CreateListing() {
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()

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
            <form className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Listing Details</h3>

                <div className="space-y-2">
                  <Label htmlFor="title">Listing Title</Label>
                  <Input id="title" placeholder="e.g., Spacious 2BR near State Street" required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rent">Monthly Rent ($)</Label>
                    <Input id="rent" type="number" placeholder="800" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">Bedrooms</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="studio">Studio</SelectItem>
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
                  <Input id="address" placeholder="123 W Dayton St" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your apartment, amenities, and any other important details"
                    className="min-h-[120px]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Photos</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <Button variant="outline" type="button">
                      Upload Photos
                    </Button>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">Upload up to 8 photos. JPG, PNG or GIF. Max 5MB each.</p>
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
                      <Checkbox id={amenity.toLowerCase().replace(/\s+/g, "-")} />
                      <Label htmlFor={amenity.toLowerCase().replace(/\s+/g, "-")}>{amenity}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Contact Preferences</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="email-contact" defaultChecked />
                    <Label htmlFor="email-contact">Allow contact via email</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="in-app-contact" defaultChecked />
                    <Label htmlFor="in-app-contact">Allow contact via in-app messaging</Label>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Save as Draft</Button>
            <Button className="bg-red-700 hover:bg-red-800">Publish Listing</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

