/**
 * Shared authenticated API client with CSRF token handling.
 */

function normalizeBase(url: string | undefined): string {
  if (!url) return ''
  let cleaned = url.trim().replace(/\/+$/, '')
  // Prevent duplicate /api prefixes if user entered https://backend.onrender.com/api in Vercel
  cleaned = cleaned.replace(/\/api\/v1$/, '').replace(/\/api$/, '')
  return cleaned
}

const DEFAULT_BASE = 'https://smart-tourist-safety-heqa.onrender.com'
export function getApiBase(): string {
  const envUrl = normalizeBase(import.meta.env.VITE_API_BASE_URL as string | undefined)
  if (envUrl) return envUrl
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return ''
  }
  return DEFAULT_BASE
}

export class ApiError extends Error {
  readonly status: number
  readonly fieldErrors: Record<string, string>

  constructor(message: string, status: number, fieldErrors: Record<string, string> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

const NETWORK_ERROR = 'Cannot reach the server. Please check your connection and try again.'

async function parseError(res: Response): Promise<ApiError> {
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
        message = 'Server endpoint not found (404). Please verify your backend URL.'
      } else if (res.status === 502 || res.status === 503) {
        message = 'Backend server is starting up on Render (cold start). Please retry in 30 seconds.'
      } else if (res.status === 403) {
        message = 'Session expired or request rejected (403). Please refresh the page and try again.'
      }
    }
  } catch {
    /* non-readable */
  }
  return new ApiError(message, res.status, fieldErrors)
}

export async function apiRequest(path: string, init: RequestInit = {}): Promise<Response> {
  try {
    return await fetch(`${getApiBase()}${path}`, { ...init, credentials: 'include' })
  } catch {
    throw new ApiError(NETWORK_ERROR, 0)
  }
}

export async function getCsrfToken(): Promise<{ headerName: string; token: string } | null> {
  try {
    const res = await apiRequest('/api/auth/csrf')
    if (res.ok) {
      return (await res.json()) as { headerName: string; token: string }
    }
  } catch {
    /* ignore */
  }
  return null
}

export async function getJson<T>(path: string): Promise<T> {
  const res = await apiRequest(path)
  if (!res.ok) throw await parseError(res)
  return (await res.json()) as T
}

export async function postJson<T>(path: string, body?: unknown): Promise<T> {
  const csrf = await getCsrfToken()
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (csrf) {
    headers[csrf.headerName] = csrf.token
  }
  const res = await apiRequest(path, {
    method: 'POST',
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (!res.ok) throw await parseError(res)
  if (res.status === 204) return {} as T
  return (await res.json()) as T
}

export async function putJson<T>(path: string, body?: unknown): Promise<T> {
  const csrf = await getCsrfToken()
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (csrf) {
    headers[csrf.headerName] = csrf.token
  }
  const res = await apiRequest(path, {
    method: 'PUT',
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (!res.ok) throw await parseError(res)
  return (await res.json()) as T
}

export async function deleteJson(path: string): Promise<void> {
  const csrf = await getCsrfToken()
  const res = await apiRequest(path, {
    method: 'DELETE',
    headers: { [csrf.headerName]: csrf.token },
  })
  if (!res.ok) throw await parseError(res)
}
