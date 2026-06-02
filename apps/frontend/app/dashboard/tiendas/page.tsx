'use client'

import { useState, useEffect, type FormEvent } from 'react'
import Link from 'next/link'
import { storesApi } from '../../../src/api/stores'
import type { Store, CreateStoreDto, UpdateStoreDto } from '../../../src/types'

export default function TiendasPage() {
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', description: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadStores() }, [])

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
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingId) {
        await storesApi.update(editingId, form)
      } else {
        const dto: CreateStoreDto = { merchantId: '', name: form.name, description: form.description || undefined }
        await storesApi.create(dto)
      }
      resetForm()
      await loadStores()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta tienda?')) return
    try {
      await storesApi.remove(id)
      await loadStores()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const statusColor: Record<string, string> = { active: 'var(--color-success)', suspended: 'var(--color-danger)', trial: 'var(--color-warning)' }

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Tiendas</h1>
        <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
          {showForm ? 'Cancelar' : '+ Nueva tienda'}
        </button>
      </div>

      {error && <p style={styles.error}>Error: {error}</p>}

      {showForm && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            placeholder="Nombre de la tienda"
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            required
            minLength={3}
            style={styles.input}
          />
          <input
            placeholder="Descripción (opcional)"
            value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            style={styles.input}
          />
          <button type="submit" disabled={saving} style={styles.saveBtn}>
            {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
          </button>
        </form>
      )}

      {loading ? (
        <p style={styles.muted}>Cargando tiendas...</p>
      ) : stores.length === 0 ? (
        <p style={styles.muted}>No hay tiendas. Crea la primera.</p>
      ) : (
        <div style={styles.grid}>
          {stores.map(s => (
            <div key={s.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <Link href={`/dashboard/tiendas/${s.id}`} style={styles.cardName}>{s.name}</Link>
                <span style={{ ...styles.status, color: statusColor[s.status] || 'var(--color-text-muted)' }}>
                  {s.status}
                </span>
              </div>
              {s.description && <p style={styles.muted}>{s.description}</p>}
              <p style={styles.muted}>Slug: {s.slug}</p>
              <div style={styles.cardActions}>
                <button onClick={() => startEdit(s)} style={styles.editBtn}>Editar</button>
                <button onClick={() => handleDelete(s.id)} style={styles.deleteBtn}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  title: { fontSize: '1.5rem', fontWeight: 700 },
  addBtn: {
    padding: '8px 16px',
    borderRadius: 'var(--radius)',
    backgroundColor: 'var(--color-primary)',
    color: 'white',
    border: 'none',
    fontSize: '0.9rem',
    cursor: 'pointer',
    fontWeight: 600,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '16px',
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius)',
    marginBottom: '20px',
    maxWidth: '480px',
  },
  input: {
    padding: '8px 12px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--color-border)',
    fontSize: '0.9rem',
    outline: 'none',
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
  },
  saveBtn: {
    padding: '8px 16px',
    borderRadius: 'var(--radius)',
    backgroundColor: 'var(--color-success)',
    color: 'white',
    border: 'none',
    fontSize: '0.9rem',
    cursor: 'pointer',
    fontWeight: 600,
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' },
  card: {
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius)',
    padding: '16px',
    boxShadow: 'var(--shadow)',
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  cardName: { fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-primary)', textDecoration: 'none' },
  status: { fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' },
  cardActions: { display: 'flex', gap: '8px', marginTop: '12px' },
  editBtn: {
    padding: '4px 12px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--color-primary)',
    backgroundColor: 'transparent',
    color: 'var(--color-primary)',
    fontSize: '0.8rem',
    cursor: 'pointer',
  },
  deleteBtn: {
    padding: '4px 12px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--color-danger)',
    backgroundColor: 'transparent',
    color: 'var(--color-danger)',
    fontSize: '0.8rem',
    cursor: 'pointer',
  },
  error: { color: 'var(--color-danger)', fontSize: '0.9rem', marginBottom: '12px' },
  muted: { color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '4px' },
}
