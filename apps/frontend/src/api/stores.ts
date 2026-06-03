import { apiFetch } from './client'
import type { Store, CreateStoreDto, UpdateStoreDto } from '../types'

export const storesApi = {
  list: () =>
    apiFetch<Store[]>('/api/stores'),

  getById: (id: string) =>
    apiFetch<Store>(`/api/stores/${id}`),

  create: (dto: CreateStoreDto) =>
    apiFetch<Store>('/api/stores', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  update: (id: string, dto: UpdateStoreDto) =>
    apiFetch<Store>(`/api/stores/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    }),

  remove: (id: string) =>
    apiFetch<void>(`/api/stores/${id}`, { method: 'DELETE' }),
}
