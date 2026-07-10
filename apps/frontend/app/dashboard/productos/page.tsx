'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Plus, X } from 'lucide-react'
import { storesApi } from '@/api/stores'
import { productsApi } from '@/api/products'
import { ordersApi } from '@/api/orders'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { StoreSelector } from '@/components/ui/store-selector'
import { ProductCard } from '@/components/product-card'
import { CardSkeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { ConfirmModal } from '@/components/ui/modal'
import type { Store, Product } from '@/types'

export default function ProductosPage() {
  const [stores, setStores] = useState<Store[]>([])
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
  })
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    storesApi.list().then(setStores).catch(() => {})
  }, [])

  useEffect(() => {
    if (selectedStoreId) loadProducts()
  }, [selectedStoreId])

  async function loadProducts() {
    if (!selectedStoreId) return
    setLoading(true)
    try {
      const data = await productsApi.listByStore(selectedStoreId)
      setProducts(data)
      setError(null)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setForm({ name: '', description: '', price: '', stock: '' })
    setEditingId(null)
    setShowForm(false)
  }

  function startEdit(p: Product) {
    setForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      stock: String(p.stock),
    })
    setEditingId(p.id)
    setShowForm(true)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!selectedStoreId) return
    setSaving(true)
    try {
      const dto = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock),
      }
      if (editingId) {
        await productsApi.update(editingId, dto)
        toast.success('Producto actualizado')
      } else {
        await productsApi.create({ ...dto, storeId: selectedStoreId })
        toast.success('Producto creado')
      }
      resetForm()
      await loadProducts()
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
      await loadProducts()
    } catch (err) {
      toast.error((err as Error).message)
    }
  }

  async function handleCreateOrder(productId: string) {
    if (!selectedStoreId) return
    const qty = prompt('Cantidad:', '1')
    if (!qty || isNaN(Number(qty)) || Number(qty) < 1) return
    try {
      await ordersApi.create({
        storeId: selectedStoreId,
        productId,
        quantity: Number(qty),
      })
      toast.success('Orden creada correctamente')
      await loadProducts()
    } catch (err) {
      toast.error((err as Error).message)
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    try {
      await productsApi.remove(deleteId)
      toast.success('Producto eliminado')
      await loadProducts()
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Productos</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {selectedStoreId
              ? `${products.length} ${products.length === 1 ? 'producto' : 'productos'}`
              : 'Selecciona una tienda para ver sus productos'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StoreSelector
            stores={stores}
            selectedId={selectedStoreId}
            onChange={setSelectedStoreId}
          />
          {selectedStoreId && (
            <Button onClick={() => setShowForm(!showForm)} size="lg">
              {showForm ? (
                <>
                  <X className="h-4 w-4" /> Cancelar
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" /> Nuevo producto
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {showForm && (
        <Card className="mb-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-slate-700">
              {editingId ? 'Editar producto' : 'Nuevo producto'}
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                placeholder="Nombre del producto"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                required
              />
              <Input
                placeholder="Descripción"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
              />
              <Input
                placeholder="Precio (CLP)"
                type="number"
                min="0"
                step="1"
                value={form.price}
                onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                required
              />
              <Input
                placeholder="Stock inicial"
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))}
                required
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear producto'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {!selectedStoreId ? (
        <EmptyState
          title="Selecciona una tienda"
          description="Elige una tienda del selector para ver y administrar sus productos."
        />
      ) : error ? (
        <ErrorState message={error} onRetry={loadProducts} />
      ) : loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          title="No hay productos todavía"
          description="Crea tu primer producto en esta tienda para empezar a recibir órdenes."
          action={
            <Button onClick={() => setShowForm(true)} size="lg">
              <Plus className="h-4 w-4" />
              Nuevo producto
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onEdit={startEdit}
              onDelete={(id) => setDeleteId(id)}
              onUpdateStock={handleUpdateStock}
              onCreateOrder={handleCreateOrder}
            />
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Eliminar producto"
        description="¿Estás seguro? Esta acción no se puede deshacer."
        confirmLabel="Eliminar producto"
        loading={deleting}
      />
    </div>
  )
}
