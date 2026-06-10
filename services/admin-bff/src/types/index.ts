export interface Store {
  id: string
  name: string
  status: 'ACTIVE' | 'SUSPENDED' | 'TRIAL'
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
