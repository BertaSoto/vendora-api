import 'dotenv/config'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'
import { swaggerUI } from '@hono/swagger-ui'
import productRoutes from './routes/product.routes.js'
import { buildProductOpenAPISpec } from './docs/openapi.js'

const app = new Hono()

app.use('*', cors({
  origin: [
    'https://vendora-frontend-xi.vercel.app',
    'http://localhost:3000',
  ],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'product-service',
  })
})

app.route('/products', productRoutes)

app.get('/openapi.json', (c) => {
  c.header('Content-Type', 'application/json')
  return c.json(buildProductOpenAPISpec())
})
app.get('/api-docs', swaggerUI({ url: '/openapi.json' }))

if (process.env.VERCEL !== '1') {
  const port = Number(process.env.PORT ?? 3001)
  serve({ fetch: app.fetch, port })
  console.log(`product-service running on http://localhost:${port}`)
}

export default app
