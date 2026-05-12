import type { Product } from '../types/index.js'

const STORE_ID = 'store-1'

const seedProducts: Product[] = [
  {
    id: 'prod-001',
    storeId: STORE_ID,
    name: 'Collar de plata 925',
    description: 'Collar artesanal de plata 925 con dije de corazón, largo 45 cm.',
    price: 25000,
    stock: 15,
    createdAt: '2025-01-10T10:00:00.000Z',
    updatedAt: '2025-01-10T10:00:00.000Z',
  },
  {
    id: 'prod-002',
    storeId: STORE_ID,
    name: 'Aretes de oro 18k',
    description: 'Aretes redondos de oro amarillo 18k, diámetro 1.5 cm.',
    price: 45000,
    stock: 8,
    createdAt: '2025-01-11T10:00:00.000Z',
    updatedAt: '2025-01-11T10:00:00.000Z',
  },
  {
    id: 'prod-003',
    storeId: STORE_ID,
    name: 'Pulsera de plata con piedras',
    description: 'Pulsera de plata 925 con incrustaciones de piedras naturales.',
    price: 18500,
    stock: 3,
    createdAt: '2025-01-12T10:00:00.000Z',
    updatedAt: '2025-01-12T10:00:00.000Z',
  },
  {
    id: 'prod-004',
    storeId: STORE_ID,
    name: 'Anillo solitario oro blanco',
    description: 'Anillo solitario de oro blanco 18k con diamante de 0.25 ct.',
    price: 85000,
    stock: 5,
    createdAt: '2025-01-13T10:00:00.000Z',
    updatedAt: '2025-01-13T10:00:00.000Z',
  },
  {
    id: 'prod-005',
    storeId: STORE_ID,
    name: 'Cadena de oro amarillo',
    description: 'Cadena tejido eslabón veneciano en oro amarillo 18k, 50 cm.',
    price: 62000,
    stock: 2,
    createdAt: '2025-01-14T10:00:00.000Z',
    updatedAt: '2025-01-14T10:00:00.000Z',
  },
  {
    id: 'prod-006',
    storeId: STORE_ID,
    name: 'Dije plata con turquesa',
    description: 'Dije artesanal de plata 925 con piedra turquesa natural.',
    price: 12000,
    stock: 20,
    createdAt: '2025-01-15T10:00:00.000Z',
    updatedAt: '2025-01-15T10:00:00.000Z',
  },
]

export class ProductRepository {
  private products: Map<string, Product> = new Map(
    seedProducts.map((p) => [p.id, p])
  )

  async create(product: Product): Promise<Product> {
    this.products.set(product.id, product)
    return product
  }

  async findAllByStore(storeId: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (p) => p.storeId === storeId
    )
  }

  async findById(id: string): Promise<Product | null> {
    return this.products.get(id) ?? null
  }

  async update(id: string, data: Partial<Product>): Promise<Product | null> {
    const existing = this.products.get(id)
    if (!existing) return null

    const updated: Product = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    }

    this.products.set(id, updated)
    return updated
  }

  async delete(id: string): Promise<boolean> {
    return this.products.delete(id)
  }
}
