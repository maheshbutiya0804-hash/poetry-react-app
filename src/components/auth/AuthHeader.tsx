import { Link } from 'react-router-dom'

export function AuthHeader({ actionLabel, actionTo }: { actionLabel: string; actionTo: string }) {
  return (
    <header className="auth-header">
      <Link to="/" className="auth-brand" aria-label="Laurentine home">
        <img src="/assets/branding/laurentine-logo.png" alt="Laurentine" />
        <span>Laurentine</span>
        <sup>TM</sup>
      </Link>
      <Link className="auth-action-link" to={actionTo}>{actionLabel}</Link>
    </header>
  )
}
