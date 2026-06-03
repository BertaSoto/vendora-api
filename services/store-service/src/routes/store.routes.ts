import { Hono } from 'hono'

import { storeService } from '../services/store.service.js'
import { validateJWT } from '@vendora/auth-middleware'
import type { CreateStoreDto, UpdateStoreDto } from '../dtos/store.dto.js'

const storeRoutes = new Hono()

storeRoutes.post('/', validateJWT(), async (c) => {
  try {
    const body = await c.req.json<CreateStoreDto>()
    const user = c.get('user')
    const dto: CreateStoreDto = { ...body, merchantId: body.merchantId || user.id }
    const store = await storeService.create(dto)
    return c.json(store, 201)
  } catch (err) {
    console.error('[STORE ROUTE] POST error:', err)
    return c.json({ error: (err as Error).message }, 400)
  }
})

storeRoutes.get('/', async (c) => {
  try {
    const merchantId = c.req.query('merchantId')

    if (merchantId) {
      const stores = await storeService.findAllByMerchant(merchantId)
      return c.json(stores)
    }

    const stores = await storeService.findAll()
    return c.json(stores)
  } catch (err) {
    console.error('[STORE ROUTE] GET list error:', err)
    return c.json({ error: (err as Error).message }, 400)
  }
})

storeRoutes.get('/:idOrSlug', async (c) => {
  const idOrSlug = c.req.param('idOrSlug')

  try {
    const store =
      (await storeService.findById(idOrSlug)) ??
      (await storeService.findBySlug(idOrSlug))

    if (!store) {
      return c.json({ error: 'Store not found' }, 404)
    }

    return c.json(store)
  } catch (err) {
    console.error('[STORE ROUTE] GET by id/slug error:', err)
    return c.json({ error: (err as Error).message }, 400)
  }
})

storeRoutes.put('/:id', validateJWT(), async (c) => {
  const id = c.req.param('id')!

  try {
    const body = await c.req.json<UpdateStoreDto>()
    const store = await storeService.update(id, body)

    if (!store) {
      return c.json({ error: 'Store not found' }, 404)
    }

    return c.json(store)
  } catch (err) {
    console.error('[STORE ROUTE] PUT error:', err)
    return c.json({ error: (err as Error).message }, 400)
  }
})

storeRoutes.patch('/:id', validateJWT(), async (c) => {
  const id = c.req.param('id')!

  try {
    const body = await c.req.json<UpdateStoreDto>()
    const store = await storeService.update(id, body)

    if (!store) {
      return c.json({ error: 'Store not found' }, 404)
    }

    return c.json(store)
  } catch (err) {
    console.error('[STORE ROUTE] PATCH error:', err)
    return c.json({ error: (err as Error).message }, 400)
  }
})

storeRoutes.delete('/:id', validateJWT(), async (c) => {
  const id = c.req.param('id')! 

  try {
    await storeService.delete(id)
    return c.json({ message: 'Store deleted successfully' })
  } catch (err) {
    console.error('[STORE ROUTE] DELETE error:', err)
    return c.json({ error: (err as Error).message }, 400)
  }
})

export default storeRoutes
