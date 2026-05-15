'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { storesApi } from '../../../../src/api/stores'
import ProductsTable from '../../../components/ProductsTable'
import OrdersTable from '../../../components/OrdersTable'
import type { Store } from '../../../../src/types'

export default function TiendaDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [store, setStore] = useState<Store | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    storesApi.getById(id)
      .then(setStore)
      .catch(err => setError(err instanceof Error ? err.message : 'Error al cargar la tienda'))
      .finally(() => setIsLoading(false))
  }, [id])

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

  if (isLoading) {
    return (
      <div style={styles.loading}>
        <span style={styles.loadingText}>Cargando tienda…</span>
      </div>
    )
  }

  if (error || !store) {
    return (
      <div style={styles.container}>
        <button onClick={() => router.back()} style={styles.backBtn}>← Volver</button>
        <p style={{ ...styles.state, color: 'var(--color-danger)' }}>
          {error ?? 'Tienda no encontrada'}
        </p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <button onClick={() => router.push('/dashboard/tiendas')} style={styles.backBtn}>
        ← Tiendas
      </button>

      <div style={styles.storeHeader}>
        <div style={styles.storeTitleRow}>
          <h1 style={styles.storeName}>{store.name}</h1>
          <span style={{ ...styles.badge, ...statusStyle[store.status] }}>
            {statusLabel[store.status]}
          </span>
        </div>
        <span style={styles.storeId}>{store.id}</span>
      </div>

      <div style={styles.sections}>
        <ProductsTable storeId={id} />
        <OrdersTable storeId={id} />
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '200px',
  },
  loadingText: {
    fontSize: '0.875rem',
    color: 'var(--color-text-muted)',
  },
  state: {
    fontSize: '0.875rem',
    color: 'var(--color-text-muted)',
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--color-text-muted)',
    backgroundColor: 'transparent',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius)',
    cursor: 'pointer',
    alignSelf: 'flex-start',
  },
  storeHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  storeTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  storeName: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'var(--color-text)',
  },
  badge: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: '9999px',
    fontSize: '0.78rem',
    fontWeight: 600,
  },
  storeId: {
    fontSize: '0.75rem',
    fontFamily: 'monospace',
    color: 'var(--color-text-muted)',
  },
  sections: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
}
