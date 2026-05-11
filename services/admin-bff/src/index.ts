import { Hono } from 'hono'
import dashboardRoutes from './routes/dashboard.routes.js'

const app = new Hono()

app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'admin-bff',
  })
})

app.route('/dashboard', dashboardRoutes)

export default app
