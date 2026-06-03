'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('vendora_token') : null
    if (!token) {
      router.push('/auth/login')
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('vendora_token')
    document.cookie = 'vendora_token=; path=/; max-age=0'
    router.push('/auth/login')
  }

  return (
    <div style={styles.wrapper}>
      <nav style={styles.nav}>
        <div style={styles.navLeft}>
          <Link href="/dashboard/tiendas" style={styles.brand}>Vendora</Link>
          <Link href="/dashboard/tiendas" style={navLinkStyle(pathname, '/dashboard/tiendas')}>Tiendas</Link>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>Cerrar sesión</button>
      </nav>
      <main style={styles.main}>{children}</main>
    </div>
  )
}

function navLinkStyle(pathname: string, href: string): React.CSSProperties {
  return {
    color: pathname.startsWith(href) ? 'var(--color-primary)' : 'var(--color-text-muted)',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: pathname.startsWith(href) ? 600 : 400,
  }
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: { minHeight: '100vh', backgroundColor: 'var(--color-bg)' },
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 24px',
    backgroundColor: 'var(--color-surface)',
    borderBottom: '1px solid var(--color-border)',
  },
  navLeft: { display: 'flex', alignItems: 'center', gap: '24px' },
  brand: { fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)', textDecoration: 'none' },
  logoutBtn: {
    padding: '6px 14px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--color-border)',
    backgroundColor: 'transparent',
    color: 'var(--color-text-muted)',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  main: { maxWidth: '960px', margin: '0 auto', padding: '24px' },
}
