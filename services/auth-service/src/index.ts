import { Hono } from 'hono'
import { cors } from 'hono/cors'
import authRoutes from './routes/auth.routes.js'
import type { ApiSuccessResponse, HealthData } from './types/auth.type.js'

const app = new Hono()

app.use('*', cors({
  origin: [
    'https://vendora-frontend-xi.vercel.app',
    'http://localhost:3000',
  ],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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

export default app
