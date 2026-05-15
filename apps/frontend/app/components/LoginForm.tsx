'use client'

import { useState, type FormEvent, type ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../src/hooks/useAuth'

interface FieldErrors {
  email?: string
  password?: string
}

function validateEmail(value: string): string | undefined {
  if (!value.trim()) return 'El correo es requerido'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Correo inválido'
}

function validatePassword(value: string): string | undefined {
  if (!value) return 'La contraseña es requerida'
  if (value.length < 6) return 'Mínimo 6 caracteres'
}

export default function LoginForm() {
  const router = useRouter()
  const { login, isLoading, error, clearError } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [touched, setTouched] = useState({ email: false, password: false })

  function handleEmailChange(e: ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value)
    if (touched.email) setFieldErrors(prev => ({ ...prev, email: validateEmail(e.target.value) }))
    clearError()
  }

  function handlePasswordChange(e: ChangeEvent<HTMLInputElement>) {
    setPassword(e.target.value)
    if (touched.password) setFieldErrors(prev => ({ ...prev, password: validatePassword(e.target.value) }))
    clearError()
  }

  function handleBlur(field: 'email' | 'password') {
    setTouched(prev => ({ ...prev, [field]: true }))
    if (field === 'email') setFieldErrors(prev => ({ ...prev, email: validateEmail(email) }))
    if (field === 'password') setFieldErrors(prev => ({ ...prev, password: validatePassword(password) }))
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)
    setTouched({ email: true, password: true })
    setFieldErrors({ email: emailError, password: passwordError })
    if (emailError || passwordError) return

    const ok = await login({ email, password })
    if (ok) router.push('/')
  }

  return (
    <form onSubmit={handleSubmit} noValidate style={styles.form}>
      <h1 style={styles.title}>Vendora</h1>
      <p style={styles.subtitle}>Inicia sesión en el panel de administración</p>

      <div style={styles.field}>
        <label htmlFor="email" style={styles.label}>Correo electrónico</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={handleEmailChange}
          onBlur={() => handleBlur('email')}
          disabled={isLoading}
          placeholder="admin@ejemplo.com"
          style={{
            ...styles.input,
            ...(touched.email && fieldErrors.email ? styles.inputError : {}),
          }}
        />
        {touched.email && fieldErrors.email && (
          <span style={styles.fieldError}>{fieldErrors.email}</span>
        )}
      </div>

      <div style={styles.field}>
        <label htmlFor="password" style={styles.label}>Contraseña</label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={handlePasswordChange}
          onBlur={() => handleBlur('password')}
          disabled={isLoading}
          placeholder="••••••••"
          style={{
            ...styles.input,
            ...(touched.password && fieldErrors.password ? styles.inputError : {}),
          }}
        />
        {touched.password && fieldErrors.password && (
          <span style={styles.fieldError}>{fieldErrors.password}</span>
        )}
      </div>

      {error && (
        <div style={styles.apiError} role="alert">
          {error}
        </div>
      )}

      <button type="submit" disabled={isLoading} style={styles.button}>
        {isLoading ? <span style={styles.spinner} /> : null}
        {isLoading ? 'Iniciando sesión…' : 'Iniciar sesión'}
      </button>
    </form>
  )
}

const styles: Record<string, React.CSSProperties> = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius)',
    padding: '40px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: 'var(--shadow)',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: 'var(--color-primary)',
    textAlign: 'center',
    marginBottom: '0',
  },
  subtitle: {
    fontSize: '0.875rem',
    color: 'var(--color-text-muted)',
    textAlign: 'center',
    marginTop: '-8px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--color-text)',
  },
  input: {
    padding: '10px 12px',
    fontSize: '0.95rem',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius)',
    outline: 'none',
    transition: 'border-color 0.15s',
    backgroundColor: 'var(--color-surface)',
    color: 'var(--color-text)',
    width: '100%',
  },
  inputError: {
    borderColor: 'var(--color-danger)',
  },
  fieldError: {
    fontSize: '0.8rem',
    color: 'var(--color-danger)',
  },
  apiError: {
    fontSize: '0.875rem',
    color: 'var(--color-danger)',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: 'var(--radius)',
    padding: '10px 12px',
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '11px',
    fontSize: '0.95rem',
    fontWeight: 600,
    color: '#fff',
    backgroundColor: 'var(--color-primary)',
    border: 'none',
    borderRadius: 'var(--radius)',
    cursor: 'pointer',
    transition: 'background-color 0.15s',
    marginTop: '4px',
  },
  spinner: {
    display: 'inline-block',
    width: '14px',
    height: '14px',
    border: '2px solid rgba(255,255,255,0.4)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },
}
