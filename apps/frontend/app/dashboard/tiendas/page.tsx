'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Store } from '../../../src/types'

const MOCK_STORES: Store[] = [
  { id: 'store-1', name: 'Joyas Maria', status: 'active' },
  { id: 'store-2', name: 'Tech Store', status: 'active' },
  { id: 'store-3', name: 'Fashion Plus', status: 'active' },
]

export default function TiendasPage() {
  const router = useRouter()
  const [stores] = useState<Store[]>(MOCK_STORES)

  const statusLabel: Record<Store['status'], string> = {
    active: 'Activa',
    inactive: 'Inactiva',
    suspended: 'Suspendida',
  }

  const statusStyle: Record<Store['status'], React.CSSProperties> = {
    active: { backgroundColor: '#d1fae5', color: '#065f46' },
    inactive: { backgroundColor: '#f1f5f9', color: '#475569' },
    suspended: { backgroundColor: '#fee2e2', color: '#991b1b' },
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.heading}>Tiendas</h1>
        <p style={styles.subtext}>Selecciona una tienda para ver sus productos y órdenes</p>
      </div>

      {stores.length === 0 && (
        <p style={styles.state}>No hay tiendas registradas.</p>
      )}

      {stores.length > 0 && (
        <div style={styles.grid}>
          {stores.map(store => (
            <button
              key={store.id}
              onClick={() => router.push(`/dashboard/tiendas/${store.id}`)}
              style={styles.card}
            >
              <div style={styles.cardTop}>
                <span style={styles.storeName}>{store.name}</span>
                <span style={{ ...styles.badge, ...statusStyle[store.status] }}>
                  {statusLabel[store.status]}
                </span>
              </div>
              <span style={styles.storeId}>{store.id}</span>
              <span style={styles.cardAction}>Ver detalles →</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
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
  state: {
    fontSize: '0.875rem',
    color: 'var(--color-text-muted)',
    padding: '24px 0',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '20px',
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius)',
    boxShadow: 'var(--shadow)',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  },
  cardTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
  },
  storeName: {
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--color-text)',
  },
  badge: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: 600,
    flexShrink: 0,
  },
  storeId: {
    fontSize: '0.75rem',
    fontFamily: 'monospace',
    color: 'var(--color-text-muted)',
  },
  cardAction: {
    fontSize: '0.8rem',
    fontWeight: 500,
    color: 'var(--color-primary)',
    marginTop: '4px',
  },
}
