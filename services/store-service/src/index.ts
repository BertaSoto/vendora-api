import { Hono } from 'hono'

const app = new Hono()

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'store-service'
  })
})

export default app