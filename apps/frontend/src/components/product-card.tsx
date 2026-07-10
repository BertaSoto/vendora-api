'use client'

import { Pencil, Trash2, PackagePlus, Hash } from 'lucide-react'
import { Button } from './ui/button'
import type { Product } from '@/types'
import { formatCLP } from '@/lib/format'

interface ProductCardProps {
  product: Product
  onEdit: (product: Product) => void
  onDelete: (id: string) => void
  onUpdateStock: (id: string, stock: number) => void
  onCreateOrder: (productId: string) => void
}

export function ProductCard({
  product,
  onEdit,
  onDelete,
  onUpdateStock,
  onCreateOrder,
}: ProductCardProps) {
  const isLowStock = product.stock <= 5
  const isOutOfStock = product.stock === 0

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-4 lg:p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:border-slate-300">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm lg:text-base font-semibold text-slate-900 break-words">{product.name}</h3>
        <span className="shrink-0 text-base lg:text-lg font-bold text-brand-600 tabular-nums">
          {formatCLP(product.price)}
        </span>
      </div>

      {product.description ? (
        <p className="mt-1.5 text-xs lg:text-sm text-slate-500 line-clamp-2 leading-relaxed">
          {product.description}
        </p>
      ) : (
        <p className="mt-1.5 text-xs lg:text-sm text-slate-300 italic">Sin descripción</p>
      )}

      <div className="mt-3 lg:mt-4 flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 lg:px-2.5 lg:py-1 text-[11px] lg:text-xs font-semibold ${
            isOutOfStock
              ? 'border-rose-200 bg-rose-50 text-rose-700'
              : isLowStock
                ? 'border-amber-200 bg-amber-50 text-amber-700'
                : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}
        >
          <Hash className="h-3 w-3" />
          Stock: {product.stock}
        </span>
      </div>

      <div className="mt-4 lg:mt-5 flex flex-wrap items-center gap-1 border-t border-slate-100 pt-3 lg:pt-4">
        <Button variant="outline" size="sm" onClick={() => onEdit(product)}>
          <Pencil className="h-3.5 w-3.5" />
          Editar
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onUpdateStock(product.id, product.stock)}>
          <Hash className="h-3.5 w-3.5" />
          Stock
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onCreateOrder(product.id)}>
          <PackagePlus className="h-3.5 w-3.5" />
          Orden
        </Button>
        <div className="flex-1" />
        <Button variant="ghost" size="sm" onClick={() => onDelete(product.id)}>
          <Trash2 className="h-3.5 w-3.5 text-rose-500" />
        </Button>
      </div>
    </div>
  )
}
