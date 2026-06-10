import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { StoreRow } from '../../src/types/store.type.js'

// ── Mock state (hoisted para que vi.mock pueda usarlo) ──────────────────────
const { mockResult, mockChain, mockFrom } = vi.hoisted(() => {
  const mockResult = {
    data: null as StoreRow | StoreRow[] | { slug: string }[] | null,
    error: null as { message: string; code?: string } | null,
  }

  const mockChain: any = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    ilike: vi.fn(),
    single: vi.fn(),
  }

  // Hace el chain "thenable" para poder hacer `await chain.eq(...)` sin .single()
  Object.defineProperty(mockChain, 'then', {
    get: () => (resolve: any, reject?: any) =>
      Promise.resolve(mockResult).then(resolve, reject),
    configurable: true,
  })

  return {
    mockResult,
    mockChain,
    mockFrom: vi.fn(),
  }
})

vi.mock('../../src/lib/supabase.js', () => ({
  supabase: { from: mockFrom },
}))

import { StoreService } from '../../src/services/store.service.js'

// ── Fixtures ────────────────────────────────────────────────────────────────
const makeStoreRow = (overrides?: Partial<StoreRow>): StoreRow => ({
  id: 'store-uuid-1',
  merchantId: 'merchant-uuid-1',
  name: 'Test Store',
  slug: 'test-store',
  description: null,
  status: 'TRIAL',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
})

// ── Suite principal ──────────────────────────────────────────────────────────
describe('StoreService', () => {
  let service: StoreService

  beforeEach(() => {
    vi.resetAllMocks()
    mockResult.data = null
    mockResult.error = null

    // Reconstruir chain después del reset
    mockChain.select.mockReturnValue(mockChain)
    mockChain.insert.mockReturnValue(mockChain)
    mockChain.update.mockReturnValue(mockChain)
    mockChain.delete.mockReturnValue(mockChain)
    mockChain.eq.mockReturnValue(mockChain)
    mockChain.order.mockReturnValue(mockChain)
    mockChain.ilike.mockReturnValue(mockChain)
    mockChain.single.mockImplementation(() => Promise.resolve(mockResult))
    mockFrom.mockReturnValue(mockChain)

    service = new StoreService()
  })

  // ── create ───────────────────────────────────────────────────────────────
  // Nota: create() hace DOS llamadas a Supabase:
  //   1. uniqueSlug() → from('Store').select('slug').ilike(...)   → awaita via `then` getter
  //   2. insert()     → from('Store').insert(...).single()        → awaita via single()
  // Por eso usamos mockResolvedValueOnce en single() para el insert y
  // dejamos mockResult.data = null para uniqueSlug (null → devuelve el slug base).
  describe('create', () => {
    it('crea una tienda y devuelve la respuesta formateada', async () => {
      const row = makeStoreRow()
      mockChain.single.mockResolvedValueOnce({ data: row, error: null })

      const result = await service.create({ merchantId: 'merchant-uuid-1', name: 'Test Store' })

      expect(mockFrom).toHaveBeenCalledWith('Store')
      expect(result).toEqual({
        id: row.id,
        merchantId: row.merchantId,
        name: row.name,
        slug: row.slug,
        description: row.description,
        status: row.status,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      })
    })

    it('genera el slug a partir del nombre', async () => {
      const row = makeStoreRow({ name: 'Mi Tienda Génial', slug: 'mi-tienda-genial' })
      mockChain.single.mockResolvedValueOnce({ data: row, error: null })

      const result = await service.create({ merchantId: 'merchant-uuid-1', name: 'Mi Tienda Génial' })

      expect(result.slug).toBe('mi-tienda-genial')
    })

    it('crea tienda con descripción opcional', async () => {
      const row = makeStoreRow({ description: 'Una tienda increíble' })
      mockChain.single.mockResolvedValueOnce({ data: row, error: null })

      const result = await service.create({
        merchantId: 'merchant-uuid-1',
        name: 'Test Store',
        description: 'Una tienda increíble',
      })

      expect(result.description).toBe('Una tienda increíble')
    })

    it('lanza error cuando merchantId está vacío', async () => {
      await expect(
        service.create({ merchantId: '', name: 'Test Store' })
      ).rejects.toThrow('merchantId is required')
    })

    it('lanza error cuando name está vacío', async () => {
      await expect(
        service.create({ merchantId: 'merchant-1', name: '' })
      ).rejects.toThrow('name is required')
    })

    it('lanza error cuando name es solo espacios', async () => {
      await expect(
        service.create({ merchantId: 'merchant-1', name: '   ' })
      ).rejects.toThrow('name is required')
    })

    it('lanza error cuando name tiene menos de 3 caracteres', async () => {
      await expect(
        service.create({ merchantId: 'merchant-1', name: 'AB' })
      ).rejects.toThrow('name must be at least 3 characters long')
    })

    it('lanza error de slug duplicado cuando supabase retorna código 23505', async () => {
      mockChain.single.mockResolvedValueOnce({
        data: null,
        error: { code: '23505', message: 'unique violation' },
      })

      await expect(
        service.create({ merchantId: 'merchant-1', name: 'Test Store' })
      ).rejects.toThrow('A store with the slug "test-store" already exists.')
    })

    it('genera un slug con sufijo -2 cuando ya existe el slug base', async () => {
      // uniqueSlug recibirá que 'test-store' ya existe → devolverá 'test-store-2'
      mockResult.data = [{ slug: 'test-store' }] as any
      const row = makeStoreRow({ slug: 'test-store-2' })
      mockChain.single.mockResolvedValueOnce({ data: row, error: null })

      const result = await service.create({ merchantId: 'merchant-uuid-1', name: 'Test Store' })

      expect(result.slug).toBe('test-store-2')
    })

    it('genera un sufijo incremental cuando múltiples slugs similares existen', async () => {
      // uniqueSlug encontrará 'test-store' y 'test-store-2' → devolverá 'test-store-3'
      mockResult.data = [{ slug: 'test-store' }, { slug: 'test-store-2' }] as any
      const row = makeStoreRow({ slug: 'test-store-3' })
      mockChain.single.mockResolvedValueOnce({ data: row, error: null })

      const result = await service.create({ merchantId: 'merchant-uuid-1', name: 'Test Store' })

      expect(result.slug).toBe('test-store-3')
    })

    it('lanza error genérico en otros errores de supabase', async () => {
      mockChain.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'connection refused' },
      })

      await expect(
        service.create({ merchantId: 'merchant-1', name: 'Test Store' })
      ).rejects.toThrow('connection refused')
    })
  })

  // ── findById ─────────────────────────────────────────────────────────────
  describe('findById', () => {
    it('devuelve la tienda cuando existe', async () => {
      const row = makeStoreRow()
      mockResult.data = row

      const result = await service.findById('store-uuid-1')

      expect(mockFrom).toHaveBeenCalledWith('Store')
      expect(result?.id).toBe('store-uuid-1')
      expect(result?.name).toBe('Test Store')
    })

    it('devuelve null cuando supabase retorna error', async () => {
      mockResult.error = { message: 'not found' }

      const result = await service.findById('id-inexistente')

      expect(result).toBeNull()
    })

    it('lanza error cuando id está vacío', async () => {
      await expect(service.findById('')).rejects.toThrow('id is required')
    })
  })

  // ── findBySlug ───────────────────────────────────────────────────────────
  describe('findBySlug', () => {
    it('devuelve la tienda cuando el slug existe', async () => {
      const row = makeStoreRow()
      mockResult.data = row

      const result = await service.findBySlug('test-store')

      expect(result?.slug).toBe('test-store')
    })

    it('devuelve null cuando supabase retorna error', async () => {
      mockResult.error = { message: 'not found' }

      const result = await service.findBySlug('slug-inexistente')

      expect(result).toBeNull()
    })

    it('lanza error cuando slug está vacío', async () => {
      await expect(service.findBySlug('')).rejects.toThrow('slug is required')
    })
  })

  // ── findAllByMerchant ─────────────────────────────────────────────────────
  describe('findAllByMerchant', () => {
    it('devuelve el arreglo de tiendas del merchant', async () => {
      const rows = [
        makeStoreRow(),
        makeStoreRow({ id: 'store-uuid-2', name: 'Otra Tienda', slug: 'otra-tienda' }),
      ]
      mockResult.data = rows as any

      const result = await service.findAllByMerchant('merchant-uuid-1')

      expect(result).toHaveLength(2)
      expect(result[0].merchantId).toBe('merchant-uuid-1')
      expect(mockChain.order).toHaveBeenCalledWith('createdAt', { ascending: false })
    })

    it('devuelve arreglo vacío si el merchant no tiene tiendas', async () => {
      mockResult.data = [] as any

      const result = await service.findAllByMerchant('merchant-uuid-1')

      expect(result).toEqual([])
    })

    it('lanza error cuando merchantId está vacío', async () => {
      await expect(service.findAllByMerchant('')).rejects.toThrow('merchantId is required')
    })

    it('lanza error en fallo de supabase', async () => {
      mockResult.error = { message: 'query fallida' }

      await expect(service.findAllByMerchant('merchant-uuid-1')).rejects.toThrow('query fallida')
    })
  })

  // ── findAll ───────────────────────────────────────────────────────────────
  describe('findAll', () => {
    it('devuelve todas las tiendas ordenadas por fecha de creación', async () => {
      const rows = [makeStoreRow(), makeStoreRow({ id: 'store-uuid-2' })]
      mockResult.data = rows as any

      const result = await service.findAll()

      expect(result).toHaveLength(2)
      expect(mockChain.order).toHaveBeenCalledWith('createdAt', { ascending: false })
    })

    it('devuelve arreglo vacío cuando no hay tiendas', async () => {
      mockResult.data = [] as any

      const result = await service.findAll()

      expect(result).toEqual([])
    })

    it('lanza error en fallo de supabase', async () => {
      mockResult.error = { message: 'database error' }

      await expect(service.findAll()).rejects.toThrow('database error')
    })
  })

  // ── update ────────────────────────────────────────────────────────────────
  describe('update', () => {
    it('actualiza y devuelve la tienda', async () => {
      const row = makeStoreRow({ name: 'Tienda Actualizada' })
      mockResult.data = row

      const result = await service.update('store-uuid-1', { name: 'Tienda Actualizada' })

      expect(result?.name).toBe('Tienda Actualizada')
    })

    it('actualiza solo el campo status', async () => {
      const row = makeStoreRow({ status: 'ACTIVE' })
      mockResult.data = row

      const result = await service.update('store-uuid-1', { status: 'ACTIVE' })

      expect(mockChain.update).toHaveBeenCalledWith({ status: 'ACTIVE' })
      expect(result?.status).toBe('ACTIVE')
    })

    it('actualiza solo el campo description', async () => {
      const row = makeStoreRow({ description: 'Nueva descripción' })
      mockResult.data = row

      const result = await service.update('store-uuid-1', { description: 'Nueva descripción' })

      expect(mockChain.update).toHaveBeenCalledWith({ description: 'Nueva descripción' })
      expect(result?.description).toBe('Nueva descripción')
    })

    it('devuelve null cuando supabase retorna error (tienda no encontrada)', async () => {
      mockResult.error = { message: 'not found' }

      const result = await service.update('id-inexistente', { name: 'Nuevo Nombre' })

      expect(result).toBeNull()
    })

    it('lanza error cuando id está vacío', async () => {
      await expect(
        service.update('', { name: 'Nuevo Nombre' })
      ).rejects.toThrow('id is required')
    })

    it('lanza error cuando no se provee ningún campo', async () => {
      await expect(
        service.update('store-uuid-1', {})
      ).rejects.toThrow('at least one field must be provided to update')
    })
  })

  // ── delete ────────────────────────────────────────────────────────────────
  describe('delete', () => {
    it('elimina la tienda y devuelve true', async () => {
      mockResult.error = null

      const result = await service.delete('store-uuid-1')

      expect(mockFrom).toHaveBeenCalledWith('Store')
      expect(result).toBe(true)
    })

    it('lanza error cuando id está vacío', async () => {
      await expect(service.delete('')).rejects.toThrow('id is required')
    })

    it('lanza error cuando supabase falla en el delete', async () => {
      mockResult.error = { message: 'delete failed' }

      await expect(service.delete('store-uuid-1')).rejects.toThrow('delete failed')
    })
  })
})
