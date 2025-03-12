"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Search, MapPin, Calendar as CalendarIcon, DollarSign, Filter, X } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

const AMENITIES = [
  "Furnished",
  "Washer/Dryer",
  "Parking",
  "AC",
  "Pets Allowed",
  "Utilities Included",
  "Dishwasher",
  "Gym",
  "Pool",
  "Balcony",
  "Elevator",
  "Security System",
]

const SEARCH_INPUT_STYLE = "pl-10 w-full h-14 border-2 bg-gray-100 hover:bg-gray-200 focus:bg-white border-gray-300 hover:border-gray-400 focus:border-red-700"

interface SearchFilterBarProps {
  className?: string
  onFilterChange?: (filters: any) => void
  vertical?: boolean
}

export function SearchFilterBar({ className, onFilterChange, vertical = false }: SearchFilterBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  // Get initial values from URL
  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : 0)
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : 3000)
  const [bedrooms, setBedrooms] = useState(searchParams.get("bedrooms") || "")
  const [availableFrom, setAvailableFrom] = useState(searchParams.get("availableFrom") || "")
  const [availableUntil, setAvailableUntil] = useState(searchParams.get("availableUntil") || "")
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    searchParams.get("amenities") ? searchParams.get("amenities")!.split(",") : [],
  )

  const hasActiveFilters = search || minPrice > 0 || maxPrice < 3000 || bedrooms || availableFrom || availableUntil || selectedAmenities.length > 0

  // Apply filters
  const applyFilters = () => {
    const params = new URLSearchParams()

    // Add search query if it exists, will be used to filter street names and details
    if (search.trim()) {
      params.set("search", search.trim().toLowerCase())
    }
    
    if (minPrice > 0) params.set("minPrice", minPrice.toString())
    if (maxPrice < 3000) params.set("maxPrice", maxPrice.toString())
    if (bedrooms && bedrooms !== "any") params.set("bedrooms", bedrooms)
    if (selectedAmenities.length > 0) params.set("amenities", selectedAmenities.join(","))

    // Always navigate to the listings page when applying filters
    router.push(`/listings${params.toString() ? `?${params.toString()}` : ""}`)

    if (onFilterChange) {
      onFilterChange({
        search: search.trim().toLowerCase(),
        minPrice,
        maxPrice,
        bedrooms,
        amenities: selectedAmenities,
      })
    }
  }

  // Reset filters
  const resetFilters = () => {
    setSearch("")
    setMinPrice(0)
    setMaxPrice(3000)
    setBedrooms("")
    setAvailableFrom("")
    setAvailableUntil("")
    setSelectedAmenities([])
    
    // Clear URL params and navigate to listings
    router.push("/listings")
    
    if (onFilterChange) {
      onFilterChange({
        search: "",
        minPrice: 0,
        maxPrice: 3000,
        bedrooms: "",
        availableFrom: "",
        availableUntil: "",
        amenities: [],
      })
    }
  }

  // Toggle amenity selection
  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) => (prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]))
  }

  // Handle price range change
  const handlePriceChange = (values: number[]) => {
    const [min, max] = values
    if (min <= max) {
      setMinPrice(min)
      setMaxPrice(max)
    }
  }

  // Handle input price change
  const handleInputPriceChange = (type: 'min' | 'max', value: string) => {
    const numValue = Number(value)
    if (type === 'min') {
      if (!isNaN(numValue) && numValue >= 0 && numValue <= maxPrice) {
        setMinPrice(numValue)
      }
    } else {
      if (!isNaN(numValue) && numValue >= minPrice && numValue <= 10000) {
        setMaxPrice(numValue)
      }
    }
  }

  if (vertical) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <Filter className="mr-2 h-5 w-5" /> Filters
            </h2>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 px-2">
                <X className="h-4 w-4 mr-1" /> Clear
              </Button>
            )}
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search by location, amenities, or price..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                  className={SEARCH_INPUT_STYLE}
                />
              </div>
            </div>

            <Accordion type="multiple" defaultValue={["price", "bedrooms", "dates", "amenities"]}>
              <AccordionItem value="price">
                <AccordionTrigger className="text-sm font-medium py-2">
                  <div className="flex items-center">
                    <DollarSign className="mr-2 h-4 w-4" /> Price Range
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">${minPrice}</span>
                      <span className="text-sm text-gray-600">${maxPrice}</span>
                    </div>
                    <Slider
                      min={0}
                      max={3000}
                      step={50}
                      value={[minPrice, maxPrice]}
                      onValueChange={handlePriceChange}
                      className="mb-4"
                    />
                    <div className="flex justify-between">
                      <div className="w-[45%]">
                        <Label htmlFor="min-price">Min Price</Label>
                        <Input
                          id="min-price"
                          type="number"
                          min={0}
                          max={maxPrice}
                          value={minPrice}
                          onChange={(e) => handleInputPriceChange('min', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div className="w-[45%]">
                        <Label htmlFor="max-price">Max Price</Label>
                        <Input
                          id="max-price"
                          type="number"
                          min={minPrice}
                          max={10000}
                          value={maxPrice}
                          onChange={(e) => handleInputPriceChange('max', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="bedrooms">
                <AccordionTrigger className="text-sm font-medium py-2">
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4" /> Bedrooms
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <Select
                    value={bedrooms}
                    onValueChange={(value) => setBedrooms(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Number of bedrooms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="0">Studio</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                    </SelectContent>
                  </Select>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="dates">
                <AccordionTrigger className="text-sm font-medium py-2">
                  <div className="flex items-center">
                    <CalendarIcon className="mr-2 h-4 w-4" /> Availability
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <div>
                      <Label htmlFor="available-from">From</Label>
                      <Input
                        id="available-from"
                        type="date"
                        value={availableFrom}
                        onChange={(e) => setAvailableFrom(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="available-until">To</Label>
                      <Input
                        id="available-until"
                        type="date"
                        value={availableUntil}
                        onChange={(e) => setAvailableUntil(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="amenities">
                <AccordionTrigger className="text-sm font-medium py-2">
                  <div className="flex items-center">Amenities</div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {AMENITIES.map((amenity) => (
                      <div key={amenity} className="flex items-center">
                        <Checkbox
                          id={`amenity-${amenity}`}
                          checked={selectedAmenities.includes(amenity)}
                          onCheckedChange={() => toggleAmenity(amenity)}
                          className="mr-2"
                        />
                        <Label htmlFor={`amenity-${amenity}`} className="text-sm cursor-pointer">
                          {amenity}
                        </Label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Button className="w-full bg-red-700 hover:bg-red-800" onClick={applyFilters}>
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("flex flex-col gap-4", vertical ? "" : "md:flex-row", className)}>
      <div className="flex-1 flex flex-col md:flex-row gap-4">
        <div className="flex-[3] relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
          <Input
            type="text"
            placeholder="Search by location, amenities, or price..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            className={SEARCH_INPUT_STYLE}
          />
        </div>

        <Select value={bedrooms} onValueChange={setBedrooms}>
          <SelectTrigger className="w-[180px] h-12">
            <SelectValue placeholder="Bedrooms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any</SelectItem>
            <SelectItem value="0">Studio</SelectItem>
            <SelectItem value="1">1 Bedroom</SelectItem>
            <SelectItem value="2">2 Bedrooms</SelectItem>
            <SelectItem value="3">3 Bedrooms</SelectItem>
            <SelectItem value="4">4+ Bedrooms</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-center">
        <Button onClick={applyFilters} className="bg-red-700 hover:bg-red-800 border-[3px] w-[120px] h-12">
          Search
        </Button>
      </div>
    </div>
  )
}

