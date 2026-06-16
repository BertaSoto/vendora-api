import { config } from 'dotenv'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { swaggerUI } from '@hono/swagger-ui'
import storeRoutes from './routes/store.routes.js'
import { buildStoreOpenAPISpec } from './docs/openapi.js'

const currentFile = fileURLToPath(import.meta.url)
const packageDir = dirname(dirname(currentFile))
const repoRoot = dirname(dirname(packageDir))
const envPaths = [
  join(repoRoot, '.env.local'),
  join(repoRoot, '.env'),
  join(packageDir, '.env'),
]
const envPath = envPaths.find((path) => existsSync(path))

if (envPath) {
  config({ path: envPath })
} else {
  config()
}

const app = new Hono()

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
