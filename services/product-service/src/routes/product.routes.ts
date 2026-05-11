import { Hono } from 'hono'
import { productService } from '../services/product.service'
import type { CreateProductDto, UpdateStockDto } from '../dtos/product.dto'

const productRoutes = new Hono()

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
  const storeId = c.req.query('storeId')
  if (!storeId) {
    return c.json({ error: 'storeId query parameter is required' }, 400)
  }
  const products = await productService.findAllByStore(storeId)
  return c.json(products)
})

productRoutes.get('/:id', async (c) => {
  const id = c.req.param('id')
  const product = await productService.findById(id)
  if (!product) {
    return c.json({ error: 'Product not found' }, 404)
  }
  return c.json(product)
})

productRoutes.put('/:id/stock', async (c) => {
  const id = c.req.param('id')
  try {
    const body = await c.req.json<UpdateStockDto>()
    const updated = await productService.updateStock(id, body)
    if (!updated) {
      return c.json({ error: 'Product not found' }, 404)
    }
    return c.json(updated)
  } catch (err) {
    return c.json({ error: (err as Error).message }, 400)
  }
})

productRoutes.delete('/:id', async (c) => {
  const id = c.req.param('id')
  const deleted = await productService.delete(id)
  if (!deleted) {
    return c.json({ error: 'Product not found' }, 404)
  }
  return c.body(null, 204)
})

export default productRoutes
