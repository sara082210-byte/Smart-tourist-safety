import { useEffect, useState } from 'react'
import { Link, navigate } from '../src/router'
import { getCurrentUser, logout } from '../src/services/authService'
import type { User } from '../src/services/authService'
import { useDestination } from '../src/context/DestinationContext'
import {
  EmergencyContact as BackendContact,
  getEmergencyContacts,
  createEmergencyContact,
  deleteEmergencyContact,
} from '../src/services/contactService'
import {
  IncidentReport as BackendIncident,
  getIncidents,
  createIncident,
} from '../src/services/incidentService'
import DestinationMap from '../src/components/DestinationMap'
import {
  UNIVERSAL_EMERGENCY_NUMBERS,
  CRITICAL_EMERGENCY_PHRASES,
} from '../src/services/destinationData'
import './Dashboard.css'
import './SOS.css'

// Navigation Types
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

export default function Dashboard() {
  const {
    selectedDestination,
    setDestination,
    destinations: supportedDestinations,
    activeJourney,
    doCheckIn,
  } = useDestination()

  const [user, setUser] = useState<User | null>(null)
  const [userLoading, setUserLoading] = useState(true)

  // Auth guard: only authenticated sessions may view the dashboard
  useEffect(() => {
    let cancelled = false
    getCurrentUser()
      .then((currentUser) => {
        if (cancelled) return
        if (!currentUser) {
          navigate('/login')
          return
        }
        setUser(currentUser)
        setUserLoading(false)
      })
      .catch(() => {
        if (!cancelled) navigate('/login')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const userInitials = user?.fullName
    ? user.fullName
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U'

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

  // Safe places filter state
  const [safePlaceFilter, setSafePlaceFilter] = useState<string>('All')

  // Check-in state
  const [lastCheckIn, setLastCheckIn] = useState(activeJourney?.lastCheckIn || 'Checked in: Today at 08:00 AM')
  const [checkInNotice, setCheckInNotice] = useState<string | null>(null)

  // User personal contacts (loaded from backend)
  const [userContacts, setUserContacts] = useState<BackendContact[]>([])
  const [contactsLoading, setContactsLoading] = useState(false)
  const [contactsError, setContactsError] = useState<string | null>(null)
  const [newContactName, setNewContactName] = useState('')
  const [newContactPhone, setNewContactPhone] = useState('')
  const [newContactRelation, setNewContactRelation] = useState('')
  const [contactNotice, setContactNotice] = useState<string | null>(null)

  // Incident reporting state (persisted to backend)
  const [userIncidents, setUserIncidents] = useState<BackendIncident[]>([])
  const [incidentType, setIncidentType] = useState('General Assistance')
  const [incidentLocation, setIncidentLocation] = useState(
    `${selectedDestination.name}, ${selectedDestination.state}`
  )
  const [incidentDetails, setIncidentDetails] = useState('')
  const [incidentSubmitted, setIncidentSubmitted] = useState(false)
  const [incidentNotice, setIncidentNotice] = useState<string | null>(null)

  // Offline kit cache status
  const [offlineCached, setOfflineCached] = useState(false)
  const [copyNotice, setCopyNotice] = useState<string | null>(null)

  // Synchronize incident location default when destination changes
  useEffect(() => {
    setIncidentLocation(`${selectedDestination.name}, ${selectedDestination.state}`)
    try {
      setOfflineCached(Boolean(localStorage.getItem(`offline_kit_cached_${selectedDestination.id}`)))
    } catch {
      setOfflineCached(false)
    }
  }, [selectedDestination])

  // Load user contacts and incidents from backend
  const loadUserData = async () => {
    setContactsLoading(true)
    try {
      const fetchedContacts = await getEmergencyContacts()
      setUserContacts(fetchedContacts)
    } catch {
      // Unauthenticated or network issue
    } finally {
      setContactsLoading(false)
    }

    try {
      const fetchedIncidents = await getIncidents()
      setUserIncidents(fetchedIncidents)
    } catch {
      // Ignore
    }
  }

  useEffect(() => {
    loadUserData()
  }, [])

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
      `SIMULATED ${typeLabel.toUpperCase()} ASSISTANCE: Distress signal simulated for ${selectedDestination.name} (${selectedDestination.latitude.toFixed(4)}° N, ${selectedDestination.longitude.toFixed(4)}° E). Official emergency contact: 112 & ${selectedDestination.localPolice.name}.`
    )
  }

  const handleCancelSos = () => {
    setSosActive(false)
    setSosStatusMessage(null)
  }

  // Handle Journey Check-in
  const handleCheckInNow = async () => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setLastCheckIn(`Checked in: Today at ${timeStr}`)
    try {
      await doCheckIn()
    } catch {
      // Local state fallback
    }
    setCheckInNotice(`Safety check-in recorded for ${selectedDestination.name}! Emergency contacts updated.`)
    setTimeout(() => setCheckInNotice(null), 4000)
  }

  // Handle Add Personal Contact
  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newContactName.trim() || !newContactPhone.trim()) return

    setContactsError(null)
    try {
      const created = await createEmergencyContact({
        name: newContactName.trim(),
        phone: newContactPhone.trim(),
        relationship: newContactRelation.trim() || 'Family / Friend',
        isPrimary: userContacts.length === 0,
      })
      setUserContacts((prev) => [...prev, created])
      setNewContactName('')
      setNewContactPhone('')
      setNewContactRelation('')
      setContactNotice('Personal emergency contact saved to your profile.')
      setTimeout(() => setContactNotice(null), 3500)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save contact'
      setContactsError(msg)
    }
  }

  // Handle Delete Personal Contact
  const handleDeleteContact = async (id: number) => {
    setContactsError(null)
    try {
      await deleteEmergencyContact(id)
      setUserContacts((prev) => prev.filter((c) => c.id !== id))
      setContactNotice('Emergency contact removed.')
      setTimeout(() => setContactNotice(null), 3000)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete contact'
      setContactsError(msg)
    }
  }

  // Handle Incident Report Submit
  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!incidentDetails.trim() || !incidentLocation.trim()) return

    setIncidentNotice(null)
    try {
      const created = await createIncident({
        incidentType,
        location: incidentLocation.trim(),
        destinationName: selectedDestination.name,
        details: incidentDetails.trim(),
      })
      setUserIncidents((prev) => [created, ...prev])
      setIncidentSubmitted(true)
      setTimeout(() => {
        setIncidentSubmitted(false)
        setIncidentDetails('')
        setActiveModal(null)
      }, 2500)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to submit report'
      setIncidentNotice(msg)
    }
  }

  // Handle Cache Offline Kit
  const handleCacheOfflineKit = () => {
    try {
      const payload = {
        destinationId: selectedDestination.id,
        destinationName: selectedDestination.name,
        state: selectedDestination.state,
        coordinates: [selectedDestination.latitude, selectedDestination.longitude],
        guidance: selectedDestination.offlineKit,
        universalNumbers: UNIVERSAL_EMERGENCY_NUMBERS,
        localPolice: selectedDestination.localPolice,
        phrases: CRITICAL_EMERGENCY_PHRASES,
        savedAt: new Date().toISOString(),
      }
      localStorage.setItem(`offline_kit_cached_${selectedDestination.id}`, JSON.stringify(payload))
      setOfflineCached(true)
      setCopyNotice('Offline Kit cached to browser storage! Available without internet.')
      setTimeout(() => setCopyNotice(null), 3500)
    } catch {
      setCopyNotice('Could not save to local storage.')
      setTimeout(() => setCopyNotice(null), 3000)
    }
  }

  // Copy phrase to clipboard helper
  const handleCopyPhrase = (text: string) => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopyNotice(`Copied: "${text}"`)
      setTimeout(() => setCopyNotice(null), 2500)
    })
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

  // Handle Logout
  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      /* ignore */
    }
    navigate('/login')
  }

  // Filtered Safe Places
  const filteredSafePlaces =
    safePlaceFilter === 'All'
      ? selectedDestination.safePlaces
      : selectedDestination.safePlaces.filter((item) => item.category === safePlaceFilter)

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
          <div
            className="user-avatar-circle"
            title={user?.fullName || 'User Profile'}
            onClick={() => setActiveModal('profile')}
            style={{ cursor: 'pointer' }}
          >
            <span className="avatar-initials">{userInitials}</span>
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
            {selectedDestination.alerts.length > 0 && (
              <span className="dash-nav-pill-badge">{selectedDestination.alerts.length}</span>
            )}
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
            <span className="dash-nav-label">My Profile</span>
          </button>
        </nav>

        <div className="dash-sidebar-bottom">
          <div
            className="dash-sidebar-user-preview"
            onClick={() => setActiveModal('profile')}
            role="button"
            tabIndex={0}
            title="View My Profile"
            style={{ cursor: 'pointer' }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setActiveModal('profile')
              }
            }}
          >
            <div className="user-avatar-circle dash-sidebar-avatar">
              <span className="avatar-initials">{userInitials}</span>
            </div>
            <div className="dash-sidebar-user-info">
              <span className="dash-sidebar-user-name">
                {userLoading ? 'Loading…' : user?.fullName || 'User'}
              </span>
              <span className="dash-sidebar-user-role">Tourist</span>
            </div>
          </div>

          {/* Logout button */}
          <button
            type="button"
            className="dash-nav-item dash-logout-btn"
            onClick={handleLogout}
            id="nav-tab-logout"
          >
            <svg className="dash-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span className="dash-nav-label">Log Out</span>
          </button>
        </div>
      </aside>

      {/* ===== MAIN CONTENT AREA ===== */}
      <main className="dash-main-content">
        {/* Top Header / Profile / Notification Area */}
        <header className="dash-topbar" onClick={(e) => e.stopPropagation()}>
          <div className="dash-topbar-left">
            <span className="dash-welcome-eyebrow">SafeJourney Tourist Safety Network</span>
          </div>

          <div className="dash-topbar-right">
            {/* Notifications Bell */}
            <div className="dash-notifications-wrapper">
              <button
                type="button"
                className="dash-icon-button"
                aria-label="View safety alerts and notifications"
                aria-expanded={isNotificationsOpen}
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen)
                  setIsProfileMenuOpen(false)
                }}
                id="dash-notifications-button"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {selectedDestination.alerts.length > 0 && <span className="notification-badge-dot" />}
              </button>

              {/* Notification Dropdown Panel */}
              {isNotificationsOpen && (
                <div className="dash-dropdown-panel dash-notifications-panel" id="dash-notifications-dropdown">
                  <div className="dropdown-panel-header">
                    <h4>Safety Advisories ({selectedDestination.name})</h4>
                    <span className="notif-count-pill">{selectedDestination.alerts.length} Active</span>
                  </div>
                  <ul className="notifications-list">
                    {selectedDestination.alerts.map((al) => (
                      <li key={al.id} className="notification-item">
                        <div className="notif-indicator" />
                        <div className="notif-body">
                          <p className="notif-text">
                            <strong>{al.category}:</strong> {al.title}
                          </p>
                          <span className="notif-time">{al.time} • Sample Advisory</span>
                        </div>
                      </li>
                    ))}
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
                      View all regional safety advisories →
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
                  <div className="user-avatar-circle" style={{ width: '100%', height: '100%' }}>
                    <span className="avatar-initials">{userInitials}</span>
                  </div>
                </div>
                <div className="user-profile-text">
                  <span className="user-name">
                    {userLoading ? 'Loading…' : user?.fullName || 'User'}
                  </span>
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
                    <p className="profile-dd-name">{userLoading ? 'Loading…' : user?.fullName || 'User'}</p>
                    <p className="profile-dd-email">{user?.email || ''}</p>
                    <span className="profile-verified-badge">✓ Verified Tourist</span>
                  </div>
                  <div className="profile-dropdown-divider" />
                  <button
                    type="button"
                    className="profile-dropdown-item"
                    onClick={() => {
                      setIsProfileMenuOpen(false)
                      setActiveModal('profile')
                    }}
                    id="dash-menu-my-profile"
                  >
                    👤 My Profile
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
                    id="dash-menu-logout"
                  >
                    🚪 Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Greeting Banner & Active Destination Selector */}
        <section className="dash-greeting-section" aria-labelledby="dash-greeting-title">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 id="dash-greeting-title" className="dash-greeting-title">
                {userLoading ? 'Welcome!' : user?.fullName ? `Welcome, ${user.fullName}!` : 'Welcome!'}
              </h1>
              <p className="dash-greeting-subtitle">Stay safe. Explore more.</p>
            </div>

            {/* Destination Selector Pill */}
            <div
              style={{
                background: '#ffffff',
                padding: '8px 14px',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Active Destination:
              </span>
              <select
                id="dash-destination-selector"
                value={selectedDestination.id}
                onChange={(e) => setDestination(Number(e.target.value))}
                style={{
                  border: '1px solid #94a3b8',
                  background: '#f8fafc',
                  color: '#0f172a',
                  fontWeight: 600,
                  fontSize: '13px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                {supportedDestinations.map((d) => (
                  <option key={d.id} value={d.id}>
                    📍 {d.name} ({d.state})
                  </option>
                ))}
              </select>
            </div>
          </div>
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
                  Prototype demonstration: Simulated student safety ping. Destination coordinates: {selectedDestination.latitude.toFixed(4)}° N, {selectedDestination.longitude.toFixed(4)}° E.
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
        {copyNotice && (
          <div className="dash-inline-toast dash-inline-toast--info">
            <span>ℹ️</span> {copyNotice}
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

          {/* Card 2: Current Journey Card */}
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
                <h3 className="journey-destination">
                  {selectedDestination.name}, {selectedDestination.state}
                </h3>
                <p className="journey-checkin-timeline">
                  {activeJourney?.nextCheckIn ? `Next check-in: ${activeJourney.nextCheckIn}` : 'Check-in scheduled'}
                </p>
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

        {/* ===== LOWER GRID: 4 Summary Cards ===== */}
        <div className="dash-grid-bottom">
          {/* Summary Card 1: Active Alerts */}
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
                  {selectedDestination.alerts.length} Advisory item{selectedDestination.alerts.length === 1 ? '' : 's'}
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

          {/* Summary Card 2: Nearby Safe Places */}
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
                <p className="summary-subtitle">{selectedDestination.safePlaces.length} verified places</p>
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

          {/* Summary Card 3: Emergency Contacts */}
          <div className="dash-card dash-summary-card" id="card-emergency-contacts">
            <div className="summary-card-header">
              <div className="summary-icon-circle summary-icon-contacts">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="#e11d48">
                  <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.44-5.15-3.75-6.59-6.59l1.97-1.57c.28-.28.36-.67.25-1.02A11.36 11.36 0 0 1 8.5 4.3c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-.99-1.42z" />
                </svg>
              </div>
              <div className="summary-title-group">
                <h3 className="summary-title">Emergency Contacts</h3>
                <p className="summary-subtitle">
                  1 Official + {userContacts.length} Personal
                </p>
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
                <p className="summary-subtitle">Perimeter around {selectedDestination.name}</p>
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

      {/* 1. SOS EMERGENCY ASSISTANCE MODAL */}
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
              <div className="sos-location-card">
                <div className="sos-location-header">
                  <span className="sos-location-title">Selected Destination</span>
                  <span className="sos-gps-fixed" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
                    ● Planned Destination
                  </span>
                </div>

                <div className="sos-location-body">
                  <p className="sos-location-text">{selectedDestination.name}, {selectedDestination.state}</p>
                  <p className="sos-location-coords">
                    📍 {selectedDestination.latitude.toFixed(4)}° N, {selectedDestination.longitude.toFixed(4)}° E
                  </p>
                </div>

                <div className="sos-responders-badge">
                  <span className="sos-responders-icon">🛡️</span>
                  <div>
                    <div className="sos-responders-label">Emergency Helpline:</div>
                    <div className="sos-responders-val">112 & {selectedDestination.localPolice.name}</div>
                  </div>
                </div>
              </div>

              <div className="sos-map-card" style={{ padding: '6px' }}>
                <DestinationMap destination={selectedDestination} height="160px" zoom={12} />
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
                Simulate SOS Alert
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
                <p className="modal-subtitle">{selectedDestination.name} Safety Tracking</p>
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
                    <h4>{selectedDestination.name}, {selectedDestination.state}</h4>
                    <p>Coordinates: {selectedDestination.latitude.toFixed(4)}° N, {selectedDestination.longitude.toFixed(4)}° E</p>
                  </div>
                </div>

                <div className="jms-grid">
                  <div className="jms-stat">
                    <span className="stat-label">Safety Status</span>
                    <span className="stat-val stat-val--high">Active Monitor</span>
                  </div>
                  <div className="jms-stat">
                    <span className="stat-label">Scheduled Stay</span>
                    <span className="stat-val">{activeJourney?.startDate || 'Oct 10, 2026'} – {activeJourney?.expectedArrival || 'Oct 16, 2026'}</span>
                  </div>
                  <div className="jms-stat">
                    <span className="stat-label">Next Check-In</span>
                    <span className="stat-val">{activeJourney?.nextCheckIn || 'In 2 hours'}</span>
                  </div>
                  <div className="jms-stat">
                    <span className="stat-label">National Helpline</span>
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

                <div style={{ marginTop: '16px' }}>
                  <DestinationMap destination={selectedDestination} height="200px" />
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
                <h3 className="modal-title">Nearby Safe Places Around {selectedDestination.name}</h3>
                <p className="modal-subtitle">Showing verified safe shelters, hospitals, and police near {selectedDestination.name}, {selectedDestination.state}</p>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setActiveModal(null)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              {/* Interactive Leaflet Map for Destination */}
              <div style={{ marginBottom: '16px' }}>
                <DestinationMap destination={selectedDestination} places={filteredSafePlaces} height="260px" />
              </div>

              {/* Category Filter Tabs */}
              <div className="safe-places-tabs">
                {(['All', 'Police', 'Hospital', 'Tourist Center'] as const).map((cat) => (
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
                {filteredSafePlaces.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                    No verified safe places under this category for {selectedDestination.name}.
                  </div>
                ) : (
                  filteredSafePlaces.map((sp) => (
                    <div key={sp.id} className="safe-place-card">
                      <div className="sp-card-left">
                        <div className="sp-cat-icon">
                          {sp.category === 'Hospital' && '🏥'}
                          {sp.category === 'Police' && '👮'}
                          {sp.category === 'Tourist Center' && 'ℹ️'}
                        </div>
                        <div>
                          <h4 className="sp-name">{sp.name}</h4>
                          <p className="sp-address">{sp.address}</p>
                          <div className="sp-meta-tags">
                            <span className="sp-tag sp-tag-cat">{sp.category}</span>
                            <span className="sp-tag sp-tag-dist">{sp.distance} away</span>
                            {sp.isOpen247 && <span className="sp-tag sp-tag-open">24/7 Open</span>}
                            <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>
                              ✓ {sp.verifiedSource}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="sp-card-right">
                        <a href={`tel:${sp.phone.replace(/[^0-9+]/g, '')}`} className="btn-sp-call">
                          📞 {sp.phone}
                        </a>
                      </div>
                    </div>
                  ))
                )}
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
                <h3 className="modal-title">Regional Safety Alerts – {selectedDestination.name}</h3>
                <p className="modal-subtitle">Advisory categories and safety notices for {selectedDestination.name}, {selectedDestination.state}</p>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setActiveModal(null)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="alerts-full-list">
                {selectedDestination.alerts.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                    No active warnings or advisories for {selectedDestination.name}.
                  </div>
                ) : (
                  selectedDestination.alerts.map((item) => (
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
                          <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', background: '#f1f5f9', color: '#475569', fontWeight: 600 }}>
                            Sample Advisory
                          </span>
                        </div>
                        <span className="alert-time-text">{item.time}</span>
                      </div>
                      <h4 className="alert-headline">{item.title}</h4>
                      <p className="alert-details-text">{item.description}</p>
                      <div style={{ marginTop: '6px', fontSize: '11px', color: '#64748b' }}>
                        📍 <strong>Affected Perimeter:</strong> {item.affectedArea}
                      </div>
                    </div>
                  ))
                )}
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
                <h3 className="modal-title">Emergency Contacts</h3>
                <p className="modal-subtitle">Official emergency services & your personal trusted contacts</p>
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
              {contactsError && (
                <div className="dash-inline-toast dash-inline-toast--error" style={{ background: '#fee2e2', color: '#991b1b' }}>
                  <span>⚠️</span> {contactsError}
                </div>
              )}

              {/* Slot 1: Official National 112 & Local Police Contact */}
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  1. Official Emergency Helplines
                </h4>
                <div className="contacts-list">
                  {/* National 112 */}
                  <div className="contact-item-card" style={{ borderLeft: '4px solid #dc2626' }}>
                    <div className="contact-item-avatar" style={{ background: '#fee2e2', color: '#dc2626' }}>
                      🚨
                    </div>
                    <div className="contact-item-info">
                      <div className="contact-name-row">
                        <h4 className="contact-name">Police / Emergency Helpline</h4>
                        <span className="primary-pill" style={{ background: '#dc2626', color: '#ffffff' }}>
                          National 24/7
                        </span>
                      </div>
                      <p className="contact-relation">India's unified emergency number</p>
                      <p className="contact-phone">
                        📞 <a href="tel:112" style={{ color: '#dc2626', fontWeight: 700, textDecoration: 'none' }}>112</a>
                      </p>
                    </div>
                    <div className="contact-item-actions">
                      <a href="tel:112" className="btn-test-alert" style={{ background: '#dc2626', color: '#ffffff', textDecoration: 'none' }}>
                        Call 112
                      </a>
                    </div>
                  </div>

                  {/* Destination Police Station */}
                  <div className="contact-item-card" style={{ borderLeft: '4px solid #2563eb' }}>
                    <div className="contact-item-avatar" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
                      👮
                    </div>
                    <div className="contact-item-info">
                      <div className="contact-name-row">
                        <h4 className="contact-name">{selectedDestination.localPolice.name}</h4>
                        <span className="primary-pill">Local Jurisdiction</span>
                      </div>
                      <p className="contact-relation">Official local police station for {selectedDestination.name}</p>
                      <p className="contact-phone">
                        📞 <a href={`tel:${selectedDestination.localPolice.phone.replace(/[^0-9+]/g, '')}`} style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>
                          {selectedDestination.localPolice.phone}
                        </a>
                      </p>
                    </div>
                    <div className="contact-item-actions">
                      <a
                        href={`tel:${selectedDestination.localPolice.phone.replace(/[^0-9+]/g, '')}`}
                        className="btn-test-alert"
                        style={{ textDecoration: 'none' }}
                      >
                        Call Station
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slots 2 & 3+: User-Managed Personal Emergency Contacts */}
              <div style={{ marginTop: '20px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  2. Personal Emergency Contacts ({userContacts.length})
                </h4>

                {contactsLoading ? (
                  <div style={{ padding: '16px', textAlign: 'center', color: '#64748b' }}>
                    Loading personal contacts…
                  </div>
                ) : userContacts.length === 0 ? (
                  <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                    No personal emergency contacts added. Add family members or friends below to notify them in emergencies.
                  </div>
                ) : (
                  <div className="contacts-list">
                    {userContacts.map((c) => (
                      <div key={c.id} className="contact-item-card">
                        <div className="contact-item-avatar">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="contact-item-info">
                          <div className="contact-name-row">
                            <h4 className="contact-name">{c.name}</h4>
                            {c.isPrimary && <span className="primary-pill">Primary Contact</span>}
                          </div>
                          <p className="contact-relation">{c.relationship}</p>
                          <p className="contact-phone">
                            <a href={`tel:${c.phone.replace(/[^0-9+]/g, '')}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                              📞 {c.phone}
                            </a>
                          </p>
                        </div>
                        <div className="contact-item-actions">
                          <button
                            type="button"
                            className="btn-test-alert"
                            style={{ background: '#fee2e2', color: '#dc2626', borderColor: '#fca5a5' }}
                            onClick={() => handleDeleteContact(c.id)}
                            title="Delete personal contact"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add new personal contact form */}
              <form className="add-contact-form" onSubmit={handleAddContact} style={{ marginTop: '20px' }}>
                <h4 className="add-contact-title">+ Add New Personal Emergency Contact</h4>
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
                    placeholder="Phone (e.g. +91 9876543210)"
                    className="dash-input"
                    value={newContactPhone}
                    onChange={(e) => setNewContactPhone(e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Relationship (e.g. Spouse / Parent)"
                    className="dash-input"
                    value={newContactRelation}
                    onChange={(e) => setNewContactRelation(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn-dash-accent-small" style={{ marginTop: '8px' }}>
                  Save Personal Contact
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
                <p className="modal-subtitle">Prefilled for {selectedDestination.name} • Submit to tourist safety desk</p>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setActiveModal(null)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              {incidentNotice && (
                <div className="dash-inline-toast dash-inline-toast--error" style={{ background: '#fee2e2', color: '#991b1b', marginBottom: '12px' }}>
                  <span>⚠️</span> {incidentNotice}
                </div>
              )}

              {incidentSubmitted ? (
                <div className="report-success-state">
                  <span className="success-icon-big">✓</span>
                  <h4>Report Submitted Successfully</h4>
                  <p>
                    Your report for <strong>{selectedDestination.name}</strong> has been logged to your account.
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

                  <label className="form-field-label">
                    Incident Location / Landmark (defaults to selected destination)
                  </label>
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
                    placeholder="Describe what occurred, exact location/landmark, or assistance needed..."
                    value={incidentDetails}
                    onChange={(e) => setIncidentDetails(e.target.value)}
                    required
                  />

                  <button type="submit" className="btn-dash-primary">
                    Submit Incident Report
                  </button>
                </form>
              )}

              {/* Previously Submitted Incident Reports */}
              {userIncidents.length > 0 && (
                <div style={{ marginTop: '24px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
                    Your Submitted Reports ({userIncidents.length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {userIncidents.map((rep) => (
                      <div
                        key={rep.id}
                        style={{
                          background: '#f8fafc',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          fontSize: '12px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ color: '#0f172a' }}>{rep.incidentType}</strong>
                          <span style={{ padding: '2px 6px', borderRadius: '4px', background: '#dbeafe', color: '#1e40af', fontSize: '10px', fontWeight: 600 }}>
                            {rep.status}
                          </span>
                        </div>
                        <div style={{ color: '#475569', marginTop: '2px' }}>
                          📍 {rep.location} {rep.destinationName ? `(${rep.destinationName})` : ''}
                        </div>
                        <div style={{ color: '#64748b', fontSize: '11px', marginTop: '4px' }}>
                          Ref: {rep.referenceNumber}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
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
          <div className="dash-modal dash-modal-large" onClick={(e) => e.stopPropagation()} role="dialog">
            <div className="modal-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingRight: '24px' }}>
                <div>
                  <h3 className="modal-title">Offline Travel Safety Kit</h3>
                  <p className="modal-subtitle">
                    Guidance for {selectedDestination.name} & India Emergency Resources
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCacheOfflineKit}
                  style={{
                    background: offlineCached ? '#16a34a' : '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {offlineCached ? '✓ Cached for Offline' : '💾 Cache for Offline'}
                </button>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setActiveModal(null)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="offline-kit-grid">
                {/* 1. Universal Emergency Numbers (India) */}
                <div className="offline-item-card">
                  <h4>📞 Universal Emergency Numbers (India)</h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {UNIVERSAL_EMERGENCY_NUMBERS.map((u) => (
                      <li key={u.number} style={{ fontSize: '13px', lineHeight: 1.4 }}>
                        <strong>{u.service}:</strong>{' '}
                        <a href={u.telLink} style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>
                          {u.number}
                        </a>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{u.description}</div>
                      </li>
                    ))}
                    <li style={{ fontSize: '13px', lineHeight: 1.4 }}>
                      <strong>{selectedDestination.localPolice.name}:</strong>{' '}
                      <a href={`tel:${selectedDestination.localPolice.phone.replace(/[^0-9+]/g, '')}`} style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>
                        {selectedDestination.localPolice.phone}
                      </a>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Local police station for {selectedDestination.name}</div>
                    </li>
                  </ul>
                </div>

                {/* 2. Destination-Specific Guidance */}
                <div className="offline-item-card">
                  <h4>🛡️ {selectedDestination.name} Safety Guidance</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                    <div>
                      <strong style={{ fontSize: '12px', color: '#1e3a8a' }}>• Beach / Coastal Safety:</strong>
                      <p style={{ margin: 0, fontSize: '12px', color: '#475569' }}>
                        {selectedDestination.offlineKit.beachOrMountainSafety}
                      </p>
                    </div>
                    <div>
                      <strong style={{ fontSize: '12px', color: '#1e3a8a' }}>• Weather & Terrain Precautions:</strong>
                      <p style={{ margin: 0, fontSize: '12px', color: '#475569' }}>
                        {selectedDestination.offlineKit.weatherAndMonsoon}
                      </p>
                    </div>
                    <div>
                      <strong style={{ fontSize: '12px', color: '#1e3a8a' }}>• Hydration & Sun Safety:</strong>
                      <p style={{ margin: 0, fontSize: '12px', color: '#475569' }}>
                        {selectedDestination.offlineKit.heatAndHydration}
                      </p>
                    </div>
                    <div>
                      <strong style={{ fontSize: '12px', color: '#1e3a8a' }}>• Local Transit & Crowds:</strong>
                      <p style={{ margin: 0, fontSize: '12px', color: '#475569' }}>
                        {selectedDestination.offlineKit.localTransportAdvice}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Critical Emergency Phrases */}
              <div style={{ marginTop: '20px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                  🗣️ Critical Emergency Phrases (English & Hindi)
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '8px' }}>
                  {CRITICAL_EMERGENCY_PHRASES.map((ph) => (
                    <div
                      key={ph.id}
                      style={{
                        background: '#f8fafc',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ fontWeight: 600, fontSize: '13px', color: '#1e293b' }}>
                          {ph.english}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyPhrase(ph.hindi)}
                          style={{
                            background: '#e2e8f0',
                            border: 'none',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            cursor: 'pointer',
                          }}
                          title="Copy Hindi translation"
                        >
                          Copy
                        </button>
                      </div>
                      <div style={{ fontSize: '13px', color: '#2563eb', fontWeight: 600, marginTop: '4px' }}>
                        {ph.hindi}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic', marginTop: '2px' }}>
                        Pronunciation: "{ph.hindiPronunciation}"
                      </div>
                    </div>
                  ))}
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

      {/* 8. MY PROFILE MODAL */}
      {activeModal === 'profile' && (
        <div className="dash-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div
            className="dash-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="dash-profile-modal-title"
          >
            <div className="modal-header">
              <div>
                <h3 id="dash-profile-modal-title" className="modal-title">My Profile</h3>
                <p className="modal-subtitle">Basic account information</p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setActiveModal(null)}
                aria-label="Close"
                id="dash-profile-close-btn"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              {userLoading ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                  Loading profile information…
                </div>
              ) : (
                <div className="profile-details-sheet">
                  <div className="pds-row">
                    <span className="pds-label">Full Name</span>
                    <span className="pds-value">{user?.fullName?.trim() || 'Not provided'}</span>
                  </div>
                  <div className="pds-row">
                    <span className="pds-label">Email Address</span>
                    <span className="pds-value">{user?.email?.trim() || 'Not provided'}</span>
                  </div>
                  <div className="pds-row">
                    <span className="pds-label">Phone Number</span>
                    <span className="pds-value">{user?.phone?.trim() || 'Not provided'}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-dash-outline"
                onClick={() => setActiveModal(null)}
                id="dash-profile-modal-close"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
