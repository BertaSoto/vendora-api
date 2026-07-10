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
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-slate-900 truncate">
            {store.name}
          </h3>
          <p className="mt-1 text-xs text-slate-400 font-mono truncate">{store.slug}</p>
        </div>
        <Badge variant={statusBadgeVariant(store.status)}>
          {statusLabel(store.status)}
        </Badge>
      </div>

      {store.description && (
        <p className="mt-3 text-sm text-slate-500 line-clamp-2 leading-relaxed">
          {store.description}
        </p>
      )}

      <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
        <Button variant="outline" size="sm" onClick={() => onEdit(store)}>
          <Pencil className="h-3.5 w-3.5" />
          Editar
        </Button>
        <Link href={`/dashboard/tiendas/${store.id}`}>
          <Button variant="secondary" size="sm" type="button">
            <ExternalLink className="h-3.5 w-3.5" />
            Ver
          </Button>
        </Link>
        <div className="flex-1" />
        <Button variant="ghost" size="sm" onClick={() => onDelete(store.id)}>
          <Trash2 className="h-3.5 w-3.5 text-rose-500" />
        </Button>
      </div>
    </Card>
  )
}
