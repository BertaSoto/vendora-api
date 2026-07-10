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
      <div className="p-4 lg:p-6 lg:pb-0">
        <div className="flex items-start gap-3 lg:gap-4">
          <div
            className={`flex h-10 w-10 lg:h-12 lg:w-12 shrink-0 items-center justify-center rounded-xl text-base lg:text-lg font-bold ring-1 ${monogramClasses(store.status)}`}
          >
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm lg:text-base font-semibold text-slate-900 truncate">
                {store.name}
              </h3>
              <Badge variant={statusBadgeVariant(store.status)}>
                {statusLabel(store.status)}
              </Badge>
            </div>
            <p className="mt-0.5 text-[11px] lg:text-xs text-slate-400 font-mono truncate">
              {shortId(store.id)}
            </p>
            {store.description ? (
              <p className="mt-2 lg:mt-3 text-xs lg:text-sm text-slate-500 line-clamp-2 leading-relaxed">
                {store.description}
              </p>
            ) : (
              <p className="mt-2 lg:mt-3 text-xs lg:text-sm text-slate-300 italic">Sin descripción</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-auto">
        <div className="mx-4 border-t border-slate-100 lg:mx-6" />
        <div className="flex flex-wrap items-center gap-1.5 px-2 py-3 lg:px-3">
          <p className="mr-auto flex items-center gap-1.5 pl-1 text-[11px] lg:text-xs text-slate-400">
            <Calendar className="h-3 w-3 shrink-0" />
            <span className="hidden sm:inline">
              {new Date(store.createdAt).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
            <span className="sm:hidden">
              {new Date(store.createdAt).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
              })}
            </span>
          </p>
          <div className="flex items-center gap-0.5 lg:gap-1">
            <Link href={`/dashboard/tiendas/${store.id}`}>
              <Button variant="secondary" size="sm" type="button" className="text-xs lg:text-xs px-2 lg:px-2.5">
                <ExternalLink className="h-3.5 w-3.5" />
                <span className="hidden sm:inline ml-1">Administrar</span>
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={() => onEdit(store)} className="px-1.5 lg:px-2.5">
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(store.id)} className="px-1.5 lg:px-2.5">
              <Trash2 className="h-3.5 w-3.5 text-rose-500" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
