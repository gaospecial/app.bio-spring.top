'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { login as apiLogin, getMe } from '@/lib/api'
import { setToken, clearToken, isLoggedIn as checkLoggedIn } from '@/lib/auth'
import type { UserResponse } from '@/lib/types'

interface AuthContextType {
  isLoggedIn: boolean
  user: UserResponse | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  user: null,
  login: async () => {},
  logout: () => {},
  loading: true,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [isLoggedInState, setIsLoggedInState] = useState(false)
  const [user, setUser] = useState<UserResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loggedIn = checkLoggedIn()
    setIsLoggedInState(loggedIn)
    if (loggedIn) {
      getMe().then(setUser).catch(() => {
        clearToken()
        setIsLoggedInState(false)
      }).finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const tokenData = await apiLogin(username, password)
    setToken(tokenData.access_token, tokenData.expires_in)
    setIsLoggedInState(true)
    const userData = await getMe()
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setIsLoggedInState(false)
    setUser(null)
    router.push('/login')
  }, [router])

  return (
    <AuthContext.Provider value={{ isLoggedIn: isLoggedInState, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext }
