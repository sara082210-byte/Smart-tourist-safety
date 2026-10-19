import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, navigate } from '../src/router'
import { AuthError, login } from '../src/services/authService'
import './Login.css'

type Errors = { identifier?: string; password?: string }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^\+?[0-9\s-]{7,15}$/

function validate(identifier: string, password: string): Errors {
  const errors: Errors = {}
  const id = identifier.trim()
  if (!id) errors.identifier = 'Please enter your email or phone number.'
  else if (!EMAIL_RE.test(id) && !PHONE_RE.test(id))
    errors.identifier = 'Enter a valid email address or phone number.'

  if (!password) errors.password = 'Please enter your password.'
  else if (password.length < 6) errors.password = 'Password must be at least 6 characters.'
  return errors
}

export function EyeIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
      {!open && <path d="M3 3l18 18" />}
    </svg>
  )
}

export function ShieldLogo() {
  return (
    <svg className="login-logo-icon" viewBox="0 0 32 36" aria-hidden="true">
      <path d="M16 1 3 6v10c0 9 5.6 15.6 13 19 7.4-3.4 13-10 13-19V6L16 1Z" fill="#fff" />
      <path d="M16 4 6 8v8c0 7.4 4.4 12.8 10 15.6 5.6-2.8 10-8.2 10-15.6V8L16 4Z" fill="#1d4f91" />
      <circle cx="16" cy="17" r="7.5" fill="#3d8be0" />
      <path d="M11 14c2-1 3 1 4.5 0s2-2.5 3.5-1.5 1 2.5 2.5 3.5-1 3.5-2.5 3.5-2 1.5-3.5.8-1-2.5-2.5-2.5-2.6-1.8-2-3.8Z" fill="#4caf50" />
    </svg>
  )
}

export default function Login() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (loading) return
    const found = validate(identifier, password)
    setErrors(found)
    setNotice('')
    if (Object.keys(found).length > 0) return

    setLoading(true)
    try {
      await login({ identifier: identifier.trim(), password })
      setPassword('')
      setNotice('Login successful. Redirecting to your dashboard…')
      navigate('/dashboard')
    } catch (err) {
      setPassword('')
      if (err instanceof AuthError) {
        setErrors({ identifier: err.fieldErrors.identifier, password: err.fieldErrors.password })
        setNotice(err.message)
      } else {
        setNotice('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleForgot = () => {
    setNotice('Password reset needs the backend and is not available yet.')
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <aside className="login-visual">
          <img src="/images/login-coast.png" alt="" />
          <div className="login-visual-text">
            <div className="login-brand">
              <ShieldLogo />
              <span>SafeJourney</span>
            </div>
            <p className="login-tagline">Your Safety Companion While Traveling</p>
          </div>
        </aside>

        <section className="login-form-wrap">
          <h1>Welcome Back</h1>
          <p className="login-sub">Login to continue your journey</p>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="login-identifier">Email or Phone</label>
              <input
                id="login-identifier"
                type="text"
                autoComplete="username"
                placeholder="Enter your email or phone"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                aria-invalid={!!errors.identifier}
                aria-describedby={errors.identifier ? 'login-identifier-error' : undefined}
              />
              {errors.identifier && (
                <span className="field-error" id="login-identifier-error">{errors.identifier}</span>
              )}
            </div>

            <div className="field">
              <label htmlFor="login-password">Password</label>
              <div className="input-with-icon">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'login-password-error' : undefined}
                />
                <button
                  type="button"
                  className="icon-btn"
                  id="login-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
              {errors.password && (
                <span className="field-error" id="login-password-error">{errors.password}</span>
              )}
            </div>

            <div className="login-forgot">
              <button type="button" className="link-btn" id="login-forgot" onClick={handleForgot}>
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="btn btn-primary login-submit"
              id="login-submit"
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? 'Logging in…' : 'Login'}
            </button>

            {notice && <p className="login-notice" role="status">{notice}</p>}
          </form>

          <p className="login-switch">
            Don’t have an account? <Link to="/register" id="login-register-link">Register</Link>
          </p>
        </section>
      </div>
    </div>
  )
}
