import 'dotenv/config'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'
import dashboardRoutes from './routes/dashboard.routes.js'

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
    service: 'admin-bff',
  })
})

app.route('/dashboard', dashboardRoutes)

if (process.env.VERCEL !== '1') {
  const port = Number(process.env.PORT ?? 3000)
  serve({ fetch: app.fetch, port })
  console.log(`admin-bff running on http://localhost:${port}`)
}

export default app
