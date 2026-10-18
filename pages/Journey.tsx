import { useState } from 'react'
import { Link, navigate } from '../src/router'
import './Journey.css'

interface UpcomingItem {
  id: string
  time: string
  subtext: string
  status: 'Upcoming' | 'Scheduled' | 'Completed'
}

export default function Journey() {
  // Form State
  const [destination, setDestination] = useState('Goa, India')
  const [startDate, setStartDate] = useState('2026-10-10')
  const [expectedArrival, setExpectedArrival] = useState('2026-10-16')
  const [remindersEnabled, setRemindersEnabled] = useState(true)
  const [checkInInterval, setCheckInInterval] = useState('Every 2 hours')
  const [notifyContacts, setNotifyContacts] = useState(true)

  // Current Journey State
  const [journeyInfo, setJourneyInfo] = useState({
    name: 'Goa, India',
    description: 'A beautiful coastal destination known for its beaches, culture and heritage.',
    startDateDisplay: 'Oct 10, 2026',
    arrivalDisplay: 'Oct 16, 2026',
    arrivalTimeDisplay: '12:00 PM',
    stayDuration: '6 days',
    image: '/images/goa-beach.jpg',
  })

  // Check-in State
  const [lastCheckIn, setLastCheckIn] = useState('Today, Oct 10, 2026 at 12:04 PM')
  const [nextCheckIn, setNextCheckIn] = useState('Today at 2:00 PM')
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

  // Handle Check In Now Action
  const handleCheckInNow = () => {
    setIsCheckInSuccess(true)
    const now = new Date()
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const dateFormatted = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    const recordedTimestamp = `Today, ${dateFormatted} at ${timeFormatted}`

    setLastCheckIn(recordedTimestamp)

    // Calculate next check-in (+2 hours default)
    const nextTime = new Date(now.getTime() + 2 * 60 * 60 * 1000)
    const nextTimeFormatted = nextTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    setNextCheckIn(`Today at ${nextTimeFormatted}`)

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

    showToast('Check-in recorded! Your location has been noted and emergency contacts updated.')
    setTimeout(() => setIsCheckInSuccess(false), 2000)
  }

  // Handle Start Journey Submit
  const handleStartJourney = (e: React.FormEvent) => {
    e.preventDefault()

    const startObj = new Date(startDate || '2026-10-10')
    const endObj = new Date(expectedArrival || '2026-10-16')
    const diffTime = Math.max(0, endObj.getTime() - startObj.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1

    const startFormatted = startObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    const arrivalFormatted = endObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

    setJourneyInfo({
      name: destination || 'Goa, India',
      description:
        destination.toLowerCase().includes('goa')
          ? 'A beautiful coastal destination known for its beaches, culture and heritage.'
          : `Active travel itinerary to ${destination} with automated safety check-in schedule.`,
      startDateDisplay: startFormatted,
      arrivalDisplay: arrivalFormatted,
      arrivalTimeDisplay: '12:00 PM',
      stayDuration: `${diffDays} days`,
      image: '/images/goa-beach.jpg',
    })

    showToast(`Journey to ${destination} initialized! Safe tracking and check-in timeline created.`)
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
                <div className="journey-form-group">
                  <label htmlFor="journey-destination" className="journey-label">
                    Destination <span className="journey-required">*</span>
                  </label>
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
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="e.g. Goa, India"
                      required
                    />
                    <span className="journey-dropdown-arrow" aria-hidden="true">
                      ▼
                    </span>
                  </div>
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
