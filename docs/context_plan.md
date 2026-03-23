# Vendora — Context Plan

> **Propósito de este archivo:** Proveer contexto completo del proyecto Vendora para ser usado como referencia por IA (Claude, Cursor) y por el equipo de desarrollo. Debe leerse antes de generar código, tomar decisiones de arquitectura o responder preguntas sobre el sistema.

---

## 1. ¿Qué es Vendora?

Vendora es una plataforma SaaS de comercio electrónico orientada al mercado chileno. Permite a emprendedores crear y administrar tiendas online sin conocimientos técnicos, operando bajo un modelo de suscripción mensual.

**Analogía directa:** Shopify, pero diseñado para Chile, en español, con pasarelas de pago locales (WebPay + MercadoPago) y con una experiencia de usuario pensada para personas no técnicas, incluyendo adultos mayores y emprendedores de zonas rurales.

**Origen real del proyecto:** Vendora nace del caso real de Charme et Chic, tienda de joyería artesanal de una emprendedora de 65 años que perdía ventas por falta de presencia digital y operaba con Excel y papel. Ese caso define directamente las prioridades de accesibilidad y simplicidad del sistema.

---

## 2. Estado actual del proyecto

| Atributo | Valor |
|---|---|
| Etapa | Planificación — nada implementado aún |
| Tipo | Proyecto académico de portafolio (Duoc UC) + producto real |
| Plazo MVP | ~4 semanas |
| Equipo | Pequeño / solo desarrollador |

---

## 3. Usuarios del sistema

### 3.1 Merchant (usuario primario)
- Emprendedor chileno, frecuentemente no técnico
- Rango de edad: 30–70 años, con énfasis en adultos mayores (55+)
- Opera negocios pequeños: joyería, ropa, artesanías, alimentos
- Necesidad central: vender en línea sin saber programar
- Accede vía panel de administración (web desktop/mobile)

### 3.2 Customer (usuario final)
- Cliente que compra en la tienda de un merchant
- Accede al storefront público de la tienda
- Puede no tener cuenta en Vendora (checkout como invitado permitido)

### 3.3 Admin Vendora (interno)
- Equipo interno que administra la plataforma
- Acceso a panel de superadmin para gestionar merchants, planes y soporte

---

## 4. Stack tecnológico

> ⚠️ **Restricción firme:** JavaScript/TypeScript + Node.js + Vercel + Supabase son tecnologías obligatorias. No proponer alternativas fuera de este stack sin justificación explícita.

### Frontend
| Tecnología | Rol |
|---|---|
| Next.js 14 (App Router) | Framework principal, SSR/SSG |
| TypeScript | Tipado estático en todo el proyecto |
| shadcn/ui | Componentes accesibles (WCAG 2.1 AA) |
| Tailwind CSS | Estilos utilitarios |
| Vercel | Deploy y edge network |

### Backend
| Tecnología | Rol |
|---|---|
| Node.js + TypeScript | Runtime de todos los microservicios |
| Hono | API Gateway — punto de entrada único, enruta a microservicios |
| Vercel Functions | Plataforma de deploy de microservicios (serverless) |
| Turborepo | Gestión del monorepo |

### Servicios Supabase
| Servicio | Uso |
|---|---|
| PostgreSQL | Base de datos principal, schema por microservicio |
| Supabase Auth | Autenticación, JWT, OAuth Google |
| Supabase Realtime | Message bus asíncrono entre microservicios |
| Supabase Storage | Imágenes de productos y logos de tiendas |
| Edge Functions (Deno) | **Solo** triggers de DB y webhooks externos — NO lógica de negocio |

> ⚠️ **Regla crítica sobre Edge Functions:** Las Supabase Edge Functions corren en Deno, no en Node.js. Por lo tanto, **NO deben usarse para lógica de negocio principal**. Su uso está restringido a: triggers de base de datos y procesamiento de webhooks externos (WebPay, MercadoPago).

### Integraciones de pago
| Pasarela | Uso |
|---|---|
| Transbank / WebPay Plus | Método de pago principal en Chile (tarjetas) |
| MercadoPago Checkout Pro | Alternativa popular, especialmente móvil |

### Herramientas de desarrollo
| Herramienta | Rol |
|---|---|
| GitHub | Repositorio + CI/CD |
| GitHub Actions | Pipelines de deploy automático |
| Supabase CLI | Migraciones de base de datos versionadas |

---

## 5. Arquitectura — Microservicios

El sistema sigue un patrón de microservicios donde cada dominio de negocio es un servicio independiente desplegado como Vercel Function.

### Microservicios del sistema

| Servicio | Responsabilidad | Schema DB |
|---|---|---|
| `auth-service` | Registro, login, JWT, roles (merchant/customer/admin) | `auth` |
| `store-service` | Creación y configuración de tiendas, subdominios, temas | `store` |
| `product-service` | CRUD de productos, variantes, inventario, imágenes | `product` |
| `order-service` | Carrito, checkout, pedidos, estados, historial | `order` |
| `payment-service` | Procesamiento de pagos (WebPay + MercadoPago), transacciones | `payment` |
| `billing-service` | Suscripciones de Vendora, planes, cobros recurrentes | `billing` |
| `notification-service` | Emails transaccionales, alertas en tiempo real | `notification` |
| `analytics-service` | Métricas básicas de ventas y tráfico por tienda | `analytics` |

### Comunicación entre servicios

```
Cliente (browser)
    │
    ▼
API Gateway (Hono — Vercel Function)
    │
    ├──► auth-service      (HTTP síncrono)
    ├──► store-service     (HTTP síncrono)
    ├──► product-service   (HTTP síncrono)
    ├──► order-service     (HTTP síncrono)
    ├──► payment-service   (HTTP síncrono)
    └──► billing-service   (HTTP síncrono)

Comunicación asíncrona entre servicios:
order-service ──► [Supabase Realtime: canal 'orders'] ──► notification-service
product-service ─► [Supabase Realtime: canal 'stock']  ──► notification-service
billing-service ─► [Supabase Realtime: canal 'billing'] ──► notification-service
```

**Regla:** Operaciones que requieren respuesta inmediata → HTTP síncrono. Operaciones de notificación/efecto secundario → Supabase Realtime (async).

---

## 6. Estructura del monorepo

```
vendora/
├── apps/
│   ├── web/                  # Next.js — storefront público (tiendas de merchants)
│   └── admin/                # Next.js — panel de administración del merchant
├── services/
│   ├── api-gateway/          # Hono — enruta al microservicio correcto
│   ├── auth-service/         # Node.js Vercel Function
│   ├── store-service/        # Node.js Vercel Function
│   ├── product-service/      # Node.js Vercel Function
│   ├── order-service/        # Node.js Vercel Function
│   ├── payment-service/      # Node.js Vercel Function
│   ├── billing-service/      # Node.js Vercel Function
│   ├── notification-service/ # Node.js Vercel Function
│   └── analytics-service/    # Node.js Vercel Function
├── packages/
│   ├── shared-types/         # TypeScript types e interfaces compartidas
│   ├── supabase-client/      # Cliente Supabase compartido entre servicios
│   ├── auth-middleware/      # Validación JWT reutilizable
│   └── ui/                   # Componentes shadcn/ui compartidos
├── supabase/
│   └── migrations/           # Migraciones SQL versionadas (Supabase CLI)
├── turbo.json
├── package.json
└── .env.example
```

---

## 7. Modelo de datos — resumen por schema

### Schema: `auth`
- `users` — id, email, password_hash, role (merchant|customer|admin), created_at
- `sessions` — id, user_id, jwt_token, expires_at

### Schema: `store`
- `stores` — id, merchant_id, name, slug, theme, status (active|suspended|trial), created_at
- `store_settings` — store_id, currency (CLP), locale (es-CL), contact_email, etc.

### Schema: `product`
- `products` — id, store_id, name, description, price_clp, status, created_at
- `product_variants` — id, product_id, sku, attributes (jsonb), stock, price_clp
- `categories` — id, store_id, name, slug
- `product_images` — id, product_id, storage_url, sort_order

### Schema: `order`
- `orders` — id, store_id, customer_id, status, total_clp, created_at
- `order_items` — id, order_id, product_variant_id, quantity, unit_price_clp
- `order_status_history` — id, order_id, status, changed_at, changed_by

### Schema: `payment`
- `transactions` — id, order_id, gateway (webpay|mercadopago), amount_clp, status, gateway_ref, created_at
- `refunds` — id, transaction_id, amount_clp, reason, status, created_at

### Schema: `billing`
- `plans` — id, name, price_clp_monthly, max_products, commission_pct, features (jsonb)
- `subscriptions` — id, merchant_id, plan_id, status, trial_ends_at, current_period_end
- `invoices` — id, subscription_id, amount_clp, status, issued_at

---

## 8. Reglas de negocio críticas

1. **Stock atómico:** Al confirmar un pedido, el descuento de inventario debe ocurrir en una transacción atómica (`SELECT FOR UPDATE`) para evitar stock negativo en compras concurrentes.
2. **Pagos inmutables:** La tabla `transactions` nunca permite `UPDATE`. Todo cambio de estado genera un nuevo registro.
3. **Aislamiento multi-tenant:** RLS habilitado en el 100% de las tablas. Un merchant nunca puede ver datos de otro merchant.
4. **Datos de tarjeta:** Vendora **nunca almacena** datos de tarjeta. El procesamiento es 100% delegado a Transbank o MercadoPago.
5. **Storefront suspendido:** Si la suscripción de un merchant expira, su storefront devuelve HTTP 503. El panel de admin permanece accesible para re-suscribirse.
6. **Moneda:** Todo precio, transacción e importe es en CLP (Peso Chileno). Sin decimales. Formato: `$12.990`.
7. **Trial:** 14 días sin tarjeta. Límite de 10 transacciones de venta en período trial.

---

## 9. Restricciones y decisiones no negociables

| Restricción | Detalle |
|---|---|
| Node.js obligatorio | Todo microservicio corre en Node.js. Las Supabase Edge Functions (Deno) NO son backend principal. |
| Solo CLP | No hay soporte multi-moneda en MVP. |
| Solo Chile | Operación inicial solo en Chile. i18n-ready para expansión futura. |
| WCAG 2.1 AA | Accesibilidad no es opcional. Contraste 4.5:1 mínimo. Fuente mínima 16px. |
| JWT compartido | Todos los microservicios validan el mismo JWT emitido por Supabase Auth. |
| RLS siempre activo | No se puede deshabilitar RLS en ninguna tabla de producción. |

---

## 10. Contexto académico

- **Institución:** Duoc UC (Chile)
- **Tipo de proyecto:** Portafolio académico — evaluación por docentes de ingeniería
- **Criterios de evaluación relevantes:** Arquitectura de microservicios, separación de responsabilidades, buenas prácticas de seguridad, accesibilidad, documentación técnica
- **Referencia del stack:** Acordado con el cuerpo docente. No cambiar tecnologías obligatorias.
