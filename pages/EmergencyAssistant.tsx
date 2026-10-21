import { useState, useRef, useEffect, FormEvent } from 'react'
import { Link } from '../src/router'
import { useDestination } from '../src/context/DestinationContext'
import { sendAgentChatMessage, AgentChatResponse } from '../src/services/agentService'
import './EmergencyAssistant.css'

interface ChatMessage {
  id: string
  sender: 'assistant' | 'user'
  text: string
  timestamp: string
  disclaimer?: string
}

const INITIAL_GREETING: ChatMessage = {
  id: 'msg-welcome',
  sender: 'assistant',
  text: "Hello! I am your SafeJourney AI Safety Assistant. I'm here to provide travel safety advice, risk awareness, journey check-in guidance, and emergency recommendations. How can I help you stay safe today?",
  timestamp: 'Just now',
  disclaimer: 'AI safety guidance is informational. In real emergencies in India, dial 112.',
}

const QUICK_PROMPTS = [
  'What should I do in an emergency?',
  'Is it safe to walk around at night?',
  'Tips for safe public transportation',
  'How do I set up my journey check-in?',
]

export default function EmergencyAssistant() {
  const { selectedDestination } = useDestination()
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_GREETING])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorBanner, setErrorBanner] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  const handleSend = async (textToSend?: string) => {
    const rawText = textToSend !== undefined ? textToSend : input
    const trimmed = rawText.trim()
    if (!trimmed || loading) return

    if (trimmed.length > 2000) {
      setErrorBanner('Message exceeds maximum limit of 2000 characters.')
      return
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    if (textToSend === undefined) {
      setInput('')
    }
    setErrorBanner(null)
    setLoading(true)

    try {
      const resp: AgentChatResponse = await sendAgentChatMessage({
        message: trimmed,
        destination: selectedDestination ? `${selectedDestination.name}, ${selectedDestination.state}` : undefined,
        coordinates: selectedDestination ? `${selectedDestination.latitude}, ${selectedDestination.longitude}` : undefined,
      })

      const botMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: resp.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        disclaimer: resp.disclaimer,
      }
      setMessages((prev) => [...prev, botMsg])
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reach AI Safety Assistant.'
      setErrorBanner(msg)

      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: `⚠️ ${msg}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    handleSend()
  }

  const handleClearChat = () => {
    setMessages([INITIAL_GREETING])
    setErrorBanner(null)
  }

  return (
    <div className="assistant-container">
      {/* Top Header Card */}
      <header className="assistant-header-card">
        <div className="assistant-header-left">
          <div className="assistant-avatar-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="assistant-badge-icon">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <div>
            <div className="assistant-title-row">
              <h1 className="assistant-title">Agentic AI Safety Assistant</h1>
              <span className="assistant-status-tag">Phase 1 • Online</span>
            </div>
            <p className="assistant-subtitle">
              Intelligent travel safety advisor for tourist guidance, risk awareness, and emergency preparedness.
            </p>
          </div>
        </div>

        <div className="assistant-header-actions">
          {selectedDestination && (
            <div className="assistant-dest-pill" title="Active destination context">
              <span className="dest-pill-dot" />
              <span>{selectedDestination.name}, {selectedDestination.state}</span>
            </div>
          )}
          <Link to="/sos" className="assistant-sos-shortcut btn" id="assistant-emergency-sos-link">
            🚨 Emergency 112 / SOS
          </Link>
        </div>
      </header>

      {/* Prominent Mandatory Safety Advisory Banner */}
      <div className="assistant-advisory-banner" role="alert">
        <div className="advisory-icon">⚠️</div>
        <div className="advisory-text">
          <strong>Important Safety Notice:</strong> AI assessments are informational and not guaranteed predictions.
          In any real emergency or life-threatening situation in India, <strong>call 112 immediately</strong>.
          This assistant cannot contact police, dispatch ambulances, or track physical locations.
        </div>
      </div>

      {/* Backend Configuration Warning Banner (if GEMINI_API_KEY is not set) */}
      {errorBanner && (errorBanner.includes('GEMINI_API_KEY') || errorBanner.includes('LLM_API_KEY')) && (
        <div className="assistant-config-alert" role="alert">
          <div className="config-alert-icon">⚙️</div>
          <div>
            <strong>Google Gemini API Key Required:</strong>
            <p>
              The <code>GEMINI_API_KEY</code> environment variable is missing on the server.
              To enable live AI safety replies, configure <code>GEMINI_API_KEY</code> in your Windows PowerShell terminal:
            </p>
            <pre className="config-code-snippet">$env:GEMINI_API_KEY="your_gemini_api_key_here"</pre>
          </div>
        </div>
      )}

      {/* Backend Connection Warning Banner (if server cannot be reached) */}
      {errorBanner && !errorBanner.includes('GEMINI_API_KEY') && !errorBanner.includes('LLM_API_KEY') && (
        <div className="assistant-config-alert" role="alert" style={{ borderLeftColor: '#f59e0b' }}>
          <div className="config-alert-icon">🔌</div>
          <div>
            <strong>Backend Connection Notice:</strong>
            <p>{errorBanner}</p>
            <p style={{ marginTop: '4px', fontSize: '0.82rem' }}>
              Ensure the Spring Boot backend is running on <code>http://localhost:8080</code>:
            </p>
            <pre className="config-code-snippet">cd backend; .\mvnw.cmd spring-boot:run</pre>
          </div>
        </div>
      )}

      {/* Chat Display Area */}
      <div className="assistant-chat-window" aria-label="Chat messages">
        <div className="assistant-message-stream">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`assistant-chat-row assistant-chat-row--${msg.sender}`}
            >
              {msg.sender === 'assistant' && (
                <div className="assistant-row-avatar" aria-hidden="true">
                  🛡️
                </div>
              )}
              <div className={`assistant-bubble assistant-bubble--${msg.sender}`}>
                <div className="assistant-bubble-body">{msg.text}</div>
                <div className="assistant-bubble-footer">
                  <span className="assistant-bubble-time">{msg.timestamp}</span>
                  {msg.disclaimer && (
                    <span className="assistant-bubble-disclaimer">ℹ️ {msg.disclaimer}</span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="assistant-chat-row assistant-chat-row--assistant">
              <div className="assistant-row-avatar" aria-hidden="true">
                🛡️
              </div>
              <div className="assistant-bubble assistant-bubble--assistant assistant-bubble--loading">
                <div className="typing-indicator">
                  <span />
                  <span />
                  <span />
                </div>
                <span className="typing-label">Analyzing travel safety context…</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="assistant-chips-bar" aria-label="Suggested questions">
          <span className="chips-label">Quick Safety Inquiries:</span>
          <div className="chips-list">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                className="assistant-chip-btn"
                onClick={() => handleSend(prompt)}
                disabled={loading}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Input Bar */}
        <form onSubmit={handleSubmit} className="assistant-input-form" aria-label="Chat input">
          <div className="assistant-input-wrapper">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about travel safety, night precautions, route checks, or emergency steps..."
              className="assistant-text-input"
              maxLength={2000}
              disabled={loading}
              id="assistant-chat-input"
            />
            <span className="assistant-char-counter">
              {input.length}/2000
            </span>
          </div>

          <div className="assistant-form-buttons">
            <button
              type="button"
              onClick={handleClearChat}
              className="assistant-clear-btn btn"
              disabled={loading || messages.length <= 1}
              title="Reset conversation"
              id="assistant-clear-chat-btn"
            >
              Reset
            </button>
            <button
              type="submit"
              className="assistant-send-btn btn btn-primary"
              disabled={loading || !input.trim()}
              id="assistant-send-chat-btn"
            >
              {loading ? 'Sending…' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
