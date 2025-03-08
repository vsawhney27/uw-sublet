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
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold truncate">{title}</h3>
                <p className="text-sm text-gray-500 truncate">{address}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">${price}/mo</p>
                <p className="text-sm text-gray-500">
                  {formattedAvailableFrom} - {formattedAvailableUntil}
                </p>
              </div>
            </div>

            {/* Room Sublet Badge */}
            {isRoomSublet && (
              <div className="flex items-center gap-2 mt-2">
                <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">
                  Room Sublet
                </span>
                {roommateGenders && (
                  <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                    {roommateGenders.replace('-', ' ').replace(/(^\w|\s\w)/g, l => l.toUpperCase())} House
                  </span>
                )}
              </div>
            )}

            {!compact && (
              <>
                <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Bed className="h-4 w-4" />
                    <span>{isRoomSublet ? `Room in ${bedrooms}BR` : `${bedrooms} ${bedrooms === 1 ? 'bed' : 'beds'}`}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bath className="h-4 w-4" />
                    <span>{bathrooms} {bathrooms === 1 ? 'bath' : 'baths'}</span>
                  </div>
                  {isRoomSublet && totalRoommates && (
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{totalRoommates} roommate{totalRoommates !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-1">
                  {amenities.slice(0, 3).map((amenity) => (
                    <Badge key={amenity} variant="outline" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                  {amenities.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{amenities.length - 3} more
                    </Badge>
                  )}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}

