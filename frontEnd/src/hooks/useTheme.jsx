import { createContext, useContext, useState, useEffect, useCallback } from 'react'

/**
 * Theme modes:
 * - 'dark'   — forced dark
 * - 'light'  — forced light
 * - 'auto'   — switches based on system time (dark 7pm-7am, light otherwise)
 */

const ThemeContext = createContext()

function getAutoTheme() {
  const hour = new Date().getHours()
  return (hour >= 19 || hour < 7) ? 'dark' : 'light'
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem('theme-mode')
    return saved || 'auto'
  })

  const [resolved, setResolved] = useState(() => {
    const saved = localStorage.getItem('theme-mode')
    if (saved === 'dark' || saved === 'light') return saved
    return getAutoTheme()
  })

  // Resolve auto mode and set up timer
  useEffect(() => {
    if (mode === 'auto') {
      setResolved(getAutoTheme())
      // Check every minute for time-based switches
      const interval = setInterval(() => {
        setResolved(getAutoTheme())
      }, 60000)
      return () => clearInterval(interval)
    } else {
      setResolved(mode)
    }
  }, [mode])

  // Apply to document
  useEffect(() => {
    const root = document.documentElement
    if (resolved === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.add('light')
      root.classList.remove('dark')
    }
  }, [resolved])

  const setTheme = useCallback((newMode) => {
    setMode(newMode)
    localStorage.setItem('theme-mode', newMode)
  }, [])

  const cycleTheme = useCallback(() => {
    const order = ['dark', 'light', 'auto']
    const next = order[(order.indexOf(mode) + 1) % order.length]
    setTheme(next)
  }, [mode, setTheme])

  return (
    <ThemeContext.Provider value={{ mode, resolved, setTheme, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
