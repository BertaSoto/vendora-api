import { Hono } from 'hono'
import { dashboardService } from '../services/dashboard.service.js'

const dashboardRoutes = new Hono()

dashboardRoutes.get('/:storeId', async (c) => {
  const storeId = c.req.param('storeId')

  if (!storeId) {
    return c.json({ error: 'storeId is required' }, 400)
  }

  try {
    const dashboard = await dashboardService.getDashboard(storeId)
    return c.json(dashboard)
  } catch (err) {
    const message = (err as Error).message
    if (message === 'Store not found') {
      return c.json({ error: message }, 404)
    }
    console.error('[DASHBOARD ROUTE] getDashboard error:', err)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default dashboardRoutes
