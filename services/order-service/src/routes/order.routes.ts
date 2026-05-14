import { Hono } from 'hono'

import { orderService } from '../services/order.service.js'
import type { CreateOrderDto, UpdateOrderDto } from '../dtos/order.dto.js'

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

orderRoutes.get('/', async (c) => {
  try {
    const userId = c.req.query('userId')
    const storeId = c.req.query('storeId')

    if (userId) {
      const orders = await orderService.findAllByUserId(userId)
      return c.json(orders)
    }

    if (storeId) {
      const orders = await orderService.findAllByStoreId(storeId)
      return c.json(orders)
    }

    const orders = await orderService.findAll()
    return c.json(orders)
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

orderRoutes.patch('/:id', async (c) => {
  const id = c.req.param('id')

  try {
    const body = await c.req.json<UpdateOrderDto>()
    const order = await orderService.update(id, body)

    if (!order) {
      return c.json({ error: 'Order not found' }, 404)
    }

    return c.json(order)
  } catch (err) {
    return c.json({ error: (err as Error).message }, 400)
  }
})

orderRoutes.delete('/:id', async (c) => {
  const id = c.req.param('id')

  try {
    await orderService.delete(id)
    return c.json({ message: 'Order deleted successfully' })
  } catch (err) {
    return c.json({ error: (err as Error).message }, 400)
  }
})

export default orderRoutes
