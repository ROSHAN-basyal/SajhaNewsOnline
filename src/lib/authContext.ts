'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  username: string
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>
  logout: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

const STORAGE_KEY = 'admin_auth_data'
const DEVICE_ID_KEY = 'admin_device_id'

// Generate a unique device ID
function generateDeviceId(): string {
  if (typeof window === 'undefined') return ''
  
  let deviceId = localStorage.getItem(DEVICE_ID_KEY)
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem(DEVICE_ID_KEY, deviceId)
  }
  return deviceId
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      // Try to get stored auth data
      const storedAuth = localStorage.getItem(STORAGE_KEY)
      if (storedAuth) {
        try {
          const { user: storedUser, timestamp } = JSON.parse(storedAuth)
          // Check if stored auth is less than 30 days old
          const thirtyDays = 30 * 24 * 60 * 60 * 1000
          if (Date.now() - timestamp < thirtyDays) {
            setUser(storedUser)
          } else {
            localStorage.removeItem(STORAGE_KEY)
          }
        } catch (e) {
          localStorage.removeItem(STORAGE_KEY)
        }
      }

      // Always verify with server regardless of stored data
      const response = await fetch('/api/auth/verify')
      
      if (response.ok) {
        const data = await response.json()
        if (data.authenticated) {
          const userData = data.user
          setUser(userData)
          // Update localStorage with fresh data
          localStorage.setItem(STORAGE_KEY, JSON.stringify({
            user: userData,
            timestamp: Date.now()
          }))
        } else {
          setUser(null)
          localStorage.removeItem(STORAGE_KEY)
        }
      } else {
        setUser(null)
        localStorage.removeItem(STORAGE_KEY)
      }
    } catch (error) {
      console.error('Auth initialization failed:', error)
      setUser(null)
      localStorage.removeItem(STORAGE_KEY)
    } finally {
      setLoading(false)
    }
  }

  const login = async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const deviceId = generateDeviceId()
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, deviceId }),
      })

      const data = await response.json()
      
      if (response.ok && data.success) {
        const userData = data.user
        setUser(userData)
        // Store auth data persistently
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          user: userData,
          timestamp: Date.now()
        }))
        return { 
          success: true, 
          message: data.message 
        }
      }
      
      return { 
        success: false, 
        message: data.message || data.error || 'Login failed' 
      }
    } catch (error) {
      console.error('Login failed:', error)
      return { 
        success: false, 
        message: 'Network error. Please try again.' 
      }
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setUser(null)
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  const value: AuthContextType = {
    user,
    login,
    logout,
    loading,
  }

  // Use createElement to avoid JSX syntax issues
  const { createElement } = require('react')
  return createElement(AuthContext.Provider, { value }, children)
}