'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { ArrowLeft, Plus, X } from 'lucide-react'
import { storesApi } from '@/api/stores'
import { productsApi } from '@/api/products'
import { ordersApi } from '@/api/orders'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge, statusBadgeVariant, statusLabel } from '@/components/ui/badge'
import { ProductCard } from '@/components/product-card'
import { OrdersTable } from '@/components/orders-table'
import { CardSkeleton, TableSkeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { ConfirmModal } from '@/components/ui/modal'
import type { Store, Product, Order, OrderStatus } from '@/types'

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
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
  })
  const [saving, setSaving] = useState(false)

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteType, setDeleteType] = useState<'product' | 'order'>('product')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadData()
  }, [storeId])

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
    setProductForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      stock: String(p.stock),
    })
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
        toast.success('Producto actualizado')
      } else {
        await productsApi.create({ ...dto, storeId })
        toast.success('Producto creado')
      }
      resetProductForm()
      await loadData()
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdateStock(productId: string, currentStock: number) {
    const newStock = prompt('Nuevo stock:', String(currentStock))
    if (newStock === null || isNaN(Number(newStock)) || Number(newStock) < 0) return
    try {
      await productsApi.updateStock(productId, { stock: Number(newStock) })
      toast.success('Stock actualizado')
      await loadData()
    } catch (err) {
      toast.error((err as Error).message)
    }
  }

  async function handleCreateOrder(productId: string) {
    const qty = prompt('Cantidad:', '1')
    if (!qty || isNaN(Number(qty)) || Number(qty) < 1) return
    try {
      await ordersApi.create({ storeId, productId, quantity: Number(qty) })
      toast.success('Orden creada')
      await loadData()
    } catch (err) {
      toast.error((err as Error).message)
    }
  }

  async function handleUpdateOrderStatus(orderId: string, status: string) {
    try {
      await ordersApi.updateStatus(orderId, {
        status: status as OrderStatus,
      })
      toast.success('Estado actualizado')
      await loadData()
    } catch (err) {
      toast.error((err as Error).message)
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    try {
      if (deleteType === 'product') await productsApi.remove(deleteId)
      else await ordersApi.remove(deleteId)
      toast.success(deleteType === 'product' ? 'Producto eliminado' : 'Orden eliminada')
      await loadData()
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  if (loading) {
    return (
      <div>
        <CardSkeleton />
        <div className="mt-6">
          <TableSkeleton rows={4} />
        </div>
      </div>
    )
  }

  if (error) return <ErrorState message={error} onRetry={loadData} />
  if (!store) return <ErrorState message="Tienda no encontrada" />

  return (
    <div>
      <Link
        href="/dashboard/tiendas"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-brand-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a tiendas
      </Link>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{store.name}</h1>
          {store.description && (
            <p className="mt-1 text-sm text-slate-500">{store.description}</p>
          )}
        </div>
        <Badge variant={statusBadgeVariant(store.status)}>
          {statusLabel(store.status)}
        </Badge>
      </div>
      <p className="-mt-4 mb-6 text-xs text-slate-400 font-mono">Slug: {store.slug}</p>

      <div className="mb-6 flex border-b border-slate-200">
        <button
          onClick={() => setTab('products')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
            tab === 'products'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Productos ({products.length})
        </button>
        <button
          onClick={() => setTab('orders')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
            tab === 'orders'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Órdenes ({orders.length})
        </button>
      </div>

      {tab === 'products' && (
        <div>
          <div className="mb-4">
            <Button onClick={() => setShowProductForm(!showProductForm)}>
              {showProductForm ? (
                <>
                  <X className="h-4 w-4" /> Cancelar
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" /> Nuevo producto
                </>
              )}
            </Button>
          </div>

          {showProductForm && (
            <Card className="mb-6">
              <form onSubmit={handleProductSubmit} className="flex flex-col gap-4">
                <h2 className="text-sm font-semibold text-slate-700">
                  {editingProductId ? 'Editar producto' : 'Nuevo producto'}
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Input
                    placeholder="Nombre"
                    value={productForm.name}
                    onChange={(e) =>
                      setProductForm((p) => ({ ...p, name: e.target.value }))
                    }
                    required
                  />
                  <Input
                    placeholder="Descripción"
                    value={productForm.description}
                    onChange={(e) =>
                      setProductForm((p) => ({ ...p, description: e.target.value }))
                    }
                  />
                  <Input
                    placeholder="Precio"
                    type="number"
                    min="0"
                    step="1"
                    value={productForm.price}
                    onChange={(e) =>
                      setProductForm((p) => ({ ...p, price: e.target.value }))
                    }
                    required
                  />
                  <Input
                    placeholder="Stock"
                    type="number"
                    min="0"
                    value={productForm.stock}
                    onChange={(e) =>
                      setProductForm((p) => ({ ...p, stock: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={saving}>
                    {saving
                      ? 'Guardando...'
                      : editingProductId
                        ? 'Actualizar'
                        : 'Crear'}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {products.length === 0 ? (
            <EmptyState
              title="No hay productos"
              description="Crea tu primer producto en esta tienda."
              action={
                <Button onClick={() => setShowProductForm(true)}>
                  <Plus className="h-4 w-4" /> Nuevo producto
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onEdit={startEditProduct}
                  onDelete={(id) => {
                    setDeleteId(id)
                    setDeleteType('product')
                  }}
                  onUpdateStock={handleUpdateStock}
                  onCreateOrder={handleCreateOrder}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'orders' && (
        <div>
          {orders.length === 0 ? (
            <EmptyState
              title="No hay órdenes"
              description="Crea productos y genera órdenes desde la pestaña de productos."
            />
          ) : (
            <OrdersTable
              orders={orders}
              onDelete={(id) => {
                setDeleteId(id)
                setDeleteType('order')
              }}
              onUpdateStatus={handleUpdateOrderStatus}
            />
          )}
        </div>
      )}

      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title={deleteType === 'product' ? 'Eliminar producto' : 'Eliminar orden'}
        description="¿Estás seguro? Esta acción no se puede deshacer."
        confirmLabel={deleteType === 'product' ? 'Eliminar producto' : 'Eliminar orden'}
        loading={deleting}
      />
    </div>
  )
}
