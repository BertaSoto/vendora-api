'use client'

import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { authApi } from '../../src/api/auth'

interface FieldErrors {
  fullName?: string
  email?: string
  password?: string
  confirmPassword?: string
}

function validateFullName(v: string): string | undefined {
  if (!v.trim()) return 'El nombre es requerido'
  if (v.trim().length < 2) return 'Mínimo 2 caracteres'
}

function validateEmail(v: string): string | undefined {
  if (!v.trim()) return 'El correo es requerido'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Correo inválido'
}

function validatePassword(v: string): string | undefined {
  if (!v) return 'La contraseña es requerida'
  if (v.length < 6) return 'Mínimo 6 caracteres'
}

function validateConfirm(v: string, password: string): string | undefined {
  if (!v) return 'Confirma tu contraseña'
  if (v !== password) return 'Las contraseñas no coinciden'
}

type Field = keyof FieldErrors

export default function RegisterForm() {
  const router = useRouter()

  const [fields, setFields] = useState({ fullName: '', email: '', password: '', confirmPassword: '' })
  const [touched, setTouched] = useState<Record<Field, boolean>>({
    fullName: false, email: false, password: false, confirmPassword: false,
  })
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!success) return
    const timer = setTimeout(() => router.push('/login'), 2000)
    return () => clearTimeout(timer)
  }, [success, router])

  function getError(field: Field, value: string): string | undefined {
    if (field === 'fullName') return validateFullName(value)
    if (field === 'email') return validateEmail(value)
    if (field === 'password') return validatePassword(value)
    if (field === 'confirmPassword') return validateConfirm(value, fields.password)
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target as { name: Field; value: string }
    setFields(prev => ({ ...prev, [name]: value }))
    setApiError(null)
    if (touched[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: getError(name, value) }))
      if (name === 'password' && touched.confirmPassword) {
        setFieldErrors(prev => ({ ...prev, confirmPassword: validateConfirm(fields.confirmPassword, value) }))
      }
    }
  }

  function handleBlur(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target as { name: Field; value: string }
    setTouched(prev => ({ ...prev, [name]: true }))
    setFieldErrors(prev => ({ ...prev, [name]: getError(name, value) }))
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const errors: FieldErrors = {
      fullName: validateFullName(fields.fullName),
      email: validateEmail(fields.email),
      password: validatePassword(fields.password),
      confirmPassword: validateConfirm(fields.confirmPassword, fields.password),
    }
    setTouched({ fullName: true, email: true, password: true, confirmPassword: true })
    setFieldErrors(errors)
    if (Object.values(errors).some(Boolean)) return

    setIsLoading(true)
    setApiError(null)
    try {
      await authApi.register({
        email: fields.email,
        password: fields.password,
        fullName: fields.fullName.trim(),
      })
      setSuccess(true)
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Error al registrar usuario')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate style={styles.form}>
      <h1 style={styles.title}>Vendora</h1>
      <p style={styles.subtitle}>Crea tu cuenta de administrador</p>

      {success && (
        <div style={styles.successBanner} role="status">
          ¡Cuenta creada! Redirigiendo al inicio de sesión…
        </div>
      )}

      {apiError && (
        <div style={styles.errorBanner} role="alert">
          {apiError}
        </div>
      )}

      <Field
        id="fullName" label="Nombre completo" type="text"
        name="fullName" value={fields.fullName} placeholder="Tu nombre"
        disabled={isLoading || success}
        error={touched.fullName ? fieldErrors.fullName : undefined}
        onChange={handleChange} onBlur={handleBlur}
      />
      <Field
        id="email" label="Correo electrónico" type="email"
        name="email" value={fields.email} placeholder="admin@ejemplo.com"
        disabled={isLoading || success} autoComplete="email"
        error={touched.email ? fieldErrors.email : undefined}
        onChange={handleChange} onBlur={handleBlur}
      />
      <Field
        id="password" label="Contraseña" type="password"
        name="password" value={fields.password} placeholder="••••••••"
        disabled={isLoading || success} autoComplete="new-password"
        error={touched.password ? fieldErrors.password : undefined}
        onChange={handleChange} onBlur={handleBlur}
      />
      <Field
        id="confirmPassword" label="Confirmar contraseña" type="password"
        name="confirmPassword" value={fields.confirmPassword} placeholder="••••••••"
        disabled={isLoading || success} autoComplete="new-password"
        error={touched.confirmPassword ? fieldErrors.confirmPassword : undefined}
        onChange={handleChange} onBlur={handleBlur}
      />

      <button type="submit" disabled={isLoading || success} style={styles.button}>
        {isLoading && <span style={styles.spinner} />}
        {isLoading ? 'Registrando…' : 'Crear cuenta'}
      </button>

      <p style={styles.loginLink}>
        ¿Ya tienes cuenta?{' '}
        <a href="/login" style={styles.link}>Inicia sesión</a>
      </p>
    </form>
  )
}

interface FieldProps {
  id: string
  label: string
  type: string
  name: string
  value: string
  placeholder: string
  disabled: boolean
  error?: string
  autoComplete?: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  onBlur: (e: ChangeEvent<HTMLInputElement>) => void
}

function Field({ id, label, type, name, value, placeholder, disabled, error, autoComplete, onChange, onBlur }: FieldProps) {
  return (
    <div style={styles.field}>
      <label htmlFor={id} style={styles.label}>{label}</label>
      <input
        id={id} type={type} name={name} value={value}
        placeholder={placeholder} disabled={disabled}
        autoComplete={autoComplete}
        onChange={onChange} onBlur={onBlur}
        style={{ ...styles.input, ...(error ? styles.inputError : {}) }}
      />
      {error && <span style={styles.fieldError}>{error}</span>}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius)',
    padding: '40px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: 'var(--shadow)',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: 'var(--color-primary)',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '0.875rem',
    color: 'var(--color-text-muted)',
    textAlign: 'center',
    marginTop: '-6px',
  },
  successBanner: {
    fontSize: '0.875rem',
    color: '#065f46',
    backgroundColor: '#d1fae5',
    border: '1px solid #6ee7b7',
    borderRadius: 'var(--radius)',
    padding: '10px 12px',
  },
  errorBanner: {
    fontSize: '0.875rem',
    color: 'var(--color-danger)',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: 'var(--radius)',
    padding: '10px 12px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
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
  loginLink: {
    fontSize: '0.85rem',
    color: 'var(--color-text-muted)',
    textAlign: 'center',
  },
  link: {
    color: 'var(--color-primary)',
    textDecoration: 'none',
    fontWeight: 500,
  },
}
