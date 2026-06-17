import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { randomUUID } from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { createTestAuthUser, type TestAuthUser } from './helpers/auth.js'
import { callAPI } from './helpers/api.js'

const RUN_ID = randomUUID().slice(0, 8)
const TEST_STORE_ID = randomUUID()
const TEST_PRODUCT_ID = randomUUID()
const PRODUCT_PRICE = 50

let auth: TestAuthUser

function getAdmin() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// ── Suite principal ───────────────────────────────────────────────────────────
describe('Order API — integración HTTP', () => {

  beforeAll(async () => {
    // 1. Crear usuario auth (también inserta en tabla User para FK user_id)
    auth = await createTestAuthUser(`order-${RUN_ID}`)

    const admin = getAdmin()
    const now = new Date().toISOString()

    // 2. Crear tienda de prueba (dependencia de orden)
    const { error: storeErr } = await admin.from('Store').insert({
      id: TEST_STORE_ID,
      merchantId: auth.id,
      name: `IT Store Order ${RUN_ID}`,
      slug: `it-store-order-${RUN_ID}`,
      status: 'TRIAL',
      createdAt: now,
      updatedAt: now,
    })
    if (storeErr) throw new Error(`Setup store: ${storeErr.message}`)

    // 3. Crear producto de prueba con precio conocido (order.total = price * quantity)
    const { error: prodErr } = await admin.from('Product').insert({
      id: TEST_PRODUCT_ID,
      store_id: TEST_STORE_ID,
      name: `IT Product Order ${RUN_ID}`,
      description: 'Producto para tests de orden',
      price: PRODUCT_PRICE,
      stock: 100,
    })
    if (prodErr) throw new Error(`Setup product: ${prodErr.message}`)
  })

  afterAll(async () => {
    const admin = getAdmin()
    // Eliminar todas las órdenes del usuario de prueba
    await admin.from('Order').delete().eq('user_id', auth.id)
    // Eliminar producto, tienda y usuario
    await admin.from('Product').delete().eq('id', TEST_PRODUCT_ID)
    await admin.from('Store').delete().eq('id', TEST_STORE_ID)
    await auth.cleanup()
  })

  // ── Health ─────────────────────────────────────────────────────────────────
  describe('GET /health', () => {
    it('devuelve 200 con status ok y nombre del servicio', async () => {
      const { status, body } = await callAPI<{ status: string; service: string }>('/health')

      expect(status).toBe(200)
      expect(body.status).toBe('ok')
      expect(body.service).toBe('order-service')
    })
  })

  // ── POST /orders ───────────────────────────────────────────────────────────
  describe('POST /orders', () => {
    it('crea una orden, calcula el total y devuelve 201', async () => {
      const { status, body } = await callAPI<any>('/orders', {
        method: 'POST',
        jwt: auth.jwt,
        body: { storeId: TEST_STORE_ID, productId: TEST_PRODUCT_ID, quantity: 2 },
      })

      expect(status).toBe(201)
      expect(body.id).toBeDefined()
      expect(body.userId).toBe(auth.id)
      expect(body.storeId).toBe(TEST_STORE_ID)
      expect(body.productId).toBe(TEST_PRODUCT_ID)
      expect(body.quantity).toBe(2)
      expect(body.total).toBe(PRODUCT_PRICE * 2)
      expect(body.status).toBe('pending')
      expect(body.productName).toBe(`IT Product Order ${RUN_ID}`)
    })

    it('calcula el total correctamente para cantidad 1', async () => {
      const { status, body } = await callAPI<any>('/orders', {
        method: 'POST',
        jwt: auth.jwt,
        body: { storeId: TEST_STORE_ID, productId: TEST_PRODUCT_ID, quantity: 1 },
      })

      expect(status).toBe(201)
      expect(body.total).toBe(PRODUCT_PRICE)
    })

    it('devuelve 401 sin JWT', async () => {
      const { status, body } = await callAPI<any>('/orders', {
        method: 'POST',
        body: { storeId: TEST_STORE_ID, productId: TEST_PRODUCT_ID, quantity: 1 },
      })

      expect(status).toBe(401)
      expect(body.success).toBe(false)
    })

    it('devuelve 400 cuando storeId está vacío', async () => {
      const { status, body } = await callAPI<any>('/orders', {
        method: 'POST',
        jwt: auth.jwt,
        body: { storeId: '', productId: TEST_PRODUCT_ID, quantity: 1 },
      })

      expect(status).toBe(400)
      expect(body.error).toContain('storeId')
    })

    it('devuelve 400 cuando productId está vacío', async () => {
      const { status, body } = await callAPI<any>('/orders', {
        method: 'POST',
        jwt: auth.jwt,
        body: { storeId: TEST_STORE_ID, productId: '', quantity: 1 },
      })

      expect(status).toBe(400)
      expect(body.error).toContain('productId')
    })

    it('devuelve 400 cuando quantity es menor a 1', async () => {
      const { status, body } = await callAPI<any>('/orders', {
        method: 'POST',
        jwt: auth.jwt,
        body: { storeId: TEST_STORE_ID, productId: TEST_PRODUCT_ID, quantity: 0 },
      })

      expect(status).toBe(400)
      expect(body.error).toContain('quantity')
    })

    it('devuelve 400 cuando el productId no existe en la BD', async () => {
      const { status, body } = await callAPI<any>('/orders', {
        method: 'POST',
        jwt: auth.jwt,
        body: { storeId: TEST_STORE_ID, productId: randomUUID(), quantity: 1 },
      })

      expect(status).toBe(400)
      expect(body.error).toContain('Product not found')
    })
  })

  // ── GET /orders ────────────────────────────────────────────────────────────
  describe('GET /orders', () => {
    beforeAll(async () => {
      // Asegurar al menos 2 órdenes en la BD
      await callAPI('/orders', {
        method: 'POST',
        jwt: auth.jwt,
        body: { storeId: TEST_STORE_ID, productId: TEST_PRODUCT_ID, quantity: 1 },
      })
      await callAPI('/orders', {
        method: 'POST',
        jwt: auth.jwt,
        body: { storeId: TEST_STORE_ID, productId: TEST_PRODUCT_ID, quantity: 3 },
      })
    })

    it('devuelve 200 con un arreglo de órdenes', async () => {
      const { status, body } = await callAPI<any[]>('/orders')

      expect(status).toBe(200)
      expect(Array.isArray(body)).toBe(true)
    })

    it('devuelve las órdenes filtradas por userId', async () => {
      const { status, body } = await callAPI<any[]>(`/orders?userId=${auth.id}`)

      expect(status).toBe(200)
      expect(Array.isArray(body)).toBe(true)
      expect(body.length).toBeGreaterThanOrEqual(1)
      expect(body.every((o) => o.userId === auth.id)).toBe(true)
    })

    it('devuelve las órdenes filtradas por storeId', async () => {
      const { status, body } = await callAPI<any[]>(`/orders?storeId=${TEST_STORE_ID}`)

      expect(status).toBe(200)
      expect(Array.isArray(body)).toBe(true)
      expect(body.length).toBeGreaterThanOrEqual(1)
      expect(body.every((o) => o.storeId === TEST_STORE_ID)).toBe(true)
    })

    it('devuelve arreglo vacío para userId inexistente', async () => {
      const { status, body } = await callAPI<any[]>(`/orders?userId=${randomUUID()}`)

      expect(status).toBe(200)
      expect(body).toEqual([])
    })

    it('devuelve arreglo vacío para storeId inexistente', async () => {
      const { status, body } = await callAPI<any[]>(`/orders?storeId=${randomUUID()}`)

      expect(status).toBe(200)
      expect(body).toEqual([])
    })
  })

  // ── GET /orders/:id ────────────────────────────────────────────────────────
  describe('GET /orders/:id', () => {
    let orderId: string

    beforeAll(async () => {
      const { body } = await callAPI<any>('/orders', {
        method: 'POST',
        jwt: auth.jwt,
        body: { storeId: TEST_STORE_ID, productId: TEST_PRODUCT_ID, quantity: 2 },
      })
      orderId = body.id
    })

    it('devuelve 200 y la orden completa cuando el ID existe', async () => {
      const { status, body } = await callAPI<any>(`/orders/${orderId}`)

      expect(status).toBe(200)
      expect(body.id).toBe(orderId)
      expect(body.userId).toBe(auth.id)
      expect(body.storeId).toBe(TEST_STORE_ID)
      expect(body.productId).toBe(TEST_PRODUCT_ID)
    })

    it('devuelve 404 cuando el ID no existe en la BD', async () => {
      const { status, body } = await callAPI<any>(`/orders/${randomUUID()}`)

      expect(status).toBe(404)
      expect(body.error).toBe('Order not found')
    })
  })

  // ── PUT /orders/:id ────────────────────────────────────────────────────────
  describe('PUT /orders/:id', () => {
    let orderId: string

    beforeAll(async () => {
      const { body } = await callAPI<any>('/orders', {
        method: 'POST',
        jwt: auth.jwt,
        body: { storeId: TEST_STORE_ID, productId: TEST_PRODUCT_ID, quantity: 1 },
      })
      orderId = body.id
    })

    it('actualiza el status a confirmed y persiste en la BD', async () => {
      const { status, body } = await callAPI<any>(`/orders/${orderId}`, {
        method: 'PUT',
        jwt: auth.jwt,
        body: { status: 'confirmed' },
      })

      expect(status).toBe(200)
      expect(body.status).toBe('confirmed')

      const { body: fetched } = await callAPI<any>(`/orders/${orderId}`)
      expect(fetched.status).toBe('confirmed')
    })

    it('actualiza el status a delivered', async () => {
      const { status, body } = await callAPI<any>(`/orders/${orderId}`, {
        method: 'PUT',
        jwt: auth.jwt,
        body: { status: 'delivered' },
      })

      expect(status).toBe(200)
      expect(body.status).toBe('delivered')
    })

    it('actualiza el status a cancelled', async () => {
      const { status, body } = await callAPI<any>(`/orders/${orderId}`, {
        method: 'PUT',
        jwt: auth.jwt,
        body: { status: 'cancelled' },
      })

      expect(status).toBe(200)
      expect(body.status).toBe('cancelled')
    })

    it('devuelve 401 sin JWT', async () => {
      const { status } = await callAPI(`/orders/${orderId}`, {
        method: 'PUT',
        body: { status: 'confirmed' },
      })

      expect(status).toBe(401)
    })

    it('devuelve 404 cuando el ID no existe', async () => {
      const { status, body } = await callAPI<any>(`/orders/${randomUUID()}`, {
        method: 'PUT',
        jwt: auth.jwt,
        body: { status: 'confirmed' },
      })

      expect(status).toBe(404)
      expect(body.error).toBe('Order not found')
    })

    it('devuelve 400 cuando el status es inválido', async () => {
      const { status, body } = await callAPI<any>(`/orders/${orderId}`, {
        method: 'PUT',
        jwt: auth.jwt,
        body: { status: 'invalid_status' },
      })

      expect(status).toBe(400)
      expect(body.error).toContain('status must be one of')
    })

    it('devuelve 400 cuando no se envía status', async () => {
      const { status, body } = await callAPI<any>(`/orders/${orderId}`, {
        method: 'PUT',
        jwt: auth.jwt,
        body: {},
      })

      expect(status).toBe(400)
      expect(body.error).toContain('status')
    })
  })

  // ── PATCH /orders/:id/status ───────────────────────────────────────────────
  describe('PATCH /orders/:id/status', () => {
    let orderId: string

    beforeAll(async () => {
      const { body } = await callAPI<any>('/orders', {
        method: 'POST',
        jwt: auth.jwt,
        body: { storeId: TEST_STORE_ID, productId: TEST_PRODUCT_ID, quantity: 1 },
      })
      orderId = body.id
    })

    it('actualiza el status via PATCH y devuelve 200', async () => {
      const { status, body } = await callAPI<any>(`/orders/${orderId}/status`, {
        method: 'PATCH',
        jwt: auth.jwt,
        body: { status: 'confirmed' },
      })

      expect(status).toBe(200)
      expect(body.status).toBe('confirmed')
    })

    it('devuelve 401 sin JWT', async () => {
      const { status } = await callAPI(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: { status: 'confirmed' },
      })

      expect(status).toBe(401)
    })

    it('devuelve 404 cuando el ID no existe', async () => {
      const { status, body } = await callAPI<any>(`/orders/${randomUUID()}/status`, {
        method: 'PATCH',
        jwt: auth.jwt,
        body: { status: 'confirmed' },
      })

      expect(status).toBe(404)
      expect(body.error).toBe('Order not found')
    })

    it('devuelve 400 cuando el status es inválido', async () => {
      const { status, body } = await callAPI<any>(`/orders/${orderId}/status`, {
        method: 'PATCH',
        jwt: auth.jwt,
        body: { status: 'no_valido' },
      })

      expect(status).toBe(400)
      expect(body.error).toContain('status must be one of')
    })
  })

  // ── DELETE /orders/:id ─────────────────────────────────────────────────────
  describe('DELETE /orders/:id', () => {
    it('elimina la orden y devuelve 200 con mensaje', async () => {
      const { body: created } = await callAPI<any>('/orders', {
        method: 'POST',
        jwt: auth.jwt,
        body: { storeId: TEST_STORE_ID, productId: TEST_PRODUCT_ID, quantity: 1 },
      })

      const { status, body } = await callAPI<any>(`/orders/${created.id}`, {
        method: 'DELETE',
        jwt: auth.jwt,
      })

      expect(status).toBe(200)
      expect(body.message).toBeDefined()

      // Verificar que fue eliminada
      const { status: getStatus } = await callAPI(`/orders/${created.id}`)
      expect(getStatus).toBe(404)
    })

    it('devuelve 401 sin JWT', async () => {
      const { body: created } = await callAPI<any>('/orders', {
        method: 'POST',
        jwt: auth.jwt,
        body: { storeId: TEST_STORE_ID, productId: TEST_PRODUCT_ID, quantity: 1 },
      })

      const { status } = await callAPI(`/orders/${created.id}`, { method: 'DELETE' })

      expect(status).toBe(401)
    })
  })
})
