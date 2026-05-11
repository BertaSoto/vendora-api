import { Hono } from 'hono'
import { productService } from '../services/product.service.js'
import type { CreateProductDto, UpdateStockDto } from '../dtos/product.dto.js'

const routes = new Hono()

routes.get('/', (c) => {
  return c.json({ message: 'Product routes' })
})

export default routes
