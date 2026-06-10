import 'dotenv/config'
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import storeRoutes from './routes/store.routes.js'

const app = new Hono()

app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'store-service',
  })
})

app.route('/stores', storeRoutes)

if (process.env.VERCEL !== '1') {
  const port = Number(process.env.PORT ?? 3003)
  serve({ fetch: app.fetch, port })
  console.log(`store-service running on http://localhost:${port}`)
}

export default app
