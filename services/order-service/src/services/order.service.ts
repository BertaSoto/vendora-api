import { supabase } from '../lib/supabase.js'
import type { Order, OrderRow } from '../types/index.js'
import { rowToOrder } from '../types/index.js'
import type { CreateOrderDto, UpdateOrderDto, OrderResponseDto } from '../dtos/order.dto.js'

export class OrderService {
  async create(dto: CreateOrderDto): Promise<OrderResponseDto> {
    this.validateCreateDto(dto)

    const { data: product, error: productError } = await supabase
      .from('Product')
      .select('name, price')
      .eq('id', dto.productId)
      .single<{ name: string; price: number }>()

    if (productError || !product) {
      throw new Error('Product not found')
    }

    const total = product.price * dto.quantity

    const { data, error } = await supabase
      .from('Order')
      .insert({
        user_id: dto.userId,
        store_id: dto.storeId,
        product_id: dto.productId,
        product_name: product.name,
        quantity: dto.quantity,
        total,
        status: 'pending',
      })
      .select()
      .single<OrderRow>()

    if (error) {
      throw new Error(error.message)
    }

    return rowToOrder(data)
  }

  async findById(id: string): Promise<OrderResponseDto | null> {
    if (!id) throw new Error('id is required')

    const { data, error } = await supabase
      .from('Order')
      .select()
      .eq('id', id)
      .single<OrderRow>()

    if (error) return null
    return rowToOrder(data)
  }

  async findAll(): Promise<OrderResponseDto[]> {
    const { data, error } = await supabase
      .from('Order')
      .select()
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return (data as OrderRow[]).map(rowToOrder)
  }

  async findAllByUserId(userId: string): Promise<OrderResponseDto[]> {
    if (!userId) throw new Error('userId is required')

    const { data, error } = await supabase
      .from('Order')
      .select()
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return (data as OrderRow[]).map(rowToOrder)
  }

  async findAllByStoreId(storeId: string): Promise<OrderResponseDto[]> {
    if (!storeId) throw new Error('storeId is required')

    const { data, error } = await supabase
      .from('Order')
      .select()
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return (data as OrderRow[]).map(rowToOrder)
  }

  async update(id: string, dto: UpdateOrderDto): Promise<OrderResponseDto | null> {
    if (!id) throw new Error('id is required')

    if (!dto.status) {
      throw new Error('status is required')
    }

    const validStatuses = ['pending', 'confirmed', 'delivered', 'cancelled']
    if (!validStatuses.includes(dto.status)) {
      throw new Error(`status must be one of: ${validStatuses.join(', ')}`)
    }

    const { data, error } = await supabase
      .from('Order')
      .update({ status: dto.status })
      .eq('id', id)
      .select()
      .single<OrderRow>()

    if (error) return null
    return rowToOrder(data)
  }

  async updateStatus(id: string, status: string): Promise<OrderResponseDto | null> {
    if (!id) throw new Error('id is required')

    const validStatuses = ['pending', 'confirmed', 'delivered', 'cancelled']
    if (!validStatuses.includes(status)) {
      throw new Error(`status must be one of: ${validStatuses.join(', ')}`)
    }

    const { data, error } = await supabase
      .from('Order')
      .update({ status })
      .eq('id', id)
      .select()
      .single<OrderRow>()

    if (error) return null
    return rowToOrder(data)
  }

  async delete(id: string): Promise<boolean> {
    if (!id) throw new Error('id is required')

    const { error } = await supabase
      .from('Order')
      .delete()
      .eq('id', id)

    if (error) throw new Error(error.message)
    return true
  }

  private validateCreateDto(dto: CreateOrderDto): void {
    if (!dto.userId) {
      throw new Error('userId is required')
    }
    if (!dto.storeId) {
      throw new Error('storeId is required')
    }
    if (!dto.productId) {
      throw new Error('productId is required')
    }
    if (typeof dto.quantity !== 'number' || dto.quantity < 1) {
      throw new Error('quantity must be a positive integer')
    }
  }
}

export const orderService = new OrderService()
