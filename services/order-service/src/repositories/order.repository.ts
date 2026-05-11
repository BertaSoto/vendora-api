import type { Order } from '../types'

export class OrderRepository {
  private orders: Map<string, Order> = new Map()

  async create(order: Order): Promise<Order> {
    this.orders.set(order.id, order)
    return order
  }

  async findById(id: string): Promise<Order | null> {
    return this.orders.get(id) ?? null
  }

  async findAllByStore(storeId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (o) => o.storeId === storeId
    )
  }
}
