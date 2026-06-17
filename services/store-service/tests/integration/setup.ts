import { config } from 'dotenv'

// .env.local primero (credenciales reales), .env como fallback
config({ path: '../../.env.local' })
config({ path: '../../.env' })
