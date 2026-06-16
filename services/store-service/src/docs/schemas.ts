import { z } from 'zod'

// ── Enums ─────────────────────────────────────────────────────────────────────
export const StoreStatusSchema = z.enum(['ACTIVE', 'SUSPENDED', 'TRIAL'])
  .describe('Estado actual de la tienda')

// ── Schemas de request ────────────────────────────────────────────────────────
export const CreateStoreBodySchema = z.object({
  name: z.string().min(3)
    .describe('Nombre de la tienda (mínimo 3 caracteres)'),
  description: z.string().optional()
    .describe('Descripción opcional de la tienda'),
  merchantId: z.string().uuid().optional()
    .describe('UUID del comerciante propietario. Si se omite, se usa el ID del usuario autenticado (JWT)'),
})

export const UpdateStoreBodySchema = z.object({
  name: z.string().min(3).optional()
    .describe('Nuevo nombre de la tienda'),
  description: z.string().optional()
    .describe('Nueva descripción'),
  status: StoreStatusSchema.optional()
    .describe('Nuevo estado de la tienda'),
})

// ── Schemas de response ───────────────────────────────────────────────────────
export const StoreSchema = z.object({
  id: z.string().uuid().describe('UUID único de la tienda'),
  merchantId: z.string().uuid().describe('UUID del comerciante propietario'),
  name: z.string().describe('Nombre de la tienda'),
  slug: z.string().describe('Slug URL-friendly generado automáticamente desde el nombre'),
  description: z.string().nullable().describe('Descripción de la tienda (puede ser null)'),
  status: StoreStatusSchema,
  createdAt: z.string().describe('Timestamp ISO 8601 de creación'),
  updatedAt: z.string().describe('Timestamp ISO 8601 de última actualización'),
})

// ── Schemas de errores ────────────────────────────────────────────────────────
export const ErrorResponseSchema = z.object({
  error: z.string().describe('Mensaje descriptivo del error'),
})

export const AuthErrorSchema = z.object({
  success: z.literal(false),
  error: z.string().describe('Mensaje de error de autenticación'),
})

export const DeleteSuccessSchema = z.object({
  message: z.string().describe('Confirmación de eliminación'),
})
