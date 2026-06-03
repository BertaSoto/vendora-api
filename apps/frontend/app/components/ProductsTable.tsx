'use client'

import { useEffect, useState } from 'react'
import { productsApi } from '../../src/api/products'
import type { Product } from '../../src/types'

const fmt = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })

export default function ProductsTable({ storeId }: { storeId: string }) {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    productsApi.listByStore(storeId)
      .then(setProducts)
      .catch(err => setError(err instanceof Error ? err.message : 'Error al cargar productos'))
      .finally(() => setIsLoading(false))
  }, [storeId])

  return (
    <section style={styles.card}>
      <h2 style={styles.heading}>Productos</h2>

      {isLoading && <p style={styles.state}>Cargando productos…</p>}

      {error && <p style={{ ...styles.state, color: 'var(--color-danger)' }}>{error}</p>}

      {!isLoading && !error && products.length === 0 && (
        <p style={styles.state}>No hay productos registrados.</p>
      )}

      {!isLoading && !error && products.length > 0 && (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Nombre</th>
                <th style={{ ...styles.th, ...styles.thRight }}>Precio</th>
                <th style={{ ...styles.th, ...styles.thRight }}>Stock</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr key={p.id} style={i % 2 === 1 ? styles.rowAlt : undefined}>
                  <td style={styles.td}>
                    <span style={styles.productName}>{p.name}</span>
                    {p.description && (
                      <span style={styles.description}>{p.description}</span>
                    )}
                  </td>
                  <td style={{ ...styles.td, ...styles.tdRight }}>{fmt.format(p.price)}</td>
                  <td style={{ ...styles.td, ...styles.tdRight }}>
                    <span style={{ ...styles.stockBadge, ...(p.stock <= 5 ? styles.stockLow : {}) }}>
                      {p.stock}
                    </span>
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
  productName: {
    display: 'block',
    fontWeight: 500,
  },
  description: {
    display: 'block',
    fontSize: '0.78rem',
    color: 'var(--color-text-muted)',
    marginTop: '2px',
  },
  stockBadge: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '9999px',
    fontSize: '0.78rem',
    fontWeight: 600,
    backgroundColor: '#d1fae5',
    color: '#065f46',
  },
  stockLow: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
}
