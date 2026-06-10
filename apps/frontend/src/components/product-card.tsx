'use client'

import { Pencil, Trash2, PackagePlus, Hash } from 'lucide-react'
import { Card } from './ui/card'
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

  return (
    <Card hover>
      <div className="flex items-start justify-between">
        <h3 className="text-base font-semibold text-slate-900">{product.name}</h3>
        <span className="text-lg font-bold text-brand-600">
          {formatCLP(product.price)}
        </span>
      </div>

      {product.description && (
        <p className="mt-1 text-sm text-slate-500 line-clamp-2">{product.description}</p>
      )}

      <div className="mt-3 flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            isLowStock
              ? 'bg-red-50 text-red-700'
              : 'bg-emerald-50 text-emerald-700'
          }`}
        >
          <Hash className="h-3 w-3" />
          Stock: {product.stock}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-3">
        <Button variant="outline" size="sm" onClick={() => onEdit(product)}>
          <Pencil className="h-3.5 w-3.5" />
          Editar
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onUpdateStock(product.id, product.stock)}
        >
          <Hash className="h-3.5 w-3.5" />
          Stock
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onCreateOrder(product.id)}
        >
          <PackagePlus className="h-3.5 w-3.5" />
          Orden
        </Button>
        <div className="flex-1" />
        <Button variant="ghost" size="sm" onClick={() => onDelete(product.id)}>
          <Trash2 className="h-3.5 w-3.5 text-red-500" />
        </Button>
      </div>
    </Card>
  )
}
