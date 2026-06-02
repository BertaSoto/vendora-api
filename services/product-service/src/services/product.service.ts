import { supabase } from '../lib/supabase.js'
import type { Product, ProductRow } from '../types/index.js'
import { rowToProduct } from '../types/index.js'
import type { CreateProductDto, UpdateProductDto, ProductResponseDto } from '../dtos/product.dto.js'

export class ProductService {
  async create(dto: CreateProductDto): Promise<ProductResponseDto> {
    this.validateCreateDto(dto)

    const { data, error } = await supabase
      .from('products')
      .insert({
        store_id: dto.storeId,
        name: dto.name,
        description: dto.description,
        price: dto.price,
        stock: dto.stock,
      })
      .select()
      .single<ProductRow>()

    if (error) {
      if (error.code === '23505') {
        throw new Error(`A product with the name "${dto.name}" already exists in this store.`)
      }
      throw new Error(error.message)
    }

    return rowToProduct(data)
  }

  async findById(id: string): Promise<ProductResponseDto | null> {
    if (!id) throw new Error('id is required')

    const { data, error } = await supabase
      .from('products')
      .select()
      .eq('id', id)
      .single<ProductRow>()

    if (error) return null
    return rowToProduct(data)
  }

  async findAllByStore(storeId: string): Promise<ProductResponseDto[]> {
    if (!storeId) throw new Error('storeId is required')

    const { data, error } = await supabase
      .from('products')
      .select()
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return (data as ProductRow[]).map(rowToProduct)
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductResponseDto | null> {
    if (!id) throw new Error('id is required')

    const updates: Record<string, unknown> = {}
    if (dto.name !== undefined) updates.name = dto.name
    if (dto.description !== undefined) updates.description = dto.description
    if (dto.price !== undefined) {
      if (typeof dto.price !== 'number' || dto.price < 0) {
        throw new Error('price must be a non-negative number')
      }
      updates.price = dto.price
    }
    if (dto.stock !== undefined) {
      if (typeof dto.stock !== 'number' || dto.stock < 0) {
        throw new Error('stock must be a non-negative integer')
      }
      updates.stock = dto.stock
    }

    if (Object.keys(updates).length === 0) {
      throw new Error('at least one field must be provided to update')
    }

    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single<ProductRow>()

    if (error) return null
    return rowToProduct(data)
  }

  async delete(id: string): Promise<boolean> {
    if (!id) throw new Error('id is required')

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) throw new Error(error.message)
    return true
  }

  async updateStock(id: string, stock: number): Promise<ProductResponseDto | null> {
    if (!id) throw new Error('id is required')
    if (typeof stock !== 'number' || stock < 0) {
      throw new Error('stock must be a non-negative integer')
    }

    const { data, error } = await supabase
      .from('products')
      .update({ stock })
      .eq('id', id)
      .select()
      .single<ProductRow>()

    if (error) return null
    return rowToProduct(data)
  }

  private validateCreateDto(dto: CreateProductDto): void {
    if (!dto.storeId) {
      throw new Error('storeId is required')
    }
    if (!dto.name || dto.name.trim().length === 0) {
      throw new Error('name is required')
    }
    if (typeof dto.price !== 'number' || dto.price < 0) {
      throw new Error('price must be a non-negative number')
    }
    if (typeof dto.stock !== 'number' || dto.stock < 0) {
      throw new Error('stock must be a non-negative integer')
    }
  }
}

export const productService = new ProductService()
