import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { randomUUID } from 'crypto'
import { ProductService } from '../../src/services/product.service.js'
import { supabase } from '../../src/lib/supabase.js'

const service = new ProductService()

// Identificadores únicos por ejecución
const RUN_ID = randomUUID().slice(0, 8)
const TEST_USER_ID = randomUUID()
const TEST_STORE_ID = randomUUID()

// Rastrea los IDs creados para limpiar al final
const createdProductIds: string[] = []

// ── Helpers ───────────────────────────────────────────────────────────────────
async function createTestProduct(nameSuffix: string, overrides: Partial<{
  price: number
  stock: number
  description: string
}> = {}) {
  const product = await service.create({
    storeId: TEST_STORE_ID,
    name: `VT Product ${nameSuffix} ${RUN_ID}`,
    description: overrides.description ?? 'Descripción de prueba',
    price: overrides.price ?? 99,
    stock: overrides.stock ?? 10,
  })
  createdProductIds.push(product.id)
  return product
}

// ── Suite principal ────────────────────────────────────────────────────────────
describe('ProductService (integración)', () => {

  beforeAll(async () => {
    // Crear usuario y tienda de prueba para cumplir FKs si existieran
    // (Product no tiene FK, pero creamos las entidades para realismo)
    const { error: userErr } = await supabase.from('User').insert({
      id: TEST_USER_ID,
      email: `vitest-product-${RUN_ID}@test.internal`,
      role: 'MERCHANT',
      updatedAt: new Date().toISOString(),
    })
    if (userErr) throw new Error(`Setup user: ${userErr.message}`)

    const now = new Date().toISOString()
    const { error: storeErr } = await supabase.from('Store').insert({
      id: TEST_STORE_ID,
      merchantId: TEST_USER_ID,
      name: `VT Store Product ${RUN_ID}`,
      slug: `vt-store-product-${RUN_ID}`,
      status: 'TRIAL',
      createdAt: now,
      updatedAt: now,
    })
    if (storeErr) throw new Error(`Setup store: ${storeErr.message}`)
  })

  afterAll(async () => {
    await Promise.all(createdProductIds.map(id => service.delete(id).catch(() => {})))
    await supabase.from('Store').delete().eq('id', TEST_STORE_ID)
    await supabase.from('User').delete().eq('id', TEST_USER_ID)
  })

  // ── create ─────────────────────────────────────────────────────────────────
  describe('create', () => {
    it('persiste un producto en Supabase y devuelve los datos correctos', async () => {
      const product = await createTestProduct('A')

      expect(product.id).toBeDefined()
      expect(product.storeId).toBe(TEST_STORE_ID)
      expect(product.name).toBe(`VT Product A ${RUN_ID}`)
      expect(product.price).toBe(99)
      expect(product.stock).toBe(10)
      expect(product.createdAt).toBeDefined()
    })

    it('persiste un producto con precio cero', async () => {
      const product = await createTestProduct('Free', { price: 0, stock: 100 })

      expect(product.price).toBe(0)
    })

    it('lanza error de validación cuando storeId está vacío', async () => {
      await expect(
        service.create({ storeId: '', name: 'Test', description: '', price: 10, stock: 1 })
      ).rejects.toThrow('storeId is required')
    })

    it('lanza error de validación cuando name está vacío', async () => {
      await expect(
        service.create({ storeId: TEST_STORE_ID, name: '', description: '', price: 10, stock: 1 })
      ).rejects.toThrow('name is required')
    })

    it('lanza error de validación cuando price es negativo', async () => {
      await expect(
        service.create({ storeId: TEST_STORE_ID, name: 'Test', description: '', price: -1, stock: 1 })
      ).rejects.toThrow('price must be a non-negative number')
    })

    it('lanza error de validación cuando stock es negativo', async () => {
      await expect(
        service.create({ storeId: TEST_STORE_ID, name: 'Test', description: '', price: 10, stock: -1 })
      ).rejects.toThrow('stock must be a non-negative integer')
    })
  })

  // ── findById ───────────────────────────────────────────────────────────────
  describe('findById', () => {
    let productId: string

    beforeAll(async () => {
      const product = await createTestProduct('FindById')
      productId = product.id
    })

    it('devuelve el producto cuando el ID existe en la BD', async () => {
      const result = await service.findById(productId)

      expect(result).not.toBeNull()
      expect(result?.id).toBe(productId)
      expect(result?.storeId).toBe(TEST_STORE_ID)
    })

    it('devuelve null cuando el ID no existe en la BD', async () => {
      const result = await service.findById(randomUUID())

      expect(result).toBeNull()
    })

    it('lanza error de validación cuando id está vacío', async () => {
      await expect(service.findById('')).rejects.toThrow('id is required')
    })
  })

  // ── findAllByStore ──────────────────────────────────────────────────────────
  describe('findAllByStore', () => {
    beforeAll(async () => {
      await createTestProduct('FStore1')
      await createTestProduct('FStore2')
    })

    it('devuelve todos los productos de la tienda', async () => {
      const result = await service.findAllByStore(TEST_STORE_ID)

      expect(result.length).toBeGreaterThanOrEqual(2)
      expect(result.every(p => p.storeId === TEST_STORE_ID)).toBe(true)
    })

    it('devuelve arreglo vacío para una tienda sin productos', async () => {
      const result = await service.findAllByStore(randomUUID())

      expect(result).toEqual([])
    })

    it('lanza error de validación cuando storeId está vacío', async () => {
      await expect(service.findAllByStore('')).rejects.toThrow('storeId is required')
    })
  })

  // ── update ─────────────────────────────────────────────────────────────────
  describe('update', () => {
    let productId: string

    beforeAll(async () => {
      const product = await createTestProduct('Update')
      productId = product.id
    })

    it('actualiza el nombre y lo persiste en la BD', async () => {
      const newName = `VT Updated Product ${RUN_ID}`
      const result = await service.update(productId, { name: newName })

      expect(result?.name).toBe(newName)

      const fetched = await service.findById(productId)
      expect(fetched?.name).toBe(newName)
    })

    it('actualiza el precio', async () => {
      const result = await service.update(productId, { price: 200 })

      expect(result?.price).toBe(200)
    })

    it('actualiza el stock', async () => {
      const result = await service.update(productId, { stock: 50 })

      expect(result?.stock).toBe(50)
    })

    it('actualiza la descripción', async () => {
      const result = await service.update(productId, { description: 'Desc actualizada' })

      expect(result?.description).toBe('Desc actualizada')
    })

    it('devuelve null cuando el ID no existe en la BD', async () => {
      const result = await service.update(randomUUID(), { name: 'X' })

      expect(result).toBeNull()
    })

    it('lanza error de validación cuando id está vacío', async () => {
      await expect(service.update('', { name: 'X' })).rejects.toThrow('id is required')
    })

    it('lanza error de validación cuando no se envían campos', async () => {
      await expect(service.update(productId, {}))
        .rejects.toThrow('at least one field must be provided to update')
    })

    it('lanza error de validación cuando price es negativo en update', async () => {
      await expect(service.update(productId, { price: -10 }))
        .rejects.toThrow('price must be a non-negative number')
    })

    it('lanza error de validación cuando stock es negativo en update', async () => {
      await expect(service.update(productId, { stock: -1 }))
        .rejects.toThrow('stock must be a non-negative integer')
    })
  })

  // ── updateStock ────────────────────────────────────────────────────────────
  describe('updateStock', () => {
    let productId: string

    beforeAll(async () => {
      const product = await createTestProduct('Stock')
      productId = product.id
    })

    it('actualiza el stock y lo persiste en la BD', async () => {
      const result = await service.updateStock(productId, 75)

      expect(result?.stock).toBe(75)

      const fetched = await service.findById(productId)
      expect(fetched?.stock).toBe(75)
    })

    it('acepta stock igual a cero', async () => {
      const result = await service.updateStock(productId, 0)

      expect(result?.stock).toBe(0)
    })

    it('devuelve null cuando el ID no existe en la BD', async () => {
      const result = await service.updateStock(randomUUID(), 10)

      expect(result).toBeNull()
    })

    it('lanza error de validación cuando id está vacío', async () => {
      await expect(service.updateStock('', 10)).rejects.toThrow('id is required')
    })

    it('lanza error de validación cuando stock es negativo', async () => {
      await expect(service.updateStock(productId, -5))
        .rejects.toThrow('stock must be a non-negative integer')
    })
  })

  // ── delete ─────────────────────────────────────────────────────────────────
  describe('delete', () => {
    let toDeleteId: string

    beforeEach(async () => {
      const product = await service.create({
        storeId: TEST_STORE_ID,
        name: `VT ToDelete ${RUN_ID} ${Date.now()}`,
        description: '',
        price: 1,
        stock: 1,
      })
      toDeleteId = product.id
    })

    it('elimina el producto y devuelve true', async () => {
      const result = await service.delete(toDeleteId)

      expect(result).toBe(true)

      const fetched = await service.findById(toDeleteId)
      expect(fetched).toBeNull()
    })

    it('lanza error de validación cuando id está vacío', async () => {
      createdProductIds.push(toDeleteId)
      await expect(service.delete('')).rejects.toThrow('id is required')
    })
  })
})
