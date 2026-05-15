import type { Context, Next } from 'hono'
import { jwtVerify, createRemoteJWKSet, errors } from 'jose'
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
  return url.replace(/\/+$/, '')
}

let _jwks: GetKeyFunction<JWSHeaderParameters, FlattenedJWSInput> | null = null

function getJWKS() {
  if (!_jwks) {
    const url = getSupabaseUrl()
    _jwks = createRemoteJWKSet(new URL(`${url}/auth/v1/.well-known/jwks.json`))
  }
  return _jwks
}

function decodeJwtHeader(token: string): { alg?: string; kid?: string } | null {
  try {
    const parts = token.split('.')
    if (parts.length < 1) return null
    const headerJson = Buffer.from(parts[0], 'base64url').toString('utf-8')
    return JSON.parse(headerJson)
  } catch {
    return null
  }
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
      const header = decodeJwtHeader(token)
      const errName = (err as Error).name
      const errCode = (err as { code?: string }).code
      const errMessage = (err as Error).message

      console.error('[auth-middleware] JWT verification failed', JSON.stringify({
        supabaseUrl: getSupabaseUrl(),
        issuerExpected: `${getSupabaseUrl()}/auth/v1`,
        alg: header?.alg,
        kid: header?.kid,
        errName,
        errCode,
        errMessage,
      }))

      if (err instanceof errors.JWTExpired) {
        return c.json(
          { success: false, error: 'Token expirado' },
          401,
        )
      }

      if (err instanceof errors.JWTClaimValidationFailed) {
        return c.json(
          {
            success: false,
            error: `Token inválido: fallo la validación de "${err.claim}"`,
          },
          401,
        )
      }

      if (err instanceof errors.JWSSignatureVerificationFailed) {
        return c.json(
          { success: false, error: 'Token inválido: la firma no es válida' },
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
