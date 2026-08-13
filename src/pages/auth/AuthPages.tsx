import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthHeader } from '../../components/auth/AuthHeader'
import { GoogleButton } from '../../components/auth/GoogleButton'
import { PasswordField } from '../../components/auth/PasswordField'
import { useAuth } from '../../auth/AuthContext'

export function LoginPage() {
  const { login, googleLogin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const user = await login(email, password)
      const requested = (location.state as { from?: string } | null)?.from
      if (user.role === 'ADMIN') navigate(requested?.startsWith('/admin') ? requested : '/admin', { replace: true })
      else navigate(requested && !requested.startsWith('/admin') ? requested : '/profile', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in.')
    } finally { setSubmitting(false) }
  }

  async function googleSubmit(credential: string) {
    setError('')
    setSubmitting(true)
    try {
      const user = await googleLogin(credential)
      const requested = (location.state as { from?: string } | null)?.from
      if (user.role === 'ADMIN') navigate(requested?.startsWith('/admin') ? requested : '/admin', { replace: true })
      else navigate(requested && !requested.startsWith('/admin') ? requested : '/profile', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in with Google.')
    } finally { setSubmitting(false) }
  }

  return (
    <main className="auth-page auth-login-page">
      <AuthHeader actionLabel="Sign In" actionTo="/login" />
      <div className="login-botanical" aria-hidden="true"><span /><span /><span /><span /><span /></div>
      <section className="login-card" aria-labelledby="login-title">
        <h1 id="login-title">Welcome Back</h1>
        <p className="auth-intro">Revisit the verses that speak to you.</p>
        {error && <div className="auth-error" role="alert">{error}</div>}
        <form className="auth-form" onSubmit={submit}>
          <label className="auth-field" htmlFor="email">
            <span>EMAIL ADDRESS</span>
            <input id="email" name="email" type="email" placeholder="your@email.com" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required />
          </label>
          <div className="password-label-row">
            <span>PASSWORD</span>
            <Link to="/forgot-password">Forgot password?</Link>
          </div>
          <PasswordField id="password" label="" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />
          <button className="auth-primary" type="submit" disabled={submitting}>{submitting ? 'SIGNING IN…' : 'LOG IN'}</button>
          <GoogleButton label="Continue with Google" onCredential={googleSubmit} disabled={submitting} />
        </form>
        <p className="auth-switch">New here? <Link to="/register">Create account</Link></p>
      </section>
    </main>
  )
}

export function RegisterPage() {
  const { register, googleLogin } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName:'', email:'', phone:'', password:'' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const set = (key: keyof typeof form, value: string) => setForm(v=>({...v,[key]:value}))

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await register(form)
      navigate('/profile', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create your account.')
    } finally { setSubmitting(false) }
  }

  async function googleSubmit(credential: string) {
    setError('')
    setSubmitting(true)
    try {
      const user = await googleLogin(credential)
      navigate(user.role === 'ADMIN' ? '/admin' : '/profile', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not continue with Google.')
    } finally { setSubmitting(false) }
  }

  return (
    <main className="auth-page auth-register-page">
      <AuthHeader actionLabel="Sign In" actionTo="/login" />
      <section className="register-grid">
        <aside className="register-art-panel" aria-hidden="true">
          <div className="register-card-art"><div className="register-shadow-card"/><div className="register-poem-card"><p>Some bonds don’t need<br/>words.<br/>They live in the little<br/>things,<br/>without needing to<br/>explain.</p></div></div>
          <p className="register-art-copy">Words that carry weight.<br/>Moments that deserve<br/>more than silence.</p>
          <span className="register-art-brand">LAURENTINE</span>
        </aside>
        <section className="register-form-panel" aria-labelledby="register-title">
          <h1 id="register-title">Begin Your<br/>Collection.</h1>
          <p className="register-subtitle">Poetry for the moments that matter most.</p>
          {error && <div className="auth-error" role="alert">{error}</div>}
          <form className="auth-form register-form" onSubmit={submit}>
            <label className="auth-field" htmlFor="fullName"><span>Full Name</span><input id="fullName" name="fullName" type="text" placeholder="Your name" autoComplete="name" value={form.fullName} onChange={e=>set('fullName',e.target.value)} required /></label>
            <label className="auth-field" htmlFor="registerEmail"><span>Email Address</span><input id="registerEmail" name="registerEmail" type="email" placeholder="you@example.com" autoComplete="email" value={form.email} onChange={e=>set('email',e.target.value)} required /></label>
            <label className="auth-field" htmlFor="phone"><span>Phone Number</span><div className="phone-field"><button type="button" className="country-code" aria-label="Country code">🇮🇳 <span>⌄</span></button><input id="phone" name="phone" type="tel" placeholder="+91" autoComplete="tel" value={form.phone} onChange={e=>set('phone',e.target.value)} /></div></label>
            <PasswordField id="newPassword" label="Password" placeholder="Create a password" value={form.password} onChange={e=>set('password',e.target.value)} required />
            <p className="password-help">Use at least 8 characters with uppercase, lowercase, number,<br className="desktop-break"/> and special character.</p>
            <button className="auth-primary" type="submit" disabled={submitting}>{submitting ? 'CREATING ACCOUNT…' : 'CREATE MY ACCOUNT'}</button>
            <p className="register-benefit">Unlock Everything · Cancel anytime</p>
            <div className="auth-divider"><span>or continue with</span></div>
            <GoogleButton label="Continue with Google" onCredential={googleSubmit} disabled={submitting} />
          </form>
        </section>
      </section>
    </main>
  )
}

export function ForgotPasswordPage() {
  return <main className="auth-page auth-login-page"><AuthHeader actionLabel="Sign In" actionTo="/login"/><section className="login-card compact-auth-card"><h1>Reset Password</h1><p className="auth-intro">Password reset email delivery is not connected yet.</p><p className="auth-switch"><Link to="/login">Return to sign in</Link></p></section></main>
}
