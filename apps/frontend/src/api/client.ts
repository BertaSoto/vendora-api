const PRODUCTION_URLS: Record<string, string | undefined> = {
  '/api/auth': process.env.NEXT_PUBLIC_AUTH_SERVICE_URL
    ? `${process.env.NEXT_PUBLIC_AUTH_SERVICE_URL}/auth`
    : undefined,
  '/api/products': process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL
    ? `${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL}/products`
    : undefined,
  '/api/orders': process.env.NEXT_PUBLIC_ORDER_SERVICE_URL
    ? `${process.env.NEXT_PUBLIC_ORDER_SERVICE_URL}/orders`
    : undefined,
  '/api/stores': process.env.NEXT_PUBLIC_STORE_SERVICE_URL
    ? `${process.env.NEXT_PUBLIC_STORE_SERVICE_URL}/stores`
    : undefined,
  '/api/dashboard': process.env.NEXT_PUBLIC_ADMIN_BFF_URL
    ? `${process.env.NEXT_PUBLIC_ADMIN_BFF_URL}/dashboard`
    : undefined,
}

function resolveUrl(path: string): string {
  if (process.env.NODE_ENV !== 'production') return path

  for (const [prefix, baseUrl] of Object.entries(PRODUCTION_URLS)) {
    if (baseUrl && path.startsWith(prefix)) {
      return path.replace(prefix, baseUrl)
    }
  }

  return path
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = resolveUrl(path)
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error((error as { error: string }).error ?? res.statusText)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}
