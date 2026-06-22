import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import ws from 'ws'

if (typeof globalThis.WebSocket === 'undefined') {
  ;(globalThis as Record<string, unknown>).WebSocket = ws
}

let client: SupabaseClient | null = null

function getClient(): SupabaseClient {
  if (client) return client

  if (!process.env.SUPABASE_URL) {
    console.error('[product-service] SUPABASE_URL is not configured')
    throw new Error('SUPABASE_URL is required. Asegurate de configurarlo en tu .env.')
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[product-service] SUPABASE_SERVICE_ROLE_KEY is not configured')
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required. Asegurate de configurarlo en tu .env.')
  }

  try {
    const url = new URL(process.env.SUPABASE_URL)
    console.log('[product-service] SUPABASE_URL_HOST:', url.host)
    console.log('[product-service] SUPABASE_URL_PROTOCOL:', url.protocol)
  } catch {
    console.error('[product-service] SUPABASE_URL is invalid (check format: https://<ref>.supabase.co)')
  }

  client = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
  return client
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return Reflect.get(getClient(), prop)
  },
  apply(_, _thisArg, args) {
    return Reflect.apply(getClient() as never, undefined, args)
  },
})
