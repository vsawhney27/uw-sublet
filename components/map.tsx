"use client"

import { useState, useCallback, useEffect } from "react"
import { GoogleMap, Marker } from "@react-google-maps/api"
import Script from "next/script"

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

export function Map({ address, className }: MapProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [marker, setMarker] = useState<google.maps.LatLng | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)

  // Get API key and trim any whitespace
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim()

  // Function to initialize map
  const initializeMap = useCallback(async () => {
    if (!isScriptLoaded || !google?.maps?.Geocoder) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const geocoder = new google.maps.Geocoder()
      
      // Add "Madison, WI" to the address if not present
      const fullAddress = address.toLowerCase().includes("madison")
        ? address
        : `${address}, Madison, WI`

      const result = await geocoder.geocode({ address: fullAddress })

      if (result.results && result.results[0]) {
        const location = result.results[0].geometry.location
        if (map) {
          map.setCenter(location)
          map.setZoom(15)
          setMarker(location)
        }
      } else {
        setError("Could not find this location")
        if (map) {
          map.setCenter(defaultCenter)
          map.setZoom(14)
        }
      }
    } catch (error) {
      console.error("Geocoding error:", error)
      setError("Could not load location data")
      if (map) {
        map.setCenter(defaultCenter)
        map.setZoom(14)
      }
    } finally {
      setIsLoading(false)
    }
  }, [address, map, isScriptLoaded])

  // Initialize map when script loads or address changes
  useEffect(() => {
    if (isScriptLoaded) {
      initializeMap()
    }
  }, [isScriptLoaded, address, initializeMap])

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
  }, [])

  const onUnmount = useCallback(() => {
    setMap(null)
  }, [])

  if (!apiKey) {
    return (
      <div className={`${className} bg-gray-100 rounded-lg flex items-center justify-center p-4`}>
        <p className="text-red-500">Error: Google Maps API key is missing</p>
      </div>
    )
  }

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geocoding`}
        onLoad={() => setIsScriptLoaded(true)}
        onError={() => {
          console.error("Google Maps script failed to load")
          setError("Failed to load Google Maps")
          setIsLoading(false)
        }}
      />
      <div className={className}>
        <div className="relative h-full">
          {isScriptLoaded && (
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
          )}
          
          {error && (
            <div className="absolute top-0 left-0 right-0 bg-red-100 text-red-700 p-2 text-sm text-center">
              {error}
            </div>
          )}
          
          {(isLoading || !isScriptLoaded) && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80">
              <div className="text-gray-500">Loading map...</div>
            </div>
          )}
        </div>
      </div>
    </>
  )
} 