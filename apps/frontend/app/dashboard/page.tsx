'use client'

import { useAuth } from '../../src/hooks/useAuth'
import { decodeJwtPayload } from '../../src/lib/jwt'
import ProductsTable from '../components/ProductsTable'
import OrdersTable from '../components/OrdersTable'

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

      <div style={styles.sections}>
        <ProductsTable />
        <OrdersTable />
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
  sections: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
}
