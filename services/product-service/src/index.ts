import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import productRoutes from './routes/product.routes.js'

const app = new Hono()

app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'product-service',
  })
})

app.route('/products', productRoutes)

if (process.env.VERCEL !== '1') {
  const port = Number(process.env.PORT ?? 3001)
  serve({ fetch: app.fetch, port })
  console.log(`product-service running on http://localhost:${port}`)
}

export default app
