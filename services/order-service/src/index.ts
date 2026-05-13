import { Hono } from 'hono'
import orderRoutes from './routes/order.routes.js'

const app = new Hono()

app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'order-service',
  })
})

app.route('/orders', orderRoutes)

export default app
