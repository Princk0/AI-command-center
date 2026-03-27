import { createContext, useContext, useState, useCallback } from 'react'

/**
 * Auth modes:
 * - guest:  read-only dashboard, no chat, no tool execution
 * - client: full access — chat with Claude, execute tools, control GPIO
 *
 * In a real app you'd verify credentials against a backend.
 * Here we keep it client-side to demonstrate the pattern without
 * adding a full auth server (which you can layer on later).
 */

const AuthContext = createContext()

const USERS = {
  admin: { password: 'admin123', role: 'client', name: 'Admin' },
  demo: { password: 'demo', role: 'client', name: 'Demo User' },
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('auth-user')
    if (saved) {
      try { return JSON.parse(saved) } catch { return null }
    }
    return null
  })

  const login = useCallback((username, password) => {
    const entry = USERS[username.toLowerCase()]

    if (!entry) {
      return { success: false, error: 'User not found' }
    }
    if (entry.password !== password) {
      return { success: false, error: 'Wrong password' }
    }

    const userData = {
      username: username.toLowerCase(),
      name: entry.name,
      role: entry.role,
      loggedInAt: new Date().toISOString(),
    }
    setUser(userData)
    sessionStorage.setItem('auth-user', JSON.stringify(userData))
    return { success: true }
  }, [])

  const loginAsGuest = useCallback(() => {
    const guestData = {
      username: 'guest',
      name: 'Guest',
      role: 'guest',
      loggedInAt: new Date().toISOString(),
    }
    setUser(guestData)
    sessionStorage.setItem('auth-user', JSON.stringify(guestData))
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    sessionStorage.removeItem('auth-user')
  }, [])

  const isAuthenticated = user !== null
  const isClient = user?.role === 'client'
  const isGuest = user?.role === 'guest'

  return (
    <AuthContext.Provider value={{
      user, login, loginAsGuest, logout,
      isAuthenticated, isClient, isGuest,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
