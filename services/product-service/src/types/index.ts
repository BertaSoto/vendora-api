export interface Product {
  id: string
  storeId: string
  name: string
  description: string
  price: number
  stock: number
  createdAt: string
  updatedAt: string
}

export interface ProductRow {
  id: string
  store_id: string
  name: string
  description: string
  price: number
  stock: number
  created_at: string
  updated_at: string
}

export function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    storeId: row.store_id,
    name: row.name,
    description: row.description,
    price: row.price,
    stock: row.stock,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
