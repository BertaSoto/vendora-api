import { Hono } from 'hono'
import productRoutes from './routes/product.routes.js'

const app = new Hono()

app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'product-service',
  })
})

app.route('/products', productRoutes)

export default app
