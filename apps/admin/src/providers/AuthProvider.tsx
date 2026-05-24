'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { UserRole } from '@amuzic/shared'

interface AuthUser {
  id: string
  full_name: string
  role: UserRole
  email: string
}

interface AuthContextValue {
  user: AuthUser | null
  role: UserRole | null
  isLoading: boolean
  accessToken: string | null
  isDirector: boolean
  isTeacher: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  role: null,
  isLoading: true,
  accessToken: null,
  isDirector: false,
  isTeacher: false,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    const stored = localStorage.getItem('admin_user')
    if (token && stored) {
      try {
        const parsed = JSON.parse(stored) as AuthUser
        setUser(parsed)
        setAccessToken(token)
      } catch {
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_user')
      }
    }
    setIsLoading(false)
  }, [])

  const signOut = useCallback(async () => {
    const token = localStorage.getItem('admin_token')
    const apiUrl = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000'
    if (token) {
      await fetch(`${apiUrl}/api/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {})
    }
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    document.cookie = 'admin_auth=; path=/; max-age=0'
    setUser(null)
    setAccessToken(null)
    window.location.href = '/login'
  }, [])

  const role = user?.role ?? null

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isLoading,
        accessToken,
        isDirector: role === 'director',
        isTeacher: role === 'teacher' || role === 'director',
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  return useContext(AuthContext)
}
