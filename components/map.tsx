'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { cn } from '@/lib/utils'

interface MapProps {
  center: [number, number]
  zoom: number
  className?: string
  destinations: {
    id: string
    arrival: number
    departure: number
    location: {
      lat: number
      lng: number
    }
    city: string
    region: string
    presentsDelivered: number
  }[]
  currentDate: Date
}

const Map = ({ center, zoom, className, destinations, currentDate }: MapProps) => {
  const mapRef = useRef<L.Map | null>(null)
  const markersLayerRef = useRef<L.LayerGroup | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    if (!mapRef.current) {
      mapRef.current = L.map('map', {
        zoomControl: false,
        attributionControl: false
      }).setView(center, zoom)
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        className: 'dark:opacity-70'
      }).addTo(mapRef.current)
      
      markersLayerRef.current = L.layerGroup().addTo(mapRef.current)
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView(center, zoom)
    }
  }, [center, zoom])

  useEffect(() => {
    if (!markersLayerRef.current) return

    markersLayerRef.current.clearLayers()

    destinations.forEach((destination) => {
      const { arrival, departure, location, city, region, presentsDelivered } = destination
      const arrivalDate = new Date(arrival)
      const departureDate = new Date(departure)
      const santaWasHere = currentDate.getTime() > departureDate.getTime()
      const santaIsHere = 
        currentDate.getTime() >= arrivalDate.getTime() && 
        currentDate.getTime() <= departureDate.getTime()

      const icon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="w-6 h-6 rounded-full border-2 border-white shadow-lg ${
          santaIsHere 
            ? 'bg-red-500 animate-pulse' 
            : santaWasHere 
              ? 'bg-green-500' 
              : 'bg-blue-500/50'
        }"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      })

      const marker = L.marker([location.lat, location.lng], { icon })
      
      const popupContent = `
        <div class="p-2 rounded-lg shadow-lg">
          <h3 class="font-semibold text-base">${city}, ${region}</h3>
          <div class="mt-2 space-y-1 text-sm text-muted-foreground">
            <p>Arrival: ${arrivalDate.toLocaleTimeString()}</p>
            <p>Departure: ${departureDate.toLocaleTimeString()}</p>
            <p class="font-medium">Presents: ${presentsDelivered.toLocaleString()}</p>
          </div>
        </div>
      `

      marker.bindPopup(popupContent, {
        className: 'rounded-lg shadow-lg'
      })

      markersLayerRef.current?.addLayer(marker)
    })
  }, [destinations, currentDate])

  return (
    <div 
      id="map" 
      className={cn(
        "w-full h-[50vh] rounded-lg border shadow-xs overflow-hidden",
        className
      )} 
    />
  )
}

export default Map

