/**
 * Shared authenticated API client with CSRF token handling.
 */

const API_BASE: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:8080'

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
  let message = 'Something went wrong. Please try again.'
  let fieldErrors: Record<string, string> = {}
  try {
    const body = (await res.json()) as { message?: string; fieldErrors?: Record<string, string> | null }
    if (body.message) message = body.message
    if (body.fieldErrors) fieldErrors = body.fieldErrors
  } catch {
    /* non-JSON body */
  }
  return new ApiError(message, res.status, fieldErrors)
}

export async function apiRequest(path: string, init: RequestInit = {}): Promise<Response> {
  try {
    return await fetch(`${API_BASE}${path}`, { ...init, credentials: 'include' })
  } catch {
    throw new ApiError(NETWORK_ERROR, 0)
  }
}

export async function getCsrfToken(): Promise<{ headerName: string; token: string }> {
  const res = await apiRequest('/api/auth/csrf')
  if (!res.ok) throw await parseError(res)
  return (await res.json()) as { headerName: string; token: string }
}

export async function getJson<T>(path: string): Promise<T> {
  const res = await apiRequest(path)
  if (!res.ok) throw await parseError(res)
  return (await res.json()) as T
}

export async function postJson<T>(path: string, body?: unknown): Promise<T> {
  const csrf = await getCsrfToken()
  const res = await apiRequest(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', [csrf.headerName]: csrf.token },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (!res.ok) throw await parseError(res)
  if (res.status === 204) return {} as T
  return (await res.json()) as T
}

export async function putJson<T>(path: string, body?: unknown): Promise<T> {
  const csrf = await getCsrfToken()
  const res = await apiRequest(path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', [csrf.headerName]: csrf.token },
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
