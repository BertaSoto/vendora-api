import { apiFetch } from './client'
import type { Order, CreateOrderDto, UpdateOrderStatusDto } from '../types'

export const ordersApi = {
  listByStore: (storeId: string) =>
    apiFetch<Order[]>(`/api/orders?storeId=${storeId}`),

  getById: (id: string) =>
    apiFetch<Order>(`/api/orders/${id}`),

  create: (dto: CreateOrderDto) =>
    apiFetch<Order>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  update: (id: string, dto: UpdateOrderStatusDto) =>
    apiFetch<Order>(`/api/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    }),

  updateStatus: (id: string, dto: UpdateOrderStatusDto) =>
    apiFetch<Order>(`/api/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    }),

  remove: (id: string) =>
    apiFetch<void>(`/api/orders/${id}`, { method: 'DELETE' }),
}
