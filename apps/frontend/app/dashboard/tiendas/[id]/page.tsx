'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { storesApi } from '../../../../src/api/stores'
import { productsApi } from '../../../../src/api/products'
import { ordersApi } from '../../../../src/api/orders'
import type { Store, Product, Order } from '../../../../src/types'

export default function TiendaDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const storeId = params.id

  const [store, setStore] = useState<Store | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<'products' | 'orders'>('products')

  const [showProductForm, setShowProductForm] = useState(false)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [productForm, setProductForm] = useState({ name: '', description: '', price: '', stock: '' })
  const [saving, setSaving] = useState(false)

  const [editingOrderStatus, setEditingOrderStatus] = useState<string | null>(null)

  useEffect(() => { loadData() }, [storeId])

  async function loadData() {
    setLoading(true)
    try {
      const [storeData, productsData, ordersData] = await Promise.all([
        storesApi.getById(storeId),
        productsApi.listByStore(storeId),
        ordersApi.listByStore(storeId),
      ])
      setStore(storeData)
      setProducts(productsData)
      setOrders(ordersData)
      setError(null)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  function resetProductForm() {
    setProductForm({ name: '', description: '', price: '', stock: '' })
    setEditingProductId(null)
    setShowProductForm(false)
  }

  function startEditProduct(p: Product) {
    setProductForm({ name: p.name, description: p.description, price: String(p.price), stock: String(p.stock) })
    setEditingProductId(p.id)
    setShowProductForm(true)
  }

  async function handleProductSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const dto = {
        name: productForm.name,
        description: productForm.description,
        price: Number(productForm.price),
        stock: Number(productForm.stock),
      }
      if (editingProductId) {
        await productsApi.update(editingProductId, dto)
      } else {
        await productsApi.create({ ...dto, storeId })
      }
      resetProductForm()
      await loadData()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdateStock(productId: string, newStock: number) {
    try {
      await productsApi.updateStock(productId, { stock: newStock })
      await loadData()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  async function handleDeleteProduct(id: string) {
    if (!confirm('¿Eliminar este producto?')) return
    try {
      await productsApi.remove(id)
      await loadData()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  async function handleCreateOrder(productId: string) {
    setError(null)
    const qty = prompt('Cantidad:', '1')
    if (!qty || isNaN(Number(qty)) || Number(qty) < 1) return
    try {
      await ordersApi.create({ storeId, productId, quantity: Number(qty) })
      await loadData()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  async function handleUpdateOrderStatus(orderId: string, status: string) {
    try {
      await ordersApi.updateStatus(orderId, { status: status as Order['status'] })
      setEditingOrderStatus(null)
      await loadData()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  async function handleDeleteOrder(id: string) {
    if (!confirm('¿Eliminar esta orden?')) return
    try {
      await ordersApi.remove(id)
      await loadData()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const statusColor: Record<string, string> = { active: 'var(--color-success)', suspended: 'var(--color-danger)', trial: 'var(--color-warning)' }
  const orderStatusColor: Record<string, string> = { pending: 'var(--color-warning)', confirmed: '#6366f1', delivered: 'var(--color-success)', cancelled: 'var(--color-danger)' }

  if (loading) return <p style={styles.muted}>Cargando...</p>
  if (error) return <p style={styles.error}>Error: {error}</p>
  if (!store) return <p style={styles.muted}>Tienda no encontrada</p>

  return (
    <div>
      <Link href="/dashboard/tiendas" style={styles.backLink}>← Volver a tiendas</Link>

      <div style={styles.storeHeader}>
        <h1 style={styles.title}>{store.name}</h1>
        <span style={{ ...styles.status, color: statusColor[store.status] || 'var(--color-text-muted)' }}>{store.status}</span>
      </div>
      {store.description && <p style={styles.muted}>{store.description}</p>}
      <p style={styles.muted}>Slug: {store.slug}</p>

      <div style={styles.tabs}>
        <button onClick={() => setTab('products')} style={tabStyle(tab === 'products')}>
          Productos ({products.length})
        </button>
        <button onClick={() => setTab('orders')} style={tabStyle(tab === 'orders')}>
          Órdenes ({orders.length})
        </button>
      </div>

      {tab === 'products' && (
        <div>
          <button onClick={() => setShowProductForm(!showProductForm)} style={styles.addBtn}>
            {showProductForm ? 'Cancelar' : '+ Nuevo producto'}
          </button>

          {showProductForm && (
            <form onSubmit={handleProductSubmit} style={styles.form}>
              <input placeholder="Nombre" value={productForm.name} onChange={e => setProductForm(p => ({ ...p, name: e.target.value }))} required style={styles.input} />
              <input placeholder="Descripción" value={productForm.description} onChange={e => setProductForm(p => ({ ...p, description: e.target.value }))} style={styles.input} />
              <input placeholder="Precio" type="number" min="0" step="0.01" value={productForm.price} onChange={e => setProductForm(p => ({ ...p, price: e.target.value }))} required style={styles.input} />
              <input placeholder="Stock" type="number" min="0" value={productForm.stock} onChange={e => setProductForm(p => ({ ...p, stock: e.target.value }))} required style={styles.input} />
              <button type="submit" disabled={saving} style={styles.saveBtn}>{saving ? 'Guardando...' : editingProductId ? 'Actualizar' : 'Crear'}</button>
            </form>
          )}

          {products.length === 0 ? (
            <p style={styles.muted}>No hay productos.</p>
          ) : (
            <div style={styles.grid}>
              {products.map(p => (
                <div key={p.id} style={styles.cardSmall}>
                  <p style={styles.cardName}>{p.name}</p>
                  <p style={styles.muted}>{p.description || 'Sin descripción'}</p>
                  <p>${p.price} — Stock: {p.stock}</p>
                  <div style={styles.cardActions}>
                    <button onClick={() => startEditProduct(p)} style={styles.editBtn}>Editar</button>
                    <button onClick={() => handleUpdateStock(p.id, p.stock)} style={styles.stockBtn}>Cambiar stock</button>
                    <button onClick={() => handleCreateOrder(p.id)} style={styles.orderBtn}>Crear orden</button>
                    <button onClick={() => handleDeleteProduct(p.id)} style={styles.deleteBtn}>Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'orders' && (
        <div>
          {orders.length === 0 ? (
            <p style={styles.muted}>No hay órdenes.</p>
          ) : (
            <div style={styles.grid}>
              {orders.map(o => (
                <div key={o.id} style={styles.cardSmall}>
                  <p style={styles.cardName}>{o.productName || 'Producto'} x{o.quantity}</p>
                  <p style={styles.muted}>Total: ${o.total}</p>
                  <span style={{ ...styles.statusBadge, color: orderStatusColor[o.status] || 'var(--color-text-muted)' }}>{o.status}</span>
                  <div style={styles.cardActions}>
                    {editingOrderStatus === o.id ? (
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {['pending', 'confirmed', 'delivered', 'cancelled'].map(s => (
                          <button key={s} onClick={() => handleUpdateOrderStatus(o.id, s)} style={styles.smallBtn}>{s}</button>
                        ))}
                        <button onClick={() => setEditingOrderStatus(null)} style={styles.mutedBtn}>x</button>
                      </div>
                    ) : (
                      <button onClick={() => setEditingOrderStatus(o.id)} style={styles.stockBtn}>Cambiar estado</button>
                    )}
                    <button onClick={() => handleDeleteOrder(o.id)} style={styles.deleteBtn}>Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function tabStyle(active: boolean): React.CSSProperties {
  return {
    padding: '8px 20px',
    border: 'none',
    borderBottom: active ? '2px solid var(--color-primary)' : '2px solid transparent',
    backgroundColor: 'transparent',
    color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
    fontSize: '0.9rem',
    fontWeight: active ? 600 : 400,
    cursor: 'pointer',
  }
}

const styles: Record<string, React.CSSProperties> = {
  backLink: { color: 'var(--color-primary)', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '12px', display: 'inline-block' },
  storeHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' },
  title: { fontSize: '1.5rem', fontWeight: 700 },
  status: { fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' },
  statusBadge: { fontSize: '0.8rem', fontWeight: 600 },
  tabs: { display: 'flex', gap: '0', borderBottom: '1px solid var(--color-border)', margin: '20px 0 16px' },
  addBtn: {
    padding: '6px 14px',
    borderRadius: 'var(--radius)',
    backgroundColor: 'var(--color-primary)',
    color: 'white',
    border: 'none',
    fontSize: '0.85rem',
    cursor: 'pointer',
    fontWeight: 600,
    marginBottom: '12px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '14px',
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius)',
    marginBottom: '16px',
    maxWidth: '480px',
  },
  input: {
    padding: '8px 12px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--color-border)',
    fontSize: '0.9rem',
    outline: 'none',
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
  },
  saveBtn: {
    padding: '8px 16px',
    borderRadius: 'var(--radius)',
    backgroundColor: 'var(--color-success)',
    color: 'white',
    border: 'none',
    fontSize: '0.9rem',
    cursor: 'pointer',
    fontWeight: 600,
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px', marginTop: '12px' },
  cardSmall: {
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius)',
    padding: '14px',
    boxShadow: 'var(--shadow)',
  },
  cardName: { fontSize: '1rem', fontWeight: 600, marginBottom: '4px' },
  cardActions: { display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' },
  editBtn: {
    padding: '3px 10px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--color-primary)',
    backgroundColor: 'transparent',
    color: 'var(--color-primary)',
    fontSize: '0.75rem',
    cursor: 'pointer',
  },
  stockBtn: {
    padding: '3px 10px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--color-warning)',
    backgroundColor: 'transparent',
    color: 'var(--color-warning)',
    fontSize: '0.75rem',
    cursor: 'pointer',
  },
  orderBtn: {
    padding: '3px 10px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--color-success)',
    backgroundColor: 'transparent',
    color: 'var(--color-success)',
    fontSize: '0.75rem',
    cursor: 'pointer',
  },
  deleteBtn: {
    padding: '3px 10px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--color-danger)',
    backgroundColor: 'transparent',
    color: 'var(--color-danger)',
    fontSize: '0.75rem',
    cursor: 'pointer',
  },
  smallBtn: {
    padding: '2px 8px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
    fontSize: '0.7rem',
    cursor: 'pointer',
  },
  mutedBtn: {
    padding: '2px 8px',
    borderRadius: 'var(--radius)',
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--color-text-muted)',
    fontSize: '0.7rem',
    cursor: 'pointer',
  },
  error: { color: 'var(--color-danger)', fontSize: '0.9rem', marginBottom: '12px' },
  muted: { color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '4px' },
}
