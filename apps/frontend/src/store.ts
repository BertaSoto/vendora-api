const STORE_ID_KEY = 'vendora_store_id'

export function getStoreId(): string {
  return localStorage.getItem(STORE_ID_KEY) ?? 'store-1'
}

export function setStoreId(id: string): void {
  localStorage.setItem(STORE_ID_KEY, id)
}
