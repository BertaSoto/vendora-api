import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { randomUUID } from 'crypto'
import { StoreService } from '../../src/services/store.service.js'
import { supabase } from '../../src/lib/supabase.js'

const service = new StoreService()

// Identificadores únicos por ejecución para no colisionar con datos existentes
const RUN_ID = randomUUID().slice(0, 8)
const TEST_USER_ID = randomUUID()
const TEST_EMAIL = `vitest-store-${RUN_ID}@test.internal`

// Rastrea los IDs creados para limpiar al final
const createdStoreIds: string[] = []

// ── Helpers ──────────────────────────────────────────────────────────────────
async function createTestStore(nameSuffix: string, description?: string) {
  const store = await service.create({
    merchantId: TEST_USER_ID,
    name: `VT Store ${nameSuffix} ${RUN_ID}`,
    description,
  })
  createdStoreIds.push(store.id)
  return store
}

// ── Suite principal ───────────────────────────────────────────────────────────
describe('StoreService (integración)', () => {

  beforeAll(async () => {
    // Crear usuario de prueba requerido por FK Store.merchantId → User.id
    const { error } = await supabase.from('User').insert({
      id: TEST_USER_ID,
      email: TEST_EMAIL,
      role: 'MERCHANT',
      updatedAt: new Date().toISOString(),
    })
    if (error) throw new Error(`Setup: no se pudo crear el usuario de prueba — ${error.message}`)
  })

  afterAll(async () => {
    // Eliminar todos los stores creados durante la suite
    await Promise.all(createdStoreIds.map(id => service.delete(id).catch(() => {})))
    // Eliminar el usuario de prueba
    await supabase.from('User').delete().eq('id', TEST_USER_ID)
  })

  // ── create ────────────────────────────────────────────────────────────────
  describe('create', () => {
    it('persiste una tienda en Supabase y devuelve los datos correctos', async () => {
      const store = await createTestStore('A')

      expect(store.id).toBeDefined()
      expect(store.merchantId).toBe(TEST_USER_ID)
      expect(store.name).toBe(`VT Store A ${RUN_ID}`)
      expect(store.slug).toContain(`vt-store-a-${RUN_ID}`)
      expect(store.status).toBe('TRIAL')
      expect(store.createdAt).toBeDefined()
    })

    it('genera slug único con sufijo -2 cuando ya existe el slug base', async () => {
      const first = await createTestStore('Dup')
      const second = await createTestStore('Dup')

      expect(first.slug).toContain(`vt-store-dup-${RUN_ID}`)
      expect(second.slug).toBe(`${first.slug}-2`)
    })

    it('persiste la descripción opcional', async () => {
      const store = await createTestStore('Desc', 'Descripción de prueba')

      expect(store.description).toBe('Descripción de prueba')
    })

    it('lanza error de validación cuando merchantId está vacío', async () => {
      await expect(service.create({ merchantId: '', name: 'Test' }))
        .rejects.toThrow('merchantId is required')
    })

    it('lanza error de validación cuando name está vacío', async () => {
      await expect(service.create({ merchantId: TEST_USER_ID, name: '' }))
        .rejects.toThrow('name is required')
    })

    it('lanza error de validación cuando name tiene menos de 3 caracteres', async () => {
      await expect(service.create({ merchantId: TEST_USER_ID, name: 'AB' }))
        .rejects.toThrow('name must be at least 3 characters long')
    })
  })

  // ── findById ──────────────────────────────────────────────────────────────
  describe('findById', () => {
    let storeId: string

    beforeAll(async () => {
      const store = await createTestStore('FindById')
      storeId = store.id
    })

    it('devuelve la tienda cuando el ID existe en la BD', async () => {
      const result = await service.findById(storeId)

      expect(result).not.toBeNull()
      expect(result?.id).toBe(storeId)
      expect(result?.merchantId).toBe(TEST_USER_ID)
    })

    it('devuelve null cuando el ID no existe en la BD', async () => {
      const result = await service.findById(randomUUID())

      expect(result).toBeNull()
    })

    it('lanza error de validación cuando id está vacío', async () => {
      await expect(service.findById('')).rejects.toThrow('id is required')
    })
  })

  // ── findBySlug ────────────────────────────────────────────────────────────
  describe('findBySlug', () => {
    let existingSlug: string

    beforeAll(async () => {
      const store = await createTestStore('Slug')
      existingSlug = store.slug
    })

    it('devuelve la tienda cuando el slug existe en la BD', async () => {
      const result = await service.findBySlug(existingSlug)

      expect(result).not.toBeNull()
      expect(result?.slug).toBe(existingSlug)
    })

    it('devuelve null cuando el slug no existe en la BD', async () => {
      const result = await service.findBySlug(`slug-que-no-existe-${RUN_ID}`)

      expect(result).toBeNull()
    })

    it('lanza error de validación cuando slug está vacío', async () => {
      await expect(service.findBySlug('')).rejects.toThrow('slug is required')
    })
  })

  // ── findAllByMerchant ─────────────────────────────────────────────────────
  describe('findAllByMerchant', () => {
    beforeAll(async () => {
      // Asegurar al menos 2 tiendas para este merchant
      await createTestStore('FMerchant1')
      await createTestStore('FMerchant2')
    })

    it('devuelve todas las tiendas del merchant', async () => {
      const result = await service.findAllByMerchant(TEST_USER_ID)

      expect(result.length).toBeGreaterThanOrEqual(2)
      expect(result.every(s => s.merchantId === TEST_USER_ID)).toBe(true)
    })

    it('devuelve arreglo vacío para un merchant sin tiendas', async () => {
      const result = await service.findAllByMerchant(randomUUID())

      expect(result).toEqual([])
    })

    it('lanza error de validación cuando merchantId está vacío', async () => {
      await expect(service.findAllByMerchant('')).rejects.toThrow('merchantId is required')
    })
  })

  // ── findAll ───────────────────────────────────────────────────────────────
  describe('findAll', () => {
    it('devuelve al menos las tiendas creadas en esta suite', async () => {
      const result = await service.findAll()

      expect(Array.isArray(result)).toBe(true)
      const ours = result.filter(s => s.merchantId === TEST_USER_ID)
      expect(ours.length).toBeGreaterThan(0)
    })
  })

  // ── update ────────────────────────────────────────────────────────────────
  describe('update', () => {
    let storeId: string

    beforeAll(async () => {
      const store = await createTestStore('Update')
      storeId = store.id
    })

    it('actualiza el nombre y lo persiste en la BD', async () => {
      const newName = `VT Updated Name ${RUN_ID}`
      const result = await service.update(storeId, { name: newName })

      expect(result).not.toBeNull()
      expect(result?.name).toBe(newName)

      // Verificar persistencia real
      const fetched = await service.findById(storeId)
      expect(fetched?.name).toBe(newName)
    })

    it('actualiza el status a ACTIVE', async () => {
      const result = await service.update(storeId, { status: 'ACTIVE' })

      expect(result?.status).toBe('ACTIVE')
    })

    it('actualiza la descripción', async () => {
      const result = await service.update(storeId, { description: 'Nueva descripción' })

      expect(result?.description).toBe('Nueva descripción')
    })

    it('devuelve null cuando el ID no existe en la BD', async () => {
      const result = await service.update(randomUUID(), { name: 'X' })

      expect(result).toBeNull()
    })

    it('lanza error de validación cuando id está vacío', async () => {
      await expect(service.update('', { name: 'X' })).rejects.toThrow('id is required')
    })

    it('lanza error de validación cuando no se envían campos', async () => {
      await expect(service.update(storeId, {}))
        .rejects.toThrow('at least one field must be provided to update')
    })
  })

  // ── delete ────────────────────────────────────────────────────────────────
  describe('delete', () => {
    let toDeleteId: string

    beforeEach(async () => {
      // Cada test de delete crea su propia tienda descartable
      const store = await service.create({
        merchantId: TEST_USER_ID,
        name: `VT ToDelete ${RUN_ID} ${Date.now()}`,
      })
      toDeleteId = store.id
      // No se agrega a createdStoreIds porque el test mismo la elimina
    })

    it('elimina la tienda y devuelve true', async () => {
      const result = await service.delete(toDeleteId)

      expect(result).toBe(true)

      // Verificar que realmente fue eliminada
      const fetched = await service.findById(toDeleteId)
      expect(fetched).toBeNull()
    })

    it('lanza error de validación cuando id está vacío', async () => {
      createdStoreIds.push(toDeleteId) // no se eliminó, agregar a cleanup
      await expect(service.delete('')).rejects.toThrow('id is required')
    })
  })
})
