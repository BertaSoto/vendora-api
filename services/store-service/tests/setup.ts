import { config } from 'dotenv'

// Carga variables desde el .env raíz del monorepo (relativo al cwd del servicio)
config({ path: '../../.env' })
