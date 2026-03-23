# Vendora — Product Requirements Document (PRD)

> Documento formal de producto. Define el problema que Vendora resuelve, el modelo de negocio, los planes de suscripción, el roadmap y las métricas de éxito. Dirigido a stakeholders, evaluadores académicos y el equipo de producto.

---

## Índice

1. [Resumen ejecutivo](#1-resumen-ejecutivo)
2. [Problem Statement](#2-problem-statement)
3. [Oportunidad de negocio](#3-oportunidad-de-negocio)
4. [Usuarios y personas](#4-usuarios-y-personas)
5. [Propuesta de valor](#5-propuesta-de-valor)
6. [Modelo de suscripción y planes](#6-modelo-de-suscripción-y-planes)
7. [Modelo de ingresos](#7-modelo-de-ingresos)
8. [Roadmap del producto](#8-roadmap-del-producto)
9. [Métricas de éxito (KPIs)](#9-métricas-de-éxito-kpis)
10. [Riesgos y mitigaciones](#10-riesgos-y-mitigaciones)
11. [Supuestos y restricciones](#11-supuestos-y-restricciones)

---

## 1. Resumen ejecutivo

**Vendora** es una plataforma SaaS de comercio electrónico diseñada para el mercado chileno. Permite a emprendedores crear y administrar tiendas online sin conocimientos técnicos, operando bajo un modelo de suscripción mensual en pesos chilenos.

| Atributo | Detalle |
|---|---|
| Nombre del producto | Vendora |
| Categoría | SaaS — E-commerce Platform |
| Mercado inicial | Chile |
| Moneda | CLP (Peso Chileno) |
| Modelo de negocio | Suscripción mensual + comisión por venta |
| Usuario principal | Emprendedores no técnicos (adultos mayores, zonas rurales, microempresas) |
| Versión documentada | MVP — v1.0 |
| Estado | En planificación |

---

## 2. Problem Statement

### El problema real

Millones de pequeños emprendedores en Chile llevan sus negocios en papel, planillas Excel o grupos de WhatsApp. Cuando intentan dar el salto al comercio digital, se enfrentan a barreras que las plataformas actuales no resuelven:

**1. Barreras tecnológicas**
Las plataformas líderes como Shopify están en inglés, tienen interfaces complejas y asumen conocimientos técnicos previos que gran parte del segmento objetivo simplemente no tiene.

**2. Barreras económicas**
Shopify cobra en USD (desde $29 USD/mes ≈ $27.000 CLP), lo que resulta prohibitivo para microempresarios chilenos en etapa temprana o con ingresos variables.

**3. Pagos no localizados**
Las plataformas internacionales no integran nativamente WebPay (Transbank), el método de pago con tarjeta más utilizado y de mayor confianza en Chile. Esto genera fricción y abandono en el checkout.

**4. Falta de soporte accesible**
El segmento de adultos mayores y emprendedores rurales no encuentra soporte en español simple, sin jerga técnica, adaptado a su contexto.

### Caso real que origina el producto

> *"Charme et Chic es una tienda de joyería artesanal de una emprendedora de 65 años. Operaba desde una tienda física en mall, pero tras daños estructurales y pérdida del local, su negocio cayó drásticamente. Intentó vender por redes sociales, pero la gestión manual de pedidos e inventario en Excel le generaba errores, pérdidas y frustración. No tenía presencia digital ni herramientas para construirla sola."*

Ese caso representa a un segmento masivo y desatendido. **Vendora nace para resolverlo.**

---

## 3. Oportunidad de negocio

### Contexto del mercado chileno

- Chile tiene más de **1.2 millones de micro y pequeñas empresas** (MIPYMES) según el SII.
- Solo el **~30% de las PYMES chilenas** tiene presencia de venta online (fuente: CCS 2023).
- El e-commerce en Chile creció un **52%** durante 2020–2022 y mantiene crecimiento sostenido.
- El segmento de emprendedores de mayor edad (50+) es uno de los de mayor crecimiento post-pandemia, pero el más desatendido por las plataformas digitales actuales.

### Ventaja competitiva de Vendora frente a alternativas

| Criterio | Vendora | Shopify | Wix | Bsale |
|---|---|---|---|---|
| Precio | CLP accesible | USD (caro para Chile) | USD | CLP, pero complejo |
| Idioma y UX | Español simple | Inglés / traducido | Traducido | Español técnico |
| WebPay nativo | ✅ | ❌ (requiere plugin) | ❌ | ✅ |
| MercadoPago | ✅ | ✅ | ✅ | ✅ |
| Diseñado para no técnicos | ✅ (énfasis total) | Parcial | Parcial | ❌ |
| Accesibilidad WCAG 2.1 | ✅ | Parcial | Parcial | ❌ |
| Mercado objetivo | Chile | Global | Global | Chile (empresas medianas) |

---

## 4. Usuarios y personas

### Persona 1 — María, emprendedora adulta mayor

| Atributo | Detalle |
|---|---|
| Edad | 65 años |
| Negocio | Joyería artesanal (Charme et Chic) |
| Tecnología | Usa WhatsApp y Facebook básico; Excel con ayuda |
| Problema central | Perdió su local físico y no sabe cómo vender en línea |
| Motivación | Mantener su negocio, recuperar ingresos, no depender de terceros |
| Frustraciones | Interfaces complejas, texto pequeño, mensajes de error en inglés o con términos técnicos |
| Objetivo en Vendora | Crear su tienda, subir sus joyas con fotos y empezar a vender esta semana |

**Quote representativo:** *"Si me preguntan qué es un 'slug' o un 'webhook', ya perdí. Yo quiero ponerle nombre a mi tienda y subirle fotos a mis collares, nada más."*

---

### Persona 2 — Carlos, emprendedor rural

| Atributo | Detalle |
|---|---|
| Edad | 42 años |
| Negocio | Venta de miel y productos apícolas artesanales |
| Tecnología | Smartphone básico con Android; conexión 4G intermitente |
| Problema central | Sus clientes de Santiago le piden comprar online, pero no sabe cómo |
| Motivación | Ampliar su mercado más allá de su región |
| Frustraciones | Plataformas en dólares, cobros en tarjetas que no acepta, soporte inaccesible |
| Objetivo en Vendora | Tener una tienda que sus clientes puedan encontrar y pagar con WebPay |

---

### Persona 3 — Diego, emprendedor joven (early adopter)

| Atributo | Detalle |
|---|---|
| Edad | 28 años |
| Negocio | Ropa streetwear, vende por Instagram |
| Tecnología | Nativo digital; ha probado Shopify y Wix |
| Problema central | Shopify es caro en USD y el checkout con WebPay requiere configuración compleja |
| Motivación | Una solución en CLP, con WebPay nativo, sin pagar USD |
| Objetivo en Vendora | Migrar sus ventas de Instagram a una tienda profesional en pesos |

---

## 5. Propuesta de valor

### Para el merchant

> **Vendora: Tu tienda online en 30 minutos, sin saber programar, pagando en pesos.**

- ✅ Crea tu tienda con un asistente de 3 pasos
- ✅ Acepta pagos con WebPay y MercadoPago desde el día 1
- ✅ Gestiona productos, pedidos e inventario desde un panel simple
- ✅ 14 días de prueba gratis, sin tarjeta
- ✅ Precios en pesos chilenos, sin sorpresas en el tipo de cambio

### Para el customer final

> **Compra en tiendas de emprendedores chilenos, con la confianza del pago seguro.**

- ✅ Storefront rápido y fácil de navegar
- ✅ Pago con WebPay o MercadoPago
- ✅ Confirmación inmediata por email
- ✅ Seguimiento del estado de su pedido

---

## 6. Modelo de suscripción y planes

> ⚠️ **Nota:** Los precios y límites indicados son una propuesta inicial basada en benchmarks del mercado chileno. Deben validarse con usuarios y el equipo de negocio antes del lanzamiento.

### Planes propuestos

| | **Starter** | **Pro** | **Business** |
|---|---|---|---|
| **Precio mensual** | $9.990 CLP | $19.990 CLP | $39.990 CLP |
| **Precio anual** | $99.900 CLP (-17%) | $199.900 CLP (-17%) | $399.900 CLP (-17%) |
| **Productos** | Hasta 50 | Hasta 500 | Ilimitados |
| **Tiendas** | 1 | 1 | Hasta 3 |
| **Comisión Vendora por venta** | 3.5% | 2.0% | 1.0% |
| **Temas visuales** | 3 temas | 10 temas | Todos + personalización |
| **Soporte** | Email (48h) | Email (24h) | Chat prioritario |
| **Analytics** | Básico | Estándar | Avanzado |
| **Dominio personalizado** | ❌ | ✅ | ✅ |
| **Exportar datos** | ❌ | ✅ | ✅ |

### Período de prueba

- **14 días gratuitos** para todos los plans al registrarse
- Sin solicitar datos de tarjeta durante el trial
- Límite de 10 transacciones de venta durante el trial
- El día 11, el merchant recibe recordatorio para suscribirse
- Al vencer el trial sin suscripción: storefront suspendido (panel admin disponible)

### Comparativa con competencia en precio

| Plataforma | Precio base mensual (CLP aprox.) |
|---|---|
| Shopify Basic | ~$27.000 CLP (en USD, variable) |
| Wix Business | ~$18.000 CLP (en USD, variable) |
| **Vendora Starter** | **$9.990 CLP (fijo en CLP)** |
| **Vendora Pro** | **$19.990 CLP (fijo en CLP)** |

---

## 7. Modelo de ingresos

Vendora genera ingresos por dos vías complementarias:

### 7.1 Suscripciones mensuales / anuales
Cobro recurrente por el acceso a la plataforma según el plan contratado.

```
Proyección conservadora — 12 meses post-lanzamiento:
  - 100 merchants en plan Starter:  100 × $9.990  = $999.000/mes
  - 40 merchants en plan Pro:        40 × $19.990  = $799.600/mes
  - 10 merchants en plan Business:   10 × $39.990  = $399.900/mes
  ─────────────────────────────────────────────────────────────────
  Total suscripciones:                              ≈ $2.198.500/mes
```

### 7.2 Comisión por transacción de venta

Porcentaje retenido por Vendora de cada venta procesada en las tiendas.

```
Ejemplo:
  Merchant en plan Starter vende $100.000 CLP
  Comisión Vendora: 3.5% = $3.500 CLP
  Neto al merchant: $96.500 CLP (menos comisión de pasarela)
```

> Las comisiones de las pasarelas (Transbank ~1.3% + IVA, MercadoPago ~3.49% + IVA) son pagadas directamente por el merchant a la pasarela y no pasan por Vendora.

---

## 8. Roadmap del producto

### Fase 0 — Infraestructura base (Semana 1)

**Objetivo:** Monorepo funcionando, CI/CD configurado, Supabase inicializado.

- [ ] Setup Turborepo + estructura de carpetas
- [ ] Configuración de GitHub Actions (lint, typecheck, deploy)
- [ ] Supabase: proyecto creado, migraciones base, RLS habilitado
- [ ] Variables de entorno documentadas
- [ ] API Gateway (Hono) con health check funcionando
- [ ] Paquetes compartidos: `shared-types`, `supabase-client`, `auth-middleware`

**Criterio de done:** `pnpm dev` levanta todos los servicios sin errores; `supabase db push` aplica migraciones limpias.

---

### Fase 1 — Auth + Tiendas (Semana 1–2)

**Objetivo:** Un merchant puede registrarse, crear su tienda y ver el storefront vacío.

- [ ] `auth-service`: registro, login, refresh, logout, recuperación de contraseña
- [ ] `store-service`: crear tienda, configurar, generar URL pública
- [ ] App `admin`: pantalla de registro/login + asistente de creación de tienda (3 pasos)
- [ ] App `web`: storefront público básico (sin productos aún)
- [ ] Subdominio dinámico configurado en Vercel

**Criterio de done:** María puede registrarse en Vendora, crear "Joyas María" y ver `joyasmaria.vendora.cl` funcionando (aunque esté vacío).

---

### Fase 2 — Productos (Semana 2)

**Objetivo:** El merchant puede publicar productos y el storefront los muestra.

- [ ] `product-service`: CRUD de productos, variantes, categorías, upload de imágenes
- [ ] App `admin`: módulo de gestión de productos
- [ ] App `web`: listado de productos y página de detalle en el storefront
- [ ] Supabase Storage: bucket de imágenes configurado con CDN

**Criterio de done:** María puede subir 5 productos con fotos y cualquier persona puede verlos en su storefront.

---

### Fase 3 — Checkout y Pagos (Semana 2–3)

**Objetivo:** Un customer puede comprar y el merchant recibe la venta.

- [ ] `order-service`: carrito, checkout, creación de pedidos, estados
- [ ] `payment-service`: integración WebPay Plus (ambiente integración)
- [ ] `payment-service`: integración MercadoPago Checkout Pro
- [ ] `notification-service`: emails de confirmación de pedido (customer + merchant)
- [ ] App `web`: flujo de checkout completo (3 pasos)
- [ ] App `admin`: módulo de pedidos con gestión de estados

**Criterio de done:** Un tester puede comprar un producto con WebPay de prueba y el merchant ve el pedido en su panel con email de confirmación.

---

### Fase 4 — Billing y Suscripciones (Semana 3)

**Objetivo:** El modelo de negocio de Vendora está operativo.

- [ ] `billing-service`: planes, trial de 14 días, suscripciones, suspensión
- [ ] App `admin`: pantalla de planes y suscripción
- [ ] Cron job de expiración de trial (Supabase Edge Function)
- [ ] Emails de notificación de trial y vencimiento

**Criterio de done:** Merchant en trial ve el contador de días; al expirar, su storefront muestra 503; puede re-activarse desde el panel.

---

### Fase 5 — Pulido, accesibilidad y estabilización (Semana 3–4)

**Objetivo:** Producto listo para presentación y evaluación.

- [ ] Auditoría WCAG 2.1 AA (axe DevTools — 0 errores)
- [ ] Test de usuario con persona no técnica (adulto 55+): crear tienda en ≤ 30 min
- [ ] Lighthouse score ≥ 90 en storefront
- [ ] `notification-service`: alertas de stock bajo completadas
- [ ] Manejo de errores exhaustivo (sin mensajes técnicos visibles al usuario)
- [ ] Documentación README de cada servicio
- [ ] Deploy a producción verificado

**Criterio de done:** El producto puede ser presentado en clase con un demo en vivo sin errores críticos.

---

### Post-MVP — Backlog

| Feature | Justificación | Estimación |
|---|---|---|
| `analytics-service` | Los merchants necesitan entender sus ventas | Sprint 1 post-MVP |
| Dominio personalizado | Feature clave para plan Pro/Business | Sprint 1 post-MVP |
| Múltiples tiendas por merchant | Requerido por plan Business | Sprint 2 post-MVP |
| Boletas electrónicas (SII) | Cumplimiento tributario en Chile | Sprint 2 post-MVP |
| App móvil (React Native) | Gestión desde celular para merchants rurales | Q2 post-MVP |
| Venta multicanal (Instagram, WhatsApp) | Ampliar canales de venta | Q3 post-MVP |

---

## 9. Métricas de éxito (KPIs)

### KPIs de producto

| Métrica | Definición | Meta MVP (primer mes tras launch) |
|---|---|---|
| **Merchants activos** | Merchants con al menos 1 producto publicado | 20 merchants |
| **Tasa de activación** | % merchants que completan la creación de tienda después de registrarse | ≥ 60% |
| **Tiempo de onboarding** | Tiempo promedio desde registro hasta primer producto publicado | ≤ 30 minutos |
| **Tasa de conversión checkout** | % carritos que resultan en pedido completado | ≥ 40% |
| **Pedidos procesados** | Total de pedidos con pago confirmado | 50 pedidos |
| **Tasa de retención** | % merchants que continúan en el servicio tras el trial | ≥ 30% |

### KPIs técnicos

| Métrica | Meta | Herramienta |
|---|---|---|
| **Uptime** | ≥ 99.5% mensual | Vercel + Supabase status |
| **LCP storefront** | ≤ 3 segundos | Google Lighthouse |
| **P95 latencia API** | ≤ 500 ms | k6 load testing |
| **Score accesibilidad** | ≥ 90 (Lighthouse) | axe DevTools |
| **Cobertura de tests** | ≥ 70% en funciones core | Vitest |

### KPIs de negocio (proyección 6 meses post-MVP)

| Métrica | Meta |
|---|---|
| **MRR (Monthly Recurring Revenue)** | $500.000 CLP |
| **Merchants pagos** | 50 merchants en plan pagado |
| **Volumen de ventas procesadas** | $5.000.000 CLP en GMV |
| **NPS del merchant** | ≥ 40 |

---

## 10. Riesgos y mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Scope creep en el MVP de 4 semanas | Alta | Alto | Backlog estrictamente separado; daily check de avance |
| Rechazo por Transbank (demora en certificación) | Media | Alto | Usar ambiente de integración en MVP; iniciar proceso de certificación desde semana 1 |
| Adopción baja por UX no suficientemente simple | Media | Alto | Test de usuario con persona no técnica (persona 1 — María) en semana 2 |
| Costo de Supabase / Vercel supera presupuesto | Baja | Medio | Free tier suficiente para MVP ≤ 100 merchants; monitorear uso semanalmente |
| Fuga de datos entre merchants (multi-tenant) | Baja | Crítico | RLS en 100% tablas; test de aislamiento automatizado desde la fase 0 |
| Incumplimiento Ley 19.628 (protección de datos) | Baja | Alto | Consentimiento en registro; endpoint de borrado de cuenta; política de privacidad desde el día 1 |

---

## 11. Supuestos y restricciones

### Supuestos

- El merchant tiene acceso a internet (banda ancha o 4G móvil) para usar el panel.
- Los customers acceden al storefront desde un navegador web moderno.
- Vendora no gestiona logística ni despacho; eso es responsabilidad del merchant.
- Los precios en CLP son suficientes para el MVP; no se requiere multi-moneda.

### Restricciones no negociables

| Restricción | Razón |
|---|---|
| JavaScript/TypeScript + Node.js | Pauta académica y decisión de stack del equipo |
| Vercel como plataforma de deploy | Pauta académica |
| Supabase para DB, Auth y Realtime | Pauta académica |
| Solo Chile y CLP en MVP | Reducir complejidad para el plazo de 4 semanas |
| WCAG 2.1 AA | El público objetivo lo exige; no es negociable |

---

*Vendora — PRD v1.0 | Proyecto de Portafolio Duoc UC | Documento sujeto a revisión*
