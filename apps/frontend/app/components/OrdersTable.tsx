'use client'

import { useEffect, useState } from 'react'
import { ordersApi } from '../../src/api/orders'
import type { Order, OrderStatus } from '../../src/types'

const fmt = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })
const dateFmt = new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' })

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending:   'Pendiente',
  confirmed: 'Confirmado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

const STATUS_STYLE: Record<OrderStatus, React.CSSProperties> = {
  pending:   { backgroundColor: '#fef3c7', color: '#92400e' },
  confirmed: { backgroundColor: '#ede9fe', color: '#4338ca' },
  delivered: { backgroundColor: '#d1fae5', color: '#065f46' },
  cancelled: { backgroundColor: '#fee2e2', color: '#991b1b' },
}

export default function OrdersTable({ storeId }: { storeId: string }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ordersApi.list(storeId)
      .then(setOrders)
      .catch(err => setError(err instanceof Error ? err.message : 'Error al cargar órdenes'))
      .finally(() => setIsLoading(false))
  }, [storeId])

  return (
    <section style={styles.card}>
      <h2 style={styles.heading}>Órdenes</h2>

      {isLoading && <p style={styles.state}>Cargando órdenes…</p>}

      {error && <p style={{ ...styles.state, color: 'var(--color-danger)' }}>{error}</p>}

      {!isLoading && !error && orders.length === 0 && (
        <p style={styles.state}>No hay órdenes registradas.</p>
      )}

      {!isLoading && !error && orders.length > 0 && (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Cliente</th>
                <th style={styles.th}>Estado</th>
                <th style={{ ...styles.th, ...styles.thRight }}>Total</th>
                <th style={{ ...styles.th, ...styles.thRight }}>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o, i) => (
                <tr key={o.id} style={i % 2 === 1 ? styles.rowAlt : undefined}>
                  <td style={styles.td}>
                    <span style={styles.orderId}>{o.id.slice(0, 8)}…</span>
                  </td>
                  <td style={styles.td}>{o.customerName}</td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, ...STATUS_STYLE[o.status] }}>
                      {STATUS_LABEL[o.status]}
                    </span>
                  </td>
                  <td style={{ ...styles.td, ...styles.tdRight }}>{fmt.format(o.total)}</td>
                  <td style={{ ...styles.td, ...styles.tdRight }}>
                    {dateFmt.format(new Date(o.createdAt))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius)',
    boxShadow: 'var(--shadow)',
    overflow: 'hidden',
  },
  heading: {
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--color-text)',
    padding: '16px 20px',
    borderBottom: '1px solid var(--color-border)',
  },
  state: {
    padding: '24px 20px',
    fontSize: '0.875rem',
    color: 'var(--color-text-muted)',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.875rem',
  },
  th: {
    padding: '10px 20px',
    textAlign: 'left',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid var(--color-border)',
    backgroundColor: '#f8fafc',
  },
  thRight: { textAlign: 'right' },
  td: {
    padding: '12px 20px',
    color: 'var(--color-text)',
    borderBottom: '1px solid var(--color-border)',
    verticalAlign: 'middle',
  },
  tdRight: { textAlign: 'right' },
  rowAlt: { backgroundColor: '#fafafa' },
  orderId: {
    fontFamily: 'monospace',
    fontSize: '0.8rem',
    color: 'var(--color-text-muted)',
  },
  badge: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: '9999px',
    fontSize: '0.78rem',
    fontWeight: 600,
  },
}
