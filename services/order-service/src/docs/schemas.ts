import { z } from 'zod'

// ── Enums ─────────────────────────────────────────────────────────────────────
export const OrderStatusSchema = z.enum(['pending', 'confirmed', 'delivered', 'cancelled'])
  .describe('Estado del ciclo de vida de la orden')

// ── Schemas de request ────────────────────────────────────────────────────────
export const CreateOrderBodySchema = z.object({
  storeId: z.string().uuid()
    .describe('UUID de la tienda donde se realiza la orden'),
  productId: z.string().uuid()
    .describe('UUID del producto a ordenar'),
  quantity: z.number().int().min(1)
    .describe('Cantidad de unidades (entero ≥ 1)'),
})
// Nota: userId se extrae automáticamente del JWT (no va en el body)

export const UpdateOrderBodySchema = z.object({
  status: OrderStatusSchema
    .describe('Nuevo estado de la orden'),
})

export const UpdateOrderStatusBodySchema = z.object({
  status: OrderStatusSchema
    .describe('Nuevo estado de la orden'),
})

// ── Schemas de response ───────────────────────────────────────────────────────
export const OrderSchema = z.object({
  id: z.string().uuid().describe('UUID único de la orden'),
  userId: z.string().uuid().describe('UUID del usuario que realizó la orden'),
  storeId: z.string().uuid().describe('UUID de la tienda'),
  productId: z.string().uuid().describe('UUID del producto ordenado'),
  productName: z.string().nullable().describe('Nombre del producto al momento de la orden'),
  quantity: z.number().int().describe('Cantidad ordenada'),
  total: z.number().describe('Total calculado: precio × cantidad'),
  status: OrderStatusSchema,
  createdAt: z.string().describe('Timestamp ISO 8601 de creación'),
  updatedAt: z.string().describe('Timestamp ISO 8601 de última actualización'),
})

// ── Schemas de errores ────────────────────────────────────────────────────────
export const ErrorResponseSchema = z.object({
  error: z.string().describe('Mensaje descriptivo del error'),
})

export const AuthErrorSchema = z.object({
  success: z.literal(false),
  error: z.string(),
})

export const DeleteSuccessSchema = z.object({
  message: z.string().describe('Confirmación de eliminación'),
})
