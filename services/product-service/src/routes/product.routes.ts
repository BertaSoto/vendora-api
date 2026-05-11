import { Hono } from 'hono'

const routes = new Hono()

routes.get('/', (c) => {
  return c.json({ message: 'Product routes' })
})

export default routes
