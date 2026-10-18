import { Link } from '../src/router'
import type { ReactNode } from 'react'
import './Home.css'

type Feature = {
  title: string
  text: string
  tone: 'danger' | 'info' | 'success' | 'purple'
  icon: ReactNode
}

const features: Feature[] = [
  {
    title: 'Emergency SOS',
    text: 'Quick help when you need it',
    tone: 'danger',
    icon: (
      <svg viewBox="0 0 24 24"><path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Z" fill="currentColor" /><rect x="11" y="7" width="2" height="6" rx="1" fill="#fff" /><circle cx="12" cy="16" r="1.2" fill="#fff" /></svg>
    ),
  },
  {
    title: 'Safe Places',
    text: 'Find hospitals, police & more',
    tone: 'info',
    icon: (
      <svg viewBox="0 0 24 24"><path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Z" fill="currentColor" /><circle cx="12" cy="9" r="2.6" fill="#fff" /></svg>
    ),
  },
  {
    title: 'Real-time Alerts',
    text: 'Stay informed and prepared',
    tone: 'success',
    icon: (
      <svg viewBox="0 0 24 24"><path d="M12 22a2.5 2.5 0 0 0 2.4-2h-4.8A2.5 2.5 0 0 0 12 22Zm7-6V11a7 7 0 0 0-5.5-6.8V3.5a1.5 1.5 0 0 0-3 0v.7A7 7 0 0 0 5 11v5l-2 2v1h18v-1l-2-2Z" fill="currentColor" /></svg>
    ),
  },
  {
    title: '24/7 Support',
    text: 'Assistance whenever, wherever',
    tone: 'purple',
    icon: (
      <svg viewBox="0 0 24 24"><path d="M12 3a8 8 0 0 0-8 8v5a2 2 0 0 0 2 2h2v-7H6a6 6 0 0 1 12 0h-2v7h2v1a1 1 0 0 1-1 1h-4v2h4a3 3 0 0 0 3-3v-8a8 8 0 0 0-8-8Z" fill="currentColor" /><text x="12" y="15.5" textAnchor="middle" fontSize="5.5" fontWeight="700" fill="currentColor">24/7</text></svg>
    ),
  },
]

export default function Home() {
  return (
    <div className="home">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-content">
          <h1 id="hero-title">Explore the World with Confidence</h1>
          <p className="hero-sub">
            Your safety, our priority. Get real-time support, find safe places, and stay
            connected — wherever you go.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-accent" id="hero-get-started">Get Started</Link>
            <Link to="/how-it-works" className="btn btn-ghost-light" id="hero-learn-more">Learn More</Link>
          </div>
        </div>
        <div className="hero-media">
          <img src="/images/hero-traveler.png" alt="Traveler with backpack overlooking green hills and a river valley" />
        </div>
      </section>

      <section className="features" aria-label="Key features">
        {features.map((f) => (
          <article className="feature-card" key={f.title}>
            <div className={`feature-icon tone-${f.tone}`}>{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.text}</p>
          </article>
        ))}
      </section>
    </div>
  )
}
