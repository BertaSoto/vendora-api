import { apiFetch } from './client'
import type { Store } from '../types'

export const storesApi = {
  list: () => apiFetch<Store[]>('/api/stores'),
  getById: (id: string) => apiFetch<Store>(`/api/store/${id}`),
}
