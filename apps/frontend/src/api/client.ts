const TOKEN_KEY = 'vendora_token'

// En producción no hay rewrites: mapeamos /api/X/* → env var base + /X/*
function resolveUrl(path: string): string {
  if (process.env.NODE_ENV !== 'production') return path

  const serviceMap: [string, string | undefined][] = [
    ['/api/auth', process.env.NEXT_PUBLIC_AUTH_SERVICE_URL && `${process.env.NEXT_PUBLIC_AUTH_SERVICE_URL}/auth`],
    ['/api/products', process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL && `${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL}/products`],
    ['/api/orders', process.env.NEXT_PUBLIC_ORDER_SERVICE_URL && `${process.env.NEXT_PUBLIC_ORDER_SERVICE_URL}/orders`],
    ['/api/stores', process.env.NEXT_PUBLIC_STORE_SERVICE_URL && `${process.env.NEXT_PUBLIC_STORE_SERVICE_URL}/stores`],
    ['/api/dashboard', process.env.NEXT_PUBLIC_BFF_URL && `${process.env.NEXT_PUBLIC_BFF_URL}/dashboard`],
  ]

  for (const [prefix, base] of serviceMap) {
    if (base && path.startsWith(prefix)) {
      return `${base}${path.slice(prefix.length)}`
    }
  }
  return path
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = resolveUrl(path)
  const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    ...options,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error((error as { error: string }).error ?? res.statusText)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}
