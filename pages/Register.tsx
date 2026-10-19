import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, navigate } from '../src/router'
import { AuthError, register } from '../src/services/authService'
import { EyeIcon, ShieldLogo } from './Login'
import './Login.css' // shared card / field / button styles
import './Register.css'

type Form = {
  fullName: string
  email: string
  phone: string
  password: string
  confirm: string
  agree: boolean
}
type Errors = Partial<Record<keyof Form, string>>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^\+?[0-9\s-]{7,15}$/

const emptyForm: Form = { fullName: '', email: '', phone: '', password: '', confirm: '', agree: false }

function validate(f: Form): Errors {
  const e: Errors = {}
  if (!f.fullName.trim()) e.fullName = 'Please enter your full name.'

  if (!f.email.trim()) e.email = 'Please enter your email address.'
  else if (!EMAIL_RE.test(f.email.trim())) e.email = 'Enter a valid email address.'

  if (!f.phone.trim()) e.phone = 'Please enter your phone number.'
  else if (!PHONE_RE.test(f.phone.trim())) e.phone = 'Enter a valid phone number.'

  if (!f.password) e.password = 'Please create a password.'
  else if (f.password.length < 8) e.password = 'Password must be at least 8 characters.'
  else if (!/[A-Za-z]/.test(f.password) || !/[0-9]/.test(f.password))
    e.password = 'Use at least one letter and one number.'

  if (!f.confirm) e.confirm = 'Please confirm your password.'
  else if (f.confirm !== f.password) e.confirm = 'Passwords do not match.'

  if (!f.agree) e.agree = 'You must agree to the Terms of Service and Privacy Policy.'
  return e
}

export default function Register() {
  const [form, setForm] = useState<Form>(emptyForm)
  const [errors, setErrors] = useState<Errors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)

  const update = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (loading) return
    const found = validate(form)
    setErrors(found)
    setNotice('')
    if (Object.keys(found).length > 0) return

    setLoading(true)
    try {
      await register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      })
      setForm(emptyForm)
      setNotice('Account created successfully! Redirecting to login…')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setForm((prev) => ({ ...prev, password: '', confirm: '' }))
      if (err instanceof AuthError) {
        const fe = err.fieldErrors
        setErrors({ fullName: fe.fullName, email: fe.email, phone: fe.phone, password: fe.password })
        setNotice(err.message)
      } else {
        setNotice('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Small helper so every text field looks and behaves the same
  const field = (
    key: 'fullName' | 'email' | 'phone',
    label: string,
    type: string,
    placeholder: string,
    autoComplete: string,
  ) => (
    <div className="field">
      <label htmlFor={`reg-${key}`}>{label}</label>
      <input
        id={`reg-${key}`}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={form[key]}
        onChange={(e) => update(key, e.target.value)}
        aria-invalid={!!errors[key]}
      />
      {errors[key] && <span className="field-error">{errors[key]}</span>}
    </div>
  )

  const passwordField = (
    key: 'password' | 'confirm',
    label: string,
    placeholder: string,
    shown: boolean,
    toggle: () => void,
  ) => (
    <div className="field">
      <label htmlFor={`reg-${key}`}>{label}</label>
      <div className="input-with-icon">
        <input
          id={`reg-${key}`}
          type={shown ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder={placeholder}
          value={form[key]}
          onChange={(e) => update(key, e.target.value)}
          aria-invalid={!!errors[key]}
        />
        <button
          type="button"
          className="icon-btn"
          id={`reg-toggle-${key}`}
          onClick={toggle}
          aria-label={shown ? 'Hide password' : 'Show password'}
        >
          <EyeIcon open={shown} />
        </button>
      </div>
      {errors[key] && <span className="field-error">{errors[key]}</span>}
    </div>
  )

  return (
    <div className="login-page">
      <div className="login-card register-card">
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

        <section className="login-form-wrap register-form-wrap">
          <h1>Create an Account</h1>
          <p className="login-sub">Register to start your journey with us</p>

          <form className="login-form register-form" onSubmit={handleSubmit} noValidate>
            {field('fullName', 'Full Name', 'text', 'Enter your full name', 'name')}
            {field('email', 'Email Address', 'email', 'Enter your email address', 'email')}
            {field('phone', 'Phone Number', 'tel', 'Enter your phone number', 'tel')}
            {passwordField('password', 'Password', 'Create a strong password', showPassword, () => setShowPassword(!showPassword))}
            {passwordField('confirm', 'Confirm Password', 'Confirm your password', showConfirm, () => setShowConfirm(!showConfirm))}

            <div className="register-terms">
              <label htmlFor="reg-agree">
                <input
                  id="reg-agree"
                  type="checkbox"
                  checked={form.agree}
                  onChange={(e) => update('agree', e.target.checked)}
                />
                <span>I agree to the Terms of Service and Privacy Policy</span>
              </label>
              {errors.agree && <span className="field-error">{errors.agree}</span>}
            </div>

            <button
              type="submit"
              className="btn btn-primary login-submit"
              id="reg-submit"
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? 'Creating account…' : 'Register'}
            </button>

            {notice && <p className="login-notice" role="status">{notice}</p>}
          </form>

          <p className="login-switch">
            Already have an account? <Link to="/login" id="reg-login-link">Login</Link>
          </p>
        </section>
      </div>
    </div>
  )
}
