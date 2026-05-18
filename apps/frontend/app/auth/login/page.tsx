'use client'

import { useState, type FormEvent, type CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../../src/hooks/useAuth'

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading, error, clearError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const success = await login({ email, password })
    if (success) {
      router.push('/dashboard')
    }
  }

  return (
    <main style={styles.main}>
      <div style={styles.card}>
        <h1 style={styles.title}>Vendora</h1>
        <p style={styles.subtitle}>Inicia sesión para continuar</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              clearError()
            }}
            required
            style={styles.input}
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              clearError()
            }}
            required
            style={styles.input}
          />

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" disabled={isLoading} style={styles.button}>
            {isLoading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>

        <p style={styles.footer}>
          ¿No tienes cuenta?{' '}
          <Link href="/auth/register" style={styles.link}>
            Regístrate
          </Link>
        </p>
      </div>
    </main>
  )
}

const styles: Record<string, CSSProperties> = {
  main: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: 'var(--color-bg)',
    fontFamily: 'system-ui, sans-serif',
  },
  card: {
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius)',
    padding: '48px',
    textAlign: 'center',
    maxWidth: '420px',
    width: '100%',
    boxShadow: 'var(--shadow)',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 700,
    color: 'var(--color-primary)',
    marginBottom: '8px',
  },
  subtitle: {
    color: 'var(--color-text-muted)',
    marginBottom: '32px',
    fontSize: '0.95rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  input: {
    padding: '10px 14px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--color-border)',
    fontSize: '0.95rem',
    outline: 'none',
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
  },
  button: {
    padding: '10px 20px',
    borderRadius: 'var(--radius)',
    backgroundColor: 'var(--color-primary)',
    color: 'white',
    border: 'none',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '4px',
  },
  error: {
    color: 'var(--color-danger)',
    fontSize: '0.85rem',
    textAlign: 'left',
    padding: '4px 0',
  },
  footer: {
    marginTop: '20px',
    fontSize: '0.9rem',
    color: 'var(--color-text-muted)',
  },
  link: {
    color: 'var(--color-primary)',
    textDecoration: 'none',
    fontWeight: 600,
  },
}
