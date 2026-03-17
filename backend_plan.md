# Vendora — Backend Plan

> Plan técnico completo del backend de Vendora. Incluye microservicios, endpoints, schemas de base de datos, flujos de comunicación y guía de setup. Referencia principal para el desarrollo del backend.

---

## Índice

1. [Stack y decisiones técnicas](#1-stack-y-decisiones-técnicas)
2. [Estructura del monorepo](#2-estructura-del-monorepo)
3. [Microservicios y responsabilidades](#3-microservicios-y-responsabilidades)
4. [Endpoints por servicio](#4-endpoints-por-servicio)
5. [Modelo de datos y schemas](#5-modelo-de-datos-y-schemas)
6. [Flujos de comunicación](#6-flujos-de-comunicación)
7. [Guía de setup](#7-guía-de-setup)
8. [Variables de entorno](#8-variables-de-entorno)
9. [Convenciones de código](#9-convenciones-de-código)

---

## 1. Stack y decisiones técnicas

| Capa | Tecnología | Justificación |
|---|---|---|
| Runtime | Node.js 20 LTS + TypeScript | Obligatorio por pauta del proyecto |
| API Gateway | Hono v4 | Ultra ligero (~12kb), corre en Node.js/Vercel Functions, excelente DX |
| Deploy | Vercel Functions (serverless) | Integración nativa con el frontend Next.js, escala automático |
| Monorepo | Turborepo | Permite compartir tipos y clientes entre servicios sin duplicación |
| Base de datos | Supabase PostgreSQL | RLS nativo, migraciones versionadas, incluido en el stack obligatorio |
| Auth | Supabase Auth | JWT compartido entre servicios, OAuth Google incluido |
| Mensajería async | Supabase Realtime | Message bus interno entre microservicios, incluido en Supabase |
| Storage | Supabase Storage | Imágenes de productos y logos |
| ORM | Prisma 5 | Tipos TypeScript generados automáticamente, migraciones versionadas, DX superior para equipo pequeño |

### Prisma + Supabase RLS — cómo conviven

Prisma conecta a Supabase usando el `DATABASE_URL` con el rol `service_role`, que **bypasea RLS por defecto**. Esto no es un problema en una arquitectura de microservicios bien diseñada, pero hay que entenderlo:

**¿Por qué no es un problema?**
En esta arquitectura, el aislamiento multi-tenant lo garantiza la lógica de cada microservicio: cada servicio filtra por `merchant_id` del JWT antes de hacer cualquier query. RLS es una segunda línea de defensa, no la única.

**Estrategia recomendada — dos clientes:**

```typescript
// packages/supabase-client/src/client.ts

// Cliente 1: Prisma — para toda la lógica de negocio en microservicios
// Conecta con service_role; el microservicio es responsable del aislamiento
import { PrismaClient } from '@prisma/client'
export const prisma = new PrismaClient()

// Cliente 2: Supabase JS — para operaciones que sí necesitan RLS
// (ej: queries directas desde el frontend, Storage, Realtime, Auth)
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!   // anon key — respeta RLS
)
```

**Regla de uso:**

| Operación | Cliente a usar |
|---|---|
| Queries de negocio en microservicios | Prisma (`service_role`) |
| Auth, Storage, Realtime | Supabase JS (`anon key`) |
| Queries directas desde el frontend | Supabase JS (`anon key` + JWT del usuario) |

**RLS sigue activo** en Supabase para todas las conexiones que no usen `service_role`. Mantenerlo habilitado es obligatorio como capa de defensa adicional.

---

### ⚠️ Regla sobre Supabase Edge Functions

Las Edge Functions de Supabase corren sobre **Deno**, no Node.js. Por esto, su uso está **estrictamente limitado** a:
- Triggers de base de datos (ej: `on_order_created`)
- Procesamiento de webhooks externos (WebPay, MercadoPago)

**No usar Edge Functions para lógica de negocio.** Todo el backend principal corre como Vercel Function con Node.js.

---

## 2. Estructura del monorepo

```
vendora/
├── apps/
│   ├── web/                        # Next.js — storefront público
│   └── admin/                      # Next.js — panel del merchant
│
├── services/
│   ├── api-gateway/                # Hono — enrutador central
│   │   ├── src/
│   │   │   ├── index.ts            # Entry point
│   │   │   ├── routes/             # Rutas hacia cada microservicio
│   │   │   └── middleware/         # Rate limiting, logging, CORS
│   │   └── package.json
│   │
│   ├── auth-service/
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── handlers/           # register, login, logout, refresh
│   │   │   └── middleware/         # validateJWT, requireRole
│   │   └── package.json
│   │
│   ├── store-service/
│   ├── product-service/
│   ├── order-service/
│   ├── payment-service/
│   ├── billing-service/
│   ├── notification-service/
│   └── analytics-service/
│
├── packages/
│   ├── shared-types/               # Tipos TypeScript compartidos
│   │   ├── src/
│   │   │   ├── user.types.ts
│   │   │   ├── store.types.ts
│   │   │   ├── product.types.ts
│   │   │   ├── order.types.ts
│   │   │   ├── payment.types.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── supabase-client/            # Cliente Supabase centralizado
│   │   ├── src/
│   │   │   ├── client.ts           # createClient con config
│   │   │   └── admin-client.ts     # service_role client (solo backend)
│   │   └── package.json
│   │
│   └── auth-middleware/            # Validación JWT reutilizable
│       ├── src/
│       │   ├── validate-jwt.ts
│       │   └── require-role.ts
│       └── package.json
│
├── prisma/
│   ├── schema.prisma               # Schema unificado de todos los modelos
│   └── migrations/                 # Migraciones generadas por Prisma CLI
│       ├── 20240001_init/
│       └── ...
├── supabase/
│   └── config.toml                 # Config de Supabase local (Auth, Storage, Realtime)
│
├── turbo.json
├── package.json                    # Root workspace
└── .env.example
```

---

## 3. Microservicios y responsabilidades

### 3.1 api-gateway

**Responsabilidad:** Punto de entrada único. Enruta, autentica y aplica rate limiting.

- Recibe todas las peticiones del frontend
- Valida JWT antes de reenviar a microservicios
- Aplica rate limiting: 100 req/min por IP
- Agrega headers de correlación (`x-request-id`)
- No contiene lógica de negocio

### 3.2 auth-service

**Responsabilidad:** Todo lo relacionado con identidad y sesiones.

- Registro de merchants y customers
- Login / logout
- Refresh de tokens JWT
- Recuperación de contraseña
- OAuth Google (vía Supabase Auth)
- Bloqueo de cuenta tras 5 intentos fallidos

### 3.3 store-service

**Responsabilidad:** Ciclo de vida de las tiendas.

- Crear, editar, eliminar tiendas
- Gestión de subdominios (`slug.vendora.cl`)
- Selección y personalización de temas visuales
- Configuración general de la tienda (moneda, contacto, etc.)
- Cambio de estado: `active | suspended | trial`

### 3.4 product-service

**Responsabilidad:** Catálogo de productos e inventario.

- CRUD de productos
- Variantes (talla, color) con stock independiente
- Categorías y etiquetas
- Upload de imágenes a Supabase Storage
- Alerta de stock bajo (< 5 unidades)
- Actualización de stock tras ventas (consume eventos de `order-service`)

### 3.5 order-service

**Responsabilidad:** Flujo completo de pedidos.

- Gestión del carrito (sesión sin autenticación)
- Checkout en 3 pasos
- Creación de pedidos tras pago confirmado
- Gestión de estados: `pending → processing → shipped → delivered → cancelled`
- Historial de pedidos por merchant y por customer
- Flujo de devoluciones

### 3.6 payment-service

**Responsabilidad:** Procesamiento de pagos y registro de transacciones.

- Integración con WebPay Plus (Transbank SDK Node.js)
- Integración con MercadoPago Checkout Pro
- Procesamiento de webhooks de confirmación de pago
- Registro inmutable de transacciones
- Procesamiento de reembolsos

### 3.7 billing-service

**Responsabilidad:** Suscripciones y cobros de Vendora a los merchants.

- Gestión de planes (Starter, Pro, Business)
- Activación y control del período de prueba (14 días)
- Cobro mensual recurrente
- Suspensión de tienda al expirar suscripción
- Generación de facturas/boletas para el merchant

### 3.8 notification-service

**Responsabilidad:** Todas las notificaciones salientes.

- Emails transaccionales (registro, confirmación de pedido, cambio de estado)
- Alertas en tiempo real al dashboard del merchant (vía Supabase Realtime)
- Notificaciones de stock crítico
- Notificaciones de expiración de trial

### 3.9 analytics-service

**Responsabilidad:** Métricas básicas por tienda. *(Post-MVP)*

- Total de ventas por período
- Productos más vendidos
- Tráfico del storefront
- Tasa de conversión básica

---

## 4. Endpoints por servicio

> **Convención de URLs:**
> - Todas las rutas pasan por el API Gateway: `https://api.vendora.cl/v1/`
> - Autenticación: Bearer token JWT en header `Authorization`
> - Respuestas siempre en JSON
> - Errores siguen el formato: `{ "error": { "code": "ERROR_CODE", "message": "Descripción legible" } }`

---

### 4.1 auth-service — `/v1/auth`

#### `POST /v1/auth/register`
Registrar nuevo merchant.

```typescript
// Request body
{
  email: string       // válido, único
  password: string    // mínimo 8 caracteres
  full_name: string
  role?: "merchant" | "customer"  // default: "merchant"
}

// Response 201
{
  user: {
    id: string
    email: string
    role: string
  }
  message: "Revisa tu email para verificar tu cuenta"
}

// Errores
// 409 EMAIL_ALREADY_EXISTS
// 422 VALIDATION_ERROR
```

#### `POST /v1/auth/login`
Iniciar sesión.

```typescript
// Request body
{
  email: string
  password: string
}

// Response 200
{
  access_token: string    // JWT, expira en 1h
  refresh_token: string   // expira en 7 días
  user: {
    id: string
    email: string
    role: string
  }
}

// Errores
// 401 INVALID_CREDENTIALS
// 423 ACCOUNT_LOCKED  (5 intentos fallidos → 15 min)
```

#### `POST /v1/auth/refresh`
Refrescar access token.

```typescript
// Request body
{ refresh_token: string }

// Response 200
{ access_token: string }

// Errores
// 401 INVALID_REFRESH_TOKEN
```

#### `POST /v1/auth/forgot-password`
Solicitar recuperación de contraseña.

```typescript
// Request body
{ email: string }

// Response 200 (siempre — no revela si el email existe)
{ message: "Si el email existe, recibirás instrucciones en breve" }
```

#### `POST /v1/auth/reset-password`
Restablecer contraseña con token.

```typescript
// Request body
{
  token: string       // token recibido por email, válido 1h
  new_password: string
}

// Response 200
{ message: "Contraseña actualizada correctamente" }

// Errores
// 400 INVALID_OR_EXPIRED_TOKEN
```

#### `DELETE /v1/auth/logout`
Cerrar sesión. Requiere JWT válido.

```typescript
// Response 200
{ message: "Sesión cerrada" }
```

---

### 4.2 store-service — `/v1/stores`

#### `POST /v1/stores`
Crear una nueva tienda. Requiere rol `merchant`.

```typescript
// Request body
{
  name: string        // nombre visible
  slug: string        // URL: slug.vendora.cl — único, solo alfanumérico y guiones
  category: string    // "joyería" | "ropa" | "alimentos" | "artesanía" | "otro"
  description?: string
  theme?: string      // default: "light"
}

// Response 201
{
  store: {
    id: string
    name: string
    slug: string
    url: string       // "https://[slug].vendora.cl"
    status: "trial"
    created_at: string
  }
}

// Errores
// 409 SLUG_ALREADY_TAKEN
// 422 VALIDATION_ERROR
```

#### `GET /v1/stores/:storeId`
Obtener datos de una tienda. Merchant solo puede ver la suya.

```typescript
// Response 200
{
  store: {
    id: string
    name: string
    slug: string
    url: string
    status: "active" | "trial" | "suspended"
    theme: string
    category: string
    settings: { currency: "CLP", locale: "es-CL", contact_email: string }
    created_at: string
  }
}
```

#### `PATCH /v1/stores/:storeId`
Actualizar configuración de la tienda.

```typescript
// Request body (todos opcionales)
{
  name?: string
  description?: string
  theme?: string
  logo_url?: string
  settings?: { contact_email?: string, contact_phone?: string }
}

// Response 200
{ store: StoreObject }
```

#### `GET /v1/stores/public/:slug`
Obtener datos públicos de una tienda (para el storefront). Sin autenticación.

```typescript
// Response 200
{
  store: {
    id: string
    name: string
    slug: string
    theme: string
    category: string
    logo_url: string | null
  }
}

// Errores
// 404 STORE_NOT_FOUND
// 503 STORE_SUSPENDED  { message: "Esta tienda no está disponible temporalmente" }
```

---

### 4.3 product-service — `/v1/products`

#### `POST /v1/products`
Crear producto. Requiere rol `merchant`.

```typescript
// Request body
{
  store_id: string
  name: string
  description?: string
  price_clp: number       // entero, sin decimales
  category_id?: string
  images?: string[]       // URLs de Supabase Storage (subir antes con /upload)
  variants?: Array<{
    sku: string
    attributes: Record<string, string>   // { "talla": "M", "color": "rojo" }
    stock: number
    price_clp?: number    // si difiere del precio base
  }>
}

// Response 201
{ product: ProductObject }
```

#### `GET /v1/products`
Listar productos de una tienda.

```typescript
// Query params
// ?store_id=xxx&category_id=xxx&status=active&page=1&limit=20

// Response 200
{
  products: ProductObject[]
  pagination: { total: number, page: number, limit: number, pages: number }
}
```

#### `GET /v1/products/:productId`
Obtener producto por ID.

```typescript
// Response 200
{ product: ProductObject }  // incluye variants e images
```

#### `PATCH /v1/products/:productId`
Actualizar producto.

```typescript
// Request body (todos opcionales)
{
  name?: string
  description?: string
  price_clp?: number
  status?: "active" | "inactive"
  images?: string[]
}

// Response 200
{ product: ProductObject }
```

#### `DELETE /v1/products/:productId`
Eliminar producto (soft delete — cambia status a `deleted`).

```typescript
// Response 200
{ message: "Producto eliminado" }
```

#### `POST /v1/products/upload-image`
Subir imagen de producto a Supabase Storage.

```typescript
// Request: multipart/form-data
// Campos: file (imagen, max 5MB, jpg/png/webp), store_id

// Response 201
{
  url: string    // URL pública en Supabase Storage
  path: string   // path interno en el bucket
}

// Errores
// 413 FILE_TOO_LARGE   (> 5MB)
// 415 UNSUPPORTED_FORMAT
```

#### `PATCH /v1/products/:productId/variants/:variantId/stock`
Ajuste manual de stock por el merchant.

```typescript
// Request body
{
  stock: number
  reason?: string   // "Conteo físico", "Devolución", etc.
}

// Response 200
{ variant: { id: string, sku: string, stock: number } }
```

---

### 4.4 order-service — `/v1/orders`

#### `POST /v1/orders`
Crear pedido tras confirmación de pago. Generalmente invocado por `payment-service`.

```typescript
// Request body
{
  store_id: string
  customer_id?: string      // null si es invitado
  customer_email: string
  customer_name: string
  shipping_address: {
    street: string
    city: string
    region: string
    postal_code?: string
  }
  items: Array<{
    product_variant_id: string
    quantity: number
    unit_price_clp: number
  }>
  payment_transaction_id: string
}

// Response 201
{
  order: {
    id: string
    order_number: string    // formato: VND-YYYY-XXXXX
    status: "pending"
    total_clp: number
    items: OrderItemObject[]
    created_at: string
  }
}
```

#### `GET /v1/orders`
Listar pedidos. Merchant ve los de su tienda; customer ve los suyos.

```typescript
// Query params
// ?store_id=xxx&status=pending&from=2024-01-01&page=1&limit=20

// Response 200
{
  orders: OrderObject[]
  pagination: PaginationObject
}
```

#### `GET /v1/orders/:orderId`
Obtener pedido por ID.

```typescript
// Response 200
{ order: OrderObject }  // incluye items, historial de estados, datos del customer
```

#### `PATCH /v1/orders/:orderId/status`
Actualizar estado del pedido. Solo merchant.

```typescript
// Request body
{
  status: "processing" | "shipped" | "delivered" | "cancelled"
  note?: string     // nota interna o número de tracking
}

// Response 200
{ order: { id: string, status: string, updated_at: string } }
```

---

### 4.5 payment-service — `/v1/payments`

#### `POST /v1/payments/webpay/init`
Iniciar transacción WebPay. Retorna URL para redirigir al customer.

```typescript
// Request body
{
  store_id: string
  cart_items: Array<{
    product_variant_id: string
    quantity: number
    unit_price_clp: number
  }>
  customer_email: string
  return_url: string    // URL de retorno tras el pago
}

// Response 200
{
  webpay_url: string    // URL de Transbank donde redirigir al customer
  token: string         // token de la transacción Transbank
}
```

#### `POST /v1/payments/webpay/confirm`
Confirmar transacción WebPay. Invocado por el return_url.

```typescript
// Request body
{ token_ws: string }    // token devuelto por Transbank

// Response 200 si aprobado
{
  status: "approved"
  transaction_id: string
  order_id: string
  amount_clp: number
}

// Response 200 si rechazado
{ status: "rejected", message: "El pago fue rechazado por el banco" }
```

#### `POST /v1/payments/mercadopago/init`
Crear preferencia de MercadoPago.

```typescript
// Request body
{
  store_id: string
  cart_items: CartItemObject[]
  customer_email: string
  back_urls: {
    success: string
    failure: string
    pending: string
  }
}

// Response 200
{
  preference_id: string
  checkout_url: string    // URL de MercadoPago Checkout Pro
}
```

#### `POST /v1/payments/mercadopago/webhook`
Webhook de MercadoPago. Endpoint público, valida firma `X-Signature`.

```typescript
// Request body (enviado por MercadoPago)
{
  type: "payment"
  data: { id: string }
}

// Response 200
{ received: true }
```

#### `POST /v1/payments/:transactionId/refund`
Procesar reembolso. Solo merchant.

```typescript
// Request body
{
  amount_clp?: number   // si es null → reembolso total
  reason: string
}

// Response 200
{ refund: { id: string, amount_clp: number, status: "pending" } }
```

---

### 4.6 billing-service — `/v1/billing`

#### `GET /v1/billing/plans`
Listar planes disponibles. Público, sin autenticación.

```typescript
// Response 200
{
  plans: Array<{
    id: string
    name: string              // "Starter" | "Pro" | "Business"
    price_clp_monthly: number
    max_products: number | null   // null = ilimitado
    commission_pct: number        // % que retiene Vendora
    features: string[]
  }>
}
```

#### `POST /v1/billing/subscriptions`
Suscribir merchant a un plan.

```typescript
// Request body
{
  plan_id: string
  payment_method_token: string    // token de tarjeta (nunca datos raw)
}

// Response 201
{
  subscription: {
    id: string
    plan: PlanObject
    status: "active"
    current_period_end: string
  }
}
```

#### `GET /v1/billing/subscriptions/me`
Obtener suscripción activa del merchant autenticado.

```typescript
// Response 200
{
  subscription: {
    id: string
    plan: PlanObject
    status: "trial" | "active" | "past_due" | "cancelled"
    trial_ends_at: string | null
    current_period_end: string
    days_remaining: number
  }
}
```

#### `PATCH /v1/billing/subscriptions/me`
Cambiar de plan.

```typescript
// Request body
{ plan_id: string }

// Response 200
{ subscription: SubscriptionObject }
```

---

## 5. Modelo de datos y schemas

> El schema vive en `prisma/schema.prisma`. Prisma genera los tipos TypeScript y las migraciones. RLS se configura adicionalmente en Supabase para consultas directas desde el frontend.

### `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")   // requerido por Supabase con connection pooling
}

// ─── AUTH ────────────────────────────────────────────────────────────────────

model User {
  id                   String    @id @default(uuid())
  email                String    @unique
  passwordHash         String    @map("password_hash")
  fullName             String?   @map("full_name")
  role                 Role      @default(MERCHANT)
  emailVerified        Boolean   @default(false) @map("email_verified")
  failedLoginAttempts  Int       @default(0) @map("failed_login_attempts")
  lockedUntil          DateTime? @map("locked_until")
  createdAt            DateTime  @default(now()) @map("created_at")
  updatedAt            DateTime  @updatedAt @map("updated_at")

  stores        Store[]
  orders        Order[]
  subscription  Subscription?
  statusChanges OrderStatusHistory[]

  @@map("users")
}

enum Role {
  MERCHANT
  CUSTOMER
  ADMIN
}

// ─── STORE ───────────────────────────────────────────────────────────────────

model Store {
  id          String      @id @default(uuid())
  merchantId  String      @map("merchant_id")
  name        String
  slug        String      @unique
  theme       String      @default("light")
  category    String
  description String?
  logoUrl     String?     @map("logo_url")
  status      StoreStatus @default(TRIAL)
  createdAt   DateTime    @default(now()) @map("created_at")
  updatedAt   DateTime    @updatedAt @map("updated_at")

  merchant  User          @relation(fields: [merchantId], references: [id], onDelete: Cascade)
  settings  StoreSettings?
  products  Product[]
  orders    Order[]
  categories Category[]

  @@map("stores")
}

enum StoreStatus {
  TRIAL
  ACTIVE
  SUSPENDED
  DELETED
}

model StoreSettings {
  storeId      String   @id @map("store_id")
  currency     String   @default("CLP")
  locale       String   @default("es-CL")
  contactEmail String?  @map("contact_email")
  contactPhone String?  @map("contact_phone")
  updatedAt    DateTime @updatedAt @map("updated_at")

  store Store @relation(fields: [storeId], references: [id], onDelete: Cascade)

  @@map("store_settings")
}

// ─── PRODUCT ─────────────────────────────────────────────────────────────────

model Category {
  id       String    @id @default(uuid())
  storeId  String    @map("store_id")
  name     String
  slug     String
  products Product[]

  store Store @relation(fields: [storeId], references: [id], onDelete: Cascade)

  @@unique([storeId, slug])
  @@map("categories")
}

model Product {
  id          String        @id @default(uuid())
  storeId     String        @map("store_id")
  categoryId  String?       @map("category_id")
  name        String
  description String?
  priceCLP    Int           @map("price_clp")
  status      ProductStatus @default(ACTIVE)
  createdAt   DateTime      @default(now()) @map("created_at")
  updatedAt   DateTime      @updatedAt @map("updated_at")

  store    Store            @relation(fields: [storeId], references: [id], onDelete: Cascade)
  category Category?        @relation(fields: [categoryId], references: [id])
  variants ProductVariant[]
  images   ProductImage[]

  @@map("products")
}

enum ProductStatus {
  ACTIVE
  INACTIVE
  DELETED
}

model ProductVariant {
  id         String   @id @default(uuid())
  productId  String   @map("product_id")
  sku        String
  attributes Json     @default("{}")   // { "talla": "M", "color": "rojo" }
  stock      Int      @default(0)
  priceCLP   Int?     @map("price_clp") // null = usa precio del producto padre

  product    Product     @relation(fields: [productId], references: [id], onDelete: Cascade)
  orderItems OrderItem[]

  @@unique([productId, sku])
  @@map("product_variants")
}

model ProductImage {
  id         String @id @default(uuid())
  productId  String @map("product_id")
  storageUrl String @map("storage_url")
  sortOrder  Int    @default(0) @map("sort_order")

  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@map("product_images")
}

// ─── ORDER ───────────────────────────────────────────────────────────────────

model Order {
  id              String      @id @default(uuid())
  storeId         String      @map("store_id")
  customerId      String?     @map("customer_id")   // null = invitado
  customerEmail   String      @map("customer_email")
  customerName    String      @map("customer_name")
  shippingAddress Json        @map("shipping_address")
  status          OrderStatus @default(PENDING)
  totalCLP        Int         @map("total_clp")
  orderNumber     String      @unique @map("order_number")  // VND-YYYY-XXXXX
  createdAt       DateTime    @default(now()) @map("created_at")
  updatedAt       DateTime    @updatedAt @map("updated_at")

  store        Store                @relation(fields: [storeId], references: [id])
  customer     User?                @relation(fields: [customerId], references: [id])
  items        OrderItem[]
  statusHistory OrderStatusHistory[]
  transaction  Transaction?

  @@map("orders")
}

enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}

model OrderItem {
  id               String @id @default(uuid())
  orderId          String @map("order_id")
  productVariantId String @map("product_variant_id")
  quantity         Int
  unitPriceCLP     Int    @map("unit_price_clp")

  order          Order          @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productVariant ProductVariant @relation(fields: [productVariantId], references: [id])

  @@map("order_items")
}

model OrderStatusHistory {
  id         String   @id @default(uuid())
  orderId    String   @map("order_id")
  status     String
  note       String?
  changedAt  DateTime @default(now()) @map("changed_at")
  changedBy  String?  @map("changed_by")

  order     Order @relation(fields: [orderId], references: [id], onDelete: Cascade)
  changedByUser User? @relation(fields: [changedBy], references: [id])

  @@map("order_status_history")
}

// ─── PAYMENT ─────────────────────────────────────────────────────────────────

model Transaction {
  id              String            @id @default(uuid())
  orderId         String            @unique @map("order_id")
  gateway         PaymentGateway
  gatewayRef      String?           @map("gateway_ref")
  amountCLP       Int               @map("amount_clp")
  status          TransactionStatus @default(PENDING)
  gatewayResponse Json?             @map("gateway_response")
  createdAt       DateTime          @default(now()) @map("created_at")
  // SIN updatedAt: esta tabla es INMUTABLE

  order   Order    @relation(fields: [orderId], references: [id])
  refunds Refund[]

  @@map("transactions")
}

enum PaymentGateway {
  WEBPAY
  MERCADOPAGO
}

enum TransactionStatus {
  PENDING
  APPROVED
  REJECTED
  REFUNDED
}

model Refund {
  id            String       @id @default(uuid())
  transactionId String       @map("transaction_id")
  amountCLP     Int          @map("amount_clp")
  reason        String
  status        RefundStatus @default(PENDING)
  gatewayRef    String?      @map("gateway_ref")
  createdAt     DateTime     @default(now()) @map("created_at")

  transaction Transaction @relation(fields: [transactionId], references: [id])

  @@map("refunds")
}

enum RefundStatus {
  PENDING
  APPROVED
  REJECTED
}

// ─── BILLING ─────────────────────────────────────────────────────────────────

model Plan {
  id               String   @id @default(uuid())
  name             String   @unique   // 'Starter' | 'Pro' | 'Business'
  priceCLPMonthly  Int      @map("price_clp_monthly")
  maxProducts      Int?     @map("max_products")   // null = ilimitado
  commissionPct    Decimal  @map("commission_pct") @db.Decimal(4, 2)
  features         Json     @default("[]")
  isActive         Boolean  @default(true) @map("is_active")

  subscriptions Subscription[]

  @@map("plans")
}

model Subscription {
  id                  String             @id @default(uuid())
  merchantId          String             @unique @map("merchant_id")
  planId              String             @map("plan_id")
  status              SubscriptionStatus @default(TRIAL)
  trialEndsAt         DateTime?          @map("trial_ends_at")
  currentPeriodStart  DateTime?          @map("current_period_start")
  currentPeriodEnd    DateTime?          @map("current_period_end")
  createdAt           DateTime           @default(now()) @map("created_at")
  updatedAt           DateTime           @updatedAt @map("updated_at")

  merchant User      @relation(fields: [merchantId], references: [id])
  plan     Plan      @relation(fields: [planId], references: [id])
  invoices Invoice[]

  @@map("subscriptions")
}

enum SubscriptionStatus {
  TRIAL
  ACTIVE
  PAST_DUE
  CANCELLED
}

model Invoice {
  id             String        @id @default(uuid())
  subscriptionId String        @map("subscription_id")
  amountCLP      Int           @map("amount_clp")
  status         InvoiceStatus @default(DRAFT)
  issuedAt       DateTime      @default(now()) @map("issued_at")
  paidAt         DateTime?     @map("paid_at")

  subscription Subscription @relation(fields: [subscriptionId], references: [id])

  @@map("invoices")
}

enum InvoiceStatus {
  DRAFT
  PAID
  FAILED
}
```

### Comandos Prisma más usados

```bash
# Generar cliente después de cambiar el schema
npx prisma generate

# Crear y aplicar migración en desarrollo
npx prisma migrate dev --name descripcion_del_cambio

# Aplicar migraciones en producción
npx prisma migrate deploy

# Abrir Prisma Studio (explorador visual de la DB)
npx prisma studio

# Resetear DB en desarrollo (¡cuidado! borra todo)
npx prisma migrate reset
```

### Variables de entorno para Prisma + Supabase

```bash
# Supabase proporciona dos URLs — ambas necesarias con Prisma
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
```

> `DATABASE_URL` usa el puerto 6543 con PgBouncer (para Vercel Functions — muchas conexiones cortas). `DIRECT_URL` usa el puerto 5432 directo (necesario para que Prisma corra las migraciones).

---

## 6. Flujos de comunicación

### 6.1 Flujo de checkout completo

```
1. Customer agrega productos al carrito (localStorage en browser)

2. Customer inicia checkout
   POST /v1/payments/webpay/init
   └── payment-service crea transacción en Transbank
   └── retorna webpay_url al frontend

3. Frontend redirige al customer a webpay_url (Transbank)

4. Customer completa pago en Transbank

5. Transbank redirige a return_url
   POST /v1/payments/webpay/confirm { token_ws }
   └── payment-service confirma con Transbank API
   └── si APPROVED:
       └── registra transaction en payment.transactions
       └── POST interno a order-service → crea order
       └── order-service descuenta stock (transacción atómica)
       └── order-service publica evento en Supabase Realtime canal 'orders'
       └── notification-service consume evento
           └── envía email de confirmación al customer
           └── envía email de nueva venta al merchant
   └── si REJECTED:
       └── retorna error al frontend (carrito intacto, sin pedido)
```

### 6.2 Flujo de alertas de stock

```
product-service detecta stock < 5 después de una venta
    └── publica en Supabase Realtime canal 'stock'
        { type: 'LOW_STOCK', product_id, store_id, current_stock }

notification-service consume el evento
    └── envía email al merchant
    └── crea notificación en el dashboard (Realtime al browser del merchant)
```

### 6.3 Flujo de expiración de trial

```
billing-service (cron job diario vía Supabase Edge Function)
    └── consulta subscriptions donde trial_ends_at <= now() y status = 'trial'
    └── para cada expiración:
        └── actualiza subscription.status = 'suspended'
        └── actualiza store.status = 'suspended' (via store-service)
        └── publica evento en Realtime canal 'billing'
            notification-service envía email al merchant
```

### 6.4 Comunicación síncrona vs asíncrona

| Operación | Tipo | Justificación |
|---|---|---|
| Login, registro | Síncrono (HTTP) | Requiere respuesta inmediata |
| Crear tienda, producto | Síncrono (HTTP) | El merchant espera confirmación |
| Confirmar pago | Síncrono (HTTP) | Operación crítica — no puede perderse |
| Enviar email de confirmación | Asíncrono (Realtime) | No bloquea el flujo del usuario |
| Alerta de stock | Asíncrono (Realtime) | No urgente, puede tener latencia |
| Suspender trial expirado | Asíncrono (cron) | Proceso en background |

---

## 7. Guía de setup

### Prerrequisitos

- Node.js 20 LTS
- pnpm 8+
- Supabase CLI
- Cuenta en Vercel (conectada al repositorio GitHub)
- Cuenta en Supabase
- Cuenta de desarrollador en Transbank (ambiente integración)
- Cuenta de desarrollador en MercadoPago

### Setup inicial

```bash
# 1. Clonar repositorio
git clone https://github.com/tu-usuario/vendora.git
cd vendora

# 2. Instalar dependencias
pnpm install

# 3. Copiar variables de entorno
cp .env.example .env.local

# 4. Iniciar Supabase local
supabase start

# 5. Aplicar migraciones con Prisma
npx prisma migrate dev --name init

# 6. Generar cliente Prisma
npx prisma generate

# 6. Iniciar servicios en desarrollo
pnpm dev
# Turborepo levanta todos los servicios y apps en paralelo
```

### Comandos de Turborepo

```bash
pnpm dev           # Levantar todos los servicios
pnpm build         # Build de producción de todos los servicios
pnpm test          # Ejecutar tests en todos los servicios
pnpm lint          # Linting en todo el monorepo
pnpm typecheck     # TypeScript check global

# Por servicio específico
pnpm dev --filter=auth-service
pnpm test --filter=product-service
```

---

## 8. Variables de entorno

```bash
# .env.example

# Prisma + Supabase (dos URLs requeridas)
# Puerto 6543 con PgBouncer para Vercel Functions
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
# Puerto 5432 directo para migraciones
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"

# Supabase (para Auth, Storage y Realtime)
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # Solo en backend, nunca en frontend

# Transbank (ambiente integración para desarrollo)
TRANSBANK_API_KEY=tu-api-key
TRANSBANK_COMMERCE_CODE=tu-codigo
TRANSBANK_ENVIRONMENT=integration  # "production" en producción

# MercadoPago
MP_ACCESS_TOKEN=APP_USR-...
MP_PUBLIC_KEY=APP_USR-...
MP_WEBHOOK_SECRET=tu-webhook-secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001
NODE_ENV=development

# Email (elegir proveedor)
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@vendora.cl
```

---

## 9. Convenciones de código

### Estructura de un microservicio

```typescript
// services/[nombre]-service/src/index.ts
import { Hono } from 'hono'
import { validateJWT } from '@vendora/auth-middleware'
import { prisma } from '@vendora/supabase-client'
import { exampleHandler } from './handlers/example.handler'

const app = new Hono()

// Middleware global del servicio
app.use('*', validateJWT)

// Rutas
app.get('/health', (c) => c.json({ status: 'ok' }))
app.post('/resource', exampleHandler)

export default app
```

```typescript
// Ejemplo de handler con Prisma
// services/product-service/src/handlers/product.handler.ts
import { Context } from 'hono'
import { prisma } from '@vendora/supabase-client'

export async function getProducts(c: Context) {
  const merchantId = c.get('userId')   // del JWT validado
  const { storeId } = c.req.param()

  // Prisma filtra por storeId — el microservicio garantiza el aislamiento
  const products = await prisma.product.findMany({
    where: {
      storeId,
      store: { merchantId },   // doble verificación: la tienda pertenece al merchant
      status: 'ACTIVE',
    },
    include: { variants: true, images: true },
    orderBy: { createdAt: 'desc' },
  })

  return c.json({ data: products })
}
```

### Formato de respuesta estándar

```typescript
// ✅ Éxito
{ data: { ... } }

// ✅ Lista
{ data: [...], pagination: { total, page, limit, pages } }

// ✅ Error
{ error: { code: "ERROR_CODE", message: "Mensaje legible para humanos" } }
```

### Naming conventions

| Elemento | Convención | Ejemplo |
|---|---|---|
| Archivos | kebab-case | `auth-service.ts` |
| Variables / funciones | camelCase | `getUserById` |
| Tipos / Interfaces | PascalCase | `OrderStatus` |
| Constantes | SCREAMING_SNAKE | `MAX_LOGIN_ATTEMPTS` |
| Tablas DB | snake_case | `order_items` |
| Endpoints | kebab-case | `/v1/order-items` |
| Canales Realtime | kebab-case | `store-notifications` |
