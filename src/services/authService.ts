/**
 * Authentication API client (session-cookie based).
 *
 * - The session lives in an HttpOnly JSESSIONID cookie set by the backend; JS never sees it.
 * - Every state-changing request first fetches a fresh CSRF token and sends it as X-XSRF-TOKEN.
 * - No tokens or passwords are stored in localStorage/sessionStorage.
 */

function normalizeBase(url: string | undefined): string {
  if (!url) return ''
  let cleaned = url.trim().replace(/\/+$/, '')
  cleaned = cleaned.replace(/\/api\/v1$/, '').replace(/\/api$/, '')
  return cleaned
}

const API_BASE: string = normalizeBase(import.meta.env.VITE_API_BASE_URL as string | undefined)

export type User = {
  id: number
  fullName: string
  email: string
  phone: string
}

export type RegisterPayload = {
  fullName: string
  email: string
  phone: string
  password: string
}

export type LoginPayload = {
  /** Email address or phone number */
  identifier: string
  password: string
}

/** Error with a user-safe message and optional per-field messages from the server. */
export class AuthError extends Error {
  readonly status: number
  readonly fieldErrors: Record<string, string>

  constructor(message: string, status: number, fieldErrors: Record<string, string> = {}) {
    super(message)
    this.name = 'AuthError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

const NETWORK_ERROR = 'Cannot reach the server. Please check your connection and try again.'

async function parseError(res: Response): Promise<AuthError> {
  let message = `Server error (${res.status}). Please try again.`
  let fieldErrors: Record<string, string> = {}
  try {
    const text = await res.text()
    try {
      const body = JSON.parse(text) as {
        message?: string
        error?: string
        path?: string
        fieldErrors?: Record<string, string> | null
      }
      if (body.message) message = body.message
      else if (body.error && body.path) message = `${body.error} (${body.path})`
      else if (body.error) message = body.error
      if (body.fieldErrors) fieldErrors = body.fieldErrors
    } catch {
      if (res.status === 404) {
        message = 'Authentication endpoint not found (404). Please verify your backend URL.'
      } else if (res.status === 502 || res.status === 503) {
        message = 'Backend server is starting up on Render (cold start). Please retry in 30 seconds.'
      } else if (res.status === 403) {
        message = 'Session expired or request rejected (403). Please refresh and try again.'
      } else if (res.status === 401) {
        message = 'Invalid email/phone or password. If you haven\'t registered on this deployment yet, please create an account.'
      }
    }
  } catch {
    /* non-readable */
  }
  return new AuthError(message, res.status, fieldErrors)
}

async function request(path: string, init: RequestInit = {}): Promise<Response> {
  try {
    return await fetch(`${API_BASE}${path}`, { ...init, credentials: 'include' })
  } catch {
    throw new AuthError(NETWORK_ERROR, 0)
  }
}

async function getCsrfToken(): Promise<{ headerName: string; token: string }> {
  const res = await request('/api/auth/csrf')
  if (!res.ok) throw await parseError(res)
  return (await res.json()) as { headerName: string; token: string }
}

async function postJson(path: string, body?: unknown): Promise<Response> {
  const csrf = await getCsrfToken()
  const res = await request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', [csrf.headerName]: csrf.token },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (!res.ok) throw await parseError(res)
  return res
}

export async function register(payload: RegisterPayload): Promise<User> {
  const res = await postJson('/api/auth/register', payload)
  return (await res.json()) as User
}

export async function login(payload: LoginPayload): Promise<User> {
  const res = await postJson('/api/auth/login', payload)
  return (await res.json()) as User
}

export async function logout(): Promise<void> {
  await postJson('/api/auth/logout')
}

/** Returns the logged-in user, or null if the session is not authenticated. */
export async function getCurrentUser(): Promise<User | null> {
  const res = await request('/api/auth/me')
  if (res.status === 401) return null
  if (!res.ok) throw await parseError(res)
  return (await res.json()) as User
}
