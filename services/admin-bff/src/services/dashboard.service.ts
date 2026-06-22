import { supabase } from '../lib/supabase.js'
import type { Store, DashboardSummary, DashboardResponse } from '../types/index.js'

const LOW_STOCK_THRESHOLD = 5

export class DashboardService {
  private async fetchStore(storeId: string): Promise<Store> {
    const { data, error } = await supabase
      .from('Store')
      .select('id, name, status')
      .eq('id', storeId)
      .single<{ id: string; name: string; status: string }>()

    if (error || !data) {
      throw new Error('Store not found')
    }

    return {
      id: data.id,
      name: data.name,
      status: data.status as Store['status'],
    }
  }

  private async fetchSummary(storeId: string): Promise<DashboardSummary> {
    const { data, error } = await supabase
      .from('Product')
      .select('stock')
      .eq('store_id', storeId)

    if (error) {
      return { productsCount: 0, ordersCount: 0, lowStockProducts: 0, pendingOrders: 0 }
    }

    const products = data as { stock: number }[]
    const productsCount = products.length
    const lowStockProducts = products.filter(p => p.stock < LOW_STOCK_THRESHOLD).length

    const { count: ordersCount, error: orderError } = await supabase
      .from('Order')
      .select('id', { count: 'exact', head: true })
      .eq('store_id', storeId)

    const { count: pendingOrders, error: pendingError } = await supabase
      .from('Order')
      .select('id', { count: 'exact', head: true })
      .eq('store_id', storeId)
      .eq('status', 'pending')

    return {
      productsCount,
      ordersCount: orderError ? 0 : (ordersCount ?? 0),
      lowStockProducts,
      pendingOrders: pendingError ? 0 : (pendingOrders ?? 0),
    }
  }

  async getDashboard(storeId: string): Promise<DashboardResponse> {
    const store = await this.fetchStore(storeId)
    const summary = await this.fetchSummary(storeId)

    return { store, summary }
  }
}

export const dashboardService = new DashboardService()
