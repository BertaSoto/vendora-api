import { config } from 'dotenv'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'
import { swaggerUI } from '@hono/swagger-ui'
import storeRoutes from './routes/store.routes.js'
import { buildStoreOpenAPISpec } from './docs/openapi.js'

const app = new Hono()

app.use('*', async (c, next) => {
  console.info(`[request] ${c.req.method} ${c.req.url}`)
  await next()
})

app.use('*', cors({
  origin: [
    'https://vendora-frontend-xi.vercel.app',
    'http://localhost:5173',
  ],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'store-service',
  })
})

app.route('/stores', storeRoutes)

app.get('/openapi.json', (c) => {
  c.header('Content-Type', 'application/json')
  return c.json(buildStoreOpenAPISpec())
})
app.get('/api-docs', swaggerUI({ url: '/openapi.json' }))

if (process.env.VERCEL !== '1') {
  const port = Number(process.env.PORT ?? 3003)
  serve({ fetch: app.fetch, port })
  console.log(`store-service running on http://localhost:${port}`)
}

export default app
