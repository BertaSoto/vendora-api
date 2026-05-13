import type { Store, StoreStatus } from '../types/store.type.js'

export interface CreateStoreDto {
  merchantId: string
  name: string
  description?: string
}

export interface UpdateStoreDto {
  name?: string
  description?: string
  status?: StoreStatus
}

export type StoreResponseDto = Store
