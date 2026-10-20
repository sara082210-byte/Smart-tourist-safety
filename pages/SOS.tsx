import { useState, useEffect } from 'react'
import { Link, navigate } from '../src/router'
import { getCurrentUser } from '../src/services/authService'
import type { User } from '../src/services/authService'
import { useDestination } from '../src/context/DestinationContext'
import './SOS.css'

type EmergencyType = 'medical' | 'harassment' | 'lost' | 'accident' | 'other'

interface EmergencyOption {
  id: EmergencyType
  label: string
  borderColor: string
  bgLight: string
  iconColor: string
}

const emergencyOptions: EmergencyOption[] = [
  {
    id: 'medical',
    label: 'Medical',
    borderColor: '#dc2626',
    bgLight: '#fee2e2',
    iconColor: '#dc2626',
  },
  {
    id: 'harassment',
    label: 'Harassment',
    borderColor: '#9333ea',
    bgLight: '#f3e8ff',
    iconColor: '#9333ea',
  },
  {
    id: 'lost',
    label: 'Lost',
    borderColor: '#f59e0b',
    bgLight: '#fef3c7',
    iconColor: '#d97706',
  },
  {
    id: 'accident',
    label: 'Accident',
    borderColor: '#0284c7',
    bgLight: '#e0f2fe',
    iconColor: '#0284c7',
  },
  {
    id: 'other',
    label: 'Other',
    borderColor: '#94a3b8',
    bgLight: '#f1f5f9',
    iconColor: '#64748b',
  },
]

export default function SOS() {
  const { selectedDestination } = useDestination()
  const [user, setUser] = useState<User | null>(null)
  const [selectedType, setSelectedType] = useState<EmergencyType>('medical')
  const [isFetchingLocation, setIsFetchingLocation] = useState(false)
  const [gpsStatus, setGpsStatus] = useState<'prompt' | 'granted' | 'denied' | 'unavailable'>('prompt')
  const [gpsCoordinates, setGpsCoordinates] = useState<string | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [activeAlert, setActiveAlert] = useState<{
    type: string
    timestamp: string
    responders: string
  } | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getCurrentUser()
      .then((u) => {
        if (!cancelled && u) setUser(u)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const userInitial = user?.fullName ? user.fullName.trim()[0].toUpperCase() : 'T'

  // Request browser geolocation separately to clearly distinguish destination from live GPS
  const requestGpsLocation = () => {
    if (!('geolocation' in navigator)) {
      setGpsStatus('unavailable')
      return
    }

    setIsFetchingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsFetchingLocation(false)
        setGpsStatus('granted')
        setGpsCoordinates(
          `${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E (±${Math.round(pos.coords.accuracy)}m)`
        )
      },
      () => {
        setIsFetchingLocation(false)
        setGpsStatus('denied')
      },
      { timeout: 5000, enableHighAccuracy: true }
    )
  }

  useEffect(() => {
    requestGpsLocation()
  }, [])

  const handleSendSosClick = () => {
    setShowConfirmModal(true)
  }

  const handleConfirmSend = () => {
    setShowConfirmModal(false)
    const now = new Date()
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const selectedOption = emergencyOptions.find((o) => o.id === selectedType)

    setActiveAlert({
      type: selectedOption?.label || 'Emergency',
      timestamp: `Today at ${timeFormatted}`,
      responders: `${selectedDestination.localPolice.name} (112) & Personal Emergency Contacts`,
    })

    setToastMessage('Demonstration SOS alert triggered (Simulated Student Prototype).')
  }

  const handleCancelAlert = () => {
    setActiveAlert(null)
    setToastMessage('Active emergency alert dismissed.')
    setTimeout(() => setToastMessage(null), 3500)
  }

  return (
    <div className="sos-page-wrapper">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="sos-toast" role="alert">
          <span className="sos-toast-icon">ℹ️</span>
          <span>{toastMessage}</span>
          <button
            type="button"
            className="sos-toast-close"
            onClick={() => setToastMessage(null)}
            aria-label="Dismiss notice"
          >
            ×
          </button>
        </div>
      )}

      {/* Confirmation Dialog Modal */}
      {showConfirmModal && (
        <div className="sos-modal-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="sos-confirm-dialog" onClick={(e) => e.stopPropagation()} role="dialog">
            <div className="sos-confirm-header">
              <span className="sos-confirm-siren">🚨</span>
              <div>
                <h3 className="sos-confirm-title">Confirm Emergency SOS</h3>
                <p className="sos-confirm-subtitle">Demonstration Safety Alert</p>
              </div>
            </div>

            <div className="sos-confirm-body">
              <p className="sos-confirm-question">
                Are you sure you want to broadcast a simulated emergency SOS for{' '}
                <strong>{emergencyOptions.find((o) => o.id === selectedType)?.label}</strong>?
              </p>

              <div className="sos-confirm-card">
                <div className="sos-confirm-row">
                  <span className="sos-row-label">Target Responders:</span>
                  <span className="sos-row-value sos-bold">{selectedDestination.localPolice.name} (112) & Saved Emergency Contacts</span>
                </div>
                <div className="sos-confirm-row">
                  <span className="sos-row-label">Selected Destination:</span>
                  <span className="sos-row-value">{selectedDestination.name}, {selectedDestination.state}</span>
                </div>
                <div className="sos-confirm-row">
                  <span className="sos-row-label">Destination Coords:</span>
                  <span className="sos-row-value">{selectedDestination.latitude.toFixed(4)}° N, {selectedDestination.longitude.toFixed(4)}° E</span>
                </div>
                <div className="sos-confirm-row">
                  <span className="sos-row-label">Current GPS Status:</span>
                  <span className="sos-row-value">{gpsCoordinates ? `Live: ${gpsCoordinates}` : gpsStatus === 'denied' ? 'GPS permission denied (planned destination used)' : 'Location pending / offline'}</span>
                </div>
                <div className="sos-confirm-notice">
                  ⚠️ <strong>Prototype Notice:</strong> This is a simulation for student evaluation and demonstration. Real emergency authorities are not contacted.
                </div>
              </div>
            </div>

            <div className="sos-confirm-actions">
              <button
                type="button"
                className="sos-btn-dialog-cancel"
                onClick={() => setShowConfirmModal(false)}
                id="cancel-sos-confirm-btn"
              >
                Cancel
              </button>
              <button
                type="button"
                className="sos-btn-dialog-confirm"
                onClick={handleConfirmSend}
                id="confirm-sos-dialog-btn"
              >
                Send SOS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* App Ambient Shell (Matches background in reference) */}
      <div className="sos-ambient-backdrop">
        <div className="sos-app-bar-mock">
          <div className="sos-mock-brand">
            <svg className="sos-shield-icon" viewBox="0 0 32 36" aria-hidden="true">
              <path d="M16 1 3 6v10c0 9 5.6 15.6 13 19 7.4-3.4 13-10 13-19V6L16 1Z" fill="#1d4f91" />
              <circle cx="16" cy="17" r="9" fill="#3d8be0" />
              <path d="M10 13c2-1 3 1 5 0s2-3 4-2 1 3 3 4-1 4-3 4-2 2-4 1-1-3-3-3-3-2-2-4Z" fill="#4caf50" />
            </svg>
            <span className="sos-brand-text">SafeJourney</span>
          </div>
          <div className="sos-mock-user">
            <div className="sos-user-avatar">
              <span className="sos-avatar-fallback">{userInitial}</span>
            </div>
            <span className="sos-user-name">{user?.fullName || 'Tourist'}</span>
          </div>
        </div>

        {/* Active Alert Banner if triggered */}
        {activeAlert && (
          <div className="sos-active-alert-banner" role="alert">
            <div className="sos-alert-content">
              <div className="sos-alert-icon-ring">🚨</div>
              <div>
                <h4 className="sos-alert-headline">
                  Demonstration Alert Active • {activeAlert.type} Assistance
                </h4>
                <p className="sos-alert-subline">
                  Target Responders: <strong>{activeAlert.responders}</strong> • Triggered {activeAlert.timestamp}
                </p>
                <p className="sos-alert-disclaimer">
                  (Simulated college project prototype — no live emergency dispatch was made)
                </p>
              </div>
            </div>
            <button
              type="button"
              className="sos-alert-dismiss-btn"
              onClick={handleCancelAlert}
              id="dismiss-active-sos-btn"
            >
              Cancel / Dismiss Alert
            </button>
          </div>
        )}

        {/* Main Emergency Assistance Dialog Container (Pixel-perfect to reference image) */}
        <div className="sos-card-container">
          <main className="sos-modal-card" aria-labelledby="sos-modal-title">
            {/* Header */}
            <div className="sos-header">
              <div className="sos-title-group">
                <h1 id="sos-modal-title" className="sos-title">
                  Emergency Assistance
                </h1>
                <p className="sos-subtitle">Select the type of emergency</p>
              </div>
              <button
                type="button"
                className="sos-close-btn"
                onClick={() => navigate('/dashboard')}
                aria-label="Close"
                id="sos-close-btn"
              >
                ✕
              </button>
            </div>

            {/* 5 Emergency Option Cards */}
            <div className="sos-options-grid" role="radiogroup" aria-label="Emergency options">
              {/* 1. Medical */}
              <button
                type="button"
                className={`sos-option-card ${selectedType === 'medical' ? 'selected-medical' : ''}`}
                onClick={() => setSelectedType('medical')}
                role="radio"
                aria-checked={selectedType === 'medical'}
                id="sos-opt-medical"
              >
                <div className="sos-icon-circle bg-red-soft">
                  <div className="sos-medical-square">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z" />
                    </svg>
                  </div>
                </div>
                <span className="sos-option-label">Medical</span>
              </button>

              {/* 2. Harassment */}
              <button
                type="button"
                className={`sos-option-card ${selectedType === 'harassment' ? 'selected-harassment' : ''}`}
                onClick={() => setSelectedType('harassment')}
                role="radio"
                aria-checked={selectedType === 'harassment'}
                id="sos-opt-harassment"
              >
                <div className="sos-icon-circle bg-purple-soft">
                  <svg className="sos-svg-icon icon-purple" viewBox="0 0 24 24" fill="currentColor">
                    {/* Person silhouette with alert/shield teardrop above */}
                    <path d="M12 2C10.5 4 10 5.5 10 6.5c0 1.1.9 2 2 2s2-.9 2-2C14 5.5 13.5 4 12 2z" />
                    <circle cx="12" cy="12" r="3.2" />
                    <path d="M6 20.5v-1c0-2.8 3.5-4.5 6-4.5s6 1.7 6 4.5v1H6z" />
                  </svg>
                </div>
                <span className="sos-option-label">Harassment</span>
              </button>

              {/* 3. Lost */}
              <button
                type="button"
                className={`sos-option-card ${selectedType === 'lost' ? 'selected-lost' : ''}`}
                onClick={() => setSelectedType('lost')}
                role="radio"
                aria-checked={selectedType === 'lost'}
                id="sos-opt-lost"
              >
                <div className="sos-icon-circle bg-amber-soft">
                  <svg className="sos-svg-icon icon-amber" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 10.5c-.83 0-1.5-.67-1.5-1.5h1c0 .28.22.5.5.5s.5-.22.5-.5c0-.62-.84-.73-.96-1.56L11 8.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5h-1c0-.28-.22-.5-.5-.5s-.5.22-.5.5c0 .62.84.73.96 1.56.02.13.04.28.04.44 0 .83-.67 1.5-1.5 1.5zm.75 2.25h-1.5V13.5h1.5v1.25z" />
                  </svg>
                </div>
                <span className="sos-option-label">Lost</span>
              </button>

              {/* 4. Accident */}
              <button
                type="button"
                className={`sos-option-card ${selectedType === 'accident' ? 'selected-accident' : ''}`}
                onClick={() => setSelectedType('accident')}
                role="radio"
                aria-checked={selectedType === 'accident'}
                id="sos-opt-accident"
              >
                <div className="sos-icon-circle bg-blue-soft">
                  <svg className="sos-svg-icon icon-blue" viewBox="0 0 24 24" fill="currentColor">
                    {/* Collision spark above car */}
                    <path d="M12 2l1 2 2.2-.6-1.2 2 1.6 1.5-2.2.2-.4 2.1-1-1.9-2 1 .8-2.1-1.7-1.4 2.2-.3z" />
                    {/* Car silhouette */}
                    <path d="M18.92 12.01C18.72 11.42 18.16 11 17.5 11h-11c-.66 0-1.22.42-1.42 1.01L3.5 17v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h11v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-1.58-4.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 10l1.2-3.6c.15-.45.57-.75 1.05-.75h9.5c.48 0 .9.3 1.05.75L19 10H5z" />
                  </svg>
                </div>
                <span className="sos-option-label">Accident</span>
              </button>

              {/* 5. Other */}
              <button
                type="button"
                className={`sos-option-card ${selectedType === 'other' ? 'selected-other' : ''}`}
                onClick={() => setSelectedType('other')}
                role="radio"
                aria-checked={selectedType === 'other'}
                id="sos-opt-other"
              >
                <div className="sos-icon-circle bg-grey-soft">
                  <svg className="sos-svg-icon icon-grey" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 11H7V9h2v2zm4 0h-2V9h2v2zm4 0h-2V9h2v2z" />
                  </svg>
                </div>
                <span className="sos-option-label">Other</span>
              </button>
            </div>

            {/* Lower Dual Section: Location Info (Left) & Mini Map (Right) */}
            <div className="sos-lower-grid">
              {/* Left Box: Your Location */}
              <div className="sos-location-card">
                <div className="sos-location-header">
                  <span className="sos-location-title">Selected Destination</span>
                  <span className="sos-gps-fixed" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
                    ● Planned
                  </span>
                </div>

                <div className="sos-location-body">
                  <p className="sos-location-text">{selectedDestination.name}, {selectedDestination.state}</p>
                  <p className="sos-location-coords">
                    📍 {selectedDestination.latitude.toFixed(4)}° N, {selectedDestination.longitude.toFixed(4)}° E
                  </p>
                </div>

                {/* Separate Current GPS Location */}
                <div style={{ marginTop: '12px', padding: '10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                      🛰️ Current Device GPS
                    </span>
                    <span style={{ fontSize: '11px', color: gpsCoordinates ? '#16a34a' : '#ea580c', fontWeight: 600 }}>
                      {isFetchingLocation ? 'Acquiring...' : gpsCoordinates ? '● Live GPS' : 'GPS Inactive'}
                    </span>
                  </div>
                  {gpsCoordinates ? (
                    <p style={{ margin: 0, fontSize: '12px', color: '#0f172a', fontWeight: 500 }}>{gpsCoordinates}</p>
                  ) : (
                    <p style={{ margin: 0, fontSize: '11px', color: '#64748b', lineHeight: 1.4 }}>
                      {gpsStatus === 'denied'
                        ? 'Location permission denied. Planned destination coordinates are displayed above.'
                        : 'GPS permission not granted or location unavailable. The displayed location is the planned destination.'}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={requestGpsLocation}
                    style={{
                      marginTop: '6px',
                      background: 'transparent',
                      border: 'none',
                      color: '#2563eb',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    🔄 Refresh GPS Location
                  </button>
                </div>

                {/* Target Responders */}
                <div className="sos-responders-badge" style={{ marginTop: '12px' }}>
                  <span className="sos-responders-icon">🛡️</span>
                  <div>
                    <div className="sos-responders-label">Target Responders:</div>
                    <div className="sos-responders-val">{selectedDestination.localPolice.name} (112) & Saved Contacts</div>
                  </div>
                </div>
              </div>

              {/* Right Box: Geofenced Map Illustration */}
              <div className="sos-map-card">
                <svg
                  className="sos-map-svg"
                  viewBox="0 0 320 180"
                  preserveAspectRatio="xMidYMid slice"
                  aria-label="Geofenced safe zone map"
                >
                  <defs>
                    <linearGradient id="waterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#bae6fd" />
                      <stop offset="100%" stopColor="#7dd3fc" />
                    </linearGradient>
                  </defs>

                  {/* Base Green / Urban Land */}
                  <rect width="320" height="180" fill="#e8f5e9" />

                  {/* Water River / Coast */}
                  <path
                    d="M-10,130 Q40,110 90,140 T180,110 T260,130 T330,80 L330,-10 L-10,-10 Z"
                    fill="url(#waterGrad)"
                    opacity="0.85"
                  />
                  <path
                    d="M-10,30 Q80,70 140,40 T280,20 L330,0 L-10,0 Z"
                    fill="#93c5fd"
                    opacity="0.6"
                  />

                  {/* Secondary Green Zones / Parks */}
                  <path d="M10,80 Q40,60 70,85 T110,120 L20,150 Z" fill="#c8e6c9" />
                  <path d="M220,120 Q260,100 300,130 L320,180 L200,180 Z" fill="#dcfce7" />

                  {/* Road Network Lines */}
                  <g stroke="#ffffff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" opacity="0.95">
                    {/* Main Avenue */}
                    <line x1="20" y1="160" x2="300" y2="20" />
                    <line x1="120" y1="180" x2="200" y2="0" />
                    <line x1="0" y1="80" x2="240" y2="160" />
                    <line x1="180" y1="140" x2="310" y2="100" />
                    <line x1="60" y1="20" x2="180" y2="110" />
                  </g>
                  <g stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7">
                    <line x1="20" y1="160" x2="300" y2="20" />
                    <line x1="120" y1="180" x2="200" y2="0" />
                    <line x1="0" y1="80" x2="240" y2="160" />
                    <line x1="180" y1="140" x2="310" y2="100" />
                    <line x1="60" y1="20" x2="180" y2="110" />
                  </g>

                  {/* Geofence Blue Polygon Perimeter (Matches reference image exact shape) */}
                  <polygon
                    points="60,135 110,40 240,60 250,140 180,130 160,170"
                    fill="rgba(37, 99, 235, 0.08)"
                    stroke="#2563eb"
                    strokeWidth="2.4"
                    strokeLinejoin="round"
                  />

                  {/* Small vertex nodes on geofence */}
                  <circle cx="60" cy="135" r="3" fill="#2563eb" />
                  <circle cx="110" cy="40" r="3" fill="#2563eb" />
                  <circle cx="240" cy="60" r="3" fill="#2563eb" />
                  <circle cx="250" cy="140" r="3" fill="#2563eb" />

                  {/* Centered Location Marker Pin (Black pin with white dot inside) */}
                  <g transform="translate(160, 110)">
                    {/* Subtle radar pulse ring */}
                    <circle cx="0" cy="-6" r="14" fill="#2563eb" opacity="0.15">
                      <animate attributeName="r" values="8;18;8" dur="2.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.25;0.05;0.25" dur="2.5s" repeatCount="indefinite" />
                    </circle>

                    {/* Pin shadow */}
                    <ellipse cx="0" cy="5" rx="5" ry="2" fill="rgba(0,0,0,0.3)" />

                    {/* Pin shape */}
                    <path
                      d="M0,4 C-4,0 -7,-3 -7,-8 C-7,-12 -3.8,-15 0,-15 C3.8,-15 7,-12 7,-8 C7,-3 4,0 0,4 Z"
                      fill="#0f172a"
                    />
                    {/* Inner white center dot */}
                    <circle cx="0" cy="-8" r="2.5" fill="#ffffff" />
                  </g>
                </svg>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="sos-footer">
              <Link to="/dashboard" className="sos-btn-cancel" id="sos-cancel-btn">
                Cancel
              </Link>

              <button
                type="button"
                className="sos-btn-send"
                onClick={handleSendSosClick}
                id="sos-send-btn"
              >
                Send SOS
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
