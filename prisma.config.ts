import { config } from 'dotenv'
import { existsSync } from 'node:fs'

config({
  path: existsSync('.env.local') ? '.env.local' : '.env',
})

import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx ./prisma/seed.ts',
  },
  datasource: {
    url: env('DIRECT_URL'),
  },
})