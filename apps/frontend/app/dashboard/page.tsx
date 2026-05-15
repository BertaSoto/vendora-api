'use client'

import { useAuth } from '../../src/hooks/useAuth'
import { decodeJwtPayload } from '../../src/lib/jwt'

interface TokenPayload {
  fullName?: string
  email?: string
}

export default function DashboardPage() {
  const { token } = useAuth()
  const payload = token ? decodeJwtPayload<TokenPayload>(token) : null
  const name = payload?.fullName ?? payload?.email ?? 'Usuario'

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.heading}>Bienvenido, {name}</h1>
        <p style={styles.subtext}>Panel de administración de Vendora</p>
      </div>

      <div style={styles.card}>
        <div style={styles.cardContent}>
          <div>
            <h2 style={styles.cardTitle}>Tiendas</h2>
            <p style={styles.cardDesc}>
              Gestiona tus tiendas, revisa sus productos y órdenes.
            </p>
          </div>
          <a href="/dashboard/tiendas" style={styles.cardBtn}>
            Ver tiendas →
          </a>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  heading: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'var(--color-text)',
  },
  subtext: {
    fontSize: '0.875rem',
    color: 'var(--color-text-muted)',
  },
  card: {
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius)',
    boxShadow: 'var(--shadow)',
    padding: '24px',
  },
  cardContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    flexWrap: 'wrap' as const,
  },
  cardTitle: {
    fontSize: '1.1rem',
    fontWeight: 600,
    color: 'var(--color-text)',
    marginBottom: '4px',
  },
  cardDesc: {
    fontSize: '0.875rem',
    color: 'var(--color-text-muted)',
  },
  cardBtn: {
    display: 'inline-block',
    padding: '10px 20px',
    backgroundColor: 'var(--color-primary)',
    color: 'white',
    textDecoration: 'none',
    borderRadius: 'var(--radius)',
    fontSize: '0.9rem',
    fontWeight: 600,
    flexShrink: 0,
  },
}
