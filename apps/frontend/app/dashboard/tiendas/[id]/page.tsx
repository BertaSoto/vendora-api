'use client'

import { useParams, useRouter } from 'next/navigation'
import type { Store, Product, Order, OrderStatus } from '../../../../src/types'

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

const MOCK_STORES: Store[] = [
  { id: 'store-1', name: 'Joyas Maria', status: 'active' },
  { id: 'store-2', name: 'Tech Store', status: 'active' },
  { id: 'store-3', name: 'Fashion Plus', status: 'active' },
]

const MOCK_PRODUCTS: Record<string, Product[]> = {
  'store-1': [
    { id: 'prod-1', storeId: 'store-1', name: 'Anillo dorado',   description: 'Anillo de oro 18k',      price: 15000, stock: 10, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
    { id: 'prod-2', storeId: 'store-1', name: 'Collar plata',    description: 'Collar de plata 925',    price: 12000, stock: 5,  createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  ],
  'store-2': [
    { id: 'prod-3', storeId: 'store-2', name: 'Mouse Logitech',  description: 'Mouse inalámbrico',      price: 25000, stock: 3,  createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
    { id: 'prod-4', storeId: 'store-2', name: 'Teclado mecánico',description: 'Teclado RGB compacto',   price: 45000, stock: 2,  createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  ],
  'store-3': [
    { id: 'prod-5', storeId: 'store-3', name: 'Polera básica',   description: '100% algodón',           price: 8000,  stock: 20, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
    { id: 'prod-6', storeId: 'store-3', name: 'Jeans azul',      description: 'Corte recto',            price: 18000, stock: 8,  createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  ],
}

const MOCK_ORDERS: Record<string, Order[]> = {
  'store-1': [
    {
      id: 'order-001',
      storeId: 'store-1',
      customerName: 'Ana García',
      items: [{ productId: 'prod-1', productName: 'Anillo dorado', quantity: 2, unitPrice: 15000 }],
      total: 30000,
      status: 'pending',
      createdAt: '2024-01-15T10:00:00Z',
    },
  ],
  'store-2': [
    {
      id: 'order-002',
      storeId: 'store-2',
      customerName: 'Carlos Pérez',
      items: [{ productId: 'prod-3', productName: 'Mouse Logitech', quantity: 1, unitPrice: 25000 }],
      total: 25000,
      status: 'delivered',
      createdAt: '2024-01-16T14:00:00Z',
    },
  ],
  'store-3': [
    {
      id: 'order-003',
      storeId: 'store-3',
      customerName: 'María López',
      items: [{ productId: 'prod-5', productName: 'Polera básica', quantity: 3, unitPrice: 8000 }],
      total: 24000,
      status: 'pending',
      createdAt: '2024-01-17T09:00:00Z',
    },
  ],
}

function ProductsSection({ products }: { products: Product[] }) {
  return (
    <section style={tableStyles.card}>
      <h2 style={tableStyles.heading}>Productos</h2>
      {products.length === 0 && <p style={tableStyles.state}>No hay productos registrados.</p>}
      {products.length > 0 && (
        <div style={tableStyles.tableWrapper}>
          <table style={tableStyles.table}>
            <thead>
              <tr>
                <th style={tableStyles.th}>Nombre</th>
                <th style={{ ...tableStyles.th, ...tableStyles.thRight }}>Precio</th>
                <th style={{ ...tableStyles.th, ...tableStyles.thRight }}>Stock</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr key={p.id} style={i % 2 === 1 ? tableStyles.rowAlt : undefined}>
                  <td style={tableStyles.td}>
                    <span style={tableStyles.productName}>{p.name}</span>
                    {p.description && <span style={tableStyles.description}>{p.description}</span>}
                  </td>
                  <td style={{ ...tableStyles.td, ...tableStyles.tdRight }}>{fmt.format(p.price)}</td>
                  <td style={{ ...tableStyles.td, ...tableStyles.tdRight }}>
                    <span style={{ ...tableStyles.stockBadge, ...(p.stock <= 5 ? tableStyles.stockLow : {}) }}>
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

function OrdersSection({ orders }: { orders: Order[] }) {
  return (
    <section style={tableStyles.card}>
      <h2 style={tableStyles.heading}>Órdenes</h2>
      {orders.length === 0 && <p style={tableStyles.state}>No hay órdenes registradas.</p>}
      {orders.length > 0 && (
        <div style={tableStyles.tableWrapper}>
          <table style={tableStyles.table}>
            <thead>
              <tr>
                <th style={tableStyles.th}>ID</th>
                <th style={tableStyles.th}>Cliente</th>
                <th style={tableStyles.th}>Estado</th>
                <th style={{ ...tableStyles.th, ...tableStyles.thRight }}>Total</th>
                <th style={{ ...tableStyles.th, ...tableStyles.thRight }}>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o, i) => (
                <tr key={o.id} style={i % 2 === 1 ? tableStyles.rowAlt : undefined}>
                  <td style={tableStyles.td}>
                    <span style={tableStyles.orderId}>{o.id}</span>
                  </td>
                  <td style={tableStyles.td}>{o.customerName}</td>
                  <td style={tableStyles.td}>
                    <span style={{ ...tableStyles.badge, ...STATUS_STYLE[o.status] }}>
                      {STATUS_LABEL[o.status]}
                    </span>
                  </td>
                  <td style={{ ...tableStyles.td, ...tableStyles.tdRight }}>{fmt.format(o.total)}</td>
                  <td style={{ ...tableStyles.td, ...tableStyles.tdRight }}>
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

export default function TiendaDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const store = MOCK_STORES.find(s => s.id === id) ?? null
  const products = MOCK_PRODUCTS[id] ?? []
  const orders = MOCK_ORDERS[id] ?? []

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

  if (!store) {
    return (
      <div style={styles.container}>
        <button onClick={() => router.back()} style={styles.backBtn}>← Volver</button>
        <p style={{ ...styles.state, color: 'var(--color-danger)' }}>Tienda no encontrada</p>
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
        <ProductsSection products={products} />
        <OrdersSection orders={orders} />
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

const tableStyles: Record<string, React.CSSProperties> = {
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
