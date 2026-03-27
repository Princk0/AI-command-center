import { useState, useEffect, useRef, useCallback } from 'react'
import { MOCK_MODE, generateMockMetrics } from '../utils/mockData'

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws'

/**
 * Hook for real-time data from the backend.
 * 
 * In MOCK_MODE: generates fake metrics every 5 seconds via setInterval.
 * In real mode: connects via WebSocket for live Pi metrics.
 */
export function useWebSocket() {
  const [metrics, setMetrics] = useState(null)
  const [metricsHistory, setMetricsHistory] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const [chatResponse, setChatResponse] = useState(null)
  const wsRef = useRef(null)
  const reconnectTimer = useRef(null)
  const mockTimer = useRef(null)

  const pushMetrics = useCallback((data) => {
    setMetrics(data)
    setMetricsHistory((prev) => {
      const updated = [...prev, { ...data, _receivedAt: Date.now() }]
      return updated.slice(-60) // Keep last 5 minutes at 5s intervals
    })
  }, [])

  // --- Mock mode: polling via setInterval ---
  useEffect(() => {
    if (!MOCK_MODE) return

    setIsConnected(true)

    // Generate initial data immediately
    pushMetrics(generateMockMetrics())

    // Then poll every 5 seconds
    mockTimer.current = setInterval(() => {
      pushMetrics(generateMockMetrics())
    }, 5000)

    return () => {
      clearInterval(mockTimer.current)
    }
  }, [pushMetrics])

  // --- Real mode: WebSocket ---
  const connect = useCallback(() => {
    if (MOCK_MODE) return

    try {
      const ws = new WebSocket(WS_URL)
      wsRef.current = ws

      ws.onopen = () => {
        setIsConnected(true)
        console.log('WebSocket connected')
      }

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data)

        if (msg.type === 'metrics') {
          pushMetrics(msg.data)
        }

        if (msg.type === 'chat_response') {
          setChatResponse(msg.data)
        }
      }

      ws.onclose = () => {
        setIsConnected(false)
        console.log('WebSocket disconnected, reconnecting in 3s...')
        reconnectTimer.current = setTimeout(connect, 3000)
      }

      ws.onerror = (err) => {
        console.error('WebSocket error:', err)
        ws.close()
      }
    } catch (err) {
      console.error('WebSocket connection failed:', err)
      reconnectTimer.current = setTimeout(connect, 3000)
    }
  }, [pushMetrics])

  useEffect(() => {
    if (!MOCK_MODE) {
      connect()
      return () => {
        clearTimeout(reconnectTimer.current)
        wsRef.current?.close()
      }
    }
  }, [connect])

  const sendChat = useCallback((message, conversationId = 'default') => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'chat',
          message,
          conversation_id: conversationId,
        })
      )
    }
  }, [])

  return { metrics, metricsHistory, isConnected, chatResponse, sendChat }
}
