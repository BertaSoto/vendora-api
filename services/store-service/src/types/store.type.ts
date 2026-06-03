export type StoreStatus = 'active' | 'suspended' | 'trial'

export interface Store {
  id: string
  merchantId: string
  name: string
  slug: string
  description: string | null
  status: StoreStatus
  createdAt: string
  updatedAt: string
}

export interface StoreRow {
  id: string
  merchantId: string
  name: string
  slug: string
  description: string | null
  status: StoreStatus
  createdAt: string
  updatedAt: string
}

export function rowToStore(row: StoreRow): Store {
  return {
    id: row.id,
    merchantId: row.merchantId,
    name: row.name,
    slug: row.slug,
    description: row.description,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}
