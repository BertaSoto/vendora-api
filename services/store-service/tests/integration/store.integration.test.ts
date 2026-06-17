import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { randomUUID } from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { createTestAuthUser, type TestAuthUser } from './helpers/auth.js'
import { callAPI } from './helpers/api.js'

const RUN_ID = randomUUID().slice(0, 8)

let auth: TestAuthUser

// ── Suite principal ───────────────────────────────────────────────────────────
describe('Store API — integración HTTP', () => {

  beforeAll(async () => {
    auth = await createTestAuthUser(`store-${RUN_ID}`)
  })

  afterAll(async () => {
    // Eliminar todas las tiendas del merchant de prueba en una sola operación
    const admin = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    await admin.from('Store').delete().eq('merchantId', auth.id)
    await auth.cleanup()
  })

  // ── Health ─────────────────────────────────────────────────────────────────
  describe('GET /health', () => {
    it('devuelve 200 con status ok y nombre del servicio', async () => {
      const { status, body } = await callAPI<{ status: string; service: string }>('/health')

      expect(status).toBe(200)
      expect(body.status).toBe('ok')
      expect(body.service).toBe('store-service')
    })
  })

  // ── POST /stores ───────────────────────────────────────────────────────────
  describe('POST /stores', () => {
    it('crea una tienda y devuelve 201 con los datos correctos', async () => {
      const { status, body } = await callAPI<any>('/stores', {
        method: 'POST',
        jwt: auth.jwt,
        body: { name: `IT Store A ${RUN_ID}`, description: 'Tienda de integración' },
      })

      expect(status).toBe(201)
      expect(body.id).toBeDefined()
      expect(body.name).toBe(`IT Store A ${RUN_ID}`)
      expect(body.merchantId).toBe(auth.id)
      expect(body.status).toBe('TRIAL')
      expect(body.slug).toContain(`it-store-a-${RUN_ID}`)
      expect(body.createdAt).toBeDefined()
    })

    it('asigna merchantId desde el JWT cuando no se envía en el body', async () => {
      const { status, body } = await callAPI<any>('/stores', {
        method: 'POST',
        jwt: auth.jwt,
        body: { name: `IT Store JWT ${RUN_ID}` },
      })

      expect(status).toBe(201)
      expect(body.merchantId).toBe(auth.id)
    })

    it('persiste la descripción opcional', async () => {
      const { status, body } = await callAPI<any>('/stores', {
        method: 'POST',
        jwt: auth.jwt,
        body: { name: `IT Store Desc ${RUN_ID}`, description: 'Descripción de prueba' },
      })

      expect(status).toBe(201)
      expect(body.description).toBe('Descripción de prueba')
    })

    it('devuelve 401 cuando no se envía JWT', async () => {
      const { status, body } = await callAPI<any>('/stores', {
        method: 'POST',
        body: { name: 'Sin Auth' },
      })

      expect(status).toBe(401)
      expect(body.success).toBe(false)
    })

    it('devuelve 400 cuando el nombre está vacío', async () => {
      const { status, body } = await callAPI<any>('/stores', {
        method: 'POST',
        jwt: auth.jwt,
        body: { name: '' },
      })

      expect(status).toBe(400)
      expect(body.error).toBeDefined()
    })

    it('devuelve 400 cuando el nombre tiene menos de 3 caracteres', async () => {
      const { status, body } = await callAPI<any>('/stores', {
        method: 'POST',
        jwt: auth.jwt,
        body: { name: 'AB' },
      })

      expect(status).toBe(400)
      expect(body.error).toContain('3 characters')
    })
  })

  // ── GET /stores ────────────────────────────────────────────────────────────
  describe('GET /stores', () => {
    beforeAll(async () => {
      // Asegurar al menos 2 tiendas para el merchant de prueba
      await callAPI('/stores', { method: 'POST', jwt: auth.jwt, body: { name: `IT List1 ${RUN_ID}` } })
      await callAPI('/stores', { method: 'POST', jwt: auth.jwt, body: { name: `IT List2 ${RUN_ID}` } })
    })

    it('devuelve 200 con un arreglo de tiendas', async () => {
      const { status, body } = await callAPI<any[]>('/stores')

      expect(status).toBe(200)
      expect(Array.isArray(body)).toBe(true)
    })

    it('devuelve las tiendas filtradas por merchantId', async () => {
      const { status, body } = await callAPI<any[]>(`/stores?merchantId=${auth.id}`)

      expect(status).toBe(200)
      expect(Array.isArray(body)).toBe(true)
      expect(body.length).toBeGreaterThanOrEqual(2)
      expect(body.every((s) => s.merchantId === auth.id)).toBe(true)
    })

    it('devuelve arreglo vacío para merchantId inexistente', async () => {
      const { status, body } = await callAPI<any[]>(`/stores?merchantId=${randomUUID()}`)

      expect(status).toBe(200)
      expect(body).toEqual([])
    })
  })

  // ── GET /stores/:idOrSlug ──────────────────────────────────────────────────
  describe('GET /stores/:idOrSlug', () => {
    let storeId: string
    let storeSlug: string

    beforeAll(async () => {
      const { body } = await callAPI<any>('/stores', {
        method: 'POST',
        jwt: auth.jwt,
        body: { name: `IT Store Get ${RUN_ID}` },
      })
      storeId = body.id
      storeSlug = body.slug
    })

    it('devuelve 200 y la tienda completa cuando el ID existe', async () => {
      const { status, body } = await callAPI<any>(`/stores/${storeId}`)

      expect(status).toBe(200)
      expect(body.id).toBe(storeId)
      expect(body.merchantId).toBe(auth.id)
      expect(body.slug).toBe(storeSlug)
    })

    it('devuelve 200 y la tienda cuando se busca por slug', async () => {
      const { status, body } = await callAPI<any>(`/stores/${storeSlug}`)

      expect(status).toBe(200)
      expect(body.id).toBe(storeId)
      expect(body.slug).toBe(storeSlug)
    })

    it('devuelve 404 cuando el ID no existe en la BD', async () => {
      const { status, body } = await callAPI<any>(`/stores/${randomUUID()}`)

      expect(status).toBe(404)
      expect(body.error).toBe('Store not found')
    })

    it('devuelve 404 cuando el slug no existe en la BD', async () => {
      const { status, body } = await callAPI<any>(`/stores/slug-inexistente-${RUN_ID}`)

      expect(status).toBe(404)
      expect(body.error).toBe('Store not found')
    })
  })

  // ── PUT /stores/:id ────────────────────────────────────────────────────────
  describe('PUT /stores/:id', () => {
    let storeId: string

    beforeAll(async () => {
      const { body } = await callAPI<any>('/stores', {
        method: 'POST',
        jwt: auth.jwt,
        body: { name: `IT Store Put ${RUN_ID}` },
      })
      storeId = body.id
    })

    it('actualiza el nombre y persiste el cambio en la BD', async () => {
      const newName = `IT Store Put Updated ${RUN_ID}`
      const { status, body } = await callAPI<any>(`/stores/${storeId}`, {
        method: 'PUT',
        jwt: auth.jwt,
        body: { name: newName },
      })

      expect(status).toBe(200)
      expect(body.name).toBe(newName)

      // Verificar persistencia consultando de nuevo
      const { body: fetched } = await callAPI<any>(`/stores/${storeId}`)
      expect(fetched.name).toBe(newName)
    })

    it('actualiza el status a ACTIVE', async () => {
      const { status, body } = await callAPI<any>(`/stores/${storeId}`, {
        method: 'PUT',
        jwt: auth.jwt,
        body: { status: 'ACTIVE' },
      })

      expect(status).toBe(200)
      expect(body.status).toBe('ACTIVE')
    })

    it('devuelve 401 cuando no se envía JWT', async () => {
      const { status } = await callAPI(`/stores/${storeId}`, {
        method: 'PUT',
        body: { name: 'Sin auth' },
      })

      expect(status).toBe(401)
    })

    it('devuelve 404 cuando el ID no existe en la BD', async () => {
      const { status, body } = await callAPI<any>(`/stores/${randomUUID()}`, {
        method: 'PUT',
        jwt: auth.jwt,
        body: { name: 'No existe' },
      })

      expect(status).toBe(404)
      expect(body.error).toBe('Store not found')
    })

    it('devuelve 400 cuando no se envían campos a actualizar', async () => {
      const { status, body } = await callAPI<any>(`/stores/${storeId}`, {
        method: 'PUT',
        jwt: auth.jwt,
        body: {},
      })

      expect(status).toBe(400)
      expect(body.error).toBeDefined()
    })
  })

  // ── PATCH /stores/:id ─────────────────────────────────────────────────────
  describe('PATCH /stores/:id', () => {
    let storeId: string

    beforeAll(async () => {
      const { body } = await callAPI<any>('/stores', {
        method: 'POST',
        jwt: auth.jwt,
        body: { name: `IT Store Patch ${RUN_ID}` },
      })
      storeId = body.id
    })

    it('actualiza parcialmente la tienda (status) y devuelve 200', async () => {
      const { status, body } = await callAPI<any>(`/stores/${storeId}`, {
        method: 'PATCH',
        jwt: auth.jwt,
        body: { status: 'ACTIVE' },
      })

      expect(status).toBe(200)
      expect(body.status).toBe('ACTIVE')
    })

    it('actualiza parcialmente la descripción', async () => {
      const { status, body } = await callAPI<any>(`/stores/${storeId}`, {
        method: 'PATCH',
        jwt: auth.jwt,
        body: { description: 'Nueva descripción parcial' },
      })

      expect(status).toBe(200)
      expect(body.description).toBe('Nueva descripción parcial')
    })

    it('devuelve 401 cuando no se envía JWT', async () => {
      const { status } = await callAPI(`/stores/${storeId}`, {
        method: 'PATCH',
        body: { status: 'ACTIVE' },
      })

      expect(status).toBe(401)
    })
  })

  // ── DELETE /stores/:id ────────────────────────────────────────────────────
  describe('DELETE /stores/:id', () => {
    it('elimina la tienda y devuelve 200 con mensaje', async () => {
      const { body: created } = await callAPI<any>('/stores', {
        method: 'POST',
        jwt: auth.jwt,
        body: { name: `IT Store Delete ${RUN_ID} ${Date.now()}` },
      })

      const { status, body } = await callAPI<any>(`/stores/${created.id}`, {
        method: 'DELETE',
        jwt: auth.jwt,
      })

      expect(status).toBe(200)
      expect(body.message).toBeDefined()

      // Verificar que fue eliminada realmente
      const { status: getStatus } = await callAPI(`/stores/${created.id}`)
      expect(getStatus).toBe(404)
    })

    it('devuelve 401 cuando no se envía JWT', async () => {
      const { body: created } = await callAPI<any>('/stores', {
        method: 'POST',
        jwt: auth.jwt,
        body: { name: `IT Store NoAuth ${RUN_ID} ${Date.now()}` },
      })

      const { status } = await callAPI(`/stores/${created.id}`, { method: 'DELETE' })

      expect(status).toBe(401)
    })
  })
})
