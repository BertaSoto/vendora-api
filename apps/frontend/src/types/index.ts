export type OrderStatus = 'pending' | 'confirmed' | 'delivered' | 'cancelled'
export type StoreStatus = 'ACTIVE' | 'SUSPENDED' | 'TRIAL'

export interface Store {
  id: string
  merchantId: string
  name: string
  slug: string
  description: string | null
  status: StoreStatus
  createdAt: string
  updatedAt: string
}

export interface DashboardSummary {
  productsCount: number
  lowStockProducts: number
  pendingOrders: number
}

export interface DashboardResponse {
  store: {
    id: string
    name: string
    status: string
  }
  summary: DashboardSummary
}

export interface Product {
  id: string
  storeId: string
  name: string
  description: string
  price: number
  stock: number
  createdAt: string
  updatedAt: string
}

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

export interface UpdateStockDto {
  stock: number
}

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

export interface CreateOrderDto {
  storeId: string
  productId: string
  quantity: number
}

export interface UpdateOrderStatusDto {
  status: OrderStatus
}

export interface CreateStoreDto {
  name: string
  description?: string
}

export interface UpdateStoreDto {
  name?: string
  description?: string
  status?: StoreStatus
}
