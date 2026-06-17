import { Hono } from 'hono'
import storeRoutes from '../../../src/routes/store.routes.js'

// App Hono en-proceso: mismas rutas que el servidor real, sin levantar un puerto
const app = new Hono()
app.get('/health', (c) => c.json({ status: 'ok', service: 'store-service' }))
app.route('/stores', storeRoutes)

export interface ApiResponse<T = unknown> {
  status: number
  body: T
}

interface ReqOptions {
  method?: string
  body?: unknown
  jwt?: string
}

/**
 * Realiza una petición HTTP en-proceso al store-service.
 * Usa la misma URL base que el servidor real (http://localhost:3003).
 */
export async function callAPI<T = unknown>(
  path: string,
  options: ReqOptions = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, jwt } = options
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (jwt) headers['Authorization'] = `Bearer ${jwt}`

  const res = await app.fetch(
    new Request(`http://localhost:3003${path}`, {
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
