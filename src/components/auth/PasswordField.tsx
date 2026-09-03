import { useState, type ChangeEvent } from 'react'

export function PasswordField({ id, label, placeholder = 'Password', value, onChange, required = false }: { id: string; label: string; placeholder?: string; value?: string; onChange?: (event: ChangeEvent<HTMLInputElement>) => void; required?: boolean }) {
  const [visible, setVisible] = useState(false)
  return (
    <label className="auth-field" htmlFor={id}>
      <span>{label}</span>
      <div className="auth-password-wrap">
        <input id={id} name={id} type={visible ? 'text' : 'password'} placeholder={placeholder} autoComplete={id === 'password' ? 'current-password' : 'new-password'} value={value} onChange={onChange} required={required} />
        <button type="button" className="password-toggle" aria-label={visible ? 'Hide password' : 'Show password'} onClick={() => setVisible(v => !v)}>
          <span className="eye-icon" aria-hidden="true">◉</span>
        </button>
      </div>
    </label>
  )
}
