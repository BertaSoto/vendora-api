import { Hono } from 'hono'
import orderRoutes from '../../../src/routes/order.routes.js'

const app = new Hono()
app.get('/health', (c) => c.json({ status: 'ok', service: 'order-service' }))
app.route('/orders', orderRoutes)

export interface ApiResponse<T = unknown> {
  status: number
  body: T
}

interface ReqOptions {
  method?: string
  body?: unknown
  jwt?: string
}

export async function callAPI<T = unknown>(
  path: string,
  options: ReqOptions = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, jwt } = options
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (jwt) headers['Authorization'] = `Bearer ${jwt}`

  const res = await app.fetch(
    new Request(`http://localhost:3002${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  )

  return {
    status: res.status,
    body: (await res.json().catch(() => null)) as T,
  }
}
