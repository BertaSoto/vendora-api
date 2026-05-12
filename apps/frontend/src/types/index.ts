export type OrderStatus = 'pending' | 'confirmed' | 'delivered' | 'cancelled'

export interface Store {
  id: string
  name: string
  status: 'active' | 'inactive' | 'suspended'
}

export interface DashboardSummary {
  productsCount: number
  lowStockProducts: number
  pendingOrders: number
}

export interface DashboardResponse {
  store: Store
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

export interface UpdateStockDto {
  stock: number
}

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
