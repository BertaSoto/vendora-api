export interface Store {
  id: string
  name: string
  status: 'active' | 'suspended' | 'trial'
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
