import { Hono } from 'hono'

import { authService } from '../services/auth.service.js'
import type { RegisterDto, LoginDto } from '../dtos/auth.dto.js'

const authRoutes = new Hono()

authRoutes.post('/register', async (c) => {
  try {
    const body = await c.req.json<RegisterDto>()
    const result = await authService.register(body)
    return c.json(result, 201)
  } catch (err) {
    return c.json({ error: (err as Error).message }, 400)
  }
})

authRoutes.post('/login', async (c) => {
  try {
    const body = await c.req.json<LoginDto>()
    const result = await authService.login(body)
    return c.json(result)
  } catch (err) {
    return c.json({ error: (err as Error).message }, 401)
  }
})

export default authRoutes
