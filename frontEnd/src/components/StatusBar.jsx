import { Wifi, WifiOff, Circle } from 'lucide-react'

/**
 * StatusBar — lives in the header. Shows:
 * - WebSocket connection state (green dot = live, red = disconnected)
 * - Pi agent status (online/offline pill)
 * - Current CPU temp as a quick glance metric
 * - Last updated timestamp
 */
export default function StatusBar({ isConnected, metrics }) {
  const temp = metrics?.temperature?.sensors
    ? Object.values(metrics.temperature.sensors)[0]
    : metrics?.temperature?.cpu_celsius ?? null

  const cpuPercent = metrics?.cpu?.percent ?? null

  return (
    <div className="flex items-center gap-3">
      {/* Quick stats (visible when connected) */}
      {metrics && (
        <div className="hidden sm:flex items-center gap-3 mr-2">
          {cpuPercent !== null && (
            <span className="text-xs text-gray-400 font-mono">
              CPU {Math.round(cpuPercent)}%
            </span>
          )}
          {temp !== null && (
            <span className="text-xs text-gray-400 font-mono">
              {temp.toFixed(1)}°C
            </span>
          )}
        </div>
      )}

      {/* Pi agent status pill */}
      <div
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
          isConnected
            ? 'bg-green-500/10 text-green-400 border-green-500/20'
            : 'bg-red-500/10 text-red-400 border-red-500/20'
        }`}
      >
        {isConnected ? (
          <Wifi className="w-3 h-3" />
        ) : (
          <WifiOff className="w-3 h-3" />
        )}
        {isConnected ? 'Live' : 'Offline'}
      </div>

      {/* Live indicator dot */}
      {isConnected && (
        <Circle className="w-2 h-2 fill-green-400 text-green-400 animate-pulse-dot" />
      )}
    </div>
  )
}
