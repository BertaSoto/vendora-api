import { Hono } from 'hono'
import authRoutes from './routes/auth.routes.js'
import type { ApiSuccessResponse, HealthData } from './types/auth.type.js'

const app = new Hono()

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
