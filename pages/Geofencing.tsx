import { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Link } from '../src/router'
import { useDestination } from '../src/context/DestinationContext'
import { DestinationData } from '../src/services/destinationData'
import './Geofencing.css'

/* ------------------------------------------------------------------ */
/* Destination-aware geofencing safety zones (Prototype demonstration)*/
/* ------------------------------------------------------------------ */
type ZoneLevel = 'high' | 'caution' | 'flood' | 'safe'

type Zone = {
  id: string
  name: string
  level: ZoneLevel
  center: [number, number]
  radius: number // metres
  message: string
}

function generateZones(dest: DestinationData): Zone[] {
  const [lat, lng] = [dest.latitude, dest.longitude]
  return [
    {
      id: 'z-safe-police',
      name: `${dest.localPolice.name} Safe Perimeter`,
      level: 'safe',
      center: [lat + 0.002, lng - 0.002],
      radius: 350,
      message: `You are inside a verified safety perimeter near ${dest.localPolice.name} (Helpline: 112).`,
    },
    {
      id: 'z-safe-tourist',
      name: `${dest.name} Monitored Tourist Corridor`,
      level: 'safe',
      center: [lat - 0.0015, lng + 0.002],
      radius: 400,
      message: `You are inside the monitored tourist safety corridor for ${dest.name}.`,
    },
    {
      id: 'z-caution',
      name: `${dest.name} High-Footfall Area`,
      level: 'caution',
      center: [lat + 0.005, lng + 0.004],
      radius: 320,
      message: 'High pedestrian density and congestion ahead. Watch your personal belongings and follow safety signage.',
    },
    {
      id: 'z-flood',
      name: 'Monsoon / Drainage Caution Zone',
      level: 'flood',
      center: [lat - 0.006, lng - 0.005],
      radius: 380,
      message: 'Low-lying drainage or seasonal risk zone. Exercise caution during rainfall and follow local police advisories.',
    },
    {
      id: 'z-high',
      name: 'Restricted / Steep Terrain Warning Zone',
      level: 'high',
      center: [lat + 0.008, lng - 0.007],
      radius: 420,
      message: 'Restricted area or hazardous terrain. Do not stray off marked trails or seawalls after dark.',
    },
  ]
}

const LEVEL_STYLE: Record<ZoneLevel, { color: string; label: string }> = {
  high: { color: '#dc2626', label: 'High risk' },
  caution: { color: '#f59e0b', label: 'Caution' },
  flood: { color: '#2563eb', label: 'Flood prone' },
  safe: { color: '#16a34a', label: 'Safe zone' },
}

const WALK_KMH = 5

function distanceMeters(a: [number, number], b: [number, number]) {
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b[0] - a[0])
  const dLng = toRad(b[1] - a[1])
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

function formatDistance(m: number) {
  const km = Math.max(m, 0) / 1000
  const mins = Math.max(1, Math.round((km / WALK_KMH) * 60))
  return `${km.toFixed(1)} km • ${mins} min`
}

type GeoStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable' | 'error'

function ZoneIcon({ level }: { level: ZoneLevel }) {
  if (level === 'high')
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <path fill="#e11d2e" d="M12 1.5l2.6 2 3.2-.4 1.2 3 3 1.2-.4 3.2 2 2.6-2 2.6.4 3.2-3 1.2-1.2 3-3.2-.4-2.6 2-2.6-2-3.2.4-1.2-3-3-1.2.4-3.2-2-2.6 2-2.6-.4-3.2 3-1.2 1.2-3 3.2.4z" />
        <path fill="#fff" d="M11 6.5h2v7h-2zM11 15.5h2v2h-2z" />
      </svg>
    )
  if (level === 'caution')
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <circle cx="12" cy="12" r="11" fill="#f59e0b" />
        <path fill="#fff" d="M12 5.5l6.5 11.5h-13z" />
        <path fill="#f59e0b" d="M11.2 9.5h1.6v4h-1.6zM11.2 14.4h1.6v1.5h-1.6z" />
      </svg>
    )
  if (level === 'flood')
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <circle cx="12" cy="12" r="11" fill="#1d6fd8" />
        <path fill="#fff" d="M12 5s-4 4.6-4 7.3A4 4 0 0 0 12 16.3a4 4 0 0 0 4-4C16 9.6 12 5 12 5z" />
        <path fill="none" stroke="#fff" strokeWidth="1.3" d="M6 18.2c1 .8 2 .8 3 0s2-.8 3 0 2 .8 3 0 2-.8 3 0" />
      </svg>
    )
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#16a34a" />
      <path fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" d="M7.5 12.5l3 3 6-6.5" />
    </svg>
  )
}

const pinIcon = (color: string) =>
  L.divIcon({
    className: 'geo-pin',
    html: `<svg viewBox="0 0 24 34" width="30" height="42"><ellipse cx="12" cy="32" rx="5" ry="1.8" fill="rgba(0,0,0,.25)"/><path d="M12 0C5.4 0 0 5.2 0 11.7 0 20.4 12 31 12 31s12-10.6 12-19.3C24 5.2 18.6 0 12 0z" fill="${color}"/><circle cx="12" cy="11.5" r="4.3" fill="#fff"/></svg>`,
    iconSize: [30, 42],
    iconAnchor: [15, 40],
  })

function Geofencing() {
  const { selectedDestination } = useDestination()
  const mapEl = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const userMarkerRef = useRef<L.Marker | null>(null)
  const circlesRef = useRef<Record<string, L.Circle>>({})

  const [selectedId, setSelectedId] = useState<string>('z-high')
  const [userPos, setUserPos] = useState<[number, number] | null>(null)
  const [geoStatus, setGeoStatus] = useState<GeoStatus>('idle')

  const destCenter: [number, number] = useMemo(
    () => [selectedDestination.latitude, selectedDestination.longitude],
    [selectedDestination]
  )

  const zones = useMemo(() => generateZones(selectedDestination), [selectedDestination])

  const origin = userPos ?? destCenter
  const riskZones = zones.filter((z) => z.level !== 'safe')

  const zonesWithDistance = useMemo(
    () =>
      riskZones
        .map((z) => ({ ...z, dist: Math.max(0, distanceMeters(origin, z.center) - z.radius) }))
        .sort((a, b) => a.dist - b.dist),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [origin[0], origin[1], zones],
  )

  // Zone the (real, permission-granted) user location is inside, if any
  const userInside = useMemo(() => {
    if (!userPos) return null
    const hits = zones.filter((z) => distanceMeters(userPos, z.center) <= z.radius)
    const order: ZoneLevel[] = ['high', 'caution', 'flood', 'safe']
    return hits.sort((a, b) => order.indexOf(a.level) - order.indexOf(b.level))[0] ?? null
  }, [userPos, zones])

  const selected = zones.find((z) => z.id === selectedId) ?? zones[0]

  /* ---------- Map setup ---------- */
  useEffect(() => {
    if (!mapEl.current) return

    // Clean up previous map if exists
    if (mapRef.current) {
      mapRef.current.remove()
      mapRef.current = null
      circlesRef.current = {}
    }

    const map = L.map(mapEl.current, { zoomControl: true, scrollWheelZoom: false }).setView(destCenter, 14)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)

    zones.forEach((z) => {
      const { color, label } = LEVEL_STYLE[z.level]
      const c = L.circle(z.center, {
        radius: z.radius,
        color,
        weight: 2,
        fillColor: color,
        fillOpacity: z.level === 'safe' ? 0.18 : 0.22,
      })
        .addTo(map)
        .bindTooltip(`${z.name} (sample · ${label})`, { direction: 'top' })
      c.on('click', () => setSelectedId(z.id))
      circlesRef.current[z.id] = c
    })

    L.marker(destCenter, { icon: pinIcon('#2563eb'), keyboard: false, interactive: false })
      .addTo(map)
      .bindTooltip(`📍 ${selectedDestination.name}`, { permanent: false })

    mapRef.current = map
    const onResize = () => map.invalidateSize()
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
      circlesRef.current = {}
    }
  }, [selectedDestination, destCenter, zones])

  /* ---------- Highlight selected zone ---------- */
  useEffect(() => {
    Object.entries(circlesRef.current).forEach(([id, c]) => {
      c.setStyle({ weight: id === selectedId ? 3.5 : 2 })
    })
    const z = zones.find((x) => x.id === selectedId)
    if (z && mapRef.current) mapRef.current.panTo(z.center, { animate: true })
  }, [selectedId, zones])

  /* ---------- User marker ---------- */
  useEffect(() => {
    const map = mapRef.current
    if (!map || !userPos) return
    if (!userMarkerRef.current) {
      userMarkerRef.current = L.marker(userPos, { icon: pinIcon('#2563eb') })
        .addTo(map)
        .bindTooltip('Your location (from browser)', { direction: 'top' })
    } else {
      userMarkerRef.current.setLatLng(userPos)
    }
    map.setView(userPos, 14)
  }, [userPos])

  const requestLocation = () => {
    if (!('geolocation' in navigator)) {
      setGeoStatus('unavailable')
      return
    }
    setGeoStatus('requesting')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos([pos.coords.latitude, pos.coords.longitude])
        setGeoStatus('granted')
      },
      (err) => setGeoStatus(err.code === err.PERMISSION_DENIED ? 'denied' : 'error'),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  /* ---------- Banner content ---------- */
  const banner = userInside
    ? { level: userInside.level, text: userInside.message, tag: 'Based on your shared location vs. sample zones' }
    : { level: selected.level, text: selected.message, tag: 'Sample alert preview' }

  const geoMessage: Record<GeoStatus, string> = {
    idle: `Location is off. Distances are measured from ${selectedDestination.name}, ${selectedDestination.state}.`,
    requesting: 'Requesting location permission…',
    granted: userInside
      ? `Your location is inside: ${userInside.name} (sample zone).`
      : 'Your location is not inside any sample zone. Distances are from your location.',
    denied: `Location permission denied. Showing distances from ${selectedDestination.name} center instead.`,
    unavailable: `Geolocation is not supported by this browser. Using ${selectedDestination.name} center.`,
    error: `Could not get your location. Using ${selectedDestination.name} center instead.`,
  }

  return (
    <div className="geo-page">
      <section className="geo-card" aria-labelledby="geo-title">
        <header className="geo-header">
          <Link to="/dashboard" className="geo-back" id="geo-back-btn" aria-label="Back to dashboard">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 12H4M10 6l-6 6 6 6" />
            </svg>
          </Link>
          <h1 id="geo-title" className="geo-title">Geofencing Safety</h1>
          <span className="geo-proto-badge">{selectedDestination.name} • Active Zones</span>
        </header>

        <div className="geo-layout">
          <div className="geo-main">
            <div className={`geo-alert geo-alert--${banner.level}`} role="status" aria-live="polite">
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" className="geo-alert-icon">
                <path fill="currentColor" d="M12 2L1 21h22L12 2z" />
                <path fill="#fff" d="M11 9h2v6h-2zM11 16.5h2v2h-2z" />
              </svg>
              <div>
                <p className="geo-alert-text">{banner.text}</p>
                <p className="geo-alert-tag">{banner.tag}</p>
              </div>
            </div>

            <div className="geo-map-wrap">
              <div ref={mapEl} className="geo-map" id="geo-map" aria-label="Map of sample safety zones" />
              <ul className="geo-legend" aria-label="Map legend">
                {(Object.keys(LEVEL_STYLE) as ZoneLevel[]).map((lv) => (
                  <li key={lv}>
                    <span className="geo-legend-dot" style={{ background: LEVEL_STYLE[lv].color }} />
                    {LEVEL_STYLE[lv].label}
                  </li>
                ))}
              </ul>
            </div>

            <div className="geo-controls">
              <button
                type="button"
                className="geo-btn geo-btn--primary"
                id="geo-locate-btn"
                onClick={requestLocation}
                disabled={geoStatus === 'requesting'}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                </svg>
                {geoStatus === 'granted' ? 'Refresh my location' : 'Use my location'}
              </button>
              <button
                type="button"
                className="geo-btn"
                id="geo-recenter-btn"
                onClick={() => mapRef.current?.setView(origin, 14)}
              >
                Recenter map
              </button>
              <p className={`geo-status geo-status--${geoStatus}`}>{geoMessage[geoStatus]}</p>
            </div>
          </div>

          <aside className="geo-side" aria-labelledby="geo-zones-title">
            <h2 id="geo-zones-title" className="geo-side-title">Active Zones</h2>
            <ul className="geo-zone-list">
              {zonesWithDistance.map((z) => (
                <li key={z.id}>
                  <button
                    type="button"
                    id={`geo-zone-${z.id}`}
                    className={`geo-zone geo-zone--${z.level} ${selectedId === z.id ? 'is-selected' : ''}`}
                    onClick={() => setSelectedId(z.id)}
                    aria-pressed={selectedId === z.id}
                  >
                    <span className={`geo-zone-icon geo-zone-icon--${z.level}`}>
                      <ZoneIcon level={z.level} />
                    </span>
                    <span className="geo-zone-text">
                      <span className="geo-zone-name">{z.name}</span>
                      <span className="geo-zone-meta">{z.dist === 0 ? 'You are inside' : formatDistance(z.dist)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            <h3 className="geo-side-subtitle">Safe Zones</h3>
            <ul className="geo-zone-list">
              {zones.filter((z) => z.level === 'safe').map((z) => (
                <li key={z.id}>
                  <button
                    type="button"
                    id={`geo-zone-${z.id}`}
                    className={`geo-zone geo-zone--safe ${selectedId === z.id ? 'is-selected' : ''}`}
                    onClick={() => setSelectedId(z.id)}
                    aria-pressed={selectedId === z.id}
                  >
                    <span className="geo-zone-icon geo-zone-icon--safe">
                      <ZoneIcon level="safe" />
                    </span>
                    <span className="geo-zone-text">
                      <span className="geo-zone-name">{z.name}</span>
                      <span className="geo-zone-meta">
                        {formatDistance(Math.max(0, distanceMeters(origin, z.center) - z.radius))}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            <p className="geo-note">
              Zones shown are sample data for this prototype. Real-time monitoring and automatic
              emergency alerts are not active. Times assume walking at ~{WALK_KMH} km/h.
            </p>
          </aside>
        </div>
      </section>
      <p className="geo-caption">Geofencing Safety</p>
    </div>
  )
}

export default Geofencing
