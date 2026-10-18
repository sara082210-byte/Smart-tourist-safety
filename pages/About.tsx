import { Link } from '../src/router'
import type { ReactNode } from 'react'
import './About.css'

interface ValueCard {
  title: string
  subtitle: string
  description: string
  icon: ReactNode
  tone: 'primary' | 'accent' | 'success' | 'danger'
}

interface FeatureItem {
  title: string
  description: string
  icon: ReactNode
  tag: string
}

export default function About() {
  const missionVisionCards: ValueCard[] = [
    {
      title: 'Our Mission',
      subtitle: 'Safety for Every Traveler',
      description:
        'To empower tourists and travelers worldwide with intuitive, real-time safety technology, proactive itinerary check-ins, and immediate access to emergency support so they can explore new destinations with peace of mind.',
      tone: 'primary',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <polyline points="9 12 11 14 15 10" />
        </svg>
      ),
    },
    {
      title: 'Our Vision',
      subtitle: 'Fearless Global Exploration',
      description:
        'To build a connected travel ecosystem where safety infrastructure, local emergency services, and loved ones work seamlessly together, transforming unpredictable journeys into confident, protected adventures.',
      tone: 'accent',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      ),
    },
  ]

  const keyFeatures: FeatureItem[] = [
    {
      title: 'Emergency SOS Broadcast',
      description:
        'Rapid one-touch emergency distress beacon transmitting real-time coordinates to local tourist police and saved emergency contacts.',
      tag: 'Immediate Response',
      icon: (
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
      title: 'Safe Journey Check-ins',
      description:
        'Automated, interval-based check-in reminders during road trips, excursions, and flights with automated alert dispatch if an interval is missed.',
      tag: 'Proactive Monitoring',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
    },
    {
      title: 'Verified Safe Places Directory',
      description:
        'Interactive geolocation maps pinpointing verified 24/7 hospitals, tourist assistance booths, embassies, and safe shelter zones.',
      tag: 'Local Navigation',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      ),
    },
    {
      title: 'Real-time Hazard Alerts',
      description:
        'Live advisories covering severe weather alerts, localized road disruptions, and high-risk safety zones tailored to your current route.',
      tag: 'Situational Awareness',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
    },
    {
      title: 'Trusted Emergency Circle',
      description:
        'Store and notify trusted family and companions instantly with automated location snapshots when assistance is requested.',
      tag: 'Connected Circle',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      title: 'Offline Emergency Readiness',
      description:
        'Quick access to universal helpline directories, medical card summaries, and essential phrase guides even without active cellular data.',
      tag: 'Always Accessible',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 2l20 20M8.5 8.5A6 6 0 0 1 18 12M5 12a10 10 0 0 1 14 0M12 19h.01" />
        </svg>
      ),
    },
  ]

  const workflowSteps = [
    {
      step: '01',
      title: 'Set Up Your Profile',
      desc: 'Add essential medical notes, emergency contacts, and active travel itineraries.',
    },
    {
      step: '02',
      title: 'Stay Connected on the Go',
      desc: 'Enable interval check-ins and receive localized safety updates wherever you travel.',
    },
    {
      step: '03',
      title: 'One-Tap Emergency Help',
      desc: 'In any critical situation, trigger an immediate SOS with precise coordinates.',
    },
  ]

  return (
    <div className="about-page">
      {/* ===== HERO SECTION ===== */}
      <section className="about-hero" aria-labelledby="about-hero-title">
        <div className="about-hero-container">
          <div className="about-hero-badge">
            <span className="badge-pulse" />
            <span>SafeJourney Platform</span>
          </div>
          <h1 id="about-hero-title" className="about-hero-title">
            About Us
          </h1>
          <p className="about-hero-lead">
            SafeJourney is a comprehensive Tourist Safety and Assistance platform dedicated to making
            independent and family travel safer, smarter, and worry-free across every destination.
          </p>
          <div className="about-hero-actions">
            <Link to="/dashboard" className="btn btn-accent" id="about-cta-dashboard">
              Explore Dashboard
            </Link>
            <Link to="/journey" className="btn btn-ghost-light" id="about-cta-journey">
              Safe Journey Check-in
            </Link>
          </div>
        </div>
      </section>

      {/* ===== INTRO & CORE VALUES SECTION ===== */}
      <section className="about-values-section" aria-labelledby="values-heading">
        <div className="about-container">
          <div className="section-header-centered">
            <span className="section-eyebrow">Guiding Principles</span>
            <h2 id="values-heading" className="section-main-heading">
              Dedicated to Tourist Protection & Peace of Mind
            </h2>
            <p className="section-sub-heading">
              Travel should be defined by curiosity and memorable experiences, not anxiety about unfamiliar surroundings or emergency logistics.
            </p>
          </div>

          <div className="about-values-grid">
            {missionVisionCards.map((card) => (
              <article key={card.title} className={`about-value-card tone-${card.tone}`}>
                <div className="value-card-header">
                  <div className="value-icon-box">{card.icon}</div>
                  <div>
                    <span className="value-card-subtitle">{card.subtitle}</span>
                    <h3 className="value-card-title">{card.title}</h3>
                  </div>
                </div>
                <p className="value-card-desc">{card.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PLATFORM KEY FEATURES SECTION ===== */}
      <section className="about-features-section" aria-labelledby="features-heading">
        <div className="about-container">
          <div className="section-header-centered">
            <span className="section-eyebrow">Smart Capabilities</span>
            <h2 id="features-heading" className="section-main-heading">
              Built for Modern Traveler Safety
            </h2>
            <p className="section-sub-heading">
              An integrated suite of protective tools designed for solo travelers, families, and tour groups.
            </p>
          </div>

          <div className="about-features-grid">
            {keyFeatures.map((feat) => (
              <article key={feat.title} className="about-feature-card">
                <div className="feature-top-row">
                  <div className="feature-icon-container">{feat.icon}</div>
                  <span className="feature-tag-pill">{feat.tag}</span>
                </div>
                <h3 className="feature-title">{feat.title}</h3>
                <p className="feature-description">{feat.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS / 3-STEP WORKFLOW ===== */}
      <section className="about-workflow-section" aria-labelledby="workflow-heading">
        <div className="about-container">
          <div className="workflow-card-inner">
            <div className="section-header-centered text-white">
              <span className="section-eyebrow eyebrow-light">How It Works</span>
              <h2 id="workflow-heading" className="section-main-heading text-white">
                Simple, Reliable Protection in 3 Steps
              </h2>
            </div>

            <div className="about-steps-grid">
              {workflowSteps.map((s) => (
                <div key={s.step} className="workflow-step-box">
                  <span className="step-number">{s.step}</span>
                  <h3 className="step-title">{s.title}</h3>
                  <p className="step-desc">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== CALL TO ACTION (CTA) ===== */}
      <section className="about-cta-section" aria-labelledby="cta-heading">
        <div className="about-container">
          <div className="about-cta-card">
            <div className="about-cta-content">
              <h2 id="cta-heading" className="about-cta-title">
                Start Your Safe Travel Journey Today
              </h2>
              <p className="about-cta-text">
                Join our tourist safety platform to manage journeys, set interval check-ins, and keep your loved ones assured every step of the way.
              </p>
            </div>
            <div className="about-cta-buttons">
              <Link to="/register" className="btn btn-accent" id="about-join-now-btn">
                Create Free Account
              </Link>
              <Link to="/dashboard" className="btn btn-outline" id="about-view-dash-btn">
                Open Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== REUSABLE FOOTER ===== */}
      <footer className="about-footer">
        <div className="about-container about-footer-inner">
          <div className="about-footer-brand">
            <div className="footer-logo-row">
              <svg className="footer-logo-icon" viewBox="0 0 32 36" aria-hidden="true">
                <path d="M16 1 3 6v10c0 9 5.6 15.6 13 19 7.4-3.4 13-10 13-19V6L16 1Z" fill="#1d4ed8" />
                <circle cx="16" cy="17" r="8.5" fill="#38bdf8" />
                <path d="M11 13c2-1 3 1 4.5 0s2-2.5 3.5-1.5 1 2.5 2.5 3.5-1 3.5-2.5 3.5-2 1.5-3.5.8-1-2.5-2.5-2.5-2.6-1.8-2-3.8Z" fill="#4ade80" />
              </svg>
              <span className="footer-brand-name">SafeJourney</span>
            </div>
            <p className="footer-tagline">
              Intelligent tourist safety, location check-ins, and emergency assistance system.
            </p>
          </div>

          <div className="about-footer-nav">
            <div className="footer-nav-col">
              <h4>Navigation</h4>
              <Link to="/">Home</Link>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/about">About Us</Link>
            </div>
            <div className="footer-nav-col">
              <h4>Safety Features</h4>
              <Link to="/journey">Journey Check-in</Link>
              <Link to="/sos">Emergency SOS</Link>
              <Link to="/dashboard">Safe Places Directory</Link>
            </div>
          </div>
        </div>

        <div className="about-footer-bottom">
          <div className="about-container footer-bottom-inner">
            <p>© {new Date().getFullYear()} SafeJourney. Tourist Safety and Assistance Academic Prototype.</p>
            <p className="footer-academic-note">Designed for academic and demonstration evaluation.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
