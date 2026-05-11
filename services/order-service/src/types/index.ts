export type OrderStatus = 'pending' | 'confirmed' | 'delivered' | 'cancelled'

export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
}

export interface Order {
  id: string
  storeId: string
  customerName: string
  items: OrderItem[]
  total: number
  status: OrderStatus
  createdAt: string
}
