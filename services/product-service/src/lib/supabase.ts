import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import ws from 'ws'

let client: SupabaseClient | null = null

function getClient(): SupabaseClient {
  if (client) return client

  if (!process.env.SUPABASE_URL) {
    throw new Error('SUPABASE_URL is required. Asegurate de configurarlo en tu .env.')
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required. Asegurate de configurarlo en tu .env.')
  }

  client = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      realtime: {
        transport: ws,
      },
    },
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