import { Link } from '../src/router'
import type { ReactNode } from 'react'
import './HowItWorks.css'

interface StepItem {
  number: string
  badge: string
  title: string
  description: string
  highlights: string[]
  primaryAction: {
    label: string
    to: string
    tone?: 'primary' | 'accent' | 'danger'
  }
  secondaryAction?: {
    label: string
    to: string
  }
  previewIcon: ReactNode
}

export default function HowItWorks() {
  const steps: StepItem[] = [
    {
      number: '01',
      badge: 'Account Setup',
      title: 'Register or Log In to Your Account',
      description:
        'Create a free traveler account in seconds or log in to manage your active trips. Your profile stores your emergency contact preferences and travel itineraries safely in one place.',
      highlights: [
        'Quick email and password registration',
        'Demonstration tourist profile ready immediately',
        'Seamless access across desktop and mobile browsers',
      ],
      primaryAction: {
        label: 'Create Free Account',
        to: '/register',
        tone: 'accent',
      },
      secondaryAction: {
        label: 'Log in',
        to: '/login',
      },
      previewIcon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
    {
      number: '02',
      badge: 'Safety Contacts',
      title: 'Set Up Your Tourist Profile & Emergency Circle',
      description:
        'Configure your trusted emergency contacts—such as family members, companions, or your tour leader. If you ever miss a scheduled check-in or raise an SOS, these contacts are prioritized for notification.',
      highlights: [
        'Save primary and secondary emergency contacts',
        'Direct phone number and relationship linking',
        'Instant contact management on your dashboard',
      ],
      primaryAction: {
        label: 'Manage Contacts on Dashboard',
        to: '/dashboard',
        tone: 'primary',
      },
      previewIcon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      number: '03',
      badge: 'Active Trip Tracking',
      title: 'Plan Your Journey & Use Safety Check-ins',
      description:
        'Enter your destination (e.g. Goa, Bali), travel dates, and choose your preferred check-in interval (every 2, 4, or 6 hours). When notified, confirm your safety with a single tap of the "Check In Now" button.',
      highlights: [
        'Customizable check-in intervals (1h to 24h)',
        'Live timestamped check-in status log',
        'Next check-in countdown reminders',
      ],
      primaryAction: {
        label: 'Open Journey Check-in',
        to: '/journey',
        tone: 'accent',
      },
      previewIcon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
    },
    {
      number: '04',
      badge: 'Immediate SOS',
      title: 'Request Emergency Assistance When Needed',
      description:
        'In any urgent situation, tap the prominent red SOS button. Categorize the issue as Medical, Harassment, Lost, Accident, or Other to dispatch a distress alert to local tourist police and saved contacts.',
      highlights: [
        '5 clear emergency classifications',
        'Automatic location coordinates snapshot',
        'Target Responders: Tourist Police & 3 Contacts',
      ],
      primaryAction: {
        label: 'View Emergency SOS',
        to: '/sos',
        tone: 'danger',
      },
      previewIcon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="4" />
          <line x1="4.93" y1="4.93" x2="9.17" y2="9.17" />
          <line x1="14.83" y1="14.83" x2="19.07" y2="19.07" />
          <line x1="14.83" y1="9.17" x2="19.07" y2="4.93" />
          <line x1="4.93" y1="19.07" x2="9.17" y2="14.83" />
        </svg>
      ),
    },
    {
      number: '05',
      badge: 'Status & Resolution',
      title: 'Track the Status of Your Assistance Request',
      description:
        'Stay informed with real-time broadcast indicators on your dashboard. Review the emergency timestamp, target responders notified, and resolve or cancel the simulated alert once you are safe.',
      highlights: [
        'Live emergency broadcast status banner',
        'Recipient confirmation & location summary',
        'One-click alert resolution & dismissal',
      ],
      primaryAction: {
        label: 'View Dashboard Tracking',
        to: '/dashboard',
        tone: 'primary',
      },
      previewIcon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <polyline points="9 12 11 14 15 10" />
        </svg>
      ),
    },
  ]

  const safetyGuarantees = [
    {
      title: 'Privacy Conscious',
      desc: 'Location coordinates are only queried during explicit check-ins or when you deliberately trigger an SOS.',
      icon: '🔒',
    },
    {
      title: 'Clear Simulation Mode',
      desc: 'As an academic prototype, all alert broadcasts are safely simulated for evaluation without false alarms.',
      icon: '🛡️',
    },
    {
      title: 'Responsive & Accessible',
      desc: 'Optimized for laptops, tablets, and mobile devices so travelers have access on any screen.',
      icon: '📱',
    },
  ]

  return (
    <div className="hiw-page">
      {/* ===== HERO SECTION ===== */}
      <section className="hiw-hero" aria-labelledby="hiw-hero-title">
        <div className="hiw-hero-container">
          <div className="hiw-hero-badge">
            <span className="hiw-badge-dot" />
            <span>Platform Workflow Guide</span>
          </div>
          <h1 id="hiw-hero-title" className="hiw-hero-title">
            How SafeJourney Works
          </h1>
          <p className="hiw-hero-lead">
            Learn how our tourist safety platform guides you through account setup, proactive itinerary check-ins,
            and rapid emergency assistance in five straightforward steps.
          </p>
          <div className="hiw-hero-actions">
            <Link to="/register" className="btn btn-accent" id="hiw-hero-get-started">
              Get Started Free
            </Link>
            <Link to="/dashboard" className="btn btn-ghost-light" id="hiw-hero-explore-dash">
              Explore Live Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* ===== 5-STEP STEP-BY-STEP PROCESS SECTION ===== */}
      <section className="hiw-steps-section" aria-labelledby="hiw-steps-heading">
        <div className="hiw-container">
          <div className="hiw-section-header">
            <span className="hiw-eyebrow">5 Simple Steps</span>
            <h2 id="hiw-steps-heading" className="hiw-section-title">
              Your Complete Travel Safety Workflow
            </h2>
            <p className="hiw-section-sub">
              Everything you need to travel with confidence, from journey departure to destination arrival.
            </p>
          </div>

          <div className="hiw-steps-list">
            {steps.map((step, index) => {
              const isEven = index % 2 === 1
              return (
                <article
                  key={step.number}
                  className={`hiw-step-card ${isEven ? 'hiw-step-card--alt' : ''}`}
                >
                  {/* Step Content Column */}
                  <div className="hiw-step-content">
                    <div className="hiw-step-meta">
                      <span className="hiw-step-number">{step.number}</span>
                      <span className="hiw-step-badge">{step.badge}</span>
                    </div>

                    <h3 className="hiw-step-title">{step.title}</h3>
                    <p className="hiw-step-desc">{step.description}</p>

                    <ul className="hiw-step-highlights">
                      {step.highlights.map((h, i) => (
                        <li key={i}>
                          <span className="hiw-check-icon" aria-hidden="true">✓</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="hiw-step-actions">
                      <Link
                        to={step.primaryAction.to}
                        className={`btn ${
                          step.primaryAction.tone === 'danger'
                            ? 'hiw-btn-danger'
                            : step.primaryAction.tone === 'primary'
                            ? 'btn-primary'
                            : 'btn-accent'
                        }`}
                        id={`hiw-step-${step.number}-primary`}
                      >
                        {step.primaryAction.label}
                      </Link>

                      {step.secondaryAction && (
                        <Link
                          to={step.secondaryAction.to}
                          className="hiw-link-subtle"
                          id={`hiw-step-${step.number}-secondary`}
                        >
                          {step.secondaryAction.label} →
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Step Graphic Preview Card */}
                  <div className="hiw-step-graphic-col">
                    <div className="hiw-graphic-card">
                      <div className="hiw-graphic-icon-wrap">
                        {step.previewIcon}
                      </div>
                      <div className="hiw-graphic-label-group">
                        <span className="hiw-graphic-sub">{step.badge}</span>
                        <span className="hiw-graphic-title">{step.title.split(' ')[0]} {step.title.split(' ')[1]}</span>
                      </div>
                      <div className="hiw-graphic-visual-bars">
                        <div className="hiw-bar hiw-bar-1" />
                        <div className="hiw-bar hiw-bar-2" />
                        <div className="hiw-bar hiw-bar-3" />
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* ===== SAFETY GUARANTEES / PROTOTYPE HIGHLIGHTS ===== */}
      <section className="hiw-guarantees-section" aria-labelledby="guarantees-heading">
        <div className="hiw-container">
          <div className="hiw-guarantees-box">
            <h2 id="guarantees-heading" className="hiw-guarantees-title">
              Designed with Integrity & Safety in Mind
            </h2>
            <div className="hiw-guarantees-grid">
              {safetyGuarantees.map((g) => (
                <div key={g.title} className="hiw-guarantee-item">
                  <span className="hiw-guarantee-icon" aria-hidden="true">{g.icon}</span>
                  <h3>{g.title}</h3>
                  <p>{g.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== CALL TO ACTION (CTA) ===== */}
      <section className="hiw-cta-section" aria-labelledby="hiw-cta-heading">
        <div className="hiw-container">
          <div className="hiw-cta-card">
            <div className="hiw-cta-text-group">
              <h2 id="hiw-cta-heading" className="hiw-cta-title">
                Ready to Experience SafeJourney?
              </h2>
              <p className="hiw-cta-desc">
                Start by creating your tourist profile, exploring real-time safety tools, or testing our simulated
                journey check-in workflow.
              </p>
            </div>
            <div className="hiw-cta-btn-group">
              <Link to="/register" className="btn btn-accent" id="hiw-cta-register">
                Register Free
              </Link>
              <Link to="/dashboard" className="btn btn-outline" id="hiw-cta-dashboard">
                Open Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== REUSABLE FOOTER ===== */}
      <footer className="hiw-footer">
        <div className="hiw-container hiw-footer-inner">
          <div className="hiw-footer-brand">
            <div className="hiw-footer-logo-row">
              <svg className="hiw-footer-logo-icon" viewBox="0 0 32 36" aria-hidden="true">
                <path d="M16 1 3 6v10c0 9 5.6 15.6 13 19 7.4-3.4 13-10 13-19V6L16 1Z" fill="#1d4ed8" />
                <circle cx="16" cy="17" r="8.5" fill="#38bdf8" />
                <path d="M11 13c2-1 3 1 4.5 0s2-2.5 3.5-1.5 1 2.5 2.5 3.5-1 3.5-2.5 3.5-2 1.5-3.5.8-1-2.5-2.5-2.5-2.6-1.8-2-3.8Z" fill="#4ade80" />
              </svg>
              <span className="hiw-footer-brand-name">SafeJourney</span>
            </div>
            <p className="hiw-footer-tagline">
              Intelligent tourist safety, location check-ins, and emergency assistance system.
            </p>
          </div>

          <div className="hiw-footer-nav">
            <div className="hiw-footer-nav-col">
              <h4>Navigation</h4>
              <Link to="/">Home</Link>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/about">About Us</Link>
              <Link to="/how-it-works">How It Works</Link>
            </div>
            <div className="hiw-footer-nav-col">
              <h4>Safety Features</h4>
              <Link to="/journey">Journey Check-in</Link>
              <Link to="/sos">Emergency SOS</Link>
              <Link to="/dashboard">Safe Places Directory</Link>
            </div>
          </div>
        </div>

        <div className="hiw-footer-bottom">
          <div className="hiw-container hiw-footer-bottom-inner">
            <p>© {new Date().getFullYear()} SafeJourney. Tourist Safety and Assistance Academic Prototype.</p>
            <p className="hiw-footer-academic-note">Designed for academic and demonstration evaluation.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
