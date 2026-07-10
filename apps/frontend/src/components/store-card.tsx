'use client'

import Link from 'next/link'
import { Pencil, Trash2, ExternalLink, Calendar } from 'lucide-react'
import { Badge, statusBadgeVariant, statusLabel } from './ui/badge'
import { Button } from './ui/button'
import type { Store } from '@/types'

interface StoreCardProps {
  store: Store
  onEdit: (store: Store) => void
  onDelete: (id: string) => void
}

function monogramClasses(status: string) {
  switch (status) {
    case 'ACTIVE':
      return 'bg-emerald-100 text-emerald-700 ring-emerald-200'
    case 'TRIAL':
      return 'bg-amber-100 text-amber-700 ring-amber-200'
    case 'SUSPENDED':
      return 'bg-rose-100 text-rose-700 ring-rose-200'
    default:
      return 'bg-slate-100 text-slate-600 ring-slate-200'
  }
}

function shortId(id: string) {
  return id.length > 8 ? id.slice(0, 8) : id
}

export function StoreCard({ store, onEdit, onDelete }: StoreCardProps) {
  const initial = store.name.charAt(0).toUpperCase()

  return (
    <div className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:border-slate-300">
      <div className="p-6 pb-0">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold ring-1 ${monogramClasses(store.status)}`}
          >
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-base font-semibold text-slate-900 truncate">
                {store.name}
              </h3>
              <Badge variant={statusBadgeVariant(store.status)}>
                {statusLabel(store.status)}
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-slate-400 font-mono">
              {shortId(store.id)}
            </p>
            {store.description ? (
              <p className="mt-3 text-sm text-slate-500 line-clamp-2 leading-relaxed">
                {store.description}
              </p>
            ) : (
              <p className="mt-3 text-sm text-slate-300 italic">Sin descripción</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-auto">
        <div className="mx-6 border-t border-slate-100" />
        <div className="flex items-center gap-1 px-3 py-3">
          <p className="mr-auto flex items-center gap-1.5 pl-1 text-xs text-slate-400">
            <Calendar className="h-3 w-3" />
            {new Date(store.createdAt).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </p>
          <div className="flex items-center gap-1">
            <Link href={`/dashboard/tiendas/${store.id}`}>
              <Button variant="secondary" size="sm" type="button">
                <ExternalLink className="h-3.5 w-3.5" />
                Administrar
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={() => onEdit(store)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(store.id)}>
              <Trash2 className="h-3.5 w-3.5 text-rose-500" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
