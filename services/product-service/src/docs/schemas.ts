import { z } from 'zod'

// ── Schemas de request ────────────────────────────────────────────────────────
export const CreateProductBodySchema = z.object({
  storeId: z.string().uuid()
    .describe('UUID de la tienda a la que pertenece el producto'),
  name: z.string().min(1)
    .describe('Nombre del producto'),
  description: z.string()
    .describe('Descripción del producto'),
  price: z.number().min(0)
    .describe('Precio en la moneda local (≥ 0)'),
  stock: z.number().int().min(0)
    .describe('Cantidad disponible en inventario (entero ≥ 0)'),
})

export const UpdateProductBodySchema = z.object({
  name: z.string().min(1).optional()
    .describe('Nuevo nombre del producto'),
  description: z.string().optional()
    .describe('Nueva descripción'),
  price: z.number().min(0).optional()
    .describe('Nuevo precio (≥ 0)'),
  stock: z.number().int().min(0).optional()
    .describe('Nuevo stock (entero ≥ 0)'),
})

export const UpdateStockBodySchema = z.object({
  stock: z.number().int().min(0)
    .describe('Nueva cantidad en inventario (entero ≥ 0)'),
})

// ── Schemas de response ───────────────────────────────────────────────────────
export const ProductSchema = z.object({
  id: z.string().uuid().describe('UUID único del producto'),
  storeId: z.string().uuid().describe('UUID de la tienda propietaria'),
  name: z.string().describe('Nombre del producto'),
  description: z.string().describe('Descripción del producto'),
  price: z.number().describe('Precio en la moneda local'),
  stock: z.number().int().describe('Cantidad disponible'),
  createdAt: z.string().describe('Timestamp ISO 8601 de creación'),
  updatedAt: z.string().describe('Timestamp ISO 8601 de última actualización'),
})

export const AuthUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: z.string(),
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
