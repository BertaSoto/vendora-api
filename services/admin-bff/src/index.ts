import { Hono } from 'hono'
import dashboardRoutes from './routes/dashboard.routes'

const app = new Hono()

app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'admin-bff',
  })
})

app.route('/dashboard', dashboardRoutes)

export default app
