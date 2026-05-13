# Vendora — Monorepo

Plataforma de gestión de tiendas construida como monorepo con **pnpm workspaces** y **Turborepo**.

---

## Estructura

```
vendora-api/
├── apps/
│   └── frontend/            # Panel de administración (Vite + TypeScript)
├── services/
│   ├── admin-bff/           # BFF del panel admin (Hono)
│   ├── product-service/     # CRUD de productos (Hono + PostgreSQL)
│   ├── order-service/       # Gestión de pedidos (Hono + PostgreSQL)
│   └── store-service/       # Gestión de tiendas (Hono)
├── packages/
│   ├── auth-middleware/     # Middleware de autenticación compartido
│   ├── shared-types/        # Tipos TypeScript compartidos
│   └── supabase-client/     # Cliente Supabase compartido
├── prisma/                  # Esquema y migraciones de base de datos
├── turbo.json
└── pnpm-workspace.yaml
```

---

## Requisitos

- Node.js 18+
- pnpm 10+
- PostgreSQL (o cuenta en Supabase)

---

## Instalación

```bash
pnpm install
```

Copia las variables de entorno:

```bash
cp .env.example .env
# Edita .env con tus credenciales de Supabase / PostgreSQL
```

---

## Levantar en desarrollo

```bash
# Todos los servicios en paralelo (Turborepo)
pnpm dev
```

O servicio por servicio:

```bash
cd services/product-service && pnpm dev   # :3001
cd services/order-service  && pnpm dev   # :3002
cd services/admin-bff      && pnpm dev   # :3000
cd apps/frontend           && pnpm dev   # :5173
```

---

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `pnpm dev` | Levanta todos los paquetes en modo watch |
| `pnpm build` | Compila todos los paquetes |
| `pnpm typecheck` | Verifica tipos en todo el monorepo |
| `pnpm lint` | Linting en todos los paquetes |

---

## Frontend

Ver instrucciones detalladas en [`apps/frontend/README.md`](apps/frontend/README.md).

---

## Base de datos

Aplica migraciones con Prisma:

```bash
npx prisma migrate dev
npx prisma generate
```

---

## Despliegue

Cada servicio en `services/` tiene un `vercel.json` y está listo para desplegarse individualmente en Vercel. El frontend en `apps/frontend/` se despliega como sitio estático con `VITE_API_BASE_URL` apuntando a los servicios desplegados.
