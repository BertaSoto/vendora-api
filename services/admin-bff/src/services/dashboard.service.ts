import type { DashboardResponse, Store } from '../types/index.js'

interface ProductSummary {
  productsCount: number
  lowStockProducts: number
}

interface OrderSummary {
  pendingOrders: number
}

export class DashboardService {
  private async fetchStore(storeId: string): Promise<Store> {
    return {
      id: storeId,
      name: 'Joyas María',
      status: 'active',
    }
  }

  private async fetchProductSummary(_storeId: string): Promise<ProductSummary> {
    return {
      productsCount: 6,
      lowStockProducts: 2, // prod-003 (stock 3) y prod-005 (stock 2)
    }
  }

  private async fetchOrderSummary(_storeId: string): Promise<OrderSummary> {
    return {
      pendingOrders: 2, // order-001 y order-004
    }
  }

  async getDashboard(storeId: string): Promise<DashboardResponse> {
    const [store, products, orders] = await Promise.all([
      this.fetchStore(storeId),
      this.fetchProductSummary(storeId),
      this.fetchOrderSummary(storeId),
    ])

    return {
      store,
      summary: {
        productsCount: products.productsCount,
        lowStockProducts: products.lowStockProducts,
        pendingOrders: orders.pendingOrders,
      },
    }
  }
}

export const dashboardService = new DashboardService()
