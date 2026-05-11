import { ProductRepository } from '../repositories/product.repository'
import type { Product } from '../types'
import type { CreateProductDto, UpdateStockDto, ProductResponseDto } from '../dtos/product.dto'

export class ProductService {
  constructor(private readonly repository: ProductRepository) {}

  async create(dto: CreateProductDto): Promise<ProductResponseDto> {
    this.validateCreateDto(dto)

    const product: Product = {
      id: crypto.randomUUID(),
      storeId: dto.storeId,
      name: dto.name,
      description: dto.description ?? '',
      price: dto.price,
      stock: dto.stock,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return this.repository.create(product)
  }

  async findAllByStore(storeId: string): Promise<ProductResponseDto[]> {
    if (!storeId) throw new Error('storeId is required')
    return this.repository.findAllByStore(storeId)
  }

  async findById(id: string): Promise<ProductResponseDto | null> {
    if (!id) throw new Error('id is required')
    return this.repository.findById(id)
  }

  async updateStock(id: string, dto: UpdateStockDto): Promise<ProductResponseDto | null> {
    if (typeof dto.stock !== 'number' || dto.stock < 0) {
      throw new Error('stock must be a non-negative integer')
    }
    return this.repository.update(id, { stock: dto.stock })
  }

  async delete(id: string): Promise<boolean> {
    if (!id) throw new Error('id is required')
    return this.repository.delete(id)
  }

  private validateCreateDto(dto: CreateProductDto): void {
    if (!dto.storeId || !dto.name) {
      throw new Error('storeId and name are required')
    }
    if (typeof dto.price !== 'number' || dto.price < 0) {
      throw new Error('price must be a non-negative number')
    }
    if (typeof dto.stock !== 'number' || dto.stock < 0) {
      throw new Error('stock must be a non-negative integer')
    }
  }
}

const repository = new ProductRepository()
export const productService = new ProductService(repository)
