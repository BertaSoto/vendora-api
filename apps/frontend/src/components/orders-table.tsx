'use client'

import { useState } from 'react'
import { Trash2, MoreHorizontal } from 'lucide-react'
import { Button } from './ui/button'
import { Badge, statusBadgeVariant, statusLabel } from './ui/badge'
import type { Order, OrderStatus } from '@/types'
import { formatCLP } from '@/lib/format'

interface OrdersTableProps {
  orders: Order[]
  onDelete: (id: string) => void
  onUpdateStatus: (id: string, status: string) => void
}

export function OrdersTable({ orders, onDelete, onUpdateStatus }: OrdersTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Producto
              </th>
              <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                Cant.
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total
              </th>
              <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                Estado
              </th>
              <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                Fecha
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => (
              <OrderRow
                key={order.id}
                order={order}
                onDelete={onDelete}
                onUpdateStatus={onUpdateStatus}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function OrderRow({
  order,
  onDelete,
  onUpdateStatus,
}: {
  order: Order
  onDelete: (id: string) => void
  onUpdateStatus: (id: string, status: string) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <tr className="hover:bg-slate-50/50 transition-colors">
      <td className="px-5 py-3.5 text-sm font-medium text-slate-900">
        {order.productName ?? '—'}
      </td>
      <td className="px-5 py-3.5 text-center text-sm text-slate-600">
        x{order.quantity}
      </td>
      <td className="px-5 py-3.5 text-right text-sm font-semibold text-slate-900">
        {formatCLP(order.total)}
      </td>
      <td className="px-5 py-3.5 text-center">
        <Badge variant={statusBadgeVariant(order.status)}>
          {statusLabel(order.status)}
        </Badge>
      </td>
      <td className="px-5 py-3.5 text-center text-xs text-slate-400">
        {new Date(order.createdAt).toLocaleDateString('es-ES')}
      </td>
      <td className="px-5 py-3.5 text-right">
        <div className="relative inline-block">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 z-20 mt-1 w-44 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                <div className="px-3 py-1.5 text-xs font-semibold text-slate-400">
                  Cambiar estado
                </div>
                {(['pending', 'confirmed', 'delivered', 'cancelled'] as OrderStatus[]).map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => {
                        onUpdateStatus(order.id, status)
                        setMenuOpen(false)
                      }}
                      className={`block w-full px-3 py-1.5 text-left text-sm hover:bg-slate-50 ${
                        order.status === status
                          ? 'font-semibold text-brand-600'
                          : 'text-slate-600'
                      }`}
                    >
                      {statusLabel(status)}
                    </button>
                  ),
                )}
                <div className="border-t border-slate-100 mt-1 pt-1">
                  <button
                    onClick={() => {
                      onDelete(order.id)
                      setMenuOpen(false)
                    }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Eliminar
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </td>
    </tr>
  )
}
