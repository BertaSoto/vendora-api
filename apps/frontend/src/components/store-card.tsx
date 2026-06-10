'use client'

import Link from 'next/link'
import { Pencil, Trash2, ExternalLink } from 'lucide-react'
import { Card } from './ui/card'
import { Badge, statusBadgeVariant, statusLabel } from './ui/badge'
import { Button } from './ui/button'
import type { Store } from '@/types'

interface StoreCardProps {
  store: Store
  onEdit: (store: Store) => void
  onDelete: (id: string) => void
}

export function StoreCard({ store, onEdit, onDelete }: StoreCardProps) {
  return (
    <Card hover>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <Link
            href={`/dashboard/tiendas/${store.id}`}
            className="text-base font-semibold text-slate-900 hover:text-brand-600 transition-colors truncate block"
          >
            {store.name}
          </Link>
          <p className="mt-0.5 text-xs text-slate-400 font-mono">{store.slug}</p>
        </div>
        <Badge variant={statusBadgeVariant(store.status)}>
          {statusLabel(store.status)}
        </Badge>
      </div>

      {store.description && (
        <p className="mt-2 text-sm text-slate-500 line-clamp-2">{store.description}</p>
      )}

      <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
        <Button variant="outline" size="sm" onClick={() => onEdit(store)}>
          <Pencil className="h-3.5 w-3.5" />
          Editar
        </Button>
        <Link href={`/dashboard/tiendas/${store.id}`}>
          <Button variant="ghost" size="sm">
            <ExternalLink className="h-3.5 w-3.5" />
            Ver
          </Button>
        </Link>
        <div className="flex-1" />
        <Button variant="ghost" size="sm" onClick={() => onDelete(store.id)}>
          <Trash2 className="h-3.5 w-3.5 text-red-500" />
        </Button>
      </div>
    </Card>
  )
}
