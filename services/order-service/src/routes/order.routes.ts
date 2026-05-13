import { Hono } from 'hono'

import { orderService } from '../services/order.service.js'
import type { CreateOrderDto } from '../dtos/order.dto.js'

const orderRoutes = new Hono()

orderRoutes.post('/', async (c) => {
  try {
    const body = await c.req.json<CreateOrderDto>()
    const order = await orderService.create(body)
    return c.json(order, 201)
  } catch (err) {
    return c.json({ error: (err as Error).message }, 400)
  }
})

orderRoutes.get('/:id', async (c) => {
  const id = c.req.param('id')
  try {
    const order = await orderService.findById(id)
    if (!order) {
      return c.json({ error: 'Order not found' }, 404)
    }
    return c.json(order)
  } catch (err) {
    return c.json({ error: (err as Error).message }, 400)
  }
})

orderRoutes.get('/', async (c) => {
  const storeId = c.req.query('storeId')
  if (!storeId) {
    return c.json({ error: 'storeId query parameter is required' }, 400)
  }
  try {
    const orders = await orderService.findAllByStore(storeId)
    return c.json(orders)
  } catch (err) {
    return c.json({ error: (err as Error).message }, 400)
  }
})

export default orderRoutes