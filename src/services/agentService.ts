/**
 * Agentic AI Safety Assistant API service.
 * Communicates with backend POST /api/v1/agent/chat.
 */
import { apiRequest, ApiError } from './apiClient'

export interface AgentChatRequest {
  message: string
  destination?: string
  coordinates?: string
  language?: string
}

export interface AgentChatResponse {
  reply: string
  status: string
  disclaimer: string
  timestamp: string
}

export async function sendAgentChatMessage(request: AgentChatRequest): Promise<AgentChatResponse> {
  const res = await apiRequest('/api/v1/agent/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })

  if (!res.ok) {
    let message = `Unable to get response from AI Safety Assistant (${res.status}).`
    try {
      const text = await res.text()
      try {
        const errBody = JSON.parse(text) as { message?: string; error?: string; path?: string }
        if (errBody?.message) {
          message = errBody.message
        } else if (errBody?.error && errBody?.path) {
          message = `${errBody.error} (${errBody.path})`
        } else if (errBody?.error) {
          message = errBody.error
        }
      } catch {
        if (res.status === 404) {
          message = 'AI Safety Assistant endpoint not found (404). Please verify backend deployment.'
        } else if (res.status === 502 || res.status === 503) {
          message = 'Backend server is starting up on Render (cold start). Please retry in 30 seconds.'
        }
      }
    } catch {
      // non-readable
    }
    throw new ApiError(message, res.status)
  }

  return (await res.json()) as AgentChatResponse
}
