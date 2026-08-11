import { Link } from 'react-router-dom'

export function AuthHeader({ actionLabel, actionTo }: { actionLabel: string; actionTo: string }) {
  return (
    <header className="auth-header">
      <Link to="/" className="auth-brand" aria-label="HeartString Notes home">
        <img src="/assets/branding/heartstring-notes-logo.png" alt="HeartString Notes" />
        <span>HeartString Notes</span>
        <sup>TM</sup>
      </Link>
      <Link className="auth-action-link" to={actionTo}>{actionLabel}</Link>
    </header>
  )
}
