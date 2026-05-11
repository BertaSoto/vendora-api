import type { Product } from '../types'

export class ProductRepository {
  private products: Map<string, Product> = new Map()

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
