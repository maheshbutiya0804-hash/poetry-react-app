import { useEffect, useRef, useState } from 'react'

type GoogleCredentialResponse = { credential?: string }
type GoogleButtonText = 'signin_with' | 'signup_with' | 'continue_with' | 'signin'

type GoogleAccounts = {
  id: {
    initialize: (options: { client_id: string; callback: (response: GoogleCredentialResponse) => void; auto_select?: boolean; cancel_on_tap_outside?: boolean }) => void
    renderButton: (element: HTMLElement, options: { type?: 'standard' | 'icon'; theme?: 'outline' | 'filled_blue' | 'filled_black'; size?: 'large' | 'medium' | 'small'; text?: GoogleButtonText; shape?: 'rectangular' | 'pill' | 'circle' | 'square'; width?: number; logo_alignment?: 'left' | 'center' }) => void
  }
}

declare global {
  interface Window { google?: { accounts: GoogleAccounts } }
}

let googleScriptPromise: Promise<void> | null = null

function loadGoogleIdentityServices() {
  if (window.google?.accounts?.id) return Promise.resolve()
  if (googleScriptPromise) return googleScriptPromise
  googleScriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-heartstring-google]')
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('Could not load Google Sign-In.')), { once: true })
      return
    }
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.dataset.heartstringGoogle = 'true'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Could not load Google Sign-In.'))
    document.head.appendChild(script)
  })
  return googleScriptPromise
}

export function GoogleButton({
  label,
  onCredential,
  disabled = false,
}: {
  label: string
  onCredential: (credential: string) => void | Promise<void>
  disabled?: boolean
}) {
  const buttonRef = useRef<HTMLDivElement>(null)
  const callbackRef = useRef(onCredential)
  const [error, setError] = useState('')
  callbackRef.current = onCredential

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim()
    if (!clientId) {
      setError('Google Sign-In is not configured.')
      return
    }

    let cancelled = false
    void loadGoogleIdentityServices()
      .then(() => {
        if (cancelled || !buttonRef.current || !window.google?.accounts?.id) return
        buttonRef.current.replaceChildren()
        window.google.accounts.id.initialize({
          client_id: clientId,
          auto_select: false,
          cancel_on_tap_outside: true,
          callback: response => {
            if (!response.credential) {
              setError('Google did not return a sign-in credential.')
              return
            }
            setError('')
            void callbackRef.current(response.credential)
          },
        })
        const text: GoogleButtonText = label.toLowerCase().includes('sign up') ? 'signup_with' : label.toLowerCase().includes('sign in') ? 'signin_with' : 'continue_with'
        window.google.accounts.id.renderButton(buttonRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text,
          shape: 'rectangular',
          width: Math.min(420, Math.max(240, buttonRef.current.clientWidth || 360)),
          logo_alignment: 'left',
        })
      })
      .catch(err => !cancelled && setError(err instanceof Error ? err.message : 'Could not load Google Sign-In.'))

    return () => { cancelled = true }
  }, [label])

  return (
    <div className={`google-signin-wrap${disabled ? ' is-disabled' : ''}`} aria-disabled={disabled}>
      <div ref={buttonRef} className="google-signin-render" />
      {error && <p className="google-signin-error" role="alert">{error}</p>}
    </div>
  )
}
