import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ProductRow } from '../../src/types/index.js'

// ── Mock state (hoisted para que vi.mock pueda usarlo) ──────────────────────
const { mockResult, mockChain, mockFrom } = vi.hoisted(() => {
  const mockResult = {
    data: null as ProductRow | ProductRow[] | null,
    error: null as { message: string; code?: string } | null,
  }

  const mockChain: any = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
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

import { ProductService } from '../../src/services/product.service.js'

// ── Fixtures ────────────────────────────────────────────────────────────────
const makeProductRow = (overrides?: Partial<ProductRow>): ProductRow => ({
  id: 'product-uuid-1',
  store_id: 'store-uuid-1',
  name: 'Producto Test',
  description: 'Descripción de prueba',
  price: 99.99,
  stock: 50,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
  ...overrides,
})

// ── Suite principal ──────────────────────────────────────────────────────────
describe('ProductService', () => {
  let service: ProductService

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
    mockChain.single.mockImplementation(() => Promise.resolve(mockResult))
    mockFrom.mockReturnValue(mockChain)

    service = new ProductService()
  })

  // ── create ───────────────────────────────────────────────────────────────
  describe('create', () => {
    it('crea un producto y devuelve la respuesta formateada', async () => {
      const row = makeProductRow()
      mockResult.data = row

      const result = await service.create({
        storeId: 'store-uuid-1',
        name: 'Producto Test',
        description: 'Descripción de prueba',
        price: 99.99,
        stock: 50,
      })

      expect(mockFrom).toHaveBeenCalledWith('Product')
      expect(result).toEqual({
        id: row.id,
        storeId: row.store_id,
        name: row.name,
        description: row.description,
        price: row.price,
        stock: row.stock,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })
    })

    it('crea un producto con precio cero (gratis)', async () => {
      const row = makeProductRow({ price: 0 })
      mockResult.data = row

      const result = await service.create({
        storeId: 'store-uuid-1',
        name: 'Producto Gratis',
        description: '',
        price: 0,
        stock: 100,
      })

      expect(result.price).toBe(0)
    })

    it('lanza error cuando storeId está vacío', async () => {
      await expect(
        service.create({ storeId: '', name: 'Producto', description: '', price: 10, stock: 1 })
      ).rejects.toThrow('storeId is required')
    })

    it('lanza error cuando name está vacío', async () => {
      await expect(
        service.create({ storeId: 'store-1', name: '', description: '', price: 10, stock: 1 })
      ).rejects.toThrow('name is required')
    })

    it('lanza error cuando name es solo espacios', async () => {
      await expect(
        service.create({ storeId: 'store-1', name: '   ', description: '', price: 10, stock: 1 })
      ).rejects.toThrow('name is required')
    })

    it('lanza error cuando price es negativo', async () => {
      await expect(
        service.create({ storeId: 'store-1', name: 'Producto', description: '', price: -1, stock: 1 })
      ).rejects.toThrow('price must be a non-negative number')
    })

    it('lanza error cuando stock es negativo', async () => {
      await expect(
        service.create({ storeId: 'store-1', name: 'Producto', description: '', price: 10, stock: -1 })
      ).rejects.toThrow('stock must be a non-negative integer')
    })

    it('lanza error de nombre duplicado cuando supabase retorna código 23505', async () => {
      mockResult.data = null
      mockResult.error = { code: '23505', message: 'unique violation' }

      await expect(
        service.create({ storeId: 'store-1', name: 'Producto Test', description: '', price: 10, stock: 1 })
      ).rejects.toThrow('A product with the name "Producto Test" already exists in this store.')
    })

    it('lanza error genérico en otros errores de supabase', async () => {
      mockResult.data = null
      mockResult.error = { message: 'connection error' }

      await expect(
        service.create({ storeId: 'store-1', name: 'Producto', description: '', price: 10, stock: 1 })
      ).rejects.toThrow('connection error')
    })
  })

  // ── findById ─────────────────────────────────────────────────────────────
  describe('findById', () => {
    it('devuelve el producto cuando existe', async () => {
      const row = makeProductRow()
      mockResult.data = row

      const result = await service.findById('product-uuid-1')

      expect(mockFrom).toHaveBeenCalledWith('Product')
      expect(result?.id).toBe('product-uuid-1')
      expect(result?.name).toBe('Producto Test')
      expect(result?.storeId).toBe('store-uuid-1')
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

  // ── findAllByStore ────────────────────────────────────────────────────────
  describe('findAllByStore', () => {
    it('devuelve el arreglo de productos de la tienda', async () => {
      const rows = [
        makeProductRow(),
        makeProductRow({ id: 'product-uuid-2', name: 'Producto 2' }),
      ]
      mockResult.data = rows as any

      const result = await service.findAllByStore('store-uuid-1')

      expect(result).toHaveLength(2)
      expect(result[0].storeId).toBe('store-uuid-1')
      expect(mockChain.order).toHaveBeenCalledWith('created_at', { ascending: false })
    })

    it('devuelve arreglo vacío si la tienda no tiene productos', async () => {
      mockResult.data = [] as any

      const result = await service.findAllByStore('store-uuid-1')

      expect(result).toEqual([])
    })

    it('lanza error cuando storeId está vacío', async () => {
      await expect(service.findAllByStore('')).rejects.toThrow('storeId is required')
    })

    it('lanza error en fallo de supabase', async () => {
      mockResult.error = { message: 'query failed' }

      await expect(service.findAllByStore('store-uuid-1')).rejects.toThrow('query failed')
    })
  })

  // ── update ────────────────────────────────────────────────────────────────
  describe('update', () => {
    it('actualiza el nombre y devuelve el producto', async () => {
      const row = makeProductRow({ name: 'Nuevo Nombre' })
      mockResult.data = row

      const result = await service.update('product-uuid-1', { name: 'Nuevo Nombre' })

      expect(mockChain.update).toHaveBeenCalledWith({ name: 'Nuevo Nombre' })
      expect(result?.name).toBe('Nuevo Nombre')
    })

    it('actualiza el precio del producto', async () => {
      const row = makeProductRow({ price: 199.99 })
      mockResult.data = row

      const result = await service.update('product-uuid-1', { price: 199.99 })

      expect(mockChain.update).toHaveBeenCalledWith({ price: 199.99 })
      expect(result?.price).toBe(199.99)
    })

    it('actualiza el stock del producto', async () => {
      const row = makeProductRow({ stock: 100 })
      mockResult.data = row

      const result = await service.update('product-uuid-1', { stock: 100 })

      expect(mockChain.update).toHaveBeenCalledWith({ stock: 100 })
      expect(result?.stock).toBe(100)
    })

    it('actualiza la descripción del producto', async () => {
      const row = makeProductRow({ description: 'Nueva descripción' })
      mockResult.data = row

      const result = await service.update('product-uuid-1', { description: 'Nueva descripción' })

      expect(result?.description).toBe('Nueva descripción')
    })

    it('devuelve null cuando el producto no existe (error de supabase)', async () => {
      mockResult.error = { message: 'not found' }

      const result = await service.update('id-inexistente', { name: 'Nuevo' })

      expect(result).toBeNull()
    })

    it('lanza error cuando id está vacío', async () => {
      await expect(
        service.update('', { name: 'Nuevo' })
      ).rejects.toThrow('id is required')
    })

    it('lanza error cuando no se provee ningún campo', async () => {
      await expect(
        service.update('product-uuid-1', {})
      ).rejects.toThrow('at least one field must be provided to update')
    })

    it('lanza error cuando price es negativo en update', async () => {
      await expect(
        service.update('product-uuid-1', { price: -5 })
      ).rejects.toThrow('price must be a non-negative number')
    })

    it('lanza error cuando stock es negativo en update', async () => {
      await expect(
        service.update('product-uuid-1', { stock: -1 })
      ).rejects.toThrow('stock must be a non-negative integer')
    })
  })

  // ── delete ────────────────────────────────────────────────────────────────
  describe('delete', () => {
    it('elimina el producto y devuelve true', async () => {
      mockResult.error = null

      const result = await service.delete('product-uuid-1')

      expect(mockFrom).toHaveBeenCalledWith('Product')
      expect(result).toBe(true)
    })

    it('lanza error cuando id está vacío', async () => {
      await expect(service.delete('')).rejects.toThrow('id is required')
    })

    it('lanza error cuando supabase falla en el delete', async () => {
      mockResult.error = { message: 'delete failed' }

      await expect(service.delete('product-uuid-1')).rejects.toThrow('delete failed')
    })
  })

  // ── updateStock ───────────────────────────────────────────────────────────
  describe('updateStock', () => {
    it('actualiza el stock y devuelve el producto', async () => {
      const row = makeProductRow({ stock: 75 })
      mockResult.data = row

      const result = await service.updateStock('product-uuid-1', 75)

      expect(mockChain.update).toHaveBeenCalledWith({ stock: 75 })
      expect(result?.stock).toBe(75)
    })

    it('acepta stock igual a cero', async () => {
      const row = makeProductRow({ stock: 0 })
      mockResult.data = row

      const result = await service.updateStock('product-uuid-1', 0)

      expect(result?.stock).toBe(0)
    })

    it('devuelve null cuando el producto no existe (error de supabase)', async () => {
      mockResult.error = { message: 'not found' }

      const result = await service.updateStock('id-inexistente', 10)

      expect(result).toBeNull()
    })

    it('lanza error cuando id está vacío', async () => {
      await expect(service.updateStock('', 10)).rejects.toThrow('id is required')
    })

    it('lanza error cuando stock es negativo', async () => {
      await expect(service.updateStock('product-uuid-1', -1)).rejects.toThrow(
        'stock must be a non-negative integer'
      )
    })

    it('lanza error cuando stock es negativo en updateStock', async () => {
      await expect(service.updateStock('product-uuid-1', -5)).rejects.toThrow(
        'stock must be a non-negative integer'
      )
    })
  })
})
