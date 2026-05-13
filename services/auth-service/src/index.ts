import { Hono } from 'hono'
import authRoutes from './routes/auth.routes.js'

const app = new Hono()

app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'auth-service',
  })
})

app.route('/auth', authRoutes)

export default app
