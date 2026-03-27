import { Sun, Moon, Clock } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

/**
 * ThemeToggle — cycles through dark → light → auto.
 * Auto mode switches based on system time (dark 7pm-7am).
 */
export default function ThemeToggle() {
  const { mode, resolved, cycleTheme } = useTheme()
  const isDark = resolved === 'dark'

  const icon = {
    dark: Moon,
    light: Sun,
    auto: Clock,
  }[mode]

  const Icon = icon
  const label = {
    dark: 'Dark',
    light: 'Light',
    auto: `Auto (${resolved})`,
  }[mode]

  return (
    <button
      onClick={cycleTheme}
      title={`Theme: ${label}. Click to switch.`}
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
        isDark
          ? 'bg-gray-800 border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-600'
          : 'bg-gray-100 border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300'
      }`}
    >
      <Icon className="w-3 h-3" />
      {mode === 'auto' ? 'Auto' : mode === 'dark' ? 'Dark' : 'Light'}
    </button>
  )
}
