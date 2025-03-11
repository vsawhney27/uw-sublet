"use client"

import { useState, useEffect } from "react"
import { GoogleMap, Marker } from "@react-google-maps/api"
import { Loader2 } from "lucide-react"

interface MapProps {
  address: string
  className?: string
}

export function Map({ address, className = "" }: MapProps) {
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const geocodeAddress = async () => {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            address
          )}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
        )
        const data = await response.json()

        if (data.status === "OK" && data.results[0]) {
          const { lat, lng } = data.results[0].geometry.location
          setCoordinates({ lat, lng })
        } else {
          setError("Could not find location on map")
        }
      } catch (error) {
        console.error("Geocoding error:", error)
        setError("Failed to load map")
      } finally {
        setIsLoading(false)
      }
    }

    geocodeAddress()
  }, [address])

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <Loader2 className="h-8 w-8 animate-spin text-red-700" />
      </div>
    )
  }

  if (error || !coordinates) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <p className="text-gray-500">{error || "Map unavailable"}</p>
      </div>
    )
  }

  return (
    <GoogleMap
      mapContainerClassName={className}
      center={coordinates}
      zoom={15}
      options={{
        disableDefaultUI: true,
        zoomControl: true,
        streetViewControl: true,
        scaleControl: true,
        mapTypeControl: true,
        rotateControl: true,
        fullscreenControl: true,
      }}
    >
      <Marker position={coordinates} />
    </GoogleMap>
  )
} 