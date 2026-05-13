import { Hono } from 'hono'
import storeRoutes from './routes/store.routes.js'

const app = new Hono()

app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'store-service',
  })
})

app.route('/stores', storeRoutes)

export default app
