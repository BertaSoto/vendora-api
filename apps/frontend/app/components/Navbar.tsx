'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '../../src/hooks/useAuth'
import { decodeJwtPayload } from '../../src/lib/jwt'

interface TokenPayload {
  fullName?: string
  email?: string
}

const NAV_LINKS = [
  { label: 'Inicio', href: '/dashboard' },
  { label: 'Tiendas', href: '/dashboard/tiendas' },
]

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { token, logout } = useAuth()

  const payload = token ? decodeJwtPayload<TokenPayload>(token) : null
  const displayName = payload?.fullName ?? payload?.email ?? 'Usuario'

  function handleLogout() {
    logout()
    router.push('/auth/login')
  }

  return (
    <nav style={styles.nav}>
      <div style={styles.left}>
        <span style={styles.logo}>Vendora</span>
        <div style={styles.links}>
          {NAV_LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              style={{
                ...styles.navLink,
                ...(pathname === link.href ? styles.navLinkActive : {}),
              }}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
      <div style={styles.right}>
        <span style={styles.userName}>{displayName}</span>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Cerrar sesión
        </button>
      </div>
    </nav>
  )
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    height: '56px',
    backgroundColor: 'var(--color-surface)',
    borderBottom: '1px solid var(--color-border)',
    boxShadow: 'var(--shadow)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  logo: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: 'var(--color-primary)',
    letterSpacing: '-0.3px',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  navLink: {
    padding: '6px 12px',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--color-text-muted)',
    textDecoration: 'none',
    borderRadius: 'var(--radius)',
  },
  navLinkActive: {
    color: 'var(--color-primary)',
    backgroundColor: '#ede9fe',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  userName: {
    fontSize: '0.875rem',
    color: 'var(--color-text-muted)',
    fontWeight: 500,
  },
  logoutBtn: {
    padding: '6px 14px',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: 'var(--color-danger)',
    backgroundColor: 'transparent',
    border: '1px solid var(--color-danger)',
    borderRadius: 'var(--radius)',
    cursor: 'pointer',
  },
}
