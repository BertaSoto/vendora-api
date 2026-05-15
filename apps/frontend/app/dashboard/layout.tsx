'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../components/Navbar'

const TOKEN_KEY = 'vendora_token'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      router.replace('/auth/login')
    } else {
      setReady(true)
    }
  }, [router])

  if (!ready) {
    return (
      <div style={styles.loading}>
        <span style={styles.loadingText}>Verificando sesión…</span>
      </div>
    )
  }

  return (
    <div style={styles.wrapper}>
      <Navbar />
      <main style={styles.main}>{children}</main>
    </div>
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
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: 'var(--color-bg)',
  },
  main: {
    flex: 1,
    padding: '32px 24px',
    maxWidth: '1100px',
    width: '100%',
    margin: '0 auto',
  },
}
