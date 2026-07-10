'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { storesApi } from '@/api/stores'
import { ordersApi } from '@/api/orders'
import { StoreSelector } from '@/components/ui/store-selector'
import { OrdersTable } from '@/components/orders-table'
import { TableSkeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { ConfirmModal } from '@/components/ui/modal'
import type { Store, Order } from '@/types'

export default function OrdenesPage() {
  const [stores, setStores] = useState<Store[]>([])
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    storesApi.list().then(setStores).catch(() => {})
  }, [])

  useEffect(() => {
    if (selectedStoreId) loadOrders()
  }, [selectedStoreId])

  async function loadOrders() {
    if (!selectedStoreId) return
    setLoading(true)
    try {
      const data = await ordersApi.listByStore(selectedStoreId)
      setOrders(data)
      setError(null)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdateStatus(orderId: string, status: string) {
    try {
      await ordersApi.updateStatus(orderId, {
        status: status as Order['status'],
      })
      toast.success('Estado actualizado')
      await loadOrders()
    } catch (err) {
      toast.error((err as Error).message)
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    try {
      await ordersApi.remove(deleteId)
      toast.success('Orden eliminada')
      await loadOrders()
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
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Órdenes</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {selectedStoreId
              ? `${orders.length} ${orders.length === 1 ? 'orden' : 'órdenes'}`
              : 'Selecciona una tienda para ver sus órdenes'}
          </p>
        </div>
        <StoreSelector
          stores={stores}
          selectedId={selectedStoreId}
          onChange={setSelectedStoreId}
        />
      </div>

      {!selectedStoreId ? (
        <EmptyState
          title="Selecciona una tienda"
          description="Elige una tienda del selector para ver y gestionar sus órdenes."
        />
      ) : error ? (
        <ErrorState message={error} onRetry={loadOrders} />
      ) : loading ? (
        <TableSkeleton rows={6} />
      ) : orders.length === 0 ? (
        <EmptyState
          title="No hay órdenes todavía"
          description="Las órdenes aparecerán aquí cuando los clientes realicen compras en tu tienda."
        />
      ) : (
        <OrdersTable
          orders={orders}
          onDelete={(id) => setDeleteId(id)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Eliminar orden"
        description="¿Estás seguro? Esta acción no se puede deshacer."
        confirmLabel="Eliminar orden"
        loading={deleting}
      />
    </div>
  )
}
