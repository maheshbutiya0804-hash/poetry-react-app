import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authGoogle, authLogin, authLogout, authMe, authRegister, type AuthUser, type RegisterInput } from '../services/api'

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<AuthUser>
  register: (input: RegisterInput) => Promise<AuthUser>
  googleLogin: (credential: string) => Promise<AuthUser>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try { setUser(await authMe()) } catch { setUser(null) } finally { setLoading(false) }
  }, [])

  useEffect(() => { void refresh() }, [refresh])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    async login(email, password) { const next = await authLogin(email, password); setUser(next); return next },
    async register(input) { const next = await authRegister(input); setUser(next); return next },
    async googleLogin(credential) { const next = await authGoogle(credential); setUser(next); return next },
    async logout() { await authLogout(); setUser(null) },
    refresh,
  }), [user, loading, refresh])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside AuthProvider')
  return value
}
