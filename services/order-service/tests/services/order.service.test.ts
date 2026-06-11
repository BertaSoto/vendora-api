import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { randomUUID } from 'crypto'
import { OrderService } from '../../src/services/order.service.js'
import { supabase } from '../../src/lib/supabase.js'

const service = new OrderService()

// Identificadores únicos por ejecución
const RUN_ID = randomUUID().slice(0, 8)
const TEST_USER_ID = randomUUID()
const TEST_STORE_ID = randomUUID()
const TEST_PRODUCT_ID = randomUUID()
const TEST_PRODUCT_PRICE = 50

// Rastrea los IDs creados para limpiar al final
const createdOrderIds: string[] = []

// ── Helpers ───────────────────────────────────────────────────────────────────
async function createTestOrder(userId = TEST_USER_ID, quantity = 2) {
  const order = await service.create({
    userId,
    storeId: TEST_STORE_ID,
    productId: TEST_PRODUCT_ID,
    quantity,
  })
  createdOrderIds.push(order.id)
  return order
}

// ── Suite principal ────────────────────────────────────────────────────────────
describe('OrderService (integración)', () => {

  beforeAll(async () => {
    const now = new Date().toISOString()

    // 1. Usuario de prueba
    const { error: userErr } = await supabase.from('User').insert({
      id: TEST_USER_ID,
      email: `vitest-order-${RUN_ID}@test.internal`,
      role: 'MERCHANT',
      updatedAt: now,
    })
    if (userErr) throw new Error(`Setup user: ${userErr.message}`)

    // 2. Tienda de prueba
    const { error: storeErr } = await supabase.from('Store').insert({
      id: TEST_STORE_ID,
      merchantId: TEST_USER_ID,
      name: `VT Store Order ${RUN_ID}`,
      slug: `vt-store-order-${RUN_ID}`,
      status: 'TRIAL',
      createdAt: now,
      updatedAt: now,
    })
    if (storeErr) throw new Error(`Setup store: ${storeErr.message}`)

    // 3. Producto de prueba (la creación de orden consulta su precio en la BD)
    const { error: prodErr } = await supabase.from('Product').insert({
      id: TEST_PRODUCT_ID,
      store_id: TEST_STORE_ID,
      name: `VT Product Order ${RUN_ID}`,
      description: 'Producto para tests de orden',
      price: TEST_PRODUCT_PRICE,
      stock: 100,
    })
    if (prodErr) throw new Error(`Setup product: ${prodErr.message}`)
  })

  afterAll(async () => {
    await Promise.all(createdOrderIds.map(id =>
      supabase.from('Order').delete().eq('id', id).then(() => {})
    ))
    await supabase.from('Product').delete().eq('id', TEST_PRODUCT_ID)
    await supabase.from('Store').delete().eq('id', TEST_STORE_ID)
    await supabase.from('User').delete().eq('id', TEST_USER_ID)
  })

  // ── create ──────────────────────────────────────────────────────────────────
  describe('create', () => {
    it('crea una orden, calcula el total y la persiste en Supabase', async () => {
      const order = await createTestOrder(TEST_USER_ID, 2)

      expect(order.id).toBeDefined()
      expect(order.userId).toBe(TEST_USER_ID)
      expect(order.storeId).toBe(TEST_STORE_ID)
      expect(order.productId).toBe(TEST_PRODUCT_ID)
      expect(order.quantity).toBe(2)
      expect(order.total).toBe(TEST_PRODUCT_PRICE * 2)
      expect(order.status).toBe('pending')
      expect(order.productName).toBe(`VT Product Order ${RUN_ID}`)
    })

    it('calcula correctamente el total para cantidad 1', async () => {
      const order = await createTestOrder(TEST_USER_ID, 1)

      expect(order.total).toBe(TEST_PRODUCT_PRICE)
    })

    it('lanza error de validación cuando userId está vacío', async () => {
      await expect(
        service.create({ userId: '', storeId: TEST_STORE_ID, productId: TEST_PRODUCT_ID, quantity: 1 })
      ).rejects.toThrow('userId is required')
    })

    it('lanza error de validación cuando storeId está vacío', async () => {
      await expect(
        service.create({ userId: TEST_USER_ID, storeId: '', productId: TEST_PRODUCT_ID, quantity: 1 })
      ).rejects.toThrow('storeId is required')
    })

    it('lanza error de validación cuando productId está vacío', async () => {
      await expect(
        service.create({ userId: TEST_USER_ID, storeId: TEST_STORE_ID, productId: '', quantity: 1 })
      ).rejects.toThrow('productId is required')
    })

    it('lanza error de validación cuando quantity es menor a 1', async () => {
      await expect(
        service.create({ userId: TEST_USER_ID, storeId: TEST_STORE_ID, productId: TEST_PRODUCT_ID, quantity: 0 })
      ).rejects.toThrow('quantity must be a positive integer')
    })

    it('lanza "Product not found" cuando el productId no existe en la BD', async () => {
      await expect(
        service.create({ userId: TEST_USER_ID, storeId: TEST_STORE_ID, productId: randomUUID(), quantity: 1 })
      ).rejects.toThrow('Product not found')
    })
  })

  // ── findById ─────────────────────────────────────────────────────────────────
  describe('findById', () => {
    let orderId: string

    beforeAll(async () => {
      const order = await createTestOrder()
      orderId = order.id
    })

    it('devuelve la orden cuando el ID existe en la BD', async () => {
      const result = await service.findById(orderId)

      expect(result).not.toBeNull()
      expect(result?.id).toBe(orderId)
      expect(result?.userId).toBe(TEST_USER_ID)
    })

    it('devuelve null cuando el ID no existe en la BD', async () => {
      const result = await service.findById(randomUUID())

      expect(result).toBeNull()
    })

    it('lanza error de validación cuando id está vacío', async () => {
      await expect(service.findById('')).rejects.toThrow('id is required')
    })
  })

  // ── findAll ───────────────────────────────────────────────────────────────────
  describe('findAll', () => {
    it('devuelve al menos las órdenes creadas en esta suite', async () => {
      const result = await service.findAll()

      expect(Array.isArray(result)).toBe(true)
      const ours = result.filter(o => o.userId === TEST_USER_ID)
      expect(ours.length).toBeGreaterThan(0)
    })
  })

  // ── findAllByUserId ───────────────────────────────────────────────────────────
  describe('findAllByUserId', () => {
    beforeAll(async () => {
      await createTestOrder()
    })

    it('devuelve las órdenes del usuario', async () => {
      const result = await service.findAllByUserId(TEST_USER_ID)

      expect(result.length).toBeGreaterThanOrEqual(1)
      expect(result.every(o => o.userId === TEST_USER_ID)).toBe(true)
    })

    it('devuelve arreglo vacío para un usuario sin órdenes', async () => {
      const result = await service.findAllByUserId(randomUUID())

      expect(result).toEqual([])
    })

    it('lanza error de validación cuando userId está vacío', async () => {
      await expect(service.findAllByUserId('')).rejects.toThrow('userId is required')
    })
  })

  // ── findAllByStoreId ──────────────────────────────────────────────────────────
  describe('findAllByStoreId', () => {
    it('devuelve las órdenes de la tienda', async () => {
      const result = await service.findAllByStoreId(TEST_STORE_ID)

      expect(result.length).toBeGreaterThanOrEqual(1)
      expect(result.every(o => o.storeId === TEST_STORE_ID)).toBe(true)
    })

    it('devuelve arreglo vacío para una tienda sin órdenes', async () => {
      const result = await service.findAllByStoreId(randomUUID())

      expect(result).toEqual([])
    })

    it('lanza error de validación cuando storeId está vacío', async () => {
      await expect(service.findAllByStoreId('')).rejects.toThrow('storeId is required')
    })
  })

  // ── update ─────────────────────────────────────────────────────────────────────
  describe('update', () => {
    let orderId: string

    beforeAll(async () => {
      const order = await createTestOrder()
      orderId = order.id
    })

    it('actualiza el status a confirmed y lo persiste en la BD', async () => {
      const result = await service.update(orderId, { status: 'confirmed' })

      expect(result?.status).toBe('confirmed')

      const fetched = await service.findById(orderId)
      expect(fetched?.status).toBe('confirmed')
    })

    it('actualiza el status a delivered', async () => {
      const result = await service.update(orderId, { status: 'delivered' })

      expect(result?.status).toBe('delivered')
    })

    it('actualiza el status a cancelled', async () => {
      const result = await service.update(orderId, { status: 'cancelled' })

      expect(result?.status).toBe('cancelled')
    })

    it('devuelve null cuando el ID no existe en la BD', async () => {
      const result = await service.update(randomUUID(), { status: 'confirmed' })

      expect(result).toBeNull()
    })

    it('lanza error de validación cuando id está vacío', async () => {
      await expect(service.update('', { status: 'confirmed' })).rejects.toThrow('id is required')
    })

    it('lanza error de validación cuando status no está en el DTO', async () => {
      await expect(service.update(orderId, {})).rejects.toThrow('status is required')
    })

    it('lanza error de validación cuando status es inválido', async () => {
      await expect(service.update(orderId, { status: 'unknown' as any }))
        .rejects.toThrow('status must be one of')
    })
  })

  // ── updateStatus ───────────────────────────────────────────────────────────────
  describe('updateStatus', () => {
    let orderId: string

    beforeAll(async () => {
      const order = await createTestOrder()
      orderId = order.id
    })

    it('actualiza el status con string y lo persiste en la BD', async () => {
      const result = await service.updateStatus(orderId, 'confirmed')

      expect(result?.status).toBe('confirmed')
    })

    it('devuelve null cuando el ID no existe en la BD', async () => {
      const result = await service.updateStatus(randomUUID(), 'confirmed')

      expect(result).toBeNull()
    })

    it('lanza error de validación cuando id está vacío', async () => {
      await expect(service.updateStatus('', 'confirmed')).rejects.toThrow('id is required')
    })

    it('lanza error de validación cuando status es inválido', async () => {
      await expect(service.updateStatus(orderId, 'unknown'))
        .rejects.toThrow('status must be one of')
    })
  })

  // ── delete ─────────────────────────────────────────────────────────────────────
  describe('delete', () => {
    let toDeleteId: string

    beforeEach(async () => {
      const order = await createTestOrder()
      toDeleteId = order.id
      // La sacamos del array porque el test la elimina
      const idx = createdOrderIds.indexOf(toDeleteId)
      if (idx !== -1) createdOrderIds.splice(idx, 1)
    })

    it('elimina la orden y devuelve true', async () => {
      const result = await service.delete(toDeleteId)

      expect(result).toBe(true)

      const fetched = await service.findById(toDeleteId)
      expect(fetched).toBeNull()
    })

    it('lanza error de validación cuando id está vacío', async () => {
      createdOrderIds.push(toDeleteId) // no se eliminó, agregar a cleanup
      await expect(service.delete('')).rejects.toThrow('id is required')
    })
  })
})
