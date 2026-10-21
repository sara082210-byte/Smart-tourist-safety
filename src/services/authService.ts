/**
 * Authentication API client (session-cookie based).
 *
 * - The session lives in an HttpOnly JSESSIONID cookie set by the backend; JS never sees it.
 * - Every state-changing request first fetches a fresh CSRF token and sends it as X-XSRF-TOKEN.
 * - No tokens or passwords are stored in localStorage/sessionStorage.
 */

const rawBase = ((import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '').trim()
const API_BASE: string = rawBase.replace(/\/+$/, '')

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
  let message = 'Something went wrong. Please try again.'
  let fieldErrors: Record<string, string> = {}
  try {
    const body = (await res.json()) as { message?: string; fieldErrors?: Record<string, string> | null }
    if (body.message) message = body.message
    if (body.fieldErrors) fieldErrors = body.fieldErrors
  } catch {
    /* non-JSON body: keep the generic message */
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
