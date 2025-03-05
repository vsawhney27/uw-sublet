import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { MapPin, Calendar, User, Heart } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Listing, User as UserType } from "@prisma/client"

type ListingWithUser = Listing & {
  user: Pick<UserType, "id" | "name" | "email" | "image">
}

interface ListingCardProps {
  listing: ListingWithUser
  onFavorite?: (id: string) => void
  isFavorite?: boolean
}

export function ListingCard({ listing, onFavorite, isFavorite = false }: ListingCardProps) {
  const {
    id,
    title,
    price,
    address,
    bedrooms,
    bathrooms,
    availableFrom,
    availableUntil,
    amenities,
    images,
    createdAt,
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

  // Get time since posted
  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true })

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative h-48">
        <img
          src={images[0] || "/placeholder.svg?height=200&width=400&text=No+Image"}
          alt={title}
          className="w-full h-full object-cover"
        />
        {onFavorite && (
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-2 right-2 rounded-full bg-white/80 backdrop-blur-sm ${
              isFavorite ? "text-red-500 hover:text-red-600" : "text-gray-500 hover:text-gray-600"
            }`}
            onClick={() => onFavorite(id)}
          >
            <Heart className={isFavorite ? "fill-current" : ""} size={18} />
            <span className="sr-only">{isFavorite ? "Remove from favorites" : "Add to favorites"}</span>
          </Button>
        )}
        <div className="absolute bottom-2 left-2">
          <Badge variant="secondary" className="bg-white/80 backdrop-blur-sm text-xs">
            {timeAgo}
          </Badge>
        </div>
      </div>
      <CardContent className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-lg mb-1 line-clamp-1">{title}</h3>
        <p className="text-red-700 font-medium mb-2">${price.toFixed(2)}/month</p>
        <div className="space-y-2 mb-3 flex-1">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="line-clamp-1">{address}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
            <span>
              {formattedAvailableFrom} - {formattedAvailableUntil}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <User className="h-4 w-4 mr-1 flex-shrink-0" />
            <span>
              {bedrooms === 0 ? "Studio" : `${bedrooms} BR`} / {bathrooms} BA
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-1 mb-4">
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
        <Link href={`/listing/${id}`} className="mt-auto">
          <Button className="w-full bg-red-700 hover:bg-red-800">View Details</Button>
        </Link>
      </CardContent>
    </Card>
  )
}

