import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2, Trash2 } from 'lucide-react'
import { api } from '../utils/api'

export default function ChatPanel() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hey! I\'m your AI command center agent. I can monitor your Pi, manage processes, control GPIO pins, scan your network, and more. Try asking me something like "How\'s the Pi doing?" or "What\'s eating all the memory?"',
      toolCalls: [],
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || isLoading) return

    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: text, toolCalls: [] }])
    setIsLoading(true)

    try {
      const result = await api.chat(text)
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: result.response,
          toolCalls: result.tool_calls || [],
        },
      ])
      
      // Broadcast tool calls for the ToolTrace panel
      if (result.tool_calls?.length) {
        window.dispatchEvent(
          new CustomEvent('tool-calls', { detail: result.tool_calls })
        )
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `Error: ${err.message}. Make sure the backend and Pi agent are running.`,
          toolCalls: [],
        },
      ])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const clearChat = async () => {
    try {
      await api.clearChat()
    } catch {}
    setMessages([{
      role: 'assistant',
      content: 'Chat cleared. What would you like to know about your Pi?',
      toolCalls: [],
    }])
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl flex flex-col h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-green-400" />
          <span className="text-sm font-medium">Claude Agent</span>
          <span className="text-xs text-gray-500 font-mono">tool-use</span>
        </div>
        <button
          onClick={clearChat}
          className="p-1.5 text-gray-500 hover:text-gray-300 transition-colors"
          title="Clear chat"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <Bot className="w-3.5 h-3.5 text-green-400" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-200'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              {msg.toolCalls?.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-700">
                  <p className="text-xs text-gray-400">
                    Used {msg.toolCalls.length} tool{msg.toolCalls.length > 1 ? 's' : ''}:{' '}
                    {msg.toolCalls.map(tc => tc.tool).join(', ')}
                  </p>
                </div>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <User className="w-3.5 h-3.5 text-blue-400" />
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-green-400" />
            </div>
            <div className="bg-gray-800 rounded-xl px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />
              <span className="text-sm text-gray-400">Thinking & calling tools...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-800">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about your Pi... (e.g., 'Check CPU temperature')"
            disabled={isLoading}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm
                       text-gray-200 placeholder-gray-500 outline-none
                       focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20
                       disabled:opacity-50 transition-colors"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="px-4 py-2.5 bg-green-600 hover:bg-green-500 disabled:bg-gray-700
                       rounded-lg transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        
        {/* Quick actions */}
        <div className="flex gap-2 mt-2 overflow-x-auto">
          {[
            'How is the Pi doing?',
            'Top processes by memory',
            'Scan my network',
            'Show disk usage',
          ].map(q => (
            <button
              key={q}
              onClick={() => { setInput(q); inputRef.current?.focus() }}
              className="text-xs px-3 py-1.5 bg-gray-800 border border-gray-700
                         rounded-full text-gray-400 hover:text-gray-200
                         hover:border-gray-600 transition-colors whitespace-nowrap"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
