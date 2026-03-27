import { useState, useEffect, useRef } from 'react'
import { Shield, Eye, EyeOff, Terminal, User } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'

/**
 * Compatible systems/technologies that float across the login background.
 * Each one is a real tech this app integrates with.
 */
const FLOATING_NAMES = [
  'Raspberry Pi', 'Claude', 'React', 'FastAPI', 'Ollama',
  'WebSocket', 'Tailwind CSS', 'Python', 'Node.js', 'LM Studio',
  'Docker', 'SSH', 'GPIO', 'psutil', 'Recharts',
  'Anthropic', 'Vite', 'SQLite', 'REST API', 'MCP',
  'Linux', 'ARM64', 'TypeScript', 'Uvicorn', 'httpx',
]

/**
 * NeonBackground — canvas-based floating neon orbs
 */
function NeonBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let animId
    let width = window.innerWidth
    let height = window.innerHeight
    canvas.width = width
    canvas.height = height

    const orbs = [
      { x: width * 0.2, y: height * 0.3, r: 200, color: [34, 197, 94], vx: 0.3, vy: 0.2, phase: 0 },
      { x: width * 0.8, y: height * 0.2, r: 250, color: [59, 130, 246], vx: -0.25, vy: 0.35, phase: 1 },
      { x: width * 0.5, y: height * 0.7, r: 180, color: [139, 92, 246], vx: 0.35, vy: -0.2, phase: 2 },
      { x: width * 0.15, y: height * 0.8, r: 160, color: [6, 182, 212], vx: 0.2, vy: -0.3, phase: 3 },
      { x: width * 0.85, y: height * 0.6, r: 220, color: [236, 72, 153], vx: -0.3, vy: -0.15, phase: 4 },
      { x: width * 0.5, y: height * 0.15, r: 140, color: [245, 158, 11], vx: 0.15, vy: 0.25, phase: 5 },
    ]

    let time = 0

    function draw() {
      ctx.clearRect(0, 0, width, height)
      time += 0.003

      for (const orb of orbs) {
        orb.x += orb.vx
        orb.y += orb.vy
        if (orb.x < -orb.r) orb.x = width + orb.r
        if (orb.x > width + orb.r) orb.x = -orb.r
        if (orb.y < -orb.r) orb.y = height + orb.r
        if (orb.y > height + orb.r) orb.y = -orb.r

        const pulse = 0.12 + Math.sin(time * 2 + orb.phase) * 0.06
        const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r)
        const [r, g, b] = orb.color
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${pulse + 0.05})`)
        gradient.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, ${pulse * 0.6})`)
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2)
        ctx.fill()
      }

      animId = requestAnimationFrame(draw)
    }

    draw()

    const handleResize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}

/**
 * FloatingNames — tech/system names that drift across the background.
 * Each name gets a random position, speed, size, and opacity.
 */
function FloatingNames() {
  const [names] = useState(() =>
    FLOATING_NAMES.map((name, i) => ({
      id: i,
      text: name,
      x: Math.random() * 100,
      y: Math.random() * 100,
      speed: 8 + Math.random() * 20,
      size: 11 + Math.random() * 8,
      opacity: 0.06 + Math.random() * 0.12,
      delay: Math.random() * -30,
    }))
  )

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 2 }}>
      {names.map((n) => (
        <span
          key={n.id}
          className="absolute whitespace-nowrap font-mono select-none"
          style={{
            left: `${n.x}%`,
            top: `${n.y}%`,
            fontSize: `${n.size}px`,
            opacity: n.opacity,
            color: '#ffffff',
            animation: `floatName ${n.speed}s linear infinite`,
            animationDelay: `${n.delay}s`,
          }}
        >
          {n.text}
        </span>
      ))}

      <style>{`
        @keyframes floatName {
          0% {
            transform: translateX(0) translateY(0);
            opacity: 0;
          }
          10% {
            opacity: var(--float-opacity, 0.1);
          }
          90% {
            opacity: var(--float-opacity, 0.1);
          }
          100% {
            transform: translateX(-120px) translateY(-60px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

/**
 * Grid overlay — subtle tech grid
 */
function GridOverlay() {
  return (
    <div
      className="fixed inset-0 pointer-events-none opacity-[0.03]"
      style={{
        zIndex: 1,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }}
    />
  )
}

export default function LoginPage() {
  const { login, loginAsGuest } = useAuth()
  const { resolved } = useTheme()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!username.trim()) return setError('Username required')
    setError('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 400))
    const result = login(username, password)
    setLoading(false)
    if (!result.success) setError(result.error)
  }

  const handleGuest = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 300))
    loginAsGuest()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-gray-950">
      {/* Layers: neon orbs → grid → floating names → card */}
      <NeonBackground />
      <GridOverlay />
      <FloatingNames />

      {/* Login card */}
      <div className="w-full max-w-sm relative" style={{ zIndex: 10 }}>
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-green-500/15 backdrop-blur-sm border border-green-500/20">
            <Terminal className="w-7 h-7 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            RUTZ
          </h1>
          <p className="text-sm mt-1 text-gray-500">
            V 0.0.0 - For demo purposes only
          </p>
        </div>

        {/* Glass card */}
        <div className="rounded-xl p-6 bg-gray-900/70 backdrop-blur-xl border border-gray-700/50 shadow-2xl shadow-black/50">
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-400">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={e => { setUsername(e.target.value); setError('') }}
                placeholder="admin"
                autoComplete="username"
                className="w-full px-3 py-2.5 text-sm rounded-lg outline-none transition-all
                  bg-gray-800/60 border border-gray-700/60 text-gray-200 placeholder-gray-600
                  focus:border-green-500/50 focus:bg-gray-800/80 focus:ring-1 focus:ring-green-500/20"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-400">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  placeholder="••••••"
                  autoComplete="current-password"
                  className="w-full px-3 py-2.5 pr-10 text-sm rounded-lg outline-none transition-all
                    bg-gray-800/60 border border-gray-700/60 text-gray-200 placeholder-gray-600
                    focus:border-green-500/50 focus:bg-gray-800/80 focus:ring-1 focus:ring-green-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                {error}
              </p>
            )}

            {/* Sign in */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 text-sm font-medium rounded-lg transition-all
                bg-green-600 hover:bg-green-500 text-white
                hover:shadow-lg hover:shadow-green-500/25
                ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Signing in...' : 'Sign in as Client'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700/50" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 text-xs bg-gray-900/70 text-gray-600">or</span>
            </div>
          </div>

          {/* Guest */}
          <button
            onClick={handleGuest}
            disabled={loading}
            className={`w-full py-2.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2
              bg-gray-800/60 border border-gray-700/50 text-gray-300
              hover:bg-gray-700/60 hover:border-gray-600/60
              ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <User className="w-4 h-4" />
            Continue as Guest
          </button>

          {/* Role info */}
          <div className="mt-4 text-xs space-y-1 text-gray-600">
            <p className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              Client: full access — chat, tools, GPIO control
            </p>
            <p className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-600 inline-block" />
              Guest: read-only dashboard, no tool execution
            </p>
          </div>
        </div>

        {/* Demo hint */}
        <p className="text-center text-xs mt-4 text-gray-700">
          Demo: admin / admin123
        </p>
      </div>
    </div>
  )
}
