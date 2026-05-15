import type { Context, Next } from 'hono'
import { jwtVerify, createRemoteJWKSet } from 'jose'
import type { GetKeyFunction, JWSHeaderParameters, FlattenedJWSInput } from 'jose'

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

function getSupabaseUrl(): string {
  const url = process.env.SUPABASE_URL
  if (!url) {
    throw new Error('SUPABASE_URL is required. Asegurate de configurarlo en tu .env.')
  }
  return url
}

let _jwks: GetKeyFunction<JWSHeaderParameters, FlattenedJWSInput> | null = null

function getJWKS() {
  if (!_jwks) {
    const url = getSupabaseUrl()
    _jwks = createRemoteJWKSet(new URL(`${url}/auth/v1/.well-known/jwks.json`))
  }
  return _jwks
}

export function validateJWT() {
  return async (c: Context, next: Next) => {
    const authHeader = c.req.header('Authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json(
        { success: false, error: 'Token faltante' },
        401,
      )
    }

    const token = authHeader.substring(7)

    try {
      const supabaseUrl = getSupabaseUrl()
      const JWKS = getJWKS()

      const { payload } = await jwtVerify(token, JWKS, {
        issuer: `${supabaseUrl}/auth/v1`,
        audience: 'authenticated',
      })

      if (!payload.sub) {
        return c.json(
          { success: false, error: 'Usuario no autenticado' },
          401,
        )
      }

      c.set('user', {
        id: payload.sub,
        email: (payload.email as string) ?? '',
        role: (payload.role as string) ?? 'authenticated',
      })

      await next()
    } catch (err) {
      const errName = (err as { name?: string }).name

      if (errName === 'JWTExpired') {
        return c.json(
          { success: false, error: 'Token expirado' },
          401,
        )
      }

      return c.json(
        { success: false, error: 'Token inválido' },
        401,
      )
    }
  }
}
