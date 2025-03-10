import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { MapPin, Calendar, User, Heart, Bed, Bath, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Listing, User as UserType } from "@prisma/client"
import { cn } from "@/lib/utils"

type ListingWithUser = Listing & {
  user: Pick<UserType, "id" | "name" | "email" | "image">
}

interface ListingCardProps {
  id: string
  title: string
  description: string
  address: string
  price: number
  bedrooms: number
  bathrooms: number
  amenities?: string[]
  availableFrom: string
  availableUntil: string
  images?: string[]
  isRoomSublet?: boolean
  totalRoommates?: number
  roommateGenders?: string
  compact?: boolean
  createdAt: Date | string
}

export function ListingCard({
  id,
  title = "Untitled Listing",
  description = "No description provided",
  address = "Address not provided",
  price = 0,
  bedrooms = 0,
  bathrooms = 0,
  amenities = [],
  availableFrom,
  availableUntil,
  images = [],
  isRoomSublet = false,
  totalRoommates,
  roommateGenders,
  compact,
  createdAt,
}: ListingCardProps) {
  // Format dates with error handling
  const formatDate = (dateString: string) => {
    if (!dateString) return "Date not set";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return "Invalid date";
    }
  };

  const getTimeAgo = (dateInput: Date | string) => {
    if (!dateInput) return "Recently";
    try {
      const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
      if (isNaN(date.getTime())) return "Recently";
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
      console.error("Error calculating time ago:", dateInput, e);
      return "Recently";
    }
  };

  const formattedAvailableFrom = formatDate(availableFrom);
  const formattedAvailableUntil = formatDate(availableUntil);
  const timeAgo = getTimeAgo(createdAt);

  return (
    <Card className={cn("group overflow-hidden", compact ? "h-[400px]" : "")}>
      <Link href={`/listing/${id}`}>
        <div className="relative h-48">
          <img
            src={images[0] || "/placeholder.svg?height=200&width=400&text=No+Image"}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2">
            <Badge variant="secondary" className="bg-white/80 backdrop-blur-sm text-xs">
              {timeAgo}
            </Badge>
          </div>
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">{title}</h3>
              <p className="text-sm text-gray-500 truncate">{address}</p>
            </div>
            <div className="flex-shrink-0">
              <span className="text-lg font-bold text-red-700">${price}</span>
              <span className="text-sm text-gray-500">/month</span>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">
              {bedrooms} {bedrooms === 1 ? 'bedroom' : 'bedrooms'}
            </span>
            <span className="text-sm text-gray-600">
              {bathrooms} {bathrooms === 1 ? 'bathroom' : 'bathrooms'}
            </span>
            {isRoomSublet && (
              <span className="text-sm text-red-700 font-medium">Room Sublet</span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {amenities?.slice(0, 3).map((amenity, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                {amenity}
              </span>
            ))}
            {amenities && amenities.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                +{amenities.length - 3} more
              </span>
            )}
          </div>

          <div className="mt-4 text-sm text-gray-500">
            <span>{getTimeAgo(createdAt)}</span>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}

