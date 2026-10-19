import { useEffect, useState } from 'react'
import { Link, navigate } from '../src/router'
import { getCurrentUser, logout } from '../src/services/authService'
import './Dashboard.css'
import './SOS.css'

// Types
type NavItemId =
  | 'dashboard'
  | 'sos'
  | 'journey'
  | 'safe-places'
  | 'alerts'
  | 'contacts'
  | 'incidents'
  | 'offline'
  | 'profile'

type SafePlace = {
  id: string
  name: string
  category: 'Hospital' | 'Police' | 'Embassy' | 'Tourist Center'
  distance: string
  phone: string
  address: string
  isOpen247: boolean
}

type EmergencyContact = {
  id: string
  name: string
  relationship: string
  phone: string
  isPrimary: boolean
}

type AlertItem = {
  id: string
  title: string
  category: 'Weather' | 'Security' | 'Advisory'
  level: 'Moderate' | 'High' | 'Low'
  time: string
  description: string
}

const INITIAL_SAFE_PLACES: SafePlace[] = [
  {
    id: 'sp-1',
    name: 'BIMC Hospital Kuta',
    category: 'Hospital',
    distance: '1.2 km',
    phone: '+62 361 761 263',
    address: 'Jl. Bypass Ngurah Rai No.100X, Kuta',
    isOpen247: true,
  },
  {
    id: 'sp-2',
    name: 'Denpasar Tourist Police Station',
    category: 'Police',
    distance: '2.8 km',
    phone: '+62 361 224 111',
    address: 'Jl. Gunung Sanghyang No.110, Denpasar',
    isOpen247: true,
  },
  {
    id: 'sp-3',
    name: 'Australian Consulate-General Bali',
    category: 'Embassy',
    distance: '4.5 km',
    phone: '+62 361 241 118',
    address: 'Jl. Tantular No.32, Renon, Denpasar',
    isOpen247: false,
  },
  {
    id: 'sp-4',
    name: 'Bali Tourism Board 24/7 Help Desk',
    category: 'Tourist Center',
    distance: '3.1 km',
    phone: '+62 361 235 600',
    address: 'Jl. Raya Puputan No.41, Denpasar',
    isOpen247: true,
  },
]

const INITIAL_CONTACTS: EmergencyContact[] = [
  {
    id: 'c-1',
    name: 'Sarah Jenkins',
    relationship: 'Spouse',
    phone: '+1 (555) 382-9102',
    isPrimary: true,
  },
  {
    id: 'c-2',
    name: 'John Davis',
    relationship: 'Brother',
    phone: '+1 (555) 904-2194',
    isPrimary: false,
  },
  {
    id: 'c-3',
    name: 'Bali Tourist Police Helpline',
    relationship: 'Official Local Service',
    phone: '110 / +62 361 224 111',
    isPrimary: false,
  },
]

const INITIAL_ALERTS: AlertItem[] = [
  {
    id: 'a-1',
    title: 'High Surf & Strong Undercurrents Advisory',
    category: 'Weather',
    level: 'Moderate',
    time: '25 mins ago',
    description:
      'High surf advisory along southwest coastlines (Kuta, Canggu, and Uluwatu). Swimmers are urged to stay within flagged safe zones and follow lifeguard directives.',
  },
  {
    id: 'a-2',
    title: 'Traffic Re-routing for Cultural Festival',
    category: 'Advisory',
    level: 'Low',
    time: '2 hours ago',
    description:
      'Temporary road closures in central Ubud due to ceremony procession until 18:00. Use southern bypass routes for airport transfers.',
  },
]

export default function Dashboard() {
  // Auth guard: only authenticated sessions may view the dashboard
  useEffect(() => {
    let cancelled = false
    getCurrentUser()
      .then((user) => {
        if (!cancelled && !user) navigate('/login')
      })
      .catch(() => {
        if (!cancelled) navigate('/login')
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Navigation & UI state
  const [activeTab, setActiveTab] = useState<NavItemId>('dashboard')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

  // Simulation states
  const [sosActive, setSosActive] = useState(false)
  const [showSosConfirmModal, setShowSosConfirmModal] = useState(false)
  const [sosStatusMessage, setSosStatusMessage] = useState<string | null>(null)

  // Modal states
  const [activeModal, setActiveModal] = useState<
    'journey' | 'safePlaces' | 'alerts' | 'contacts' | 'checkIn' | 'report' | 'offline' | 'profile' | null
  >(null)

  // Data states
  const [contacts, setContacts] = useState<EmergencyContact[]>(INITIAL_CONTACTS)
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS)
  const [safePlaces] = useState<SafePlace[]>(INITIAL_SAFE_PLACES)
  const [safePlaceFilter, setSafePlaceFilter] = useState<string>('All')

  // Check-in state
  const [lastCheckIn, setLastCheckIn] = useState('Checked in: Today at 08:00 AM')
  const [checkInNotice, setCheckInNotice] = useState<string | null>(null)

  // New contact form state
  const [newContactName, setNewContactName] = useState('')
  const [newContactPhone, setNewContactPhone] = useState('')
  const [newContactRelation, setNewContactRelation] = useState('')
  const [contactNotice, setContactNotice] = useState<string | null>(null)

  // Incident report form state
  const [incidentType, setIncidentType] = useState('General Assistance')
  const [incidentLocation, setIncidentLocation] = useState('Bali, Indonesia')
  const [incidentDetails, setIncidentDetails] = useState('')
  const [incidentSubmitted, setIncidentSubmitted] = useState(false)

  // Close all open popups/menus
  const closeAllMenus = () => {
    setIsProfileMenuOpen(false)
    setIsNotificationsOpen(false)
  }

  // Selected SOS emergency type
  const [selectedSosType, setSelectedSosType] = useState<
    'medical' | 'harassment' | 'lost' | 'accident' | 'other'
  >('medical')

  // Handle SOS triggers
  const handleSosButtonClick = () => {
    closeAllMenus()
    setShowSosConfirmModal(true)
  }

  const handleConfirmSos = (type: string = selectedSosType) => {
    setShowSosConfirmModal(false)
    setSosActive(true)
    const typeLabel = type.charAt(0).toUpperCase() + type.slice(1)
    setSosStatusMessage(
      `SIMULATED ${typeLabel.toUpperCase()} ASSISTANCE ACTIVE: Prototype distress signal dispatched to Bali Tourist Police & 3 saved emergency contacts with mock coordinates (-8.4095° S, 115.1889° E).`
    )
  }

  const handleCancelSos = () => {
    setSosActive(false)
    setSosStatusMessage(null)
  }

  // Handle Journey Check-in
  const handleCheckInNow = () => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setLastCheckIn(`Checked in: Today at ${timeStr}`)
    setCheckInNotice('Safety check-in recorded successfully! Status updated for your emergency contacts.')
    setTimeout(() => setCheckInNotice(null), 4000)
  }

  // Handle Add Contact
  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newContactName.trim() || !newContactPhone.trim()) return

    const newContact: EmergencyContact = {
      id: `c-${Date.now()}`,
      name: newContactName.trim(),
      phone: newContactPhone.trim(),
      relationship: newContactRelation.trim() || 'Emergency Contact',
      isPrimary: false,
    }

    setContacts((prev) => [...prev, newContact])
    setNewContactName('')
    setNewContactPhone('')
    setNewContactRelation('')
    setContactNotice('New emergency contact added to your demonstration profile.')
    setTimeout(() => setContactNotice(null), 3500)
  }

  // Handle Incident Report Submit
  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIncidentSubmitted(true)
    setTimeout(() => {
      setIncidentSubmitted(false)
      setIncidentDetails('')
      setActiveModal(null)
    }, 2500)
  }

  // Handle navigation click
  const handleNavClick = (id: NavItemId) => {
    setActiveTab(id)
    setIsMobileMenuOpen(false)
    closeAllMenus()

    if (id === 'sos') {
      setShowSosConfirmModal(true)
    } else if (id === 'journey') {
      window.location.hash = '/journey'
    } else if (id === 'safe-places') {
      setActiveModal('safePlaces')
    } else if (id === 'alerts') {
      setActiveModal('alerts')
    } else if (id === 'contacts') {
      setActiveModal('contacts')
    } else if (id === 'incidents') {
      setActiveModal('report')
    } else if (id === 'offline') {
      setActiveModal('offline')
    } else if (id === 'profile') {
      setActiveModal('profile')
    }
  }

  // Handle Logout: end the server session, then return to login
  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      /* even if the request fails, leave the dashboard */
    }
    navigate('/login')
  }

  // Filtered Safe Places
  const filteredSafePlaces =
    safePlaceFilter === 'All'
      ? safePlaces
      : safePlaces.filter((item) => item.category === safePlaceFilter)

  return (
    <div className="dashboard-container" onClick={closeAllMenus}>
      {/* ===== MOBILE TOP HEADER ===== */}
      <div className="dash-mobile-topbar" onClick={(e) => e.stopPropagation()}>
        <button
          className="dash-hamburger-btn"
          aria-label="Toggle navigation menu"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          id="dash-mobile-menu-toggle"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="dash-brand-mobile">
          <svg className="dash-logo-icon" viewBox="0 0 32 36" aria-hidden="true">
            <path d="M16 1 3 6v10c0 9 5.6 15.6 13 19 7.4-3.4 13-10 13-19V6L16 1Z" fill="#1e40af" />
            <circle cx="16" cy="17" r="9" fill="#3b82f6" />
            <path d="M10 13c2-1 3 1 5 0s2-3 4-2 1 3 3 4-1 4-3 4-2 2-4 1-1-3-3-3-3-2-2-4Z" fill="#22c55e" />
          </svg>
          <span className="dash-brand-title">SafeJourney</span>
        </div>

        <div className="dash-mobile-user">
          <div className="user-avatar-circle" title="Alex">
            <span className="avatar-initials">A</span>
          </div>
        </div>
      </div>

      {/* ===== SIDEBAR BACKDROP (Mobile) ===== */}
      {isMobileMenuOpen && (
        <div
          className="dash-sidebar-backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ===== SIDEBAR NAVIGATION ===== */}
      <aside
        className={`dash-sidebar ${isMobileMenuOpen ? 'dash-sidebar--open' : ''}`}
        onClick={(e) => e.stopPropagation()}
        aria-label="Dashboard navigation"
      >
        <div className="dash-sidebar-header">
          <Link to="/" className="dash-brand-link" id="dash-brand-link">
            <svg className="dash-logo-icon" viewBox="0 0 32 36" aria-hidden="true">
              <path d="M16 1 3 6v10c0 9 5.6 15.6 13 19 7.4-3.4 13-10 13-19V6L16 1Z" fill="#1d4ed8" />
              <circle cx="16" cy="17" r="8.5" fill="#38bdf8" />
              <path d="M11 13c2-1 3 1 4.5 0s2-2.5 3.5-1.5 1 2.5 2.5 3.5-1 3.5-2.5 3.5-2 1.5-3.5.8-1-2.5-2.5-2.5-2.6-1.8-2-3.8Z" fill="#4ade80" />
            </svg>
            <span className="dash-brand-title">SafeJourney</span>
          </Link>

          <button
            className="dash-close-drawer-btn"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close sidebar menu"
          >
            ✕
          </button>
        </div>

        <nav className="dash-nav-menu">
          {/* 1. Dashboard */}
          <button
            type="button"
            className={`dash-nav-item ${activeTab === 'dashboard' ? 'dash-nav-item--active' : ''}`}
            onClick={() => handleNavClick('dashboard')}
            id="nav-tab-dashboard"
          >
            <svg className="dash-nav-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 3h8v8H3V3zm0 10h8v8H3v-8zM13 3h8v8h-8V3zm0 10h8v8h-8v-8z" />
            </svg>
            <span className="dash-nav-label">Dashboard</span>
          </button>

          {/* 2. SOS */}
          <button
            type="button"
            className={`dash-nav-item ${activeTab === 'sos' ? 'dash-nav-item--active' : ''}`}
            onClick={() => handleNavClick('sos')}
            id="nav-tab-sos"
          >
            <svg className="dash-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span className="dash-nav-label">SOS</span>
          </button>

          {/* 3. Journey Check-in */}
          <button
            type="button"
            className={`dash-nav-item ${activeTab === 'journey' ? 'dash-nav-item--active' : ''}`}
            onClick={() => handleNavClick('journey')}
            id="nav-tab-journey"
          >
            <svg className="dash-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span className="dash-nav-label">Journey Check-in</span>
          </button>

          {/* 4. Map & Safe Places */}
          <button
            type="button"
            className={`dash-nav-item ${activeTab === 'safe-places' ? 'dash-nav-item--active' : ''}`}
            onClick={() => handleNavClick('safe-places')}
            id="nav-tab-safe-places"
          >
            <svg className="dash-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
              <line x1="8" y1="2" x2="8" y2="18" />
              <line x1="16" y1="6" x2="16" y2="22" />
            </svg>
            <span className="dash-nav-label">Map & Safe Places</span>
          </button>

          {/* 5. Alerts */}
          <button
            type="button"
            className={`dash-nav-item ${activeTab === 'alerts' ? 'dash-nav-item--active' : ''}`}
            onClick={() => handleNavClick('alerts')}
            id="nav-tab-alerts"
          >
            <svg className="dash-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="dash-nav-label">Alerts</span>
            {alerts.length > 0 && <span className="dash-nav-pill-badge">{alerts.length}</span>}
          </button>

          {/* 6. Emergency Contacts */}
          <button
            type="button"
            className={`dash-nav-item ${activeTab === 'contacts' ? 'dash-nav-item--active' : ''}`}
            onClick={() => handleNavClick('contacts')}
            id="nav-tab-contacts"
          >
            <svg className="dash-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span className="dash-nav-label">Emergency Contacts</span>
          </button>

          {/* 7. Incident Reports */}
          <button
            type="button"
            className={`dash-nav-item ${activeTab === 'incidents' ? 'dash-nav-item--active' : ''}`}
            onClick={() => handleNavClick('incidents')}
            id="nav-tab-incidents"
          >
            <svg className="dash-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <span className="dash-nav-label">Incident Reports</span>
          </button>

          {/* 8. Offline Kit */}
          <button
            type="button"
            className={`dash-nav-item ${activeTab === 'offline' ? 'dash-nav-item--active' : ''}`}
            onClick={() => handleNavClick('offline')}
            id="nav-tab-offline"
          >
            <svg className="dash-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span className="dash-nav-label">Offline Kit</span>
          </button>

          {/* 9. Profile */}
          <button
            type="button"
            className={`dash-nav-item ${activeTab === 'profile' ? 'dash-nav-item--active' : ''}`}
            onClick={() => handleNavClick('profile')}
            id="nav-tab-profile"
          >
            <svg className="dash-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span className="dash-nav-label">Profile</span>
          </button>
        </nav>

        <div className="dash-sidebar-bottom">
          {/* Logout button */}
          <button
            type="button"
            className="dash-nav-item dash-logout-btn"
            onClick={handleLogout}
            id="nav-tab-logout"
          >
            <svg className="dash-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
              <line x1="12" y1="2" x2="12" y2="12" />
            </svg>
            <span className="dash-nav-label">Logout</span>
          </button>
        </div>
      </aside>

      {/* ===== MAIN DASHBOARD WORKSPACE ===== */}
      <main className="dash-content-area">
        {/* Top Header Row with Notifications & Profile */}
        <header className="dash-top-bar" onClick={(e) => e.stopPropagation()}>
          <div className="dash-top-spacer" />

          <div className="dash-top-actions">
            {/* Notification Bell */}
            <div className="dash-bell-wrapper">
              <button
                type="button"
                className="dash-bell-btn"
                aria-label="View notifications"
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen)
                  setIsProfileMenuOpen(false)
                }}
                id="dash-bell-button"
              >
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {alerts.length > 0 && <span className="dash-bell-dot" />}
              </button>

              {/* Notification Dropdown Panel */}
              {isNotificationsOpen && (
                <div className="dash-dropdown-panel dash-notifications-panel" id="dash-notifications-panel">
                  <div className="dropdown-panel-header">
                    <h4>Notifications</h4>
                    <span className="badge-count">{alerts.length} new</span>
                  </div>
                  <ul className="dash-notification-list">
                    <li className="notification-item notification-warning">
                      <div className="notif-indicator" />
                      <div className="notif-body">
                        <p className="notif-text">⚠️ <strong>Weather Alert:</strong> High surf advisory near Uluwatu beach.</p>
                        <span className="notif-time">25m ago</span>
                      </div>
                    </li>
                    <li className="notification-item notification-info">
                      <div className="notif-indicator" />
                      <div className="notif-body">
                        <p className="notif-text">🛡️ <strong>Safe Zone:</strong> You entered a verified Tourist Safety Perimeter in Kuta.</p>
                        <span className="notif-time">1h ago</span>
                      </div>
                    </li>
                    <li className="notification-item">
                      <div className="notif-indicator" />
                      <div className="notif-body">
                        <p className="notif-text">📅 <strong>Check-in Reminder:</strong> Next scheduled journey check-in is in 48 hours.</p>
                        <span className="notif-time">3h ago</span>
                      </div>
                    </li>
                  </ul>
                  <div className="dropdown-panel-footer">
                    <button
                      type="button"
                      className="dropdown-footer-link"
                      onClick={() => {
                        setIsNotificationsOpen(false)
                        setActiveModal('alerts')
                      }}
                    >
                      View all safety alerts →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar & Name Pill */}
            <div className="dash-profile-wrapper">
              <button
                type="button"
                className="dash-profile-pill"
                aria-expanded={isProfileMenuOpen}
                aria-label="User profile options"
                onClick={() => {
                  setIsProfileMenuOpen(!isProfileMenuOpen)
                  setIsNotificationsOpen(false)
                }}
                id="dash-profile-menu-button"
              >
                <div className="user-avatar-image-frame">
                  {/* Clean rendered portrait avatar representing Alex */}
                  <svg className="user-avatar-svg" viewBox="0 0 36 36" fill="none" aria-hidden="true">
                    <circle cx="18" cy="18" r="18" fill="#e2e8f0" />
                    <circle cx="18" cy="13" r="6" fill="#1e293b" />
                    <path d="M8 32c0-5.5 4.5-9 10-9s10 3.5 10 9" fill="#0369a1" />
                    <path d="M14 13c0 2.2 1.8 4 4 4s4-1.8 4-4" stroke="#d97706" strokeWidth="1.2" />
                    <circle cx="18" cy="13" r="5" fill="#fcd34d" />
                    <path d="M15 11c0-2 1.5-3.5 3-3.5s3 1.5 3 3.5c0 .3-.1.6-.2.8-.5-.8-1.5-1.3-2.8-1.3s-2.3.5-2.8 1.3c-.1-.2-.2-.5-.2-.8Z" fill="#78350f" />
                    <path d="M16 15c.5.5 1.2.8 2 .8s1.5-.3 2-.8" stroke="#78350f" strokeWidth="0.8" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="user-profile-text">
                  <span className="user-name">Alex</span>
                  <span className="user-role">Tourist</span>
                </div>
                <svg className="dash-chevron-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="dash-dropdown-panel dash-profile-dropdown" id="dash-profile-dropdown">
                  <div className="profile-dropdown-user-info">
                    <p className="profile-dd-name">Alex Morrison</p>
                    <p className="profile-dd-id">Passport / ID: #ID-9824-GBR</p>
                    <span className="profile-verified-badge">✓ Verified Traveler</span>
                  </div>
                  <div className="profile-dropdown-divider" />
                  <button
                    type="button"
                    className="profile-dropdown-item"
                    onClick={() => {
                      setIsProfileMenuOpen(false)
                      setActiveModal('profile')
                    }}
                  >
                    👤 Safety Profile & Info
                  </button>
                  <button
                    type="button"
                    className="profile-dropdown-item"
                    onClick={() => {
                      setIsProfileMenuOpen(false)
                      setActiveModal('contacts')
                    }}
                  >
                    📞 Trusted Contacts
                  </button>
                  <button
                    type="button"
                    className="profile-dropdown-item"
                    onClick={() => {
                      setIsProfileMenuOpen(false)
                      setActiveModal('offline')
                    }}
                  >
                    🧰 Offline Survival Kit
                  </button>
                  <div className="profile-dropdown-divider" />
                  <button
                    type="button"
                    className="profile-dropdown-item profile-logout-link"
                    onClick={handleLogout}
                  >
                    🚪 Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Greeting Banner */}
        <section className="dash-greeting-section" aria-labelledby="dash-greeting-title">
          <h1 id="dash-greeting-title" className="dash-greeting-title">
            Good morning, Alex!
          </h1>
          <p className="dash-greeting-subtitle">Stay safe. Explore more.</p>
        </section>

        {/* Active Simulated SOS Banner if triggered */}
        {sosActive && (
          <div className="dash-sos-active-banner" role="alert">
            <div className="sos-banner-left">
              <span className="sos-beacon-pulse" />
              <div>
                <p className="sos-banner-heading">🚨 SIMULATED EMERGENCY SOS BROADCAST ACTIVE</p>
                <p className="sos-banner-text">{sosStatusMessage}</p>
                <p className="sos-banner-note">
                  Prototype demonstration: No actual emergency dispatch was placed. Coordinates transmitted: -8.4095° S, 115.1889° E.
                </p>
              </div>
            </div>
            <button
              type="button"
              className="btn-resolve-sos"
              onClick={handleCancelSos}
              id="dash-cancel-sos-banner-btn"
            >
              Cancel / Resolve Alert
            </button>
          </div>
        )}

        {/* Temporary action notices */}
        {checkInNotice && (
          <div className="dash-inline-toast dash-inline-toast--success">
            <span>✓</span> {checkInNotice}
          </div>
        )}

        {/* ===== UPPER GRID: SOS Card & Current Journey Card ===== */}
        <div className="dash-grid-top">
          {/* Card 1: SOS Card (Matches reference image) */}
          <section className="dash-card dash-card-sos" aria-labelledby="card-sos-heading">
            <h2 id="card-sos-heading" className="sr-only">
              Emergency SOS
            </h2>

            <div className="sos-button-wrapper">
              <button
                type="button"
                className={`sos-pulse-button ${sosActive ? 'sos-pulse-button--active' : ''}`}
                onClick={handleSosButtonClick}
                aria-label="Trigger Emergency SOS"
                id="dash-sos-primary-btn"
              >
                <div className="sos-inner-content">
                  {/* Emergency ring / lifebuoy icon matching reference */}
                  <svg className="sos-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="4" />
                    <line x1="4.93" y1="4.93" x2="9.17" y2="9.17" />
                    <line x1="14.83" y1="14.83" x2="19.07" y2="19.07" />
                    <line x1="14.83" y1="9.17" x2="19.07" y2="4.93" />
                    <line x1="4.93" y1="19.07" x2="9.17" y2="14.83" />
                  </svg>
                  <span className="sos-text">SOS</span>
                </div>
              </button>
            </div>

            <p className="sos-callout-text">Tap for Emergency Help</p>
          </section>

          {/* Card 2: Current Journey Card (Matches reference image) */}
          <section className="dash-card dash-card-journey" aria-labelledby="card-journey-heading">
            <h2 id="card-journey-heading" className="card-section-title">
              Current Journey
            </h2>

            <div className="journey-info-row">
              <div className="journey-pin-container">
                <svg className="journey-pin-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>

              <div className="journey-meta-text">
                <h3 className="journey-destination">Bali, Indonesia</h3>
                <p className="journey-checkin-timeline">Check-in in 2 days</p>
              </div>
            </div>

            <div className="journey-action-container">
              <button
                type="button"
                className="btn-dash-primary"
                onClick={() => { window.location.hash = '/journey' }}
                id="dash-journey-details-btn"
              >
                View Details
              </button>
            </div>
          </section>
        </div>

        {/* ===== LOWER GRID: 3 Summary Cards ===== */}
        <div className="dash-grid-bottom">
          {/* Summary Card 1: Active Alerts (Matches reference image) */}
          <div className="dash-card dash-summary-card" id="card-active-alerts">
            <div className="summary-card-header">
              <div className="summary-icon-circle summary-icon-alert">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="#ef4444">
                  <path d="M12 2L1 21h22L12 2zm0 3.5l8.5 14.5H3.5L12 5.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z" />
                </svg>
              </div>
              <div className="summary-title-group">
                <h3 className="summary-title">Active Alerts</h3>
                <p className="summary-subtitle summary-subtitle--alert">
                  {alerts.length} new alert{alerts.length === 1 ? '' : 's'}
                </p>
              </div>
            </div>

            <button
              type="button"
              className="btn-dash-outline"
              onClick={() => setActiveModal('alerts')}
              id="dash-view-alerts-btn"
            >
              View All
            </button>
          </div>

          {/* Summary Card 2: Nearby Safe Places (Matches reference image) */}
          <div className="dash-card dash-summary-card" id="card-safe-places">
            <div className="summary-card-header">
              <div className="summary-icon-circle summary-icon-places">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#0d9488" strokeWidth="2.2">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="3" fill="#0d9488" />
                </svg>
              </div>
              <div className="summary-title-group">
                <h3 className="summary-title">Nearby Safe Places</h3>
                <p className="summary-subtitle">12 places nearby</p>
              </div>
            </div>

            <button
              type="button"
              className="btn-dash-outline"
              onClick={() => setActiveModal('safePlaces')}
              id="dash-view-map-btn"
            >
              View Map
            </button>
          </div>

          {/* Summary Card 3: Emergency Contacts (Matches reference image) */}
          <div className="dash-card dash-summary-card" id="card-emergency-contacts">
            <div className="summary-card-header">
              <div className="summary-icon-circle summary-icon-contacts">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="#e11d48">
                  <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.44-5.15-3.75-6.59-6.59l1.97-1.57c.28-.28.36-.67.25-1.02A11.36 11.36 0 0 1 8.5 4.3c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-.99-1.42z" />
                </svg>
              </div>
              <div className="summary-title-group">
                <h3 className="summary-title">Emergency Contacts</h3>
                <p className="summary-subtitle">{contacts.length} contacts</p>
              </div>
            </div>

            <button
              type="button"
              className="btn-dash-outline"
              onClick={() => setActiveModal('contacts')}
              id="dash-manage-contacts-btn"
            >
              Manage
            </button>
          </div>

          {/* Summary Card 4: Geofencing Safety */}
          <div
            className="dash-card dash-summary-card dash-summary-card--clickable"
            id="card-geofencing"
            role="link"
            tabIndex={0}
            onClick={() => navigate('/geofencing')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                navigate('/geofencing')
              }
            }}
          >
            <div className="summary-card-header">
              <div className="summary-icon-circle summary-icon-geofence">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="#2563eb">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
                </svg>
              </div>
              <div className="summary-title-group">
                <h3 className="summary-title">Geofencing Safety</h3>
                <p className="summary-subtitle">View safety zones and check nearby risk alerts.</p>
              </div>
            </div>

            <button
              type="button"
              className="btn-dash-outline"
              onClick={(e) => {
                e.stopPropagation()
                navigate('/geofencing')
              }}
              id="dash-view-geofencing-btn"
            >
              View Geofencing
            </button>
          </div>
        </div>
      </main>

      {/* ========================================================= */}
      {/* ===================== MODAL DIALOGS ===================== */}
      {/* ========================================================= */}

      {/* 1. SOS EMERGENCY ASSISTANCE MODAL (Matches reference image) */}
      {showSosConfirmModal && (
        <div className="dash-modal-backdrop" onClick={() => setShowSosConfirmModal(false)}>
          <div
            className="sos-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="dash-sos-modal-title"
          >
            {/* Header */}
            <div className="sos-header">
              <div className="sos-title-group">
                <h3 id="dash-sos-modal-title" className="sos-title">
                  Emergency Assistance
                </h3>
                <p className="sos-subtitle">Select the type of emergency</p>
              </div>
              <button
                type="button"
                className="sos-close-btn"
                onClick={() => setShowSosConfirmModal(false)}
                aria-label="Close"
                id="dash-sos-close-btn"
              >
                ✕
              </button>
            </div>

            {/* 5 Emergency Option Cards */}
            <div className="sos-options-grid" role="radiogroup" aria-label="Emergency options">
              {/* 1. Medical */}
              <button
                type="button"
                className={`sos-option-card ${selectedSosType === 'medical' ? 'selected-medical' : ''}`}
                onClick={() => setSelectedSosType('medical')}
                role="radio"
                aria-checked={selectedSosType === 'medical'}
                id="dash-sos-opt-medical"
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
                className={`sos-option-card ${selectedSosType === 'harassment' ? 'selected-harassment' : ''}`}
                onClick={() => setSelectedSosType('harassment')}
                role="radio"
                aria-checked={selectedSosType === 'harassment'}
                id="dash-sos-opt-harassment"
              >
                <div className="sos-icon-circle bg-purple-soft">
                  <svg className="sos-svg-icon icon-purple" viewBox="0 0 24 24" fill="currentColor">
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
                className={`sos-option-card ${selectedSosType === 'lost' ? 'selected-lost' : ''}`}
                onClick={() => setSelectedSosType('lost')}
                role="radio"
                aria-checked={selectedSosType === 'lost'}
                id="dash-sos-opt-lost"
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
                className={`sos-option-card ${selectedSosType === 'accident' ? 'selected-accident' : ''}`}
                onClick={() => setSelectedSosType('accident')}
                role="radio"
                aria-checked={selectedSosType === 'accident'}
                id="dash-sos-opt-accident"
              >
                <div className="sos-icon-circle bg-blue-soft">
                  <svg className="sos-svg-icon icon-blue" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l1 2 2.2-.6-1.2 2 1.6 1.5-2.2.2-.4 2.1-1-1.9-2 1 .8-2.1-1.7-1.4 2.2-.3z" />
                    <path d="M18.92 12.01C18.72 11.42 18.16 11 17.5 11h-11c-.66 0-1.22.42-1.42 1.01L3.5 17v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h11v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-1.58-4.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 10l1.2-3.6c.15-.45.57-.75 1.05-.75h9.5c.48 0 .9.3 1.05.75L19 10H5z" />
                  </svg>
                </div>
                <span className="sos-option-label">Accident</span>
              </button>

              {/* 5. Other */}
              <button
                type="button"
                className={`sos-option-card ${selectedSosType === 'other' ? 'selected-other' : ''}`}
                onClick={() => setSelectedSosType('other')}
                role="radio"
                aria-checked={selectedSosType === 'other'}
                id="dash-sos-opt-other"
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
                  <span className="sos-location-title">Your Location</span>
                  <span className="sos-gps-fixed" title="Location detected">
                    ● Live
                  </span>
                </div>

                <div className="sos-location-body">
                  <p className="sos-location-text">Seminyak, Bali, Indonesia</p>
                  <p className="sos-location-coords">-8.4095° S, 115.1889° E</p>
                </div>

                <div className="sos-responders-badge">
                  <span className="sos-responders-icon">🛡️</span>
                  <div>
                    <div className="sos-responders-label">Target Responders:</div>
                    <div className="sos-responders-val">Bali Tourist Police & 3 Saved Contacts</div>
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
                    <linearGradient id="waterGradDash" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#bae6fd" />
                      <stop offset="100%" stopColor="#7dd3fc" />
                    </linearGradient>
                  </defs>

                  <rect width="320" height="180" fill="#e8f5e9" />
                  <path
                    d="M-10,130 Q40,110 90,140 T180,110 T260,130 T330,80 L330,-10 L-10,-10 Z"
                    fill="url(#waterGradDash)"
                    opacity="0.85"
                  />
                  <path
                    d="M-10,30 Q80,70 140,40 T280,20 L330,0 L-10,0 Z"
                    fill="#93c5fd"
                    opacity="0.6"
                  />
                  <path d="M10,80 Q40,60 70,85 T110,120 L20,150 Z" fill="#c8e6c9" />
                  <path d="M220,120 Q260,100 300,130 L320,180 L200,180 Z" fill="#dcfce7" />

                  {/* Road Network Lines */}
                  <g stroke="#ffffff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" opacity="0.95">
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

                  {/* Geofence Blue Polygon */}
                  <polygon
                    points="60,135 110,40 240,60 250,140 180,130 160,170"
                    fill="rgba(37, 99, 235, 0.08)"
                    stroke="#2563eb"
                    strokeWidth="2.4"
                    strokeLinejoin="round"
                  />
                  <circle cx="60" cy="135" r="3" fill="#2563eb" />
                  <circle cx="110" cy="40" r="3" fill="#2563eb" />
                  <circle cx="240" cy="60" r="3" fill="#2563eb" />
                  <circle cx="250" cy="140" r="3" fill="#2563eb" />

                  {/* Centered Location Marker Pin */}
                  <g transform="translate(160, 110)">
                    <circle cx="0" cy="-6" r="14" fill="#2563eb" opacity="0.15">
                      <animate attributeName="r" values="8;18;8" dur="2.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.25;0.05;0.25" dur="2.5s" repeatCount="indefinite" />
                    </circle>
                    <ellipse cx="0" cy="5" rx="5" ry="2" fill="rgba(0,0,0,0.3)" />
                    <path
                      d="M0,4 C-4,0 -7,-3 -7,-8 C-7,-12 -3.8,-15 0,-15 C3.8,-15 7,-12 7,-8 C7,-3 4,0 0,4 Z"
                      fill="#0f172a"
                    />
                    <circle cx="0" cy="-8" r="2.5" fill="#ffffff" />
                  </g>
                </svg>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="sos-footer">
              <button
                type="button"
                className="sos-btn-cancel"
                onClick={() => setShowSosConfirmModal(false)}
                id="dash-sos-modal-cancel-btn"
              >
                Cancel
              </button>

              <button
                type="button"
                className="sos-btn-send"
                onClick={() => handleConfirmSos(selectedSosType)}
                id="dash-sos-modal-send-btn"
              >
                Send SOS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. JOURNEY DETAILS MODAL */}
      {activeModal === 'journey' && (
        <div className="dash-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="dash-modal" onClick={(e) => e.stopPropagation()} role="dialog">
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Current Journey Itinerary</h3>
                <p className="modal-subtitle">Bali Safety Tracking & Support Details</p>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setActiveModal(null)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="journey-modal-summary">
                <div className="jms-destination-badge">
                  <span className="jms-pin">📍</span>
                  <div>
                    <h4>Bali, Indonesia (Denpasar & Ubud)</h4>
                    <p>Status: Active Safe Journey • Low Risk Zone</p>
                  </div>
                </div>

                <div className="jms-grid">
                  <div className="jms-stat">
                    <span className="stat-label">Safety Rating</span>
                    <span className="stat-val stat-val--high">9.6 / 10</span>
                  </div>
                  <div className="jms-stat">
                    <span className="stat-label">Scheduled Stay</span>
                    <span className="stat-val">Oct 12 – Oct 22, 2026</span>
                  </div>
                  <div className="jms-stat">
                    <span className="stat-label">Next Check-In</span>
                    <span className="stat-val">In 2 days</span>
                  </div>
                  <div className="jms-stat">
                    <span className="stat-label">Local Helpline</span>
                    <span className="stat-val">112 (Universal)</span>
                  </div>
                </div>

                <div className="jms-checkin-box">
                  <div className="jms-checkin-text">
                    <p className="checkin-current-status">{lastCheckIn}</p>
                    <p className="checkin-helptext">
                      Press below to record a safety check-in now. This notifies your emergency contacts that you are safe.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn-dash-accent-small"
                    onClick={handleCheckInNow}
                    id="dash-modal-checkin-btn"
                  >
                    Check In Now
                  </button>
                </div>

                <div className="jms-itinerary-list">
                  <h5>Planned Safety Waypoints:</h5>
                  <div className="waypoint-item">
                    <span className="waypoint-dot waypoint-dot--done">✓</span>
                    <div>
                      <p className="waypoint-title">Denpasar International Airport (DPS)</p>
                      <span className="waypoint-date">Arrived Oct 12, 14:30 • Verified</span>
                    </div>
                  </div>
                  <div className="waypoint-item">
                    <span className="waypoint-dot waypoint-dot--active">●</span>
                    <div>
                      <p className="waypoint-title">Grand Hyatt Nusa Dua Resort</p>
                      <span className="waypoint-date">Current Base • Verified Safe Hotel</span>
                    </div>
                  </div>
                  <div className="waypoint-item">
                    <span className="waypoint-dot">○</span>
                    <div>
                      <p className="waypoint-title">Ubud Cultural Center Day Excursion</p>
                      <span className="waypoint-date">Scheduled Oct 18 • Tourist police zone</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-dash-outline" onClick={() => setActiveModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. SAFE PLACES & MAP MODAL */}
      {activeModal === 'safePlaces' && (
        <div className="dash-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="dash-modal dash-modal-large" onClick={(e) => e.stopPropagation()} role="dialog">
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Nearby Safe Places & Assistance Centers</h3>
                <p className="modal-subtitle">Showing verified safe shelters, hospitals, police, and consulates near Bali</p>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setActiveModal(null)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              {/* Map Placeholder Graphic */}
              <div className="mock-map-container">
                <div className="mock-map-bg">
                  <div className="map-road-1" />
                  <div className="map-road-2" />
                  <div className="map-coastline" />
                  <div className="map-ocean-label">INDIAN OCEAN</div>

                  {/* Pins on map */}
                  <div className="map-pin map-pin-user" style={{ top: '48%', left: '44%' }}>
                    <span className="map-pin-pulse" />
                    <span className="map-pin-icon">📍 You</span>
                  </div>

                  <div className="map-pin map-pin-hospital" style={{ top: '35%', left: '38%' }} title="BIMC Hospital">
                    🏥 Hospital (1.2 km)
                  </div>

                  <div className="map-pin map-pin-police" style={{ top: '55%', left: '60%' }} title="Police Station">
                    👮 Police (2.8 km)
                  </div>

                  <div className="map-pin map-pin-embassy" style={{ top: '25%', left: '55%' }} title="Consulate">
                    🏛️ Consulate (4.5 km)
                  </div>
                </div>
                <div className="mock-map-overlay-info">
                  <span>Interactive Map Preview (Simulated GPS: Denpasar Area)</span>
                </div>
              </div>

              {/* Category Filter Tabs */}
              <div className="safe-places-tabs">
                {(['All', 'Hospital', 'Police', 'Embassy', 'Tourist Center'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`tab-filter-btn ${safePlaceFilter === cat ? 'tab-filter-btn--active' : ''}`}
                    onClick={() => setSafePlaceFilter(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* List of Places */}
              <div className="safe-places-list">
                {filteredSafePlaces.map((sp) => (
                  <div key={sp.id} className="safe-place-card">
                    <div className="sp-card-left">
                      <div className="sp-cat-icon">
                        {sp.category === 'Hospital' && '🏥'}
                        {sp.category === 'Police' && '👮'}
                        {sp.category === 'Embassy' && '🏛️'}
                        {sp.category === 'Tourist Center' && 'ℹ️'}
                      </div>
                      <div>
                        <h4 className="sp-name">{sp.name}</h4>
                        <p className="sp-address">{sp.address}</p>
                        <div className="sp-meta-tags">
                          <span className="sp-tag sp-tag-cat">{sp.category}</span>
                          <span className="sp-tag sp-tag-dist">{sp.distance} away</span>
                          {sp.isOpen247 && <span className="sp-tag sp-tag-open">24/7 Open</span>}
                        </div>
                      </div>
                    </div>
                    <div className="sp-card-right">
                      <a href={`tel:${sp.phone.replace(/[^0-9+]/g, '')}`} className="btn-sp-call">
                        📞 {sp.phone}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-dash-outline" onClick={() => setActiveModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. ACTIVE ALERTS MODAL */}
      {activeModal === 'alerts' && (
        <div className="dash-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="dash-modal" onClick={(e) => e.stopPropagation()} role="dialog">
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Regional Safety Alerts</h3>
                <p className="modal-subtitle">Real-time advisory feed for Bali & nearby tourist zones</p>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setActiveModal(null)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="alerts-full-list">
                {alerts.map((item) => (
                  <div
                    key={item.id}
                    className={`alert-full-card alert-full-card--${item.level.toLowerCase()}`}
                  >
                    <div className="alert-card-head">
                      <div className="alert-tag-group">
                        <span className={`alert-badge alert-badge--${item.level.toLowerCase()}`}>
                          {item.level} Priority
                        </span>
                        <span className="alert-cat-badge">{item.category}</span>
                      </div>
                      <span className="alert-time-text">{item.time}</span>
                    </div>
                    <h4 className="alert-headline">{item.title}</h4>
                    <p className="alert-details-text">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-dash-outline" onClick={() => setActiveModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. EMERGENCY CONTACTS MODAL */}
      {activeModal === 'contacts' && (
        <div className="dash-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="dash-modal" onClick={(e) => e.stopPropagation()} role="dialog">
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Saved Emergency Contacts</h3>
                <p className="modal-subtitle">These contacts are alerted when SOS is triggered</p>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setActiveModal(null)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              {contactNotice && (
                <div className="dash-inline-toast dash-inline-toast--success">
                  <span>✓</span> {contactNotice}
                </div>
              )}

              <div className="contacts-list">
                {contacts.map((c) => (
                  <div key={c.id} className="contact-item-card">
                    <div className="contact-item-avatar">
                      {c.name.charAt(0)}
                    </div>
                    <div className="contact-item-info">
                      <div className="contact-name-row">
                        <h4 className="contact-name">{c.name}</h4>
                        {c.isPrimary && <span className="primary-pill">Primary Contact</span>}
                      </div>
                      <p className="contact-relation">{c.relationship}</p>
                      <p className="contact-phone">📞 {c.phone}</p>
                    </div>
                    <div className="contact-item-actions">
                      <button
                        type="button"
                        className="btn-test-alert"
                        onClick={() => {
                          setContactNotice(`Simulated test SMS ping sent to ${c.name} (${c.phone}).`)
                          setTimeout(() => setContactNotice(null), 3000)
                        }}
                      >
                        Test Ping
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add new contact form */}
              <form className="add-contact-form" onSubmit={handleAddContact}>
                <h4 className="add-contact-title">+ Add New Emergency Contact</h4>
                <div className="form-grid-3">
                  <input
                    type="text"
                    placeholder="Full Name"
                    className="dash-input"
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    className="dash-input"
                    value={newContactPhone}
                    onChange={(e) => setNewContactPhone(e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Relationship (e.g. Parent)"
                    className="dash-input"
                    value={newContactRelation}
                    onChange={(e) => setNewContactRelation(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn-dash-accent-small">
                  Save Contact
                </button>
              </form>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-dash-outline" onClick={() => setActiveModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. INCIDENT REPORT MODAL */}
      {activeModal === 'report' && (
        <div className="dash-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="dash-modal" onClick={(e) => e.stopPropagation()} role="dialog">
            <div className="modal-header">
              <div>
                <h3 className="modal-title">File an Incident or Assistance Report</h3>
                <p className="modal-subtitle">Submit a non-emergency report to local tourist authorities</p>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setActiveModal(null)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              {incidentSubmitted ? (
                <div className="report-success-state">
                  <span className="success-icon-big">✓</span>
                  <h4>Report Submitted (Demo Simulation)</h4>
                  <p>
                    Reference ticket #TR-88219 has been generated. Tourist Assistance Desk in Bali has received your report.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleReportSubmit} className="report-form">
                  <label className="form-field-label">Incident Category</label>
                  <select
                    className="dash-input"
                    value={incidentType}
                    onChange={(e) => setIncidentType(e.target.value)}
                  >
                    <option value="General Assistance">General Assistance</option>
                    <option value="Lost Property / Passport">Lost Property / Passport</option>
                    <option value="Medical Assistance">Non-Emergency Medical Issue</option>
                    <option value="Theft or Scam">Theft or Tourist Scam</option>
                    <option value="Harassment">Harassment or Safety Concern</option>
                  </select>

                  <label className="form-field-label">Location / Area</label>
                  <input
                    type="text"
                    className="dash-input"
                    value={incidentLocation}
                    onChange={(e) => setIncidentLocation(e.target.value)}
                    required
                  />

                  <label className="form-field-label">Description of Incident</label>
                  <textarea
                    className="dash-textarea"
                    rows={4}
                    placeholder="Describe what occurred, persons involved, or assistance needed..."
                    value={incidentDetails}
                    onChange={(e) => setIncidentDetails(e.target.value)}
                    required
                  />

                  <button type="submit" className="btn-dash-primary">
                    Submit Incident Report
                  </button>
                </form>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-dash-outline" onClick={() => setActiveModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. OFFLINE SAFETY KIT MODAL */}
      {activeModal === 'offline' && (
        <div className="dash-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="dash-modal" onClick={(e) => e.stopPropagation()} role="dialog">
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Offline Travel Safety Kit</h3>
                <p className="modal-subtitle">Essential details saved to your device cache for zero-network situations</p>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setActiveModal(null)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="offline-kit-grid">
                <div className="offline-item-card">
                  <h4>📞 Universal Emergency Numbers (Indonesia)</h4>
                  <ul>
                    <li><strong>Police:</strong> 110</li>
                    <li><strong>Ambulance / Medical:</strong> 118</li>
                    <li><strong>Search & Rescue (BASARNAS):</strong> 115</li>
                    <li><strong>Tourist Police Hotline:</strong> +62 361 224 111</li>
                    <li><strong>General Emergency:</strong> 112</li>
                  </ul>
                </div>

                <div className="offline-item-card">
                  <h4>🗣️ Critical Emergency Phrases (Indonesian)</h4>
                  <ul>
                    <li><em>"Tolong!"</em> — Help!</li>
                    <li><em>"Saya butuh dokter"</em> — I need a doctor</li>
                    <li><em>"Di mana kantor polisi?"</em> — Where is the police station?</li>
                    <li><em>"Saya tersesat"</em> — I am lost</li>
                    <li><em>"Panggil ambulans!"</em> — Call an ambulance!</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-dash-outline" onClick={() => setActiveModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. PROFILE MODAL */}
      {activeModal === 'profile' && (
        <div className="dash-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="dash-modal" onClick={(e) => e.stopPropagation()} role="dialog">
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Tourist Profile & Medical Safety</h3>
                <p className="modal-subtitle">Personal safety parameters for responder identification</p>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setActiveModal(null)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="profile-details-sheet">
                <div className="pds-row">
                  <span className="pds-label">Full Name:</span>
                  <span className="pds-value">Alex Morrison</span>
                </div>
                <div className="pds-row">
                  <span className="pds-label">Account Role:</span>
                  <span className="pds-value">Verified International Tourist</span>
                </div>
                <div className="pds-row">
                  <span className="pds-label">Passport / ID:</span>
                  <span className="pds-value">GBR #98240182</span>
                </div>
                <div className="pds-row">
                  <span className="pds-label">Blood Type:</span>
                  <span className="pds-value">O Positive (O+)</span>
                </div>
                <div className="pds-row">
                  <span className="pds-label">Known Allergies:</span>
                  <span className="pds-value">Penicillin (Severe)</span>
                </div>
                <div className="pds-row">
                  <span className="pds-label">Travel Insurance:</span>
                  <span className="pds-value">Allianz Global Travel Safety #ALZ-99381</span>
                </div>
                <div className="pds-row">
                  <span className="pds-label">Primary Destination:</span>
                  <span className="pds-value">Bali, Indonesia (Grand Hyatt Nusa Dua)</span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-dash-outline" onClick={() => setActiveModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
