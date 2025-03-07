"use client"

import { useState, useCallback } from "react"
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api"

interface MapProps {
  address: string
  className?: string
}

const containerStyle = {
  width: "100%",
  height: "100%",
}

const defaultCenter = {
  lat: 43.0766, // UW-Madison latitude
  lng: -89.4125, // UW-Madison longitude
}

const libraries = ["places", "geocoding"]

export function Map({ address, className }: MapProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [marker, setMarker] = useState<google.maps.LatLng | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const onLoad = useCallback(async (map: google.maps.Map) => {
    setIsLoading(true)
    setError(null)
    const geocoder = new google.maps.Geocoder()

    // Add "Madison, WI" to the address if not present
    const fullAddress = address.toLowerCase().includes("madison")
      ? address
      : `${address}, Madison, WI`

    try {
      const result = await geocoder.geocode({ address: fullAddress })

      if (result.results[0]) {
        const location = result.results[0].geometry.location
        map.setCenter(location)
        map.setZoom(15)
        setMarker(location)
      } else {
        console.error("Location not found for address:", fullAddress)
        setError("Location not found")
        map.setCenter(defaultCenter)
        map.setZoom(14)
      }
    } catch (error) {
      console.error("Geocoding error:", error)
      setError("Failed to locate address")
      map.setCenter(defaultCenter)
      map.setZoom(14)
    } finally {
      setIsLoading(false)
    }

    setMap(map)
  }, [address])

  const onUnmount = useCallback(() => {
    setMap(null)
  }, [])

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    return (
      <div className={`${className} bg-gray-100 rounded-lg flex items-center justify-center`}>
        <p className="text-gray-500">Map configuration error: Missing API key</p>
      </div>
    )
  }

  return (
    <div className={className}>
      <LoadScript 
        googleMapsApiKey={apiKey}
        libraries={libraries as any}
      >
        <div className="relative h-full">
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={defaultCenter}
            zoom={14}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
              disableDefaultUI: false,
              zoomControl: true,
              streetViewControl: true,
              fullscreenControl: true,
              mapTypeControl: true,
            }}
          >
            {marker && <Marker position={marker} />}
          </GoogleMap>
          {error && (
            <div className="absolute top-0 left-0 right-0 bg-red-100 text-red-700 p-2 text-sm text-center">
              {error}
            </div>
          )}
          {isLoading && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80">
              <div className="text-gray-500">Loading map...</div>
            </div>
          )}
        </div>
      </LoadScript>
    </div>
  )
} 