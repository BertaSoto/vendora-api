const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? ''
const TOKEN_KEY = 'vendora_token'

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`
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
