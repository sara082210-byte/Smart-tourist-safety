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
    let message = 'Unable to get response from AI Safety Assistant.'
    try {
      const errBody = (await res.json()) as { message?: string }
      if (errBody?.message) {
        message = errBody.message
      }
    } catch {
      // non-JSON response
    }
    throw new ApiError(message, res.status)
  }

  return (await res.json()) as AgentChatResponse
}
