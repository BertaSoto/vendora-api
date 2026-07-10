'use client'

import { useState, useEffect, useMemo, type FormEvent } from 'react'
import { toast } from 'sonner'
import {
  Plus,
  Store as StoreIcon,
  Building2,
  FlaskConical,
  Ban,
  Search,
  SlidersHorizontal,
} from 'lucide-react'
import { storesApi } from '@/api/stores'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { StatCard } from '@/components/ui/stat-card'
import { StoreCard } from '@/components/store-card'
import { CardSkeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { ConfirmModal } from '@/components/ui/modal'
import type { Store, CreateStoreDto, StoreStatus } from '@/types'

type StatusFilter = 'all' | StoreStatus

const FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'ACTIVE', label: 'Activas' },
  { value: 'TRIAL', label: 'Prueba' },
  { value: 'SUSPENDED', label: 'Suspendidas' },
]

export default function TiendasPage() {
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', description: '' })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  useEffect(() => {
    loadStores()
  }, [])

  async function loadStores() {
    setLoading(true)
    try {
      const data = await storesApi.list()
      setStores(data)
      setError(null)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const activeCount = stores.filter((s) => s.status === 'ACTIVE').length
  const trialCount = stores.filter((s) => s.status === 'TRIAL').length
  const suspendedCount = stores.filter((s) => s.status === 'SUSPENDED').length

  const filteredStores = useMemo(() => {
    let result = stores
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.slug.toLowerCase().includes(q) ||
          (s.description && s.description.toLowerCase().includes(q)),
      )
    }
    if (statusFilter !== 'all') {
      result = result.filter((s) => s.status === statusFilter)
    }
    return result
  }, [stores, search, statusFilter])

  function openCreate() {
    setFormError(null)
    setForm({ name: '', description: '' })
    setEditingId(null)
    setShowForm(true)
  }

  function openEdit(s: Store) {
    setFormError(null)
    setForm({ name: s.name, description: s.description ?? '' })
    setEditingId(s.id)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setForm({ name: '', description: '' })
    setFormError(null)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || form.name.trim().length < 3) {
      setFormError('El nombre debe tener al menos 3 caracteres.')
      return
    }
    setSaving(true)
    setFormError(null)
    try {
      if (editingId) {
        await storesApi.update(editingId, { name: form.name.trim(), description: form.description.trim() || undefined })
        toast.success('Tienda actualizada')
      } else {
        const dto: CreateStoreDto = {
          name: form.name.trim(),
          description: form.description.trim() || undefined,
        }
        await storesApi.create(dto)
        toast.success('Tienda creada')
      }
      closeForm()
      await loadStores()
    } catch (err) {
      setFormError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    try {
      await storesApi.remove(deleteId)
      toast.success('Tienda eliminada')
      setDeleteId(null)
      await loadStores()
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setDeleting(false)
    }
  }

  const noResults = !loading && !error && stores.length > 0 && filteredStores.length === 0

  return (
    <div>
      {/* Hero header */}
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3 lg:gap-4">
            <div className="hidden sm:flex h-10 w-10 lg:h-12 lg:w-12 shrink-0 items-center justify-center rounded-xl lg:rounded-2xl bg-brand-600 shadow-sm shadow-brand-500/20">
              <StoreIcon className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg lg:text-xl font-bold tracking-tight text-slate-900">
                Tiendas
              </h1>
              <p className="mt-0.5 lg:mt-1 max-w-lg text-xs lg:text-sm leading-relaxed text-slate-500">
                Administra tus tiendas, revisa su estado y accede rápidamente a
                la gestión de productos y órdenes.
              </p>
            </div>
          </div>
          {!error && stores.length > 0 && (
            <Button onClick={openCreate} size="lg" className="shrink-0 self-start sm:self-auto">
              <Plus className="h-4 w-4" />
              Nueva tienda
            </Button>
          )}
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={loadStores} />}

      {loading && (
        <div className="space-y-4 lg:space-y-6">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:gap-3">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      )}

      {!loading && !error && stores.length === 0 && (
        <EmptyState
          title="Aún no tienes tiendas"
          description="Crea tu primera tienda para comenzar a administrar productos, gestionar inventario y recibir órdenes de tus clientes."
          action={
            <Button onClick={openCreate} size="lg">
              <Plus className="h-4 w-4" />
              Crear primera tienda
            </Button>
          }
        />
      )}

      {!loading && !error && stores.length > 0 && (
        <>
          {/* Summary stat cards */}
          <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:mb-6 lg:gap-3">
            <StatCard label="Total" value={stores.length} icon={Building2} variant="brand" />
            <StatCard label="Activas" value={activeCount} icon={StoreIcon} variant="success" />
            <StatCard label="Prueba" value={trialCount} icon={FlaskConical} variant="warning" />
            <StatCard label="Suspendidas" value={suspendedCount} icon={Ban} variant="danger" />
          </div>

          {/* Search + filter bar */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center lg:mb-6">
            <div className="relative w-full sm:max-w-sm">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar tienda..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-150 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-1 scrollbar-thin">
              <SlidersHorizontal className="ml-2 hidden h-3.5 w-3.5 shrink-0 text-slate-400 sm:block" />
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setStatusFilter(opt.value)}
                  className={`shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-150 sm:px-3 ${
                    statusFilter === opt.value
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* No results */}
          {noResults && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-16 lg:px-6 lg:py-20 text-center">
              <div className="mb-4 flex h-12 w-12 lg:h-14 lg:w-14 items-center justify-center rounded-xl lg:rounded-2xl bg-slate-100">
                <Search className="h-6 w-6 lg:h-7 lg:w-7 text-slate-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-700">Sin resultados</h3>
              <p className="mt-1.5 max-w-sm text-xs lg:text-sm text-slate-500">
                No se encontraron tiendas con los filtros actuales. Intenta
                ajustar la búsqueda o el filtro de estado.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setSearch(''); setStatusFilter('all') }}
                className="mt-5"
              >
                Limpiar filtros
              </Button>
            </div>
          )}

          {/* Store cards grid */}
          {filteredStores.length > 0 && (
            <>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[11px] lg:text-xs font-medium text-slate-400">
                  Mostrando {filteredStores.length}{' '}
                  {filteredStores.length === 1 ? 'tienda' : 'tiendas'}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
                {filteredStores.map((s) => (
                  <StoreCard
                    key={s.id}
                    store={s}
                    onEdit={openEdit}
                    onDelete={(id) => setDeleteId(id)}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* Create / Edit modal */}
      <Modal
        open={showForm}
        onClose={closeForm}
        title={editingId ? 'Editar tienda' : 'Crear tienda'}
        description={
          editingId
            ? 'Modifica los datos de la tienda.'
            : 'Completa los datos para crear una nueva tienda.'
        }
        footer={
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {formError && (
              <p className="text-sm text-rose-600">{formError}</p>
            )}
            <div className="flex gap-3 sm:ml-auto">
              <Button variant="secondary" onClick={closeForm} disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={saving}>
                {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear tienda'}
              </Button>
            </div>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Nombre</label>
            <Input
              placeholder="Ej. Mi Tienda Online"
              value={form.name}
              onChange={(e) => { setForm((p) => ({ ...p, name: e.target.value })); setFormError(null) }}
              required
              minLength={3}
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Descripción <span className="font-normal text-slate-400">(opcional)</span>
            </label>
            <Input
              placeholder="Breve descripción de la tienda"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            />
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Eliminar tienda"
        description="Se eliminarán permanentemente la tienda y todos sus productos y órdenes asociados. Esta acción no se puede deshacer."
        confirmLabel="Eliminar tienda"
        loading={deleting}
      />
    </div>
  )
}
