export type OrderStatus = 'pending' | 'confirmed' | 'delivered' | 'cancelled'

export interface Order {
  id: string
  userId: string
  storeId: string
  productId: string
  productName: string | null
  quantity: number
  total: number
  status: OrderStatus
  createdAt: string
  updatedAt: string
}

export interface OrderRow {
  id: string
  user_id: string
  store_id: string
  product_id: string
  quantity: number
  total: number
  status: OrderStatus
  created_at: string
  updated_at: string
}

export function rowToOrder(row: OrderRow & { product_name?: string | null }): Order {
  return {
    id: row.id,
    userId: row.user_id,
    storeId: row.store_id,
    productId: row.product_id,
    productName: row.product_name ?? null,
    quantity: row.quantity,
    total: row.total,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
