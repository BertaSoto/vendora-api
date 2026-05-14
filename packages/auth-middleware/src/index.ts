import type { Context, Next } from 'hono'
import { jwtVerify } from 'jose'

export interface AuthUser {
  id: string
  email: string
  role: string
}

declare module 'hono' {
  interface ContextVariableMap {
    user: AuthUser
  }
}

function getJwtSecret(): Uint8Array {
  const secret = process.env.SUPABASE_JWT_SECRET
  if (!secret) {
    throw new Error('SUPABASE_JWT_SECRET is required. Asegurate de configurarlo en tu .env.')
  }
  return new TextEncoder().encode(secret)
}

function getSupabaseIssuer(): string {
  const url = process.env.SUPABASE_URL
  if (!url) {
    throw new Error('SUPABASE_URL is required. Asegurate de configurarlo en tu .env.')
  }
  return `${url}/auth/v1`
}

export function validateJWT() {
  return async (c: Context, next: Next) => {
    const authHeader = c.req.header('Authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json(
        {
          success: false,
          error: 'Token faltante',
        },
        401
      )
    }

    const token = authHeader.substring(7)

    try {
      const secret = getJwtSecret()
      const issuer = getSupabaseIssuer()

      const { payload } = await jwtVerify(token, secret, {
        issuer,
        audience: 'authenticated',
      })

      c.set('user', {
        id: payload.sub ?? '',
        email: (payload.email as string) ?? '',
        role: (payload.role as string) ?? 'authenticated',
      })

      await next()
    } catch (err) {
      const errName = (err as { name?: string }).name

      if (errName === 'JWTExpired') {
        return c.json(
          {
            success: false,
            error: 'Token expirado',
          },
          401
        )
      }

      return c.json(
        {
          success: false,
          error: 'Token inválido',
        },
        401
      )
    }
  }
}
