import { useState } from 'react'
import { Link } from '../src/router'
import './Navbar.css'

type NavbarProps = { currentPath: string }

const links = [
  { to: '/', label: 'Home' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/about', label: 'About' },
  { to: '/how-it-works', label: 'How It Works' },
]

function ShieldLogo() {
  return (
    <svg className="nav-logo-icon" viewBox="0 0 32 36" aria-hidden="true">
      <path d="M16 1 3 6v10c0 9 5.6 15.6 13 19 7.4-3.4 13-10 13-19V6L16 1Z" fill="#1d4f91" />
      <circle cx="16" cy="17" r="9" fill="#3d8be0" />
      <path d="M10 13c2-1 3 1 5 0s2-3 4-2 1 3 3 4-1 4-3 4-2 2-4 1-1-3-3-3-3-2-2-4Z" fill="#4caf50" />
    </svg>
  )
}

export default function Navbar({ currentPath }: NavbarProps) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <header className="navbar">
      <nav className="navbar-inner" aria-label="Main navigation">
        <Link to="/" className="nav-brand" onClick={close} id="nav-brand">
          <ShieldLogo />
          <span>SafeJourney</span>
        </Link>

        <button
          className={`nav-toggle ${open ? 'is-open' : ''}`}
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          id="nav-toggle"
        >
          <span /><span /><span />
        </button>

        <div className={`nav-menu ${open ? 'is-open' : ''}`}>
          <ul className="nav-links">
            {links.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  onClick={close}
                  className={currentPath === l.to ? 'active' : ''}
                  id={`nav-${l.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="nav-actions">
            <Link to="/login" className="btn btn-outline" onClick={close} id="nav-login">Login</Link>
            <Link to="/register" className="btn btn-primary" onClick={close} id="nav-register">Register</Link>
          </div>
        </div>
      </nav>
    </header>
  )
}
