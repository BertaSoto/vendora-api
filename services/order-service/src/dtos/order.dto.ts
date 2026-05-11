export interface CreateOrderItemDto {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
}

export interface CreateOrderDto {
  storeId: string
  customerName: string
  items: CreateOrderItemDto[]
}

export type { Order as OrderResponseDto } from '../types'
