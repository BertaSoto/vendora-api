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
  merchant_id: string
  name: string
  slug: string
  description: string | null
  status: StoreStatus
  created_at: string
  updated_at: string
}

export function rowToStore(row: StoreRow): Store {
  return {
    id: row.id,
    merchantId: row.merchant_id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
