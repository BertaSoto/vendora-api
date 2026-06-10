'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Plus, X } from 'lucide-react'
import { storesApi } from '@/api/stores'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { StoreCard } from '@/components/store-card'
import { CardSkeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { ConfirmModal } from '@/components/ui/modal'
import type { Store, CreateStoreDto } from '@/types'

export default function TiendasPage() {
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', description: '' })
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

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

  function resetForm() {
    setForm({ name: '', description: '' })
    setEditingId(null)
    setShowForm(false)
  }

  function startEdit(s: Store) {
    setForm({ name: s.name, description: s.description ?? '' })
    setEditingId(s.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingId) {
        await storesApi.update(editingId, form)
        toast.success('Tienda actualizada correctamente')
      } else {
        const dto: CreateStoreDto = {
          name: form.name,
          description: form.description || undefined,
        }
        await storesApi.create(dto)
        toast.success('Tienda creada correctamente')
      }
      resetForm()
      await loadStores()
    } catch (err) {
      toast.error((err as Error).message)
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
      await loadStores()
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tiendas</h1>
          <p className="mt-1 text-sm text-slate-500">
            {stores.length} {stores.length === 1 ? 'tienda' : 'tiendas'}
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? (
            <>
              <X className="h-4 w-4" />
              Cancelar
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Nueva tienda
            </>
          )}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-slate-700">
              {editingId ? 'Editar tienda' : 'Nueva tienda'}
            </h2>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                placeholder="Nombre de la tienda"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                required
                minLength={3}
                className="flex-1"
              />
              <Input
                placeholder="Descripción (opcional)"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                className="flex-1"
              />
              <Button type="submit" disabled={saving}>
                {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {error && <ErrorState message={error} onRetry={loadStores} />}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : !error && stores.length === 0 ? (
        <EmptyState
          title="No hay tiendas"
          description="Crea tu primera tienda para empezar a gestionar productos y órdenes."
          action={
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4" />
              Nueva tienda
            </Button>
          }
        />
      ) : (
        !error && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stores.map((s) => (
              <StoreCard
                key={s.id}
                store={s}
                onEdit={startEdit}
                onDelete={(id) => setDeleteId(id)}
              />
            ))}
          </div>
        )
      )}

      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Eliminar tienda"
        description="¿Estás seguro? Esta acción no se puede deshacer. Se eliminarán todos los productos y órdenes asociados a esta tienda."
        confirmLabel="Eliminar tienda"
        loading={deleting}
      />
    </div>
  )
}
