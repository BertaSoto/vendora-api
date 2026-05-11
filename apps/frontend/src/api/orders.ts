import { apiFetch } from './client'
import type { Order, CreateOrderDto } from '../types'

export const ordersApi = {
  list: (storeId: string) =>
    apiFetch<Order[]>(`/api/orders?storeId=${storeId}`),

  getById: (id: string) =>
    apiFetch<Order>(`/api/orders/${id}`),

  create: (dto: CreateOrderDto) =>
    apiFetch<Order>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),
}
