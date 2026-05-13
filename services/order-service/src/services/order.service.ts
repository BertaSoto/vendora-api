import { OrderRepository } from '../repositories/order.repository.js'
import type { Order } from '../types/index.js'
import type { CreateOrderDto, OrderResponseDto } from '../dtos/order.dto.js'

export class OrderService {
  constructor(private readonly repository: OrderRepository) {}

  async create(dto: CreateOrderDto): Promise<OrderResponseDto> {
    this.validateCreateDto(dto)

    const total = dto.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    )

    const order: Order = {
      id: crypto.randomUUID(),
      storeId: dto.storeId,
      customerName: dto.customerName,
      items: dto.items,
      total,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }

    return this.repository.create(order)
  }

  async findById(id: string): Promise<OrderResponseDto | null> {
    if (!id) throw new Error('id is required')
    return this.repository.findById(id)
  }

  async findAllByStore(storeId: string): Promise<OrderResponseDto[]> {
    if (!storeId) throw new Error('storeId is required')
    return this.repository.findAllByStore(storeId)
  }

  private validateCreateDto(dto: CreateOrderDto): void {
    if (!dto.storeId || !dto.customerName) {
      throw new Error('storeId and customerName are required')
    }
    if (!dto.items || dto.items.length === 0) {
      throw new Error('items must be a non-empty array')
    }
    for (const item of dto.items) {
      if (!item.productId || !item.productName) {
        throw new Error('each item must have productId and productName')
      }
      if (
        typeof item.quantity !== 'number' ||
        item.quantity < 1
      ) {
        throw new Error('each item must have quantity >= 1')
      }
      if (typeof item.unitPrice !== 'number' || item.unitPrice < 0) {
        throw new Error('each item must have a non-negative unitPrice')
      }
    }
  }
}

const repository = new OrderRepository()
export const orderService = new OrderService(repository)
