import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { OrderRow, OrderStatus } from '../../src/types/index.js'

// ── Mock state (hoisted para que vi.mock pueda usarlo) ──────────────────────
const { mockResult, mockChain, mockFrom } = vi.hoisted(() => {
  const mockResult = {
    data: null as any,
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

import { OrderService } from '../../src/services/order.service.js'

// ── Fixtures ────────────────────────────────────────────────────────────────
const makeOrderRow = (
  overrides?: Partial<OrderRow & { product_name?: string | null }>
): OrderRow & { product_name?: string | null } => ({
  id: 'order-uuid-1',
  user_id: 'user-uuid-1',
  store_id: 'store-uuid-1',
  product_id: 'product-uuid-1',
  product_name: 'Producto Test',
  quantity: 2,
  total: 199.98,
  status: 'pending' as OrderStatus,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
  ...overrides,
})

const makeProductData = (overrides?: { name?: string; price?: number }) => ({
  name: 'Producto Test',
  price: 99.99,
  ...overrides,
})

// ── Suite principal ──────────────────────────────────────────────────────────
describe('OrderService', () => {
  let service: OrderService

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

    service = new OrderService()
  })

  // ── create ───────────────────────────────────────────────────────────────
  describe('create', () => {
    it('crea una orden con total calculado correctamente', async () => {
      const productData = makeProductData({ price: 99.99 })
      const orderRow = makeOrderRow({ quantity: 2, total: 199.98 })

      mockChain.single
        .mockResolvedValueOnce({ data: productData, error: null })
        .mockResolvedValueOnce({ data: orderRow, error: null })

      const result = await service.create({
        userId: 'user-uuid-1',
        storeId: 'store-uuid-1',
        productId: 'product-uuid-1',
        quantity: 2,
      })

      expect(mockFrom).toHaveBeenCalledWith('Product')
      expect(mockFrom).toHaveBeenCalledWith('Order')
      expect(result.total).toBe(199.98)
      expect(result.quantity).toBe(2)
      expect(result.productName).toBe('Producto Test')
      expect(result.status).toBe('pending')
    })

    it('calcula correctamente el total para cantidad de 1', async () => {
      const productData = makeProductData({ price: 50 })
      const orderRow = makeOrderRow({ quantity: 1, total: 50 })

      mockChain.single
        .mockResolvedValueOnce({ data: productData, error: null })
        .mockResolvedValueOnce({ data: orderRow, error: null })

      const result = await service.create({
        userId: 'user-uuid-1',
        storeId: 'store-uuid-1',
        productId: 'product-uuid-1',
        quantity: 1,
      })

      expect(result.total).toBe(50)
    })

    it('lanza error cuando userId está vacío', async () => {
      await expect(
        service.create({ userId: '', storeId: 'store-1', productId: 'prod-1', quantity: 1 })
      ).rejects.toThrow('userId is required')
    })

    it('lanza error cuando storeId está vacío', async () => {
      await expect(
        service.create({ userId: 'user-1', storeId: '', productId: 'prod-1', quantity: 1 })
      ).rejects.toThrow('storeId is required')
    })

    it('lanza error cuando productId está vacío', async () => {
      await expect(
        service.create({ userId: 'user-1', storeId: 'store-1', productId: '', quantity: 1 })
      ).rejects.toThrow('productId is required')
    })

    it('lanza error cuando quantity es menor a 1', async () => {
      await expect(
        service.create({ userId: 'user-1', storeId: 'store-1', productId: 'prod-1', quantity: 0 })
      ).rejects.toThrow('quantity must be a positive integer')
    })

    it('lanza error cuando quantity es negativa', async () => {
      await expect(
        service.create({ userId: 'user-1', storeId: 'store-1', productId: 'prod-1', quantity: -1 })
      ).rejects.toThrow('quantity must be a positive integer')
    })

    it('lanza error cuando el producto no se encuentra (error de supabase)', async () => {
      mockChain.single.mockResolvedValueOnce({ data: null, error: { message: 'not found' } })

      await expect(
        service.create({ userId: 'user-1', storeId: 'store-1', productId: 'id-inexistente', quantity: 1 })
      ).rejects.toThrow('Product not found')
    })

    it('lanza error cuando el producto retorna data null', async () => {
      mockChain.single.mockResolvedValueOnce({ data: null, error: null })

      await expect(
        service.create({ userId: 'user-1', storeId: 'store-1', productId: 'prod-1', quantity: 1 })
      ).rejects.toThrow('Product not found')
    })

    it('lanza error cuando el insert de la orden falla en supabase', async () => {
      const productData = makeProductData()
      mockChain.single
        .mockResolvedValueOnce({ data: productData, error: null })
        .mockResolvedValueOnce({ data: null, error: { message: 'insert failed' } })

      await expect(
        service.create({ userId: 'user-1', storeId: 'store-1', productId: 'prod-1', quantity: 1 })
      ).rejects.toThrow('insert failed')
    })
  })

  // ── findById ─────────────────────────────────────────────────────────────
  describe('findById', () => {
    it('devuelve la orden cuando existe', async () => {
      const row = makeOrderRow()
      mockResult.data = row

      const result = await service.findById('order-uuid-1')

      expect(mockFrom).toHaveBeenCalledWith('Order')
      expect(result?.id).toBe('order-uuid-1')
      expect(result?.userId).toBe('user-uuid-1')
      expect(result?.productName).toBe('Producto Test')
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

  // ── findAll ───────────────────────────────────────────────────────────────
  describe('findAll', () => {
    it('devuelve todas las órdenes ordenadas por fecha', async () => {
      const rows = [makeOrderRow(), makeOrderRow({ id: 'order-uuid-2' })]
      mockResult.data = rows

      const result = await service.findAll()

      expect(result).toHaveLength(2)
      expect(mockChain.order).toHaveBeenCalledWith('created_at', { ascending: false })
    })

    it('devuelve arreglo vacío cuando no hay órdenes', async () => {
      mockResult.data = []

      const result = await service.findAll()

      expect(result).toEqual([])
    })

    it('lanza error en fallo de supabase', async () => {
      mockResult.error = { message: 'database error' }

      await expect(service.findAll()).rejects.toThrow('database error')
    })
  })

  // ── findAllByUserId ───────────────────────────────────────────────────────
  describe('findAllByUserId', () => {
    it('devuelve las órdenes del usuario', async () => {
      const rows = [makeOrderRow(), makeOrderRow({ id: 'order-uuid-2' })]
      mockResult.data = rows

      const result = await service.findAllByUserId('user-uuid-1')

      expect(result).toHaveLength(2)
      expect(result[0].userId).toBe('user-uuid-1')
    })

    it('devuelve arreglo vacío si el usuario no tiene órdenes', async () => {
      mockResult.data = []

      const result = await service.findAllByUserId('user-uuid-1')

      expect(result).toEqual([])
    })

    it('lanza error cuando userId está vacío', async () => {
      await expect(service.findAllByUserId('')).rejects.toThrow('userId is required')
    })

    it('lanza error en fallo de supabase', async () => {
      mockResult.error = { message: 'query failed' }

      await expect(service.findAllByUserId('user-uuid-1')).rejects.toThrow('query failed')
    })
  })

  // ── findAllByStoreId ──────────────────────────────────────────────────────
  describe('findAllByStoreId', () => {
    it('devuelve las órdenes de la tienda', async () => {
      const rows = [makeOrderRow(), makeOrderRow({ id: 'order-uuid-2' })]
      mockResult.data = rows

      const result = await service.findAllByStoreId('store-uuid-1')

      expect(result).toHaveLength(2)
      expect(result[0].storeId).toBe('store-uuid-1')
    })

    it('devuelve arreglo vacío si la tienda no tiene órdenes', async () => {
      mockResult.data = []

      const result = await service.findAllByStoreId('store-uuid-1')

      expect(result).toEqual([])
    })

    it('lanza error cuando storeId está vacío', async () => {
      await expect(service.findAllByStoreId('')).rejects.toThrow('storeId is required')
    })

    it('lanza error en fallo de supabase', async () => {
      mockResult.error = { message: 'query failed' }

      await expect(service.findAllByStoreId('store-uuid-1')).rejects.toThrow('query failed')
    })
  })

  // ── update ────────────────────────────────────────────────────────────────
  describe('update', () => {
    it('actualiza el status y devuelve la orden', async () => {
      const row = makeOrderRow({ status: 'confirmed' })
      mockResult.data = row

      const result = await service.update('order-uuid-1', { status: 'confirmed' })

      expect(mockChain.update).toHaveBeenCalledWith({ status: 'confirmed' })
      expect(result?.status).toBe('confirmed')
    })

    it('acepta todos los statuses válidos: delivered', async () => {
      const row = makeOrderRow({ status: 'delivered' })
      mockResult.data = row

      const result = await service.update('order-uuid-1', { status: 'delivered' })

      expect(result?.status).toBe('delivered')
    })

    it('acepta status: cancelled', async () => {
      const row = makeOrderRow({ status: 'cancelled' })
      mockResult.data = row

      const result = await service.update('order-uuid-1', { status: 'cancelled' })

      expect(result?.status).toBe('cancelled')
    })

    it('devuelve null cuando la orden no existe (error de supabase)', async () => {
      mockResult.error = { message: 'not found' }

      const result = await service.update('id-inexistente', { status: 'confirmed' })

      expect(result).toBeNull()
    })

    it('lanza error cuando id está vacío', async () => {
      await expect(
        service.update('', { status: 'confirmed' })
      ).rejects.toThrow('id is required')
    })

    it('lanza error cuando status no está en el DTO', async () => {
      await expect(
        service.update('order-uuid-1', {})
      ).rejects.toThrow('status is required')
    })

    it('lanza error cuando status es inválido', async () => {
      await expect(
        service.update('order-uuid-1', { status: 'invalid' as any })
      ).rejects.toThrow('status must be one of: pending, confirmed, delivered, cancelled')
    })
  })

  // ── updateStatus ──────────────────────────────────────────────────────────
  describe('updateStatus', () => {
    it('actualiza el status con string y devuelve la orden', async () => {
      const row = makeOrderRow({ status: 'confirmed' })
      mockResult.data = row

      const result = await service.updateStatus('order-uuid-1', 'confirmed')

      expect(mockChain.update).toHaveBeenCalledWith({ status: 'confirmed' })
      expect(result?.status).toBe('confirmed')
    })

    it('devuelve null cuando la orden no existe', async () => {
      mockResult.error = { message: 'not found' }

      const result = await service.updateStatus('id-inexistente', 'confirmed')

      expect(result).toBeNull()
    })

    it('lanza error cuando id está vacío', async () => {
      await expect(service.updateStatus('', 'confirmed')).rejects.toThrow('id is required')
    })

    it('lanza error cuando status es inválido', async () => {
      await expect(
        service.updateStatus('order-uuid-1', 'unknown')
      ).rejects.toThrow('status must be one of: pending, confirmed, delivered, cancelled')
    })
  })

  // ── delete ────────────────────────────────────────────────────────────────
  describe('delete', () => {
    it('elimina la orden y devuelve true', async () => {
      mockResult.error = null

      const result = await service.delete('order-uuid-1')

      expect(mockFrom).toHaveBeenCalledWith('Order')
      expect(result).toBe(true)
    })

    it('lanza error cuando id está vacío', async () => {
      await expect(service.delete('')).rejects.toThrow('id is required')
    })

    it('lanza error cuando supabase falla en el delete', async () => {
      mockResult.error = { message: 'delete failed' }

      await expect(service.delete('order-uuid-1')).rejects.toThrow('delete failed')
    })
  })
})
