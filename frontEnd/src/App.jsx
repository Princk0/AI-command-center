import { useState } from 'react'
import { Activity, MessageSquare, Cpu, HardDrive, Thermometer, LogOut, Lock } from 'lucide-react'

import { ThemeProvider } from './hooks/useTheme'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { useTheme } from './hooks/useTheme'
import { useWebSocket } from './hooks/useWebSocket'

import LoginPage from './components/LoginPage'
import StatusBar from './components/StatusBar'
import ThemeToggle from './components/ThemeToggle'
import MetricCard from './components/MetricCard'
import MetricsChart from './components/MetricsChart'
import ChatPanel from './components/ChatPanel'
import ToolTrace from './components/ToolTrace'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthGate />
      </AuthProvider>
    </ThemeProvider>
  )
}

/** Show login if not authenticated, dashboard if authenticated */
function AuthGate() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Dashboard /> : <LoginPage />
}

/** Main dashboard — role-aware */
function Dashboard() {
  const { metrics, metricsHistory, isConnected } = useWebSocket()
  const { user, logout, isGuest } = useAuth()
  const { resolved } = useTheme()
  const [activeTab, setActiveTab] = useState('dashboard')
  const isDark = resolved === 'dark'

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-10 backdrop-blur-sm border-b ${
        isDark
          ? 'bg-gray-950/80 border-gray-800'
          : 'bg-white/80 border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isDark ? 'bg-green-500/20' : 'bg-green-500/10'
            }`}>
              <Activity className={`w-4 h-4 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
            </div>
            <div>
              <h1 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                RUTZ
              </h1>
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                {user.name}
                {isGuest && (
                  <span className={`ml-1.5 px-1.5 py-0.5 rounded text-[10px] ${
                    isDark ? 'bg-gray-800 text-gray-500' : 'bg-gray-100 text-gray-500'
                  }`}>
                    read-only
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <StatusBar isConnected={isConnected} metrics={metrics} />
            <ThemeToggle />
            <button
              onClick={logout}
              title="Sign out"
              className={`p-1.5 rounded-lg transition-colors ${
                isDark
                  ? 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 flex gap-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Cpu },
            { id: 'chat', label: 'AI Agent', icon: MessageSquare, clientOnly: true },
          ].map(tab => {
            const disabled = tab.clientOnly && isGuest
            return (
              <button
                key={tab.id}
                onClick={() => !disabled && setActiveTab(tab.id)}
                disabled={disabled}
                className={`flex items-center gap-2 px-4 py-2 text-sm rounded-t-lg transition-colors ${
                  disabled
                    ? `${isDark ? 'text-gray-700' : 'text-gray-300'} cursor-not-allowed`
                    : activeTab === tab.id
                      ? isDark
                        ? 'bg-gray-900 text-white border-t border-x border-gray-700'
                        : 'bg-white text-gray-900 border-t border-x border-gray-200'
                      : isDark
                        ? 'text-gray-400 hover:text-gray-200'
                        : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {disabled && <Lock className="w-3 h-3 ml-1" />}
              </button>
            )
          })}
        </div>
      </header>

      {/* Body */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView metrics={metrics} metricsHistory={metricsHistory} />
        )}
        {activeTab === 'chat' && !isGuest && <ChatView />}
        {activeTab === 'chat' && isGuest && <GuestBlock />}
      </main>
    </div>
  )
}

/** Guest users see this instead of the chat */
function GuestBlock() {
  const { resolved } = useTheme()
  const isDark = resolved === 'dark'

  return (
    <div className={`text-center py-20 rounded-xl border ${
      isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
    }`}>
      <Lock className={`w-10 h-10 mx-auto mb-4 ${isDark ? 'text-gray-700' : 'text-gray-300'}`} />
      <p className={`font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        Client access required
      </p>
      <p className={`text-sm mt-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
        Sign in with client credentials to use the AI agent and execute tools.
      </p>
    </div>
  )
}

/** Metrics dashboard — available to all roles */
function DashboardView({ metrics, metricsHistory }) {
  const { resolved } = useTheme()
  const isDark = resolved === 'dark'

  if (!metrics) {
    return (
      <div className={`text-center py-20 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
        <Cpu className="w-12 h-12 mx-auto mb-4 opacity-30" />
        <p>Waiting for Pi metrics...</p>
        <p className="text-sm mt-1">Make sure the Pi agent and backend are running.</p>
      </div>
    )
  }

  const cpu = metrics.cpu || {}
  const memory = metrics.memory || {}
  const disk = metrics.disk || {}
  const temp = metrics.temperature || {}

  const tempValue = temp.sensors
    ? Object.values(temp.sensors)[0]
    : temp.cpu_celsius
  const tempLabel = temp.sensors
    ? Object.keys(temp.sensors)[0]
    : 'cpu_thermal'
  const cpuCores = cpu.count_logical || cpu.count || '?'

  const sysInfo = metrics.system || metrics.platform || {}
  const hostname = sysInfo.hostname || sysInfo.node || '—'
  const osName = sysInfo.os || sysInfo.system || '—'
  const arch = sysInfo.architecture || sysInfo.machine || '—'
  const uptime = metrics.system?.uptime_hours
    ? `${metrics.system.uptime_hours}h`
    : metrics.uptime?.uptime_seconds
      ? `${Math.round(metrics.uptime.uptime_seconds / 3600)}h`
      : '—'

  const cardClass = isDark
    ? 'bg-gray-900 border border-gray-800'
    : 'bg-white border border-gray-200'

  return (
    <div className="space-y-6">
      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard icon={Cpu} label="CPU Usage"
          value={`${cpu.percent || 0}%`}
          detail={`${cpuCores} cores · ${cpu.frequency_mhz ? Math.round(cpu.frequency_mhz) + ' MHz' : ''}`}
          color="blue" percent={cpu.percent} />
        <MetricCard icon={HardDrive} label="Memory"
          value={`${memory.percent || 0}%`}
          detail={`${memory.used_mb || 0} / ${memory.total_mb || 0} MB`}
          color="purple" percent={memory.percent} />
        <MetricCard icon={HardDrive} label="Disk"
          value={`${disk.percent || 0}%`}
          detail={`${disk.used_gb || 0} / ${disk.total_gb || 0} GB`}
          color="amber" percent={disk.percent} />
        <MetricCard icon={Thermometer} label="Temperature"
          value={`${tempValue?.toFixed(1) || '—'}°C`}
          detail={tempLabel || 'No sensor'}
          color="red" percent={Math.min(100, ((tempValue || 0) / 85) * 100)} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricsChart title="CPU Usage" data={metricsHistory}
          dataKey="cpu.percent" color="#3b82f6" unit="%" />
        <MetricsChart title="Memory Usage" data={metricsHistory}
          dataKey="memory.percent" color="#8b5cf6" unit="%" />
      </div>

      {/* System info */}
      {(metrics.system || metrics.platform) && (
        <div className={`rounded-xl p-4 ${cardClass}`}>
          <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            System Info
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {[
              ['Hostname', hostname],
              ['OS', osName],
              ['Architecture', arch],
              ['Uptime', uptime],
            ].map(([label, val]) => (
              <div key={label}>
                <p className={isDark ? 'text-gray-500' : 'text-gray-400'}>{label}</p>
                <p className={`font-mono ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{val}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/** Chat + tool trace — client only */
function ChatView() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[600px]">
      <div className="lg:col-span-2"><ChatPanel /></div>
      <div><ToolTrace /></div>
    </div>
  )
}
