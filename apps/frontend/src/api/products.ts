import { apiFetch } from './client'
import type { Product, CreateProductDto, UpdateProductDto, UpdateStockDto } from '../types'

export const productsApi = {
  listByStore: (storeId: string) =>
    apiFetch<Product[]>(`/api/products?storeId=${storeId}`),

  getById: (id: string) =>
    apiFetch<Product>(`/api/products/${id}`),

  create: (dto: CreateProductDto) =>
    apiFetch<Product>('/api/products', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  update: (id: string, dto: UpdateProductDto) =>
    apiFetch<Product>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    }),

  updateStock: (id: string, dto: UpdateStockDto) =>
    apiFetch<Product>(`/api/products/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    }),

  remove: (id: string) =>
    apiFetch<void>(`/api/products/${id}`, { method: 'DELETE' }),
}
