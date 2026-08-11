import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <main className="auth-page auth-login-page"><section className="login-card compact-auth-card"><p className="auth-intro">Checking your session…</p></section></main>
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (user.role !== 'ADMIN') return <Navigate to="/" replace />
  return <>{children}</>
}
