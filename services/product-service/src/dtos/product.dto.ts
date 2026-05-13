export interface CreateProductDto {
  storeId: string
  name: string
  description: string
  price: number
  stock: number
}

export interface UpdateProductDto {
  name?: string
  description?: string
  price?: number
  stock?: number
}

export type { Product as ProductResponseDto } from '../types/index.js'
