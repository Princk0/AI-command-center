/**
 * API client for the backend orchestrator.
 * Automatically falls back to mock data when backend is unreachable.
 */

import { MOCK_MODE, mockApi } from './mockData'

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const error = await res.text()
    throw new Error(`API error ${res.status}: ${error}`)
  }
  return res.json()
}

const realApi = {
  health: () => request('/health'),
  tools: () => request('/tools'),
  metrics: () => request('/metrics/current'),

  chat: (message, conversationId = 'default') =>
    request('/chat', {
      method: 'POST',
      body: JSON.stringify({ message, conversation_id: conversationId }),
    }),

  clearChat: (conversationId = 'default') =>
    request(`/chat/${conversationId}`, { method: 'DELETE' }),

  executeTool: (toolName, params = {}) =>
    request(`/tools/${toolName}`, {
      method: 'POST',
      body: JSON.stringify(params),
    }),
}

// Export mock or real API based on mode
export const api = MOCK_MODE ? mockApi : realApi

// Also export for manual switching
export { realApi, mockApi }
