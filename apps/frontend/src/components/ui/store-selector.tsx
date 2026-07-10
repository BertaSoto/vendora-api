'use client'

import { Store } from 'lucide-react'
import type { Store as StoreType } from '@/types'

interface StoreSelectorProps {
  stores: StoreType[]
  selectedId: string | null
  onChange: (storeId: string) => void
}

export function StoreSelector({ stores, selectedId, onChange }: StoreSelectorProps) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
        <Store className="h-4 w-4 text-slate-500" />
      </div>
      <select
        value={selectedId ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-700 transition-all duration-150 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
      >
        <option value="" disabled>
          Seleccionar tienda...
        </option>
        {stores.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
    </div>
  )
}
