import React, { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { DestinationData, SafePlaceItem } from '../services/destinationData'

interface DestinationMapProps {
  destination: DestinationData
  places?: SafePlaceItem[]
  height?: string
  zoom?: number
}

export const DestinationMap: React.FC<DestinationMapProps> = ({
  destination,
  places = destination.safePlaces,
  height = '320px',
  zoom = 13,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapContainerRef.current) return

    // Clean up prior map instance if exists
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    try {
      const map = L.map(mapContainerRef.current, {
        center: [destination.latitude, destination.longitude],
        zoom,
        zoomControl: true,
        scrollWheelZoom: false,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map)

      // Main Destination Marker
      const destIcon = L.divIcon({
        className: 'custom-dest-pin',
        html: `
          <div style="
            background: #2563eb;
            color: #ffffff;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            box-shadow: 0 4px 12px rgba(37,99,235,0.45);
            border: 3px solid #ffffff;
          ">📍</div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      })

      const destMarker = L.marker([destination.latitude, destination.longitude], { icon: destIcon }).addTo(map)
      destMarker.bindPopup(`
        <div style="font-family: inherit; font-size: 13px; line-height: 1.4;">
          <strong style="color: #1e3a8a; font-size: 14px;">${destination.name}</strong><br/>
          <span>${destination.state}</span><br/>
          <small style="color: #64748b;">📍 ${destination.latitude.toFixed(4)}° N, ${destination.longitude.toFixed(4)}° E</small>
        </div>
      `)

      // Add nearby safe places markers
      places.forEach((sp) => {
        let badgeBg = '#0284c7'
        let emoji = 'ℹ️'
        if (sp.category === 'Police') {
          badgeBg = '#1d4ed8'
          emoji = '👮'
        } else if (sp.category === 'Hospital') {
          badgeBg = '#dc2626'
          emoji = '🏥'
        }

        const spIcon = L.divIcon({
          className: 'custom-sp-pin',
          html: `
            <div style="
              background: ${badgeBg};
              color: #ffffff;
              width: 28px;
              height: 28px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 14px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.25);
              border: 2px solid #ffffff;
            ">${emoji}</div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        })

        const marker = L.marker([sp.lat, sp.lng], { icon: spIcon }).addTo(map)
        marker.bindPopup(`
          <div style="font-family: inherit; font-size: 13px; line-height: 1.4;">
            <strong style="font-size: 13px;">${sp.name}</strong><br/>
            <span style="display:inline-block; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 600; background: #e0f2fe; color: #0369a1; margin: 4px 0;">${sp.category}</span><br/>
            <span style="color: #475569;">${sp.address}</span><br/>
            <span style="color: #0284c7; font-weight: 500;">Distance: ${sp.distance}</span><br/>
            <a href="tel:${sp.phone.replace(/[^0-9+]/g, '')}" style="color: #16a34a; font-weight: 600; text-decoration: none; display: inline-block; margin-top: 4px;">📞 ${sp.phone}</a>
          </div>
        `)
      })

      mapInstanceRef.current = map

      // Force recalculation of container size after mounting
      setTimeout(() => {
        map.invalidateSize()
      }, 200)
    } catch (err) {
      console.warn('Failed to initialize Leaflet map:', err)
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [destination, places, zoom])

  return (
    <div
      style={{
        width: '100%',
        height,
        borderRadius: '12px',
        overflow: 'hidden',
        position: 'relative',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
      <div
        style={{
          position: 'absolute',
          bottom: '8px',
          left: '8px',
          background: 'rgba(255, 255, 255, 0.92)',
          padding: '4px 10px',
          borderRadius: '6px',
          fontSize: '11px',
          color: '#334155',
          fontWeight: 600,
          zIndex: 1000,
          pointerEvents: 'none',
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
        }}
      >
        📍 {destination.name} • {destination.latitude.toFixed(4)}°N, {destination.longitude.toFixed(4)}°E
      </div>
    </div>
  )
}
export default DestinationMap
