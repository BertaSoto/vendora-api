import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { randomUUID } from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { createTestAuthUser, type TestAuthUser } from './helpers/auth.js'
import { callAPI } from './helpers/api.js'

const RUN_ID = randomUUID().slice(0, 8)
const TEST_STORE_ID = randomUUID()

let auth: TestAuthUser

function getAdmin() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// ── Suite principal ───────────────────────────────────────────────────────────
describe('Product API — integración HTTP', () => {

  beforeAll(async () => {
    // 1. Crear usuario auth (también inserta en tabla User para FK)
    auth = await createTestAuthUser(`product-${RUN_ID}`)

    // 2. Crear tienda como dependencia (FK: product.store_id → Store.id no es requerida en Supabase,
    //    pero la creamos para realismo y cumplir cualquier regla de BD)
    const admin = getAdmin()
    const now = new Date().toISOString()
    const { error } = await admin.from('Store').insert({
      id: TEST_STORE_ID,
      merchantId: auth.id,
      name: `IT Store Product ${RUN_ID}`,
      slug: `it-store-product-${RUN_ID}`,
      status: 'TRIAL',
      createdAt: now,
      updatedAt: now,
    })
    if (error) throw new Error(`Setup store: ${error.message}`)
  })

  afterAll(async () => {
    const admin = getAdmin()
    // Eliminar todos los productos de la tienda de prueba
    await admin.from('Product').delete().eq('store_id', TEST_STORE_ID)
    // Eliminar la tienda y el usuario
    await admin.from('Store').delete().eq('id', TEST_STORE_ID)
    await auth.cleanup()
  })

  // ── Health ─────────────────────────────────────────────────────────────────
  describe('GET /health', () => {
    it('devuelve 200 con status ok y nombre del servicio', async () => {
      const { status, body } = await callAPI<{ status: string; service: string }>('/health')

      expect(status).toBe(200)
      expect(body.status).toBe('ok')
      expect(body.service).toBe('product-service')
    })
  })

  // ── GET /products/me ───────────────────────────────────────────────────────
  describe('GET /products/me', () => {
    it('devuelve 200 con datos del usuario autenticado', async () => {
      const { status, body } = await callAPI<any>('/products/me', { jwt: auth.jwt })

      expect(status).toBe(200)
      expect(body.success).toBe(true)
      expect(body.data.user.id).toBe(auth.id)
    })

    it('devuelve 401 sin JWT', async () => {
      const { status } = await callAPI('/products/me')

      expect(status).toBe(401)
    })
  })

  // ── POST /products ─────────────────────────────────────────────────────────
  describe('POST /products', () => {
    it('crea un producto y devuelve 201 con datos correctos', async () => {
      const { status, body } = await callAPI<any>('/products', {
        method: 'POST',
        jwt: auth.jwt,
        body: {
          storeId: TEST_STORE_ID,
          name: `IT Product A ${RUN_ID}`,
          description: 'Producto de integración',
          price: 99.99,
          stock: 50,
        },
      })

      expect(status).toBe(201)
      expect(body.id).toBeDefined()
      expect(body.storeId).toBe(TEST_STORE_ID)
      expect(body.name).toBe(`IT Product A ${RUN_ID}`)
      expect(body.price).toBe(99.99)
      expect(body.stock).toBe(50)
      expect(body.createdAt).toBeDefined()
    })

    it('crea un producto con precio cero', async () => {
      const { status, body } = await callAPI<any>('/products', {
        method: 'POST',
        jwt: auth.jwt,
        body: {
          storeId: TEST_STORE_ID,
          name: `IT Product Free ${RUN_ID}`,
          description: 'Producto gratuito',
          price: 0,
          stock: 100,
        },
      })

      expect(status).toBe(201)
      expect(body.price).toBe(0)
    })

    it('devuelve 401 sin JWT', async () => {
      const { status } = await callAPI('/products', {
        method: 'POST',
        body: { storeId: TEST_STORE_ID, name: 'Sin Auth', description: '', price: 10, stock: 1 },
      })

      expect(status).toBe(401)
    })

    it('devuelve 400 cuando storeId está vacío', async () => {
      const { status, body } = await callAPI<any>('/products', {
        method: 'POST',
        jwt: auth.jwt,
        body: { storeId: '', name: 'Test', description: '', price: 10, stock: 1 },
      })

      expect(status).toBe(400)
      expect(body.error).toContain('storeId')
    })

    it('devuelve 400 cuando el nombre está vacío', async () => {
      const { status, body } = await callAPI<any>('/products', {
        method: 'POST',
        jwt: auth.jwt,
        body: { storeId: TEST_STORE_ID, name: '', description: '', price: 10, stock: 1 },
      })

      expect(status).toBe(400)
      expect(body.error).toContain('name')
    })

    it('devuelve 400 cuando el precio es negativo', async () => {
      const { status, body } = await callAPI<any>('/products', {
        method: 'POST',
        jwt: auth.jwt,
        body: { storeId: TEST_STORE_ID, name: 'Test', description: '', price: -1, stock: 1 },
      })

      expect(status).toBe(400)
      expect(body.error).toContain('price')
    })

    it('devuelve 400 cuando el stock es negativo', async () => {
      const { status, body } = await callAPI<any>('/products', {
        method: 'POST',
        jwt: auth.jwt,
        body: { storeId: TEST_STORE_ID, name: 'Test', description: '', price: 10, stock: -1 },
      })

      expect(status).toBe(400)
      expect(body.error).toContain('stock')
    })
  })

  // ── GET /products ──────────────────────────────────────────────────────────
  describe('GET /products', () => {
    beforeAll(async () => {
      await callAPI('/products', {
        method: 'POST',
        jwt: auth.jwt,
        body: { storeId: TEST_STORE_ID, name: `IT List1 ${RUN_ID}`, description: '', price: 10, stock: 5 },
      })
      await callAPI('/products', {
        method: 'POST',
        jwt: auth.jwt,
        body: { storeId: TEST_STORE_ID, name: `IT List2 ${RUN_ID}`, description: '', price: 20, stock: 3 },
      })
    })

    it('devuelve 400 cuando falta el parámetro storeId', async () => {
      const { status, body } = await callAPI<any>('/products')

      expect(status).toBe(400)
      expect(body.error).toContain('storeId')
    })

    it('devuelve 200 con los productos de la tienda', async () => {
      const { status, body } = await callAPI<any[]>(`/products?storeId=${TEST_STORE_ID}`)

      expect(status).toBe(200)
      expect(Array.isArray(body)).toBe(true)
      expect(body.length).toBeGreaterThanOrEqual(2)
      expect(body.every((p) => p.storeId === TEST_STORE_ID)).toBe(true)
    })

    it('devuelve arreglo vacío para tienda sin productos', async () => {
      const { status, body } = await callAPI<any[]>(`/products?storeId=${randomUUID()}`)

      expect(status).toBe(200)
      expect(body).toEqual([])
    })
  })

  // ── GET /products/:id ──────────────────────────────────────────────────────
  describe('GET /products/:id', () => {
    let productId: string

    beforeAll(async () => {
      const { body } = await callAPI<any>('/products', {
        method: 'POST',
        jwt: auth.jwt,
        body: {
          storeId: TEST_STORE_ID,
          name: `IT Product GetById ${RUN_ID}`,
          description: 'Para test findById',
          price: 150,
          stock: 10,
        },
      })
      productId = body.id
    })

    it('devuelve 200 y el producto cuando el ID existe', async () => {
      const { status, body } = await callAPI<any>(`/products/${productId}`)

      expect(status).toBe(200)
      expect(body.id).toBe(productId)
      expect(body.storeId).toBe(TEST_STORE_ID)
    })

    it('devuelve 404 cuando el ID no existe en la BD', async () => {
      const { status, body } = await callAPI<any>(`/products/${randomUUID()}`)

      expect(status).toBe(404)
      expect(body.error).toBe('Product not found')
    })
  })

  // ── PUT /products/:id ──────────────────────────────────────────────────────
  describe('PUT /products/:id', () => {
    let productId: string

    beforeAll(async () => {
      const { body } = await callAPI<any>('/products', {
        method: 'POST',
        jwt: auth.jwt,
        body: {
          storeId: TEST_STORE_ID,
          name: `IT Product Put ${RUN_ID}`,
          description: 'Original',
          price: 50,
          stock: 20,
        },
      })
      productId = body.id
    })

    it('actualiza el nombre y persiste en la BD', async () => {
      const newName = `IT Product Put Updated ${RUN_ID}`
      const { status, body } = await callAPI<any>(`/products/${productId}`, {
        method: 'PUT',
        jwt: auth.jwt,
        body: { name: newName },
      })

      expect(status).toBe(200)
      expect(body.name).toBe(newName)

      const { body: fetched } = await callAPI<any>(`/products/${productId}`)
      expect(fetched.name).toBe(newName)
    })

    it('actualiza el precio', async () => {
      const { status, body } = await callAPI<any>(`/products/${productId}`, {
        method: 'PUT',
        jwt: auth.jwt,
        body: { price: 200 },
      })

      expect(status).toBe(200)
      expect(body.price).toBe(200)
    })

    it('actualiza el stock', async () => {
      const { status, body } = await callAPI<any>(`/products/${productId}`, {
        method: 'PUT',
        jwt: auth.jwt,
        body: { stock: 75 },
      })

      expect(status).toBe(200)
      expect(body.stock).toBe(75)
    })

    it('devuelve 401 sin JWT', async () => {
      const { status } = await callAPI(`/products/${productId}`, {
        method: 'PUT',
        body: { name: 'Sin auth' },
      })

      expect(status).toBe(401)
    })

    it('devuelve 404 cuando el ID no existe', async () => {
      const { status, body } = await callAPI<any>(`/products/${randomUUID()}`, {
        method: 'PUT',
        jwt: auth.jwt,
        body: { name: 'No existe' },
      })

      expect(status).toBe(404)
      expect(body.error).toBe('Product not found')
    })

    it('devuelve 400 cuando el precio es negativo', async () => {
      const { status, body } = await callAPI<any>(`/products/${productId}`, {
        method: 'PUT',
        jwt: auth.jwt,
        body: { price: -5 },
      })

      expect(status).toBe(400)
      expect(body.error).toContain('price')
    })
  })

  // ── PATCH /products/:id/stock ──────────────────────────────────────────────
  describe('PATCH /products/:id/stock', () => {
    let productId: string

    beforeAll(async () => {
      const { body } = await callAPI<any>('/products', {
        method: 'POST',
        jwt: auth.jwt,
        body: {
          storeId: TEST_STORE_ID,
          name: `IT Product Stock ${RUN_ID}`,
          description: 'Para test de stock',
          price: 30,
          stock: 10,
        },
      })
      productId = body.id
    })

    it('actualiza el stock y devuelve 200', async () => {
      const { status, body } = await callAPI<any>(`/products/${productId}/stock`, {
        method: 'PATCH',
        jwt: auth.jwt,
        body: { stock: 99 },
      })

      expect(status).toBe(200)
      expect(body.stock).toBe(99)
    })

    it('acepta stock igual a cero', async () => {
      const { status, body } = await callAPI<any>(`/products/${productId}/stock`, {
        method: 'PATCH',
        jwt: auth.jwt,
        body: { stock: 0 },
      })

      expect(status).toBe(200)
      expect(body.stock).toBe(0)
    })

    it('devuelve 401 sin JWT', async () => {
      const { status } = await callAPI(`/products/${productId}/stock`, {
        method: 'PATCH',
        body: { stock: 5 },
      })

      expect(status).toBe(401)
    })

    it('devuelve 404 cuando el ID no existe', async () => {
      const { status, body } = await callAPI<any>(`/products/${randomUUID()}/stock`, {
        method: 'PATCH',
        jwt: auth.jwt,
        body: { stock: 5 },
      })

      expect(status).toBe(404)
      expect(body.error).toBe('Product not found')
    })
  })

  // ── DELETE /products/:id ───────────────────────────────────────────────────
  describe('DELETE /products/:id', () => {
    it('elimina el producto y devuelve 200 con mensaje', async () => {
      const { body: created } = await callAPI<any>('/products', {
        method: 'POST',
        jwt: auth.jwt,
        body: {
          storeId: TEST_STORE_ID,
          name: `IT Product Delete ${RUN_ID} ${Date.now()}`,
          description: '',
          price: 1,
          stock: 1,
        },
      })

      const { status, body } = await callAPI<any>(`/products/${created.id}`, {
        method: 'DELETE',
        jwt: auth.jwt,
      })

      expect(status).toBe(200)
      expect(body.message).toBeDefined()

      // Verificar que fue eliminado
      const { status: getStatus } = await callAPI(`/products/${created.id}`)
      expect(getStatus).toBe(404)
    })

    it('devuelve 401 sin JWT', async () => {
      const { body: created } = await callAPI<any>('/products', {
        method: 'POST',
        jwt: auth.jwt,
        body: {
          storeId: TEST_STORE_ID,
          name: `IT Product NoAuth ${RUN_ID} ${Date.now()}`,
          description: '',
          price: 1,
          stock: 1,
        },
      })

      const { status } = await callAPI(`/products/${created.id}`, { method: 'DELETE' })

      expect(status).toBe(401)
    })

    it('devuelve 404 cuando el ID no existe', async () => {
      const { status, body } = await callAPI<any>(`/products/${randomUUID()}`, {
        method: 'DELETE',
        jwt: auth.jwt,
      })

      expect(status).toBe(404)
      expect(body.error).toBe('Product not found')
    })
  })
})
