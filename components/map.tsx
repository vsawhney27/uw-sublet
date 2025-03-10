"use client"

import { useState, useCallback, useEffect } from "react"
import { GoogleMap, Marker } from "@react-google-maps/api"

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

  // Function to initialize map
  const initializeMap = useCallback(async () => {
    if (!google?.maps?.Geocoder) {
      console.error("Google Maps API not loaded")
      setError("Map service unavailable")
      setIsLoading(false)
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
  }, [address, map])

  // Initialize map when component mounts or address changes
  useEffect(() => {
    initializeMap()
  }, [address, initializeMap])

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
  }, [])

  const onUnmount = useCallback(() => {
    setMap(null)
  }, [])

  return (
    <div className={className}>
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
    </div>
  )
} 