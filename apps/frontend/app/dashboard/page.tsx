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
    <div>
      <h1 style={styles.heading}>Bienvenido, {name}</h1>
      <p style={styles.subtext}>Este es tu panel de administración de Vendora.</p>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  heading: {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: 'var(--color-text)',
    marginBottom: '8px',
  },
  subtext: {
    fontSize: '1rem',
    color: 'var(--color-text-muted)',
  },
}
