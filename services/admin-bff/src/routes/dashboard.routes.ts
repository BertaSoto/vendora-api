import { Hono } from 'hono'
import { dashboardService } from '../services/dashboard.service.js'

const dashboardRoutes = new Hono()

dashboardRoutes.get('/:storeId', async (c) => {
  const storeId = c.req.param('storeId')

  if (!storeId) {
    return c.json({ error: 'storeId is required' }, 400)
  }

  const dashboard = await dashboardService.getDashboard(storeId)
  return c.json(dashboard)
})

export default dashboardRoutes
