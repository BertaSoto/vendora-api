import { Hono } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'

import { authService } from '../services/auth.service.js'
import { AppError } from '../types/auth.type.js'
import type { RegisterDto, LoginDto } from '../dtos/auth.dto.js'
import type {
  ApiSuccessResponse,
  ApiErrorResponse,
  RegisterData,
  LoginData,
} from '../types/auth.type.js'

const authRoutes = new Hono()

authRoutes.post('/register', async (c) => {
  try {
    const body = await c.req.json<RegisterDto>()
    const data: RegisterData = await authService.register(body)

    const response: ApiSuccessResponse<RegisterData> = {
      success: true,
      message: 'Usuario registrado correctamente',
      data,
    }

    return c.json(response, 201)
  } catch (err) {
    console.error('[AUTH ROUTE] register error:', err)
    if (err instanceof AppError) {
      const response: ApiErrorResponse = {
        success: false,
        error: err.message,
      }
      return c.json(response, err.statusCode as ContentfulStatusCode)
    }

    console.error('[AUTH ROUTE] register unexpected error:', err)
    const response: ApiErrorResponse = {
      success: false,
      error: 'Error interno del servidor',
    }
    return c.json(response, 500)
  }
})

authRoutes.post('/login', async (c) => {
  try {
    const body = await c.req.json<LoginDto>()
    const data: LoginData = await authService.login(body)

    const response: ApiSuccessResponse<LoginData> = {
      success: true,
      message: 'Inicio de sesión exitoso',
      data,
    }

    return c.json(response, 200)
  } catch (err) {
    console.error('[AUTH ROUTE] login error:', err)
    if (err instanceof AppError) {
      const response: ApiErrorResponse = {
        success: false,
        error: err.message,
      }
      return c.json(response, err.statusCode as ContentfulStatusCode)
    }

    console.error('[AUTH ROUTE] login unexpected error:', err)
    const response: ApiErrorResponse = {
      success: false,
      error: 'Error interno del servidor',
    }
    return c.json(response, 500)
  }
})

export default authRoutes
