import type { Order } from '../types/index.js'

const STORE_ID = 'store-1'

const seedOrders: Order[] = [
  {
    id: 'order-001',
    storeId: STORE_ID,
    customerName: 'Ana González',
    items: [
      {
        productId: 'prod-001',
        productName: 'Collar de plata 925',
        quantity: 2,
        unitPrice: 25000,
      },
    ],
    total: 50000,
    status: 'pending',
    createdAt: '2025-05-01T14:30:00.000Z',
  },
  {
    id: 'order-002',
    storeId: STORE_ID,
    customerName: 'Carlos Muñoz',
    items: [
      {
        productId: 'prod-004',
        productName: 'Anillo solitario oro blanco',
        quantity: 1,
        unitPrice: 85000,
      },
      {
        productId: 'prod-002',
        productName: 'Aretes de oro 18k',
        quantity: 1,
        unitPrice: 45000,
      },
    ],
    total: 130000,
    status: 'confirmed',
    createdAt: '2025-05-03T09:15:00.000Z',
  },
  {
    id: 'order-003',
    storeId: STORE_ID,
    customerName: 'María Silva',
    items: [
      {
        productId: 'prod-003',
        productName: 'Pulsera de plata con piedras',
        quantity: 1,
        unitPrice: 18500,
      },
    ],
    total: 18500,
    status: 'delivered',
    createdAt: '2025-04-28T16:00:00.000Z',
  },
  {
    id: 'order-004',
    storeId: STORE_ID,
    customerName: 'Rodrigo Pérez',
    items: [
      {
        productId: 'prod-006',
        productName: 'Dije plata con turquesa',
        quantity: 3,
        unitPrice: 12000,
      },
    ],
    total: 36000,
    status: 'pending',
    createdAt: '2025-05-10T11:45:00.000Z',
  },
  {
    id: 'order-005',
    storeId: STORE_ID,
    customerName: 'Valentina Torres',
    items: [
      {
        productId: 'prod-005',
        productName: 'Cadena de oro amarillo',
        quantity: 1,
        unitPrice: 62000,
      },
    ],
    total: 62000,
    status: 'cancelled',
    createdAt: '2025-04-20T08:00:00.000Z',
  },
]

export class OrderRepository {
  private orders: Map<string, Order> = new Map(
    seedOrders.map((o) => [o.id, o])
  )

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
