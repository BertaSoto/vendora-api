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

const currentFile = fileURLToPath(import.meta.url)
const packageDir = dirname(dirname(currentFile))
const repoRoot = dirname(dirname(packageDir))

const envFiles = [
  join(repoRoot, '.env'),
  join(repoRoot, '.env.local'),
  join(packageDir, '.env'),
]

for (const envFile of envFiles) {
  if (existsSync(envFile)) {
    config({ path: envFile, override: true })
  }
}

const app = new Hono()

app.use('*', async (c, next) => {
  console.info(`[request] ${c.req.method} ${c.req.url}`)
  await next()
})

app.use('*', cors({
  origin: [
    'http://localhost:5173',
    'http://192.168.1.17:5173',
    'https://vendora-frontend.vercel.app',
    'https://vendora-frontend-xi.vercel.app',
  ],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
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
