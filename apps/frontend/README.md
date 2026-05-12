# Vendora Frontend

Panel de administración para la plataforma Vendora. Aplicación web construida con **Vite + TypeScript vanilla** que consume los microservicios del monorepo.

---

## Estructura del proyecto

```
apps/frontend/
├── public/
│   └── favicon.svg          # Ícono de la app
├── src/
│   ├── api/
│   │   ├── client.ts        # Cliente fetch genérico
│   │   ├── dashboard.ts     # Llamadas al admin-bff
│   │   ├── products.ts      # Llamadas al product-service
│   │   └── orders.ts        # Llamadas al order-service
│   ├── pages/
│   │   ├── dashboard.ts     # Vista: resumen de la tienda
│   │   ├── products.ts      # Vista: CRUD de productos
│   │   └── orders.ts        # Vista: listado y creación de pedidos
│   ├── styles/
│   │   └── main.css         # Estilos globales
│   ├── types/
│   │   └── index.ts         # Tipos compartidos con los servicios
│   ├── store.ts             # Estado del storeId en localStorage
│   └── main.ts              # Entry point, routing SPA
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
└── .env.example
```

---

## Requisitos previos

- **Node.js** 18+ y **pnpm** 10+
- Los microservicios deben estar corriendo localmente (ver sección siguiente)

---

## Levantar los servicios del backend

Cada microservicio necesita exponer un servidor HTTP. Desde la raíz del monorepo:

```bash
# Terminal 1 — admin-bff en :3000
cd services/admin-bff
pnpm dev

# Terminal 2 — product-service en :3001
cd services/product-service
pnpm dev

# Terminal 3 — order-service en :3002
cd services/order-service
pnpm dev
```

> Los servicios usan `tsx watch` y Hono. Si no tienes configurado el puerto, agrega en `src/index.ts` de cada servicio:
> ```ts
> import { serve } from '@hono/node-server'
> serve({ fetch: app.fetch, port: 3001 })
> ```

---

## Instalación y ejecución del frontend

```bash
# Desde la raíz del monorepo
pnpm install

# Iniciar el frontend en modo desarrollo
cd apps/frontend
pnpm dev
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

### Variables de entorno

Copia `.env.example` a `.env` y ajusta si es necesario:

```bash
cp .env.example .env
```

| Variable | Descripción | Default |
|---|---|---|
| `VITE_API_BASE_URL` | URL base de la API | `""` (proxy Vite) |

En desarrollo, Vite redirige automáticamente:

| Prefijo frontend | Servicio destino |
|---|---|
| `/api/dashboard/*` | `http://localhost:3000/dashboard/*` |
| `/api/products/*`  | `http://localhost:3001/products/*`  |
| `/api/orders/*`    | `http://localhost:3002/orders/*`    |

---

## Uso de la aplicación

### Store ID

Al abrir la app, el campo **Store ID** en la barra lateral está configurado por defecto como `store-1`. Cámbialo por el UUID real de tu tienda y presiona **OK** — queda guardado en `localStorage`.

### Vistas disponibles

| Vista | Funcionalidad |
|---|---|
| **Dashboard** | Resumen de la tienda: total de productos, productos con stock bajo y pedidos pendientes |
| **Productos** | Listar, crear, actualizar stock y eliminar productos |
| **Pedidos** | Listar pedidos y crear nuevos con múltiples ítems |

---

## Build para producción

```bash
cd apps/frontend
pnpm build
```

Los archivos se generan en `dist/`. Para previsualizar localmente:

```bash
pnpm preview
```

### Despliegue en Vercel / Netlify

1. Apunta el directorio raíz a `apps/frontend`
2. Comando de build: `pnpm build`
3. Directorio de salida: `dist`
4. Configura `VITE_API_BASE_URL` con la URL de tu admin-bff desplegado

---

## Probar los endpoints manualmente

Puedes probar la API directamente con `curl` o en el navegador:

```bash
# Health checks
curl http://localhost:3000/health   # admin-bff
curl http://localhost:3001/health   # product-service
curl http://localhost:3002/health   # order-service

# Dashboard (reemplaza STORE_ID)
curl http://localhost:3000/dashboard/store-1

# Listar productos
curl "http://localhost:3001/products?storeId=store-1"

# Crear producto
curl -X POST http://localhost:3001/products \
  -H "Content-Type: application/json" \
  -d '{"storeId":"store-1","name":"Collar plata","description":"Collar artesanal","price":15000,"stock":10}'

# Listar pedidos
curl "http://localhost:3002/orders?storeId=store-1"

# Crear pedido
curl -X POST http://localhost:3002/orders \
  -H "Content-Type: application/json" \
  -d '{"storeId":"store-1","customerName":"Ana González","items":[{"productId":"uuid","productName":"Collar plata","quantity":2,"unitPrice":15000}]}'
```

---

## TypeScript

Verificar tipos sin emitir archivos:

```bash
pnpm typecheck
```
