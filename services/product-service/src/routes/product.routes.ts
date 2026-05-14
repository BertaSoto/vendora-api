import { Hono } from 'hono'

import { productService } from '../services/product.service.js'
import { validateJWT } from '@vendora/auth-middleware'
import type { CreateProductDto, UpdateProductDto } from '../dtos/product.dto.js'

const productRoutes = new Hono()

productRoutes.get('/me', validateJWT(), async (c) => {
  const user = c.get('user')
  return c.json({
    success: true,
    message: 'Usuario autenticado',
    data: { user },
  })
})

productRoutes.post('/', async (c) => {
  try {
    const body = await c.req.json<CreateProductDto>()
    const product = await productService.create(body)
    return c.json(product, 201)
  } catch (err) {
    return c.json({ error: (err as Error).message }, 400)
  }
})

productRoutes.get('/', async (c) => {
  try {
    const storeId = c.req.query('storeId')
    if (!storeId) {
      return c.json({ error: 'storeId query parameter is required' }, 400)
    }
    const products = await productService.findAllByStore(storeId)
    return c.json(products)
  } catch (err) {
    return c.json({ error: (err as Error).message }, 400)
  }
})

productRoutes.get('/:id', async (c) => {
  const id = c.req.param('id')

  try {
    const product = await productService.findById(id)
    if (!product) {
      return c.json({ error: 'Product not found' }, 404)
    }
    return c.json(product)
  } catch (err) {
    return c.json({ error: (err as Error).message }, 400)
  }
})

productRoutes.patch('/:id', async (c) => {
  const id = c.req.param('id')

  try {
    const body = await c.req.json<UpdateProductDto>()
    const product = await productService.update(id, body)

    if (!product) {
      return c.json({ error: 'Product not found' }, 404)
    }

    return c.json(product)
  } catch (err) {
    return c.json({ error: (err as Error).message }, 400)
  }
})

productRoutes.delete('/:id', async (c) => {
  const id = c.req.param('id')

  try {
    const deleted = await productService.delete(id)
    if (!deleted) {
      return c.json({ error: 'Product not found' }, 404)
    }
    return c.json({ message: 'Product deleted successfully' })
  } catch (err) {
    return c.json({ error: (err as Error).message }, 400)
  }
})

export default productRoutes
