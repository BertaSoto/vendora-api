import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import orderRoutes from './routes/order.routes.js'

const app = new Hono()

app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'order-service',
  })
})

app.route('/orders', orderRoutes)

if (process.env.VERCEL !== '1') {
  const port = Number(process.env.PORT ?? 3002)
  serve({ fetch: app.fetch, port })
  console.log(`order-service running on http://localhost:${port}`)
}

export default app
