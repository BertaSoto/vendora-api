# Vendora

Plataforma de gestión de tiendas multi-tenant. Monorepo con microservicios Hono + frontend Next.js, desplegado en Vercel con autenticación Supabase.

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    apps/frontend  (:5173)                    │
│              Next.js 15 + React 19 · App Router             │
└──────────┬───────────┬──────────┬──────────┬────────────────┘
           │           │          │          │
    /api/auth/*  /api/products/*  │   /api/dashboard/*
           │           │    /api/orders/*    │
           ▼           ▼          ▼          ▼
    ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
    │   auth   │ │ product  │ │  order   │ │  store   │ │  admin   │
    │ service  │ │ service  │ │ service  │ │ service  │ │   bff    │
    │  :3004   │ │  :3001   │ │  :3002   │ │  :3003   │ │  :3000   │
    └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘
         │            └────────────┴─────────────┘            │
         ▼                         ▼                           ▼
    ┌──────────┐           ┌──────────────┐            ┌──────────────┐
    │ Supabase │           │  PostgreSQL   │            │  PostgreSQL  │
    │  (Auth)  │           │  (Prisma ORM) │            │  (Prisma ORM)│
    └──────────┘           └──────────────┘            └──────────────┘
```

### Paquetes compartidos

| Paquete | Descripción |
|---|---|
| `@vendora/auth-middleware` | Middleware Hono que valida JWT de Supabase (usa `jose`) |
| `@vendora/database` | Singleton de PrismaClient con adaptador `pg` |
| `@vendora/shared-types` | Tipos TypeScript compartidos entre servicios |
| `@vendora/supabase-client` | Cliente Supabase reutilizable |

---

## Stack técnico

| Capa | Tecnología |
|---|---|
| Monorepo | pnpm workspaces + Turborepo |
| Backend | Hono 4, TypeScript strict, ESM |
| Frontend | Next.js 15, React 19, App Router |
| Base de datos | PostgreSQL vía Supabase + Prisma ORM |
| Autenticación | Supabase Auth (JWT) |
| Deploy | Vercel (cada servicio independiente) |
| Node | 20+ |

---

## Estructura de carpetas

```
vendora-api/
├── apps/
│   └── frontend/              # Panel admin (Next.js 15 + React 19)
│       ├── app/               # App Router: layouts, pages, components
│       └── src/               # Lógica cliente: api/, hooks/, lib/, types/
├── services/
│   ├── auth-service/          # Registro y login (Hono + Supabase Auth)
│   ├── product-service/       # CRUD de productos (Hono + Prisma)
│   ├── order-service/         # Gestión de pedidos (Hono + Prisma)
│   ├── store-service/         # Gestión de tiendas (Hono + Supabase)
│   └── admin-bff/             # BFF del panel admin (Hono, agrega datos)
├── packages/
│   ├── auth-middleware/       # validateJWT() para rutas protegidas
│   ├── database/              # PrismaClient singleton
│   ├── shared-types/          # Tipos e interfaces compartidas
│   └── supabase-client/       # Cliente Supabase reutilizable
├── prisma/
│   ├── schema.prisma          # Modelos: User, Store
│   └── migrations/            # Historial de migraciones
├── turbo.json                 # Pipeline de Turborepo
├── pnpm-workspace.yaml        # Workspaces: services/*, packages/*, apps/*
└── .env.example               # Variables de entorno del monorepo
```

---

## Requisitos previos

- **Node.js** 20+
- **pnpm** 9+ (`npm install -g pnpm`)
- Cuenta en **Supabase** (gratuita)

---

## Instalación y desarrollo local

### 1. Clonar e instalar dependencias

```bash
git clone <repo-url>
cd vendora-api
pnpm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
cp apps/frontend/.env.example apps/frontend/.env.local
```

Edita `.env` con tus credenciales (ver sección [Variables de entorno](#variables-de-entorno)).

### 3. Aplicar migraciones de base de datos

```bash
npx prisma migrate dev
npx prisma generate
```

### 4. Levantar todos los servicios (Turborepo)

```bash
pnpm dev
```

O cada servicio por separado:

```bash
cd services/auth-service    && pnpm dev   # :3004
cd services/product-service && pnpm dev   # :3001
cd services/order-service   && pnpm dev   # :3002
cd services/store-service   && pnpm dev   # :3003
cd services/admin-bff       && pnpm dev   # :3000
cd apps/frontend            && pnpm dev   # :5173
```

### 5. Verificar servicios

```
GET http://localhost:3004/health   → auth-service
GET http://localhost:3001/health   → product-service
GET http://localhost:3002/health   → order-service
GET http://localhost:3003/health   → store-service
GET http://localhost:3000/health   → admin-bff
```

---

## Variables de entorno

### Raíz del proyecto (`.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | URL de conexión pooled a PostgreSQL (Supabase) | `postgresql://postgres.[ref]:[pass]@aws-0-...pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | URL directa (sin pooler) para migraciones Prisma | `postgresql://postgres.[ref]:[pass]@aws-0-...supabase.com:5432/postgres` |
| `SUPABASE_URL` | URL del proyecto Supabase | `https://xxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Clave pública anónima de Supabase | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio (solo backend, nunca en cliente) | `eyJ...` |
| `SUPABASE_JWT_SECRET` | Secreto JWT para validar tokens en auth-middleware | Se obtiene en Supabase → Settings → API → JWT Secret |
| `NODE_ENV` | Entorno de ejecución | `development` / `production` |

### Frontend (`apps/frontend/.env.local`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | URL base en producción (vacío en desarrollo, los rewrites de Next.js redirigen al localhost) | `https://vendora-api-product-service.vercel.app` |

> En desarrollo local se deja vacía: `next.config.ts` redirige `/api/*` a `localhost:300x` automáticamente.

---

## Microservicios

### `auth-service` — Puerto :3004

Registro e inicio de sesión con Supabase Auth. No requiere `auth-middleware`.

| Método | Ruta | Body | Descripción |
|---|---|---|---|
| `GET` | `/health` | — | Estado del servicio |
| `POST` | `/auth/register` | `{ email, password, fullName }` | Crea usuario en Supabase |
| `POST` | `/auth/login` | `{ email, password }` | Devuelve `{ token }` JWT |

**Variables necesarias:** `SUPABASE_URL`, `SUPABASE_ANON_KEY`

---

### `product-service` — Puerto :3001

CRUD de productos. Rutas protegidas con `@vendora/auth-middleware`.

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `GET` | `/health` | No | Estado del servicio |
| `GET` | `/products?storeId=` | Sí | Lista productos de una tienda |
| `GET` | `/products/:id` | Sí | Obtiene un producto por ID |
| `POST` | `/products` | Sí | Crea un producto |
| `PUT` | `/products/:id/stock` | Sí | Actualiza stock |
| `DELETE` | `/products/:id` | Sí | Elimina un producto |

**Variables necesarias:** `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_JWT_SECRET`

---

### `order-service` — Puerto :3002

Gestión de pedidos. Rutas protegidas con `@vendora/auth-middleware`.

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `GET` | `/health` | No | Estado del servicio |
| `GET` | `/orders?storeId=` | Sí | Lista órdenes de una tienda |
| `GET` | `/orders/:id` | Sí | Obtiene una orden por ID |
| `POST` | `/orders` | Sí | Crea una orden |

**Variables necesarias:** `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_JWT_SECRET`

---

### `store-service` — Puerto :3003

Gestión de tiendas y sus datos.

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `GET` | `/health` | No | Estado del servicio |
| `GET/POST/...` | `/stores/...` | Sí | CRUD de tiendas |

**Variables necesarias:** `SUPABASE_URL`, `SUPABASE_ANON_KEY`

---

### `admin-bff` — Puerto :3000

Backend for Frontend: agrega datos de varios servicios en una sola llamada para el panel admin.

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `GET` | `/health` | No | Estado del servicio |
| `GET` | `/dashboard/:storeId` | Sí | Resumen de tienda (productos, pedidos, stats) |

**Variables necesarias:** `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_JWT_SECRET`

---

## Frontend — Panel Admin

Aplicación Next.js 15 con App Router, levantada en el puerto `:5173` durante desarrollo.

### Estructura de carpetas

```
apps/frontend/
├── app/                        # App Router — layouts, páginas y componentes
│   ├── layout.tsx              # RootLayout
│   ├── page.tsx                # Home: redirige a /dashboard si hay sesión
│   ├── auth/
│   │   ├── login/page.tsx      # Formulario de inicio de sesión
│   │   └── register/page.tsx   # Formulario de registro
│   ├── dashboard/
│   │   ├── layout.tsx          # Layout protegido: verifica token en cada carga
│   │   ├── page.tsx            # Panel principal con bienvenida
│   │   └── tiendas/
│   │       ├── page.tsx        # Listado de tiendas del merchant
│   │       └── [id]/page.tsx   # Detalle de tienda: productos y órdenes
│   └── components/             # LoginForm, RegisterForm, Navbar, ProductsTable, OrdersTable
└── src/
    ├── api/                    # Clientes HTTP por microservicio
    │   ├── client.ts           # apiFetch — wrapper con Bearer token automático
    │   ├── auth.ts             # authApi.register()
    │   ├── dashboard.ts        # dashboardApi.get(storeId)
    │   ├── products.ts         # productsApi.list / getById / create / updateStock / delete
    │   ├── orders.ts           # ordersApi.list / getById / create
    │   └── stores.ts           # storesApi.list / getById
    ├── hooks/
    │   └── useAuth.ts          # Gestión de sesión JWT (token, login, logout)
    ├── lib/
    │   └── jwt.ts              # Decodificador JWT lado cliente (sin verificación criptográfica)
    └── types/
        └── index.ts            # Interfaces TypeScript compartidas
```

### Rutas principales

| Ruta | Protegida | Descripción |
|---|---|---|
| `/` | No | Home — redirige a `/dashboard` si hay token en localStorage |
| `/auth/login` | No | Formulario de inicio de sesión |
| `/auth/register` | No | Formulario de registro de nuevos merchants |
| `/dashboard` | Sí | Panel principal con bienvenida al usuario |
| `/dashboard/tiendas` | Sí | Listado de tiendas del merchant |
| `/dashboard/tiendas/[id]` | Sí | Detalle de tienda: productos y órdenes |

Las rutas bajo `/dashboard` están protegidas por `dashboard/layout.tsx`, que verifica la existencia del token en `localStorage` y redirige a `/auth/login` si no hay sesión activa.

### Hook `useAuth`

```typescript
import { useAuth } from '@/src/hooks/useAuth'

const { token, isAuthenticated, isLoading, error, login, logout, clearError } = useAuth()

// Iniciar sesión
const ok = await login({ email: 'usuario@ejemplo.com', password: 'secret' })

// Cerrar sesión
logout()
```

El hook persiste el token en `localStorage` y en una cookie (`vendora_token`, 7 días de expiración). El cliente `apiFetch` lee el token de `localStorage` e incluye `Authorization: Bearer <token>` en cada petición autenticada.

### Flujo de autenticación (frontend)

```
1. /auth/login  →  useAuth.login()  →  POST /api/auth/login
2. Respuesta { token }  →  localStorage.setItem + cookie vendora_token (7 días)
3. Redirige a /dashboard
4. dashboard/layout.tsx verifica localStorage en cada carga de página
5. Navbar decodifica JWT para mostrar nombre del usuario
6. logout() limpia localStorage y expira la cookie
```

---

## Ejemplos cURL

### Registrar usuario

```bash
curl -X POST http://localhost:3004/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "password": "contraseña123",
    "fullName": "Nombre Apellido"
  }'
```

**Respuesta exitosa (`201 Created`):**
```json
{ "message": "User registered" }
```

---

### Iniciar sesión

```bash
curl -X POST http://localhost:3004/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "password": "contraseña123"
  }'
```

**Respuesta exitosa (`200 OK`):**
```json
{ "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
```

---

### Listar productos de una tienda

```bash
curl -X GET "http://localhost:3001/products?storeId=<uuid-de-la-tienda>" \
  -H "Authorization: Bearer <token>"
```

**Respuesta exitosa (`200 OK`):**
```json
[
  { "id": "...", "name": "Producto A", "price": 9990, "stock": 50, "storeId": "..." }
]
```

---

## Deploy en Vercel + Supabase

### 1. Configurar Supabase

1. Crear proyecto en [supabase.com](https://supabase.com)
2. Ir a **Settings → Database** y copiar:
   - `DATABASE_URL` (connection pooling)
   - `DIRECT_URL` (direct connection)
3. Ir a **Settings → API** y copiar:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_JWT_SECRET` (JWT Secret)
4. Aplicar el esquema de base de datos:
   ```bash
   npx prisma migrate deploy
   ```

### 2. Desplegar cada servicio en Vercel

Cada servicio se despliega como un proyecto Vercel independiente:

```
services/auth-service      → vendora-api-auth-service.vercel.app
services/product-service   → vendora-api-product-service.vercel.app
services/order-service     → vendora-api-order-service.vercel.app
services/store-service     → vendora-api-store-service.vercel.app
services/admin-bff         → vendora-api-admin-bff.vercel.app
apps/frontend              → vendora-frontend.vercel.app
```

**Pasos para cada servicio:**

1. Ir a [vercel.com/new](https://vercel.com/new) → Import Git Repository
2. Seleccionar el repositorio
3. En **Root Directory** indicar la carpeta del servicio (ej: `services/auth-service`)
4. Framework: **Other**
5. Build Command: `pnpm --filter <nombre-servicio> build`
6. Agregar las variables de entorno requeridas por ese servicio
7. Deploy

**Para el frontend:**

1. Root Directory: `apps/frontend`
2. Framework: **Next.js**
3. Agregar `NEXT_PUBLIC_API_BASE_URL` vacía (el frontend llama directamente a cada servicio)

> El frontend en producción llama directamente a las URLs de Vercel de cada microservicio. En desarrollo usa los rewrites de `next.config.ts`.

### 3. Variables de entorno en Vercel

En cada servicio, agregar en **Settings → Environment Variables**:

| Servicio | Variables requeridas |
|---|---|
| auth-service | `SUPABASE_URL`, `SUPABASE_ANON_KEY` |
| product-service | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_JWT_SECRET` |
| order-service | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_JWT_SECRET` |
| store-service | `SUPABASE_URL`, `SUPABASE_ANON_KEY` |
| admin-bff | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_JWT_SECRET` |
| frontend | `NEXT_PUBLIC_API_BASE_URL` (opcional) |

---

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `pnpm dev` | Levanta todos los servicios en paralelo (Turborepo) |
| `pnpm build` | Compila todos los paquetes |
| `pnpm typecheck` | Verifica tipos TypeScript en todo el monorepo |
| `pnpm lint` | Linting en todos los paquetes |

---

## Flujo para crear una nueva feature

```bash
# 1. Partir desde la base correcta
git checkout master
git pull origin master

# 2. Crear branch con convención de nombre
git checkout -b feature/<area>-<descripcion>
# Ejemplos:
#   feature/frontend-login
#   feature/product-service-bulk-update
#   feature/docs-env-deploy

# 3. Desarrollar, verificar tipos y hacer commit
pnpm typecheck
git add <archivos>
git commit -m "feat: descripción corta"

# 4. Abrir Pull Request hacia master (o qa si existe)
```

### Convenciones de commit

| Prefijo | Uso |
|---|---|
| `feat:` | Nueva funcionalidad |
| `fix:` | Corrección de bug |
| `docs:` | Solo documentación |
| `refactor:` | Refactorización sin cambio de comportamiento |
| `chore:` | Tareas de mantenimiento (deps, config) |

---

## Modelos de base de datos

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  fullName  String?
  role      UserRole @default(MERCHANT)   // MERCHANT | CUSTOMER | ADMIN
  createdAt DateTime @default(now())
  stores    Store[]
}

model Store {
  id          String      @id @default(uuid())
  merchantId  String
  name        String
  slug        String      @unique
  status      StoreStatus @default(TRIAL) // ACTIVE | SUSPENDED | TRIAL
  merchant    User        @relation(...)
}
```

---

## Autenticación

El flujo JWT funciona así:

```
1. POST /auth/login  → Supabase valida credenciales → devuelve JWT
2. Cliente guarda token en localStorage + cookie
3. Requests autenticadas incluyen: Authorization: Bearer <token>
4. auth-middleware (jose) valida el JWT contra SUPABASE_JWT_SECRET
5. Si inválido/expirado → 401 Unauthorized
```

---

## Troubleshooting

### `Cannot find module '@vendora/...'`

Los paquetes internos deben compilarse antes de usarse. Ejecuta desde la raíz:

```bash
pnpm build
```

O compila solo el paquete que falta:

```bash
pnpm --filter @vendora/auth-middleware build
pnpm --filter @vendora/database build
```

---

### Token expirado — `401 Unauthorized`

Los tokens JWT de Supabase expiran en **1 hora** por defecto. Solución:

1. Vuelve a hacer `POST /auth/login` para obtener un token nuevo.
2. En el frontend, `useAuth` no refresca el token automáticamente: cierra sesión e inicia de nuevo.
3. Si el 401 ocurre con tokens recién generados, verifica que `SUPABASE_JWT_SECRET` en `.env` sea exactamente el valor de **Supabase → Settings → API → JWT Secret**.

---

### `WebSocket is not defined` (Node.js)

Error común en entornos Node.js sin soporte nativo de WebSocket:

1. Verifica que estés en Node.js 20+ (`node --version`).
2. Si no puedes actualizar, agrega la siguiente variable al arrancar:

```bash
NODE_OPTIONS=--experimental-websocket pnpm dev
```

---

### Puerto ya en uso (`EADDRINUSE`)

```bash
# Windows — encontrar y matar el proceso
netstat -ano | findstr :<puerto>
taskkill /PID <pid> /F

# macOS/Linux
lsof -i :<puerto>
kill -9 <pid>
```

---

### `PrismaClientInitializationError` — no puede conectar a la base de datos

1. Verifica que `DATABASE_URL` en `.env` sea la URL **pooled** de Supabase (puerto 6543).
2. Para migraciones, `prisma migrate` requiere `DIRECT_URL` (sin pooler, puerto 5432).
3. Si cambiaste `schema.prisma`, regenera el cliente:

```bash
npx prisma generate
```
