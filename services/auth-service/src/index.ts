import 'dotenv/config'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'
import authRoutes from './routes/auth.routes.js'
import type { ApiSuccessResponse, HealthData } from './types/auth.type.js'

const app = new Hono()

app.use('*', async (c, next) => {
  console.info(`[request] ${c.req.method} ${c.req.url}`)
  await next()
})

app.use('*', cors({
  origin: [
    'http://localhost:5173',
    'http://192.168.1.17:5173',
    'https://vendora-frontend.vercel.app',
    'https://vendora-frontend-xi.vercel.app',
  ],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

app.get('/health', (c) => {
  const response: ApiSuccessResponse<HealthData> = {
    success: true,
    message: 'Servicio auth-service operativo',
    data: {
      status: 'ok',
      service: 'auth-service',
    },
  }
  return c.json(response)
})

app.route('/auth', authRoutes)

if (process.env.VERCEL !== '1') {
  const port = Number(process.env.PORT ?? 3004)
  serve({ fetch: app.fetch, port })
  console.log(`auth-service running on http://localhost:${port}`)
}

export default app
