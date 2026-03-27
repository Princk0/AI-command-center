import { useState, useEffect } from 'react'
import { Wrench, ChevronDown, ChevronRight, CheckCircle, XCircle, Clock, Zap } from 'lucide-react'

/**
 * ToolTrace — sidebar panel that visualizes Claude's tool calls.
 * 
 * Shows:
 * - Each tool Claude called (name, timestamp)
 * - Input parameters sent to the Pi
 * - Output/response from the Pi
 * - Success/failure status
 * - Expandable JSON viewer for full payloads
 * 
 * Listens for 'tool-calls' custom events dispatched by ChatPanel.
 */
export default function ToolTrace() {
  const [traces, setTraces] = useState([])

  // Listen for tool call events from ChatPanel
  useEffect(() => {
    const handler = (e) => {
      const newCalls = e.detail
      if (Array.isArray(newCalls) && newCalls.length > 0) {
        setTraces((prev) => [...newCalls.map(addId), ...prev].slice(0, 50))
      }
    }
    window.addEventListener('tool-calls', handler)
    return () => window.removeEventListener('tool-calls', handler)
  }, [])

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl flex flex-col h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-medium">Tool trace</span>
          {traces.length > 0 && (
            <span className="text-xs text-gray-500 font-mono">
              {traces.length} call{traces.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        {traces.length > 0 && (
          <button
            onClick={() => setTraces([])}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Trace list */}
      <div className="flex-1 overflow-y-auto">
        {traces.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-600 px-4">
            <Wrench className="w-8 h-8 mb-3 opacity-30" />
            <p className="text-sm text-center">
              Tool calls will appear here when Claude uses Pi tools.
            </p>
            <p className="text-xs text-center mt-1 text-gray-700">
              Try: "What's the CPU temperature?"
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {traces.map((trace) => (
              <TraceCard key={trace._id} trace={trace} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * TraceCard — a single tool call trace, expandable to show full payload.
 */
function TraceCard({ trace }) {
  const [expanded, setExpanded] = useState(false)
  const isSuccess = trace.success !== false
  const toolLabel = formatToolName(trace.tool)

  return (
    <div
      className={`rounded-lg border transition-colors ${
        isSuccess
          ? 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600/50'
          : 'bg-red-950/20 border-red-900/30 hover:border-red-800/40'
      }`}
    >
      {/* Summary row — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2.5 text-left"
      >
        {/* Expand/collapse icon */}
        {expanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
        )}

        {/* Status icon */}
        {isSuccess ? (
          <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
        ) : (
          <XCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
        )}

        {/* Tool name + info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-mono text-gray-200 truncate">{trace.tool}</p>
          <p className="text-xs text-gray-500">{toolLabel}</p>
        </div>

        {/* Timestamp */}
        {trace.timestamp && (
          <span className="text-xs text-gray-600 font-mono flex-shrink-0">
            {formatTime(trace.timestamp)}
          </span>
        )}
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-3 pb-3 space-y-2">
          {/* Input */}
          <div>
            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
              Input
            </p>
            <JsonBlock data={trace.input} />
          </div>

          {/* Output */}
          <div>
            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              {isSuccess ? 'Output' : 'Error'}
            </p>
            <JsonBlock data={isSuccess ? trace.output : trace.error} />
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * JsonBlock — renders a compact, syntax-highlighted JSON viewer.
 */
function JsonBlock({ data }) {
  if (data === undefined || data === null) {
    return <span className="text-xs text-gray-600 italic">No data</span>
  }

  const text = typeof data === 'string' ? data : JSON.stringify(data, null, 2)
  const lines = text.split('\n')
  const isLong = lines.length > 8
  const [showAll, setShowAll] = useState(false)

  const displayText = isLong && !showAll ? lines.slice(0, 8).join('\n') + '\n...' : text

  return (
    <div className="relative">
      <pre className="text-xs font-mono bg-gray-950 rounded-md p-2 overflow-x-auto text-gray-400 max-h-48 overflow-y-auto leading-relaxed">
        {displayText}
      </pre>
      {isLong && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-xs text-blue-400 hover:text-blue-300 mt-1 transition-colors"
        >
          {showAll ? 'Show less' : `Show all (${lines.length} lines)`}
        </button>
      )}
    </div>
  )
}

// --- Helpers ---

let _idCounter = 0
function addId(trace) {
  return { ...trace, _id: `trace-${Date.now()}-${_idCounter++}` }
}

function formatToolName(name) {
  const labels = {
    get_system_metrics: 'System metrics',
    manage_process: 'Process manager',
    control_gpio: 'GPIO control',
    scan_network: 'Network scanner',
    run_command: 'Shell command',
  }
  return labels[name] || name
}

function formatTime(isoString) {
  try {
    const d = new Date(isoString)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  } catch {
    return ''
  }
}
