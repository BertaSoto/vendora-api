<<<<<<< HEAD
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const TOKEN_KEY = 'vendora_token'

export default function HomePage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      router.replace('/dashboard')
    } else {
      setChecking(false)
    }
  }, [router])

  if (checking) {
    return (
      <div style={styles.loading}>
        <span style={styles.loadingText}>Cargando…</span>
      </div>
    )
  }

  return (
    <main style={styles.main}>
      <div style={styles.card}>
        <h1 style={styles.title}>Vendora</h1>
        <p style={styles.subtitle}>Panel de administración</p>
        <div style={styles.actions}>
          <a href="/auth/login" style={styles.btnPrimary}>
            Iniciar sesión
          </a>
          <a href="/auth/register" style={styles.btnSecondary}>
            Registrarse
          </a>
        </div>
      </div>
    </main>
  )
}

const styles: Record<string, React.CSSProperties> = {
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: 'var(--color-bg)',
  },
  loadingText: {
    fontSize: '0.875rem',
    color: 'var(--color-text-muted)',
  },
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
    maxWidth: '400px',
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
    marginBottom: '36px',
    fontSize: '1rem',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    alignItems: 'stretch',
  },
  btnPrimary: {
    display: 'block',
    padding: '12px 20px',
    borderRadius: 'var(--radius)',
    backgroundColor: 'var(--color-primary)',
    color: 'white',
    textDecoration: 'none',
    fontSize: '0.95rem',
    fontWeight: 600,
  },
  btnSecondary: {
    display: 'block',
    padding: '12px 20px',
    borderRadius: 'var(--radius)',
    backgroundColor: 'transparent',
    color: 'var(--color-primary)',
    textDecoration: 'none',
    fontSize: '0.95rem',
    fontWeight: 600,
    border: '1px solid var(--color-primary)',
  },
=======
import { redirect } from 'next/navigation'

export default function HomePage() {
  redirect('/auth/login')
>>>>>>> qa
}
