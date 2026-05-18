'use client'

import { useState, type FormEvent, type CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authApi } from '../../../src/api/auth'

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    setIsLoading(true)

    try {
      await authApi.register({ email, password, fullName })
      router.push('/auth/login')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al registrarse'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main style={styles.main}>
      <div style={styles.card}>
        <h1 style={styles.title}>Vendora</h1>
        <p style={styles.subtitle}>Crea tu cuenta</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            placeholder="Nombre completo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            style={styles.input}
          />

          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />

          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={styles.input}
          />

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" disabled={isLoading} style={styles.button}>
            {isLoading ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>

        <p style={styles.footer}>
          ¿Ya tienes cuenta?{' '}
          <Link href="/auth/login" style={styles.link}>
            Inicia sesión
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