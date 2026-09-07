import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'
import type { ReactNode } from 'react'

export function RequireAuth({children}:{children:ReactNode}) {
  const {user, loading} = useAuth()
  const location = useLocation()
  if (loading) return <main className="profile-loading">Loading your account…</main>
  if (!user) return <Navigate to="/login" replace state={{from: location.pathname}} />
  return children
}

export function GuestOnly({children}:{children:ReactNode}) {
  const {user, loading} = useAuth()
  if (loading) return <main className="profile-loading">Loading…</main>
  if (user) return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/profile'} replace />
  return children
}
