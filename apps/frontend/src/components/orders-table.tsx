'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
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
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80">
              <th className="px-3 py-3 text-left text-[10px] lg:text-xs font-semibold uppercase tracking-wider text-slate-400 lg:px-5 lg:py-3.5">
                Producto
              </th>
              <th className="px-2 py-3 text-center text-[10px] lg:text-xs font-semibold uppercase tracking-wider text-slate-400 lg:px-5 lg:py-3.5">
                Cant.
              </th>
              <th className="px-3 py-3 text-right text-[10px] lg:text-xs font-semibold uppercase tracking-wider text-slate-400 lg:px-5 lg:py-3.5">
                Total
              </th>
              <th className="px-2 py-3 text-center text-[10px] lg:text-xs font-semibold uppercase tracking-wider text-slate-400 lg:px-5 lg:py-3.5">
                Estado
              </th>
              <th className="px-2 py-3 text-center text-[10px] lg:text-xs font-semibold uppercase tracking-wider text-slate-400 lg:px-5 lg:py-3.5">
                Fecha
              </th>
              <th className="px-2 py-3 text-right text-[10px] lg:text-xs font-semibold uppercase tracking-wider text-slate-400 lg:px-5 lg:py-3.5">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
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
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({})

  useEffect(() => {
    if (!menuOpen) return

    function updatePosition() {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect()
        setMenuStyle({
          position: 'fixed',
          top: rect.bottom + 4,
          right: window.innerWidth - rect.right,
          zIndex: 50,
        })
      }
    }

    updatePosition()
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)

    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [menuOpen])

  return (
    <tr className="transition-colors hover:bg-slate-50/50">
      <td className="px-3 py-3 text-sm font-medium text-slate-900 lg:px-5 lg:py-4">
        {order.productName ?? (
          <span className="text-slate-300">—</span>
        )}
      </td>
      <td className="px-2 py-3 text-center text-xs lg:text-sm text-slate-600 lg:px-5 lg:py-4">
        <span className="inline-flex items-center justify-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] lg:text-xs font-semibold text-slate-600">
          x{order.quantity}
        </span>
      </td>
      <td className="px-3 py-3 text-right text-xs lg:text-sm font-semibold text-slate-900 tabular-nums lg:px-5 lg:py-4">
        {formatCLP(order.total)}
      </td>
      <td className="px-2 py-3 text-center lg:px-5 lg:py-4">
        <Badge variant={statusBadgeVariant(order.status)}>
          {statusLabel(order.status)}
        </Badge>
      </td>
      <td className="px-2 py-3 text-center text-[10px] lg:text-xs text-slate-400 lg:px-5 lg:py-4">
        {new Date(order.createdAt).toLocaleDateString('es-ES')}
      </td>
      <td className="px-2 py-3 text-right lg:px-5 lg:py-4">
        <button
          ref={triggerRef}
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
        {menuOpen &&
          createPortal(
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
              />
              <div
                style={menuStyle}
                className="w-48 rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg"
              >
                <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
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
                      className={`block w-full px-3 py-1.5 text-left text-sm transition-colors hover:bg-slate-50 ${
                        order.status === status
                          ? 'font-semibold text-brand-600'
                          : 'text-slate-600'
                      }`}
                    >
                      {statusLabel(status)}
                    </button>
                  ),
                )}
                <div className="mx-2 my-1 border-t border-slate-100" />
                <button
                  onClick={() => {
                    onDelete(order.id)
                    setMenuOpen(false)
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm text-rose-600 transition-colors hover:bg-rose-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Eliminar
                </button>
              </div>
            </>,
            document.body,
          )}
      </td>
    </tr>
  )
}
