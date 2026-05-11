import { apiFetch } from './client'
import type { Product, CreateProductDto, UpdateStockDto } from '../types'

export const productsApi = {
  list: (storeId: string) =>
    apiFetch<Product[]>(`/api/products?storeId=${storeId}`),

  getById: (id: string) =>
    apiFetch<Product>(`/api/products/${id}`),

  create: (dto: CreateProductDto) =>
    apiFetch<Product>('/api/products', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  updateStock: (id: string, dto: UpdateStockDto) =>
    apiFetch<Product>(`/api/products/${id}/stock`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    }),

  delete: (id: string) =>
    apiFetch<void>(`/api/products/${id}`, { method: 'DELETE' }),
}
