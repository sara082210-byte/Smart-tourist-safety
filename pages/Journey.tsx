import { useEffect, useRef, useState } from 'react'
import { Link, navigate } from '../src/router'
import { Destination, fetchDestinations } from '../src/services/destinations'
import { useDestination } from '../src/context/DestinationContext'
import DestinationMap from '../src/components/DestinationMap'
import './Journey.css'

interface UpcomingItem {
  id: string
  time: string
  subtext: string
  status: 'Upcoming' | 'Scheduled' | 'Completed'
}

export default function Journey() {
  const {
    selectedDestination,
    setDestination: setGlobalDestination,
    destinations: supportedDests,
    activeJourney,
    updateJourney,
    doCheckIn,
  } = useDestination()

  // Form State initialized from global destination context
  const [destination, setDestination] = useState(`${selectedDestination.name}, ${selectedDestination.state}`)
  const [startDate, setStartDate] = useState(activeJourney?.startDate || '2026-10-10')
  const [expectedArrival, setExpectedArrival] = useState(activeJourney?.expectedArrival || '2026-10-16')
  const [remindersEnabled, setRemindersEnabled] = useState(activeJourney?.remindersEnabled ?? true)
  const [checkInInterval, setCheckInInterval] = useState(activeJourney?.checkInInterval || 'Every 2 hours')
  const [notifyContacts, setNotifyContacts] = useState(activeJourney?.notifyContacts ?? true)

  // Backend Destinations State
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [destinationsLoading, setDestinationsLoading] = useState(true)
  const [destinationsError, setDestinationsError] = useState<string | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Current Journey State
  const [journeyInfo, setJourneyInfo] = useState({
    name: `${selectedDestination.name}, ${selectedDestination.state}`,
    description: selectedDestination.description,
    startDateDisplay: activeJourney?.startDate || 'Oct 10, 2026',
    arrivalDisplay: activeJourney?.expectedArrival || 'Oct 16, 2026',
    arrivalTimeDisplay: '12:00 PM',
    stayDuration: '6 days',
    image: selectedDestination.imageUrl,
  })

  // Synchronize local form when selectedDestination or activeJourney changes
  useEffect(() => {
    const formatted = `${selectedDestination.name}, ${selectedDestination.state}`
    setDestination(formatted)
    setJourneyInfo((prev) => ({
      ...prev,
      name: formatted,
      description: selectedDestination.description,
      image: selectedDestination.imageUrl,
      startDateDisplay: activeJourney?.startDate || prev.startDateDisplay,
      arrivalDisplay: activeJourney?.expectedArrival || prev.arrivalDisplay,
    }))
  }, [selectedDestination, activeJourney])

  // Check-in State
  const [lastCheckIn, setLastCheckIn] = useState(activeJourney?.lastCheckIn || 'Today, Oct 10, 2026 at 12:04 PM')
  const [nextCheckIn, setNextCheckIn] = useState(activeJourney?.nextCheckIn || 'Today at 2:00 PM')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isCheckInSuccess, setIsCheckInSuccess] = useState(false)
  const [showCallNotice, setShowCallNotice] = useState(false)

  // Timeline State
  const [timeline, setTimeline] = useState<UpcomingItem[]>([
    {
      id: '1',
      time: 'Oct 10, 2026 | 2:00 PM',
      subtext: 'Next check-in • Reminder in 1 hour 45 minutes',
      status: 'Upcoming',
    },
    {
      id: '2',
      time: 'Oct 10, 2026 | 4:00 PM',
      subtext: 'Scheduled check-in',
      status: 'Scheduled',
    },
    {
      id: '3',
      time: 'Oct 10, 2026 | 6:00 PM',
      subtext: 'Scheduled check-in',
      status: 'Scheduled',
    },
    {
      id: '4',
      time: 'Oct 10, 2026 | 8:00 PM',
      subtext: 'Scheduled check-in',
      status: 'Scheduled',
    },
  ])

  // Show Toast helper
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 4000)
  }

  // Handle Check In Now Action with backend sync
  const handleCheckInNow = async () => {
    setIsCheckInSuccess(true)
    const now = new Date()
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const dateFormatted = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    const recordedTimestamp = `Today, ${dateFormatted} at ${timeFormatted}`

    setLastCheckIn(recordedTimestamp)

    // Calculate next check-in (+2 hours default)
    const nextTime = new Date(now.getTime() + 2 * 60 * 60 * 1000)
    const nextTimeFormatted = nextTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    const nextFormatted = `Today at ${nextTimeFormatted}`
    setNextCheckIn(nextFormatted)

    // Update timeline
    setTimeline((prev) => [
      {
        id: `t-${Date.now()}`,
        time: `${dateFormatted} | ${nextTimeFormatted}`,
        subtext: 'Next check-in • Reminder active (demonstration)',
        status: 'Upcoming',
      },
      ...prev.slice(0, 3).map((item) => ({ ...item, status: 'Scheduled' as const })),
    ])

    // Trigger backend check-in persistence
    try {
      await doCheckIn()
    } catch {
      // Local state already updated
    }

    showToast(`Check-in recorded for ${selectedDestination.name}! Your emergency contacts have been kept up to date.`)
    setTimeout(() => setIsCheckInSuccess(false), 2000)
  }

  // Fetch destinations from backend on mount
  const loadDestinations = async () => {
    setDestinationsLoading(true)
    setDestinationsError(null)
    try {
      const data = await fetchDestinations()
      setDestinations(data)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not reach backend API'
      setDestinationsError(msg)
      // Fallback to supported destinations from context/data
      setDestinations(
        supportedDests.map((d) => ({
          id: d.id,
          name: d.name,
          state: d.state,
          description: d.description,
          latitude: d.latitude,
          longitude: d.longitude,
          imageUrl: d.imageUrl,
        }))
      )
    } finally {
      setDestinationsLoading(false)
    }
  }

  useEffect(() => {
    loadDestinations()
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Filtered destinations based on user input
  const filteredDestinations = destinations.filter((d) => {
    const q = destination.toLowerCase().trim()
    if (!q) return true
    return (
      d.name.toLowerCase().includes(q) ||
      (d.state && d.state.toLowerCase().includes(q)) ||
      (d.description && d.description.toLowerCase().includes(q))
    )
  })

  // Select destination from dropdown and update global context
  const handleSelectDestination = async (dest: Destination) => {
    const label = `${dest.name}${dest.state ? ', ' + dest.state : ''}`
    setDestination(label)
    setIsDropdownOpen(false)

    // Update global destination
    await setGlobalDestination(dest.id)

    setJourneyInfo((prev) => ({
      ...prev,
      name: label,
      description: dest.description || prev.description,
      image: dest.imageUrl || prev.image,
    }))

    showToast(`Destination switched to ${dest.name}. All safety resources updated across the application.`)
  }

  // Handle Start Journey Submit
  const handleStartJourney = async (e: React.FormEvent) => {
    e.preventDefault()

    const startObj = new Date(startDate || '2026-10-10')
    const endObj = new Date(expectedArrival || '2026-10-16')
    const diffTime = Math.max(0, endObj.getTime() - startObj.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1

    const startFormatted = startObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    const arrivalFormatted = endObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

    // Find destination match
    const matched =
      destinations.find(
        (d) =>
          d.name.toLowerCase() === destination.toLowerCase() ||
          `${d.name}, ${d.state}`.toLowerCase() === destination.toLowerCase() ||
          destination.toLowerCase().includes(d.name.toLowerCase())
      ) || selectedDestination

    await updateJourney({
      destinationId: matched.id,
      destinationName: matched.name,
      startDate,
      expectedArrival,
      checkInInterval,
      remindersEnabled,
      notifyContacts,
    })

    setJourneyInfo({
      name: destination || `${selectedDestination.name}, ${selectedDestination.state}`,
      description: matched.description || selectedDestination.description,
      startDateDisplay: startFormatted,
      arrivalDisplay: arrivalFormatted,
      arrivalTimeDisplay: '12:00 PM',
      stayDuration: `${diffDays} days`,
      image: matched.imageUrl || selectedDestination.imageUrl,
    })

    showToast(`Journey to ${destination} active! Safe tracking and check-in timeline updated.`)
  }

  return (
    <div className="journey-page">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="journey-toast" role="alert">
          <span className="journey-toast-icon">✓</span>
          <span>{toastMessage}</span>
          <button
            type="button"
            className="journey-toast-close"
            onClick={() => setToastMessage(null)}
            aria-label="Dismiss notice"
          >
            ×
          </button>
        </div>
      )}

      {/* Emergency Call Notice Modal / Alert */}
      {showCallNotice && (
        <div className="journey-modal-backdrop" onClick={() => setShowCallNotice(false)}>
          <div className="journey-modal" onClick={(e) => e.stopPropagation()} role="dialog">
            <div className="journey-modal-header">
              <span className="journey-modal-danger-icon">📞</span>
              <h3>Emergency Assistance Universal (112)</h3>
            </div>
            <p className="journey-modal-body">
              In an actual emergency, dialing <strong>112</strong> immediately connects you to local emergency, medical,
              fire, or police response units.
            </p>
            <div className="journey-modal-actions">
              <a href="tel:112" className="journey-btn-emergency-call" id="confirm-call-112">
                Dial 112 Now
              </a>
              <button
                type="button"
                className="journey-btn-outline"
                onClick={() => setShowCallNotice(false)}
                id="close-call-modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="journey-container">
        {/* Navigation Breadcrumb / Back link */}
        <div className="journey-top-nav">
          <Link to="/dashboard" className="journey-back-link" id="journey-back-to-dashboard">
            <svg
              className="journey-back-arrow"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Page Title & Subtitle */}
        <header className="journey-header">
          <div className="journey-header-icon-box" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <div className="journey-header-titles">
            <h1 className="journey-title">Journey Check-in</h1>
            <p className="journey-subtitle">
              Start, manage and check in during your journey for a safer travel experience.
            </p>
          </div>
        </header>

        {/* 2-Column Responsive Layout */}
        <div className="journey-grid">
          {/* ================= LEFT COLUMN ================= */}
          <div className="journey-col journey-col-left">
            {/* 1. Start a Journey Card */}
            <section className="journey-card journey-card-start" aria-labelledby="start-journey-heading">
              <div className="journey-card-header-with-icon">
                <div className="journey-icon-circle journey-icon-blue" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
                <div>
                  <h2 id="start-journey-heading" className="journey-card-title">
                    Start a Journey
                  </h2>
                  <p className="journey-card-desc">Plan your trip and set check-in reminders.</p>
                </div>
              </div>

              <form onSubmit={handleStartJourney} className="journey-form">
                {/* Destination */}
                <div className="journey-form-group journey-destination-group" ref={dropdownRef}>
                  <div className="journey-label-row">
                    <label htmlFor="journey-destination" className="journey-label">
                      Destination <span className="journey-required">*</span>
                    </label>
                    {destinationsLoading ? (
                      <span className="journey-dest-loading-badge" title="Connecting to backend">
                        <span className="journey-spinner-dot" /> Loading destinations...
                      </span>
                    ) : destinations.length > 0 ? (
                      <span className="journey-dest-connected-badge" title="Live destinations connected">
                        ● {destinations.length} available
                      </span>
                    ) : null}
                  </div>
                  <div className="journey-input-with-icon">
                    <span className="journey-field-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </span>
                    <input
                      id="journey-destination"
                      type="text"
                      className="journey-input"
                      value={destination}
                      onChange={(e) => {
                        setDestination(e.target.value)
                        setIsDropdownOpen(true)
                      }}
                      onFocus={() => setIsDropdownOpen(true)}
                      placeholder={destinationsLoading ? 'Loading destinations...' : 'Search or select destination (e.g. Goa)'}
                      required
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      className="journey-dropdown-arrow-btn"
                      onClick={() => setIsDropdownOpen((prev) => !prev)}
                      aria-label="Toggle destinations dropdown"
                      aria-expanded={isDropdownOpen}
                    >
                      <span className="journey-dropdown-arrow" aria-hidden="true">
                        {isDropdownOpen ? '▲' : '▼'}
                      </span>
                    </button>
                  </div>

                  {/* Error State */}
                  {destinationsError && (
                    <div className="journey-dest-error" role="alert">
                      <span className="journey-dest-error-icon">⚠️</span>
                      <span className="journey-dest-error-text">
                        Backend API unavailable ({destinationsError}). Using manual entry.
                      </span>
                      <button
                        type="button"
                        onClick={loadDestinations}
                        className="journey-dest-retry-btn"
                      >
                        Retry
                      </button>
                    </div>
                  )}

                  {/* Dropdown Menu */}
                  {isDropdownOpen && !destinationsLoading && (
                    <div className="journey-dest-dropdown" role="listbox">
                      {destinations.length > 0 ? (
                        <>
                          <div className="journey-dest-dropdown-header">
                            Available Destinations ({filteredDestinations.length})
                          </div>
                          {filteredDestinations.length > 0 ? (
                            <div className="journey-dest-dropdown-list">
                              {filteredDestinations.map((item) => (
                                <button
                                  key={item.id}
                                  type="button"
                                  className={`journey-dest-item ${
                                    destination.toLowerCase().includes(item.name.toLowerCase()) ? 'selected' : ''
                                  }`}
                                  onClick={() => handleSelectDestination(item)}
                                >
                                  {item.imageUrl && (
                                    <img
                                      src={item.imageUrl}
                                      alt={item.name}
                                      className="journey-dest-item-img"
                                      onError={(e) => {
                                        ;(e.target as HTMLElement).style.display = 'none'
                                      }}
                                    />
                                  )}
                                  <div className="journey-dest-item-info">
                                    <div className="journey-dest-item-name">
                                      {item.name}
                                      {item.state && <span className="journey-dest-item-state"> • {item.state}</span>}
                                    </div>
                                    {item.description && (
                                      <div className="journey-dest-item-desc">{item.description}</div>
                                    )}
                                    {item.latitude != null && item.longitude != null && (
                                      <div className="journey-dest-item-coords">
                                        📍 {item.latitude.toFixed(3)}°N, {item.longitude.toFixed(3)}°E
                                      </div>
                                    )}
                                  </div>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="journey-dest-empty">
                              No destinations matching "{destination}". You can continue with manual entry.
                            </div>
                          )}
                        </>
                      ) : !destinationsError ? (
                        <div className="journey-dest-empty">
                          No destinations registered in the backend yet. You can type any custom destination above.
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>

                {/* Dates Row */}
                <div className="journey-form-row">
                  <div className="journey-form-group journey-half">
                    <label htmlFor="journey-start-date" className="journey-label">
                      Start Date <span className="journey-required">*</span>
                    </label>
                    <div className="journey-input-with-icon">
                      <span className="journey-field-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                      </span>
                      <input
                        id="journey-start-date"
                        type="text"
                        className="journey-input"
                        value={startDate === '2026-10-10' ? 'Oct 10, 2026' : startDate}
                        onFocus={(e) => (e.target.type = 'date')}
                        onBlur={(e) => {
                          if (!e.target.value) e.target.type = 'text'
                        }}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                      />
                      <span className="journey-field-tail-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                        </svg>
                      </span>
                    </div>
                  </div>

                  <div className="journey-form-group journey-half">
                    <label htmlFor="journey-expected-arrival" className="journey-label">
                      Expected Arrival <span className="journey-required">*</span>
                    </label>
                    <div className="journey-input-with-icon">
                      <span className="journey-field-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                      </span>
                      <input
                        id="journey-expected-arrival"
                        type="text"
                        className="journey-input"
                        value={expectedArrival === '2026-10-16' ? 'Oct 16, 2026' : expectedArrival}
                        onFocus={(e) => (e.target.type = 'date')}
                        onBlur={(e) => {
                          if (!e.target.value) e.target.type = 'text'
                        }}
                        onChange={(e) => setExpectedArrival(e.target.value)}
                        required
                      />
                      <span className="journey-field-tail-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Enable Check-in Reminders Toggle */}
                <div className="journey-toggle-row">
                  <div className="journey-toggle-info">
                    <span className="journey-toggle-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        <line x1="2" y1="8" x2="4" y2="8" />
                        <line x1="20" y1="8" x2="22" y2="8" />
                      </svg>
                    </span>
                    <div>
                      <div className="journey-toggle-title">Enable check-in reminders</div>
                      <div className="journey-toggle-sub">Get reminded to check in at regular intervals.</div>
                    </div>
                  </div>
                  <label className="journey-switch" aria-label="Toggle check-in reminders">
                    <input
                      type="checkbox"
                      checked={remindersEnabled}
                      onChange={(e) => setRemindersEnabled(e.target.checked)}
                      id="toggle-reminders"
                    />
                    <span className="journey-slider round" />
                  </label>
                </div>

                {/* Check-in interval dropdown */}
                {remindersEnabled && (
                  <div className="journey-interval-box">
                    <div className="journey-interval-label-row">
                      <span className="journey-interval-clock-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                      </span>
                      <span className="journey-interval-label">Check-in interval</span>
                    </div>
                    <div className="journey-select-wrapper">
                      <select
                        className="journey-select"
                        value={checkInInterval}
                        onChange={(e) => setCheckInInterval(e.target.value)}
                        id="select-interval"
                      >
                        <option value="Every 1 hour">Every 1 hour</option>
                        <option value="Every 2 hours">Every 2 hours</option>
                        <option value="Every 4 hours">Every 4 hours</option>
                        <option value="Every 6 hours">Every 6 hours</option>
                        <option value="Daily (Every 24 hours)">Daily (Every 24 hours)</option>
                      </select>
                      <span className="journey-select-arrow" aria-hidden="true">
                        ▼
                      </span>
                    </div>
                  </div>
                )}

                {/* Notify Emergency Contacts Toggle */}
                <div className="journey-toggle-row">
                  <div className="journey-toggle-info">
                    <span className="journey-toggle-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </span>
                    <div>
                      <div className="journey-toggle-title">Notify emergency contacts</div>
                      <div className="journey-toggle-sub">
                        Your selected contacts will be notified if you miss a check-in.
                      </div>
                    </div>
                  </div>
                  <label className="journey-switch" aria-label="Toggle notify emergency contacts">
                    <input
                      type="checkbox"
                      checked={notifyContacts}
                      onChange={(e) => setNotifyContacts(e.target.checked)}
                      id="toggle-notify-contacts"
                    />
                    <span className="journey-slider round" />
                  </label>
                </div>

                {/* Submit CTA */}
                <button type="submit" className="journey-btn-primary" id="btn-start-journey">
                  <svg className="journey-btn-play-icon" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  <span>Start Journey</span>
                </button>
              </form>
            </section>

            {/* 2. Emergency Assistance Card */}
            <section className="journey-card journey-card-emergency" aria-labelledby="emergency-card-heading">
              <div className="journey-emergency-top">
                <div className="journey-siren-box" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    <circle cx="12" cy="12" r="4" fill="#fee2e2" />
                  </svg>
                </div>
                <div>
                  <h2 id="emergency-card-heading" className="journey-emergency-title">
                    Emergency Assistance
                  </h2>
                  <p className="journey-emergency-desc">
                    If you are in danger or need immediate help, call the emergency number or raise an SOS alert.
                  </p>
                </div>
              </div>

              <div className="journey-emergency-actions">
                <button
                  type="button"
                  className="journey-btn-call"
                  onClick={() => setShowCallNotice(true)}
                  id="journey-call-112-btn"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="btn-icon">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span>112 (Universal)</span>
                </button>

                <button
                  type="button"
                  className="journey-btn-sos"
                  onClick={() => navigate('/dashboard')}
                  id="journey-raise-sos-btn"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="btn-icon">
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <span>Raise an SOS Alert</span>
                </button>
              </div>
            </section>
          </div>

          {/* ================= RIGHT COLUMN ================= */}
          <div className="journey-col journey-col-right">
            {/* 1. Current Journey Card */}
            <section className="journey-card journey-card-current" aria-labelledby="current-journey-heading">
              <div className="journey-card-header-bar">
                <div className="journey-header-title-group">
                  <div className="journey-icon-circle journey-icon-green" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <h2 id="current-journey-heading" className="journey-card-title">
                    Current Journey
                  </h2>
                </div>
                <div className="journey-status-pill journey-status-on-track">
                  <span className="journey-pulse-dot" />
                  <span>On Track</span>
                </div>
              </div>

              <div className="journey-current-body">
                <div className="journey-image-wrapper">
                  <img
                    src={journeyInfo.image}
                    alt={journeyInfo.name}
                    className="journey-destination-img"
                    onError={(e) => {
                      // Fallback if local image load issue
                      ;(e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80'
                    }}
                  />
                </div>
                <div className="journey-current-meta">
                  <h3 className="journey-current-dest-name">{journeyInfo.name}</h3>
                  <p className="journey-current-dest-desc">{journeyInfo.description}</p>

                  <div className="journey-stats-row">
                    <div className="journey-stat-chip">
                      <span className="journey-chip-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                      </span>
                      <div>
                        <div className="journey-chip-label">Start Date</div>
                        <div className="journey-chip-val">{journeyInfo.startDateDisplay}</div>
                      </div>
                    </div>

                    <div className="journey-stat-chip">
                      <span className="journey-chip-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                      </span>
                      <div>
                        <div className="journey-chip-label">Expected Arrival</div>
                        <div className="journey-chip-val">
                          {journeyInfo.arrivalDisplay}
                          <span className="journey-arrival-time">{journeyInfo.arrivalTimeDisplay}</span>
                        </div>
                      </div>
                    </div>

                    <div className="journey-stat-chip">
                      <span className="journey-chip-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                          <path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9" />
                        </svg>
                      </span>
                      <div>
                        <div className="journey-chip-label">Planned Stay</div>
                        <div className="journey-chip-val">{journeyInfo.stayDuration}</div>
                      </div>
                    </div>

                    <div className="journey-stat-chip">
                      <span className="journey-chip-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="2" y1="12" x2="22" y2="12" />
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        </svg>
                      </span>
                      <div>
                        <div className="journey-chip-label">Coordinates</div>
                        <div className="journey-chip-val">
                          {selectedDestination.latitude.toFixed(3)}°N, {selectedDestination.longitude.toFixed(3)}°E
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Leaflet Map for Selected Destination */}
                  <div style={{ marginTop: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                        🗺️ Destination Map & Safe Perimeter
                      </span>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        OpenStreetMap • Live Markers
                      </span>
                    </div>
                    <DestinationMap destination={selectedDestination} height="240px" />
                  </div>

                  {/* Verified Nearby Safe Places */}
                  <div style={{ marginTop: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', margin: 0 }}>
                        Nearby Safe Places Around {selectedDestination.name} ({selectedDestination.safePlaces.length})
                      </h4>
                      <span style={{ fontSize: '11px', fontWeight: 500, color: '#16a34a' }}>
                        ● Verified Directory
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '8px' }}>
                      {selectedDestination.safePlaces.map((sp) => (
                        <div
                          key={sp.id}
                          style={{
                            background: '#f8fafc',
                            padding: '10px',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            fontSize: '12px',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <strong style={{ color: '#0f172a' }}>{sp.name}</strong>
                            <span
                              style={{
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '10px',
                                fontWeight: 600,
                                background: sp.category === 'Police' ? '#dbeafe' : sp.category === 'Hospital' ? '#fee2e2' : '#f3e8ff',
                                color: sp.category === 'Police' ? '#1d4ed8' : sp.category === 'Hospital' ? '#dc2626' : '#7e22ce',
                              }}
                            >
                              {sp.category}
                            </span>
                          </div>
                          <div style={{ color: '#64748b', fontSize: '11px', marginBottom: '4px' }}>{sp.address}</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                            <span style={{ color: '#2563eb', fontWeight: 600 }}>{sp.distance} away</span>
                            <a
                              href={`tel:${sp.phone.replace(/[^0-9+]/g, '')}`}
                              style={{ color: '#16a34a', textDecoration: 'none', fontWeight: 600 }}
                            >
                              📞 {sp.phone}
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Check-in Status Card */}
            <section className="journey-card journey-card-status" aria-labelledby="status-card-heading">
              <div className="journey-card-header-bar">
                <div className="journey-header-title-group">
                  <div className="journey-icon-circle journey-icon-blue" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <h2 id="status-card-heading" className="journey-card-title">
                    Check-in Status
                  </h2>
                </div>
              </div>

              <div className="journey-status-boxes-grid">
                {/* Last Check-in Box */}
                <div className="journey-status-box journey-box-last">
                  <div className="journey-status-box-header">
                    <div className="journey-status-badge-circle badge-green">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <div>
                      <div className="journey-status-box-tag tag-green">Last Check-in</div>
                      <div className="journey-status-box-time">{lastCheckIn}</div>
                    </div>
                  </div>
                  <p className="journey-status-box-note">
                    Your location has been recorded and your emergency contacts have been notified.
                  </p>
                </div>

                {/* Next Check-in Box */}
                <div className="journey-status-box journey-box-next">
                  <div className="journey-status-box-header">
                    <div className="journey-status-badge-circle badge-blue">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    </div>
                    <div>
                      <div className="journey-status-box-tag tag-blue">Next Check-in</div>
                      <div className="journey-status-box-time">{nextCheckIn}</div>
                    </div>
                  </div>
                  <p className="journey-status-box-note">Reminder will be sent 15 minutes before.</p>
                </div>
              </div>

              {/* Full Width Check In Now Button */}
              <button
                type="button"
                className={`journey-btn-checkin ${isCheckInSuccess ? 'btn-success-pulse' : ''}`}
                onClick={handleCheckInNow}
                id="journey-checkin-now-btn"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="btn-icon">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>{isCheckInSuccess ? 'Check-in Recorded ✓' : 'Check In Now'}</span>
              </button>
            </section>

            {/* 3. Upcoming Check-ins Card */}
            <section className="journey-card journey-card-upcoming" aria-labelledby="upcoming-checkins-heading">
              <div className="journey-card-header-bar">
                <div className="journey-header-title-group">
                  <div className="journey-icon-circle journey-icon-blue" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <h2 id="upcoming-checkins-heading" className="journey-card-title">
                    Upcoming Check-ins
                  </h2>
                </div>
              </div>

              {/* Connected Vertical Timeline */}
              <div className="journey-timeline">
                {timeline.map((item, index) => {
                  const isFirst = index === 0
                  return (
                    <div key={item.id} className="journey-timeline-item">
                      {/* Timeline column with node and connector line */}
                      <div className="journey-timeline-marker-col">
                        <div
                          className={`journey-timeline-dot ${
                            isFirst ? 'journey-dot-active' : 'journey-dot-scheduled'
                          }`}
                        >
                          {isFirst && <div className="journey-dot-inner" />}
                        </div>
                        {index < timeline.length - 1 && <div className="journey-timeline-line" />}
                      </div>

                      {/* Content column */}
                      <div className="journey-timeline-content">
                        <div className="journey-timeline-text-group">
                          <div className={`journey-timeline-time ${isFirst ? 'time-active' : ''}`}>{item.time}</div>
                          <div className="journey-timeline-subtext">{item.subtext}</div>
                        </div>

                        {/* Status Badge */}
                        <div
                          className={`journey-timeline-badge ${
                            isFirst ? 'badge-pill-upcoming' : 'badge-pill-scheduled'
                          }`}
                        >
                          {item.status}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
