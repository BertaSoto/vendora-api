import { Hono } from 'hono'

import { orderService } from '../services/order.service.js'
import { validateJWT } from '@vendora/auth-middleware'
import type { CreateOrderDto, UpdateOrderDto } from '../dtos/order.dto.js'

const orderRoutes = new Hono()

orderRoutes.post('/', validateJWT(), async (c) => {
  try {
    const { storeId, productId, quantity } = await c.req.json<Omit<CreateOrderDto, 'userId'> & { userId?: string }>()
    const user = c.get('user')
    const dto: CreateOrderDto = { userId: user.id, storeId, productId, quantity }
    const order = await orderService.create(dto)
    return c.json(order, 201)
  } catch (err) {
    console.error('[ORDER ROUTE] POST error:', err)
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
    console.error('[ORDER ROUTE] GET list error:', err)
    return c.json({ error: (err as Error).message }, 400)
  }
})

orderRoutes.get('/:id', async (c) => {
  const id = c.req.param('id')!

  try {
    const order = await orderService.findById(id)
    if (!order) {
      return c.json({ error: 'Order not found' }, 404)
    }
    return c.json(order)
  } catch (err) {
    console.error('[ORDER ROUTE] GET by id error:', err)
    return c.json({ error: (err as Error).message }, 400)
  }
})

orderRoutes.put('/:id', validateJWT(), async (c) => {
  const id = c.req.param('id')!

  try {
    const body = await c.req.json<UpdateOrderDto>()
    const order = await orderService.update(id, body)

    if (!order) {
      return c.json({ error: 'Order not found' }, 404)
    }

    return c.json(order)
  } catch (err) {
    console.error('[ORDER ROUTE] PUT error:', err)
    return c.json({ error: (err as Error).message }, 400)
  }
})

orderRoutes.patch('/:id/status', validateJWT(), async (c) => {
  const id = c.req.param('id')!

  try {
    const { status } = await c.req.json<{ status: string }>()
    const order = await orderService.updateStatus(id, status)

    if (!order) {
      return c.json({ error: 'Order not found' }, 404)
    }

    return c.json(order)
  } catch (err) {
    console.error('[ORDER ROUTE] PATCH status error:', err)
    return c.json({ error: (err as Error).message }, 400)
  }
})

orderRoutes.delete('/:id', validateJWT(), async (c) => {
  const id = c.req.param('id')!

  try {
    await orderService.delete(id)
    return c.json({ message: 'Order deleted successfully' })
  } catch (err) {
    console.error('[ORDER ROUTE] DELETE error:', err)
    return c.json({ error: (err as Error).message }, 400)
  }
})

export default orderRoutes
