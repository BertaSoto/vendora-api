import type { OrderStatus } from '../types/index.js'

export interface CreateOrderDto {
  userId: string
  storeId: string
  productId: string
  quantity: number
}

export interface UpdateOrderDto {
  status?: OrderStatus
}

export type { Order as OrderResponseDto } from '../types/index.js'
