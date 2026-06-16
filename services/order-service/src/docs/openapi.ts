import { z } from 'zod'
import {
  CreateOrderBodySchema,
  UpdateOrderBodySchema,
  UpdateOrderStatusBodySchema,
  OrderSchema,
  ErrorResponseSchema,
  AuthErrorSchema,
  DeleteSuccessSchema,
} from './schemas.js'

function toSchema(schema: z.ZodType): Record<string, unknown> {
  const result = z.toJSONSchema(schema) as Record<string, unknown>
  delete result['$schema']
  return result
}

export function buildOrderOpenAPISpec(): Record<string, unknown> {
  return {
    openapi: '3.1.0',
    info: {
      title: 'Order Service API',
      version: '1.0.0',
      description:
        'API REST para gestión de órdenes de compra en la plataforma **Vendora**.\n\n' +
        'Las rutas marcadas con 🔒 requieren un Bearer JWT emitido por Supabase Auth.\n\n' +
        '**Ciclo de vida de una orden:** `pending` → `confirmed` → `delivered` | `cancelled`',
      contact: { name: 'Vendora Dev Team' },
    },
    servers: [{ url: 'http://localhost:3002', description: 'Servidor local de desarrollo' }],
    tags: [
      { name: 'Health', description: 'Estado del servicio' },
      { name: 'Orders', description: 'Operaciones CRUD sobre órdenes de compra' },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtenido desde Supabase Auth (`POST /auth/v1/token`)',
        },
      },
      schemas: {
        Order: toSchema(OrderSchema),
        CreateOrderBody: toSchema(CreateOrderBodySchema),
        UpdateOrderBody: toSchema(UpdateOrderBodySchema),
        UpdateOrderStatusBody: toSchema(UpdateOrderStatusBodySchema),
        ErrorResponse: toSchema(ErrorResponseSchema),
        AuthError: toSchema(AuthErrorSchema),
        DeleteSuccess: toSchema(DeleteSuccessSchema),
      },
    },
    paths: {
      '/health': {
        get: {
          tags: ['Health'],
          summary: 'Health check',
          operationId: 'healthCheck',
          responses: {
            '200': {
              description: 'Servicio en funcionamiento',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', examples: ['ok'] },
                      service: { type: 'string', examples: ['order-service'] },
                    },
                    required: ['status', 'service'],
                  },
                },
              },
            },
          },
        },
      },

      '/orders': {
        post: {
          tags: ['Orders'],
          summary: 'Crear orden 🔒',
          description:
            'Crea una nueva orden de compra. El `userId` se extrae automáticamente del JWT — no va en el body.\n\n' +
            'El campo `total` se calcula como `precio del producto × quantity`.',
          operationId: 'createOrder',
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateOrderBody' },
                examples: {
                  unaUnidad: {
                    summary: 'Una unidad',
                    value: {
                      storeId: '550e8400-e29b-41d4-a716-446655440000',
                      productId: 'aabbccdd-1234-5678-abcd-ef1234567890',
                      quantity: 1,
                    },
                  },
                  variosItems: {
                    summary: 'Varias unidades',
                    value: {
                      storeId: '550e8400-e29b-41d4-a716-446655440000',
                      productId: 'aabbccdd-1234-5678-abcd-ef1234567890',
                      quantity: 5,
                    },
                  },
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Orden creada exitosamente',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Order' },
                  example: {
                    id: 'f1e2d3c4-b5a6-7890-abcd-ef1234567890',
                    userId: '123e4567-e89b-12d3-a456-426614174000',
                    storeId: '550e8400-e29b-41d4-a716-446655440000',
                    productId: 'aabbccdd-1234-5678-abcd-ef1234567890',
                    productName: 'Camiseta Premium',
                    quantity: 2,
                    total: 59.98,
                    status: 'pending',
                    createdAt: '2025-01-01T12:00:00.000Z',
                    updatedAt: '2025-01-01T12:00:00.000Z',
                  },
                },
              },
            },
            '400': {
              description: 'Datos de entrada inválidos',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                  examples: {
                    storeId: { summary: 'storeId faltante', value: { error: 'storeId is required' } },
                    productId: { summary: 'productId faltante', value: { error: 'productId is required' } },
                    quantity: { summary: 'quantity < 1', value: { error: 'quantity must be at least 1' } },
                  },
                },
              },
            },
            '401': {
              description: 'JWT faltante o inválido',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/AuthError' },
                  example: { success: false, error: 'Token faltante' },
                },
              },
            },
          },
        },
        get: {
          tags: ['Orders'],
          summary: 'Listar órdenes 🔒',
          description:
            'Retorna órdenes con filtros opcionales. Sin filtros retorna todas las órdenes del usuario autenticado.',
          operationId: 'getOrders',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'userId',
              in: 'query',
              required: false,
              description: 'Filtrar órdenes de un usuario específico (UUID)',
              schema: { type: 'string', format: 'uuid' },
            },
            {
              name: 'storeId',
              in: 'query',
              required: false,
              description: 'Filtrar órdenes de una tienda específica (UUID)',
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: {
            '200': {
              description: 'Lista de órdenes (vacía si no hay resultados)',
              content: {
                'application/json': {
                  schema: { type: 'array', items: { $ref: '#/components/schemas/Order' } },
                },
              },
            },
            '401': {
              description: 'JWT faltante o inválido',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthError' } } },
            },
          },
        },
      },

      '/orders/{id}': {
        get: {
          tags: ['Orders'],
          summary: 'Obtener orden por ID 🔒',
          operationId: 'getOrderById',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'UUID de la orden',
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: {
            '200': {
              description: 'Orden encontrada',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Order' } } },
            },
            '401': { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthError' } } } },
            '404': {
              description: 'Orden no encontrada',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                  example: { error: 'Order not found' },
                },
              },
            },
          },
        },
        put: {
          tags: ['Orders'],
          summary: 'Actualizar estado de la orden 🔒',
          description:
            'Actualiza el estado de la orden.\n\n' +
            '**Estados válidos:** `pending` → `confirmed` → `delivered` | `cancelled`',
          operationId: 'updateOrder',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'UUID de la orden',
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateOrderBody' },
                examples: {
                  confirmar: { summary: 'Confirmar orden', value: { status: 'confirmed' } },
                  entregar: { summary: 'Marcar como entregada', value: { status: 'delivered' } },
                  cancelar: { summary: 'Cancelar orden', value: { status: 'cancelled' } },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Orden actualizada',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Order' } } },
            },
            '400': {
              description: 'Estado inválido o faltante',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                  examples: {
                    estadoInvalido: { summary: 'Estado no reconocido', value: { error: 'Invalid status value' } },
                    sinEstado: { summary: 'Sin campo status', value: { error: 'status is required' } },
                  },
                },
              },
            },
            '401': { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthError' } } } },
            '404': { description: 'Orden no encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { error: 'Order not found' } } } },
          },
        },
        delete: {
          tags: ['Orders'],
          summary: 'Eliminar orden 🔒',
          operationId: 'deleteOrder',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'UUID de la orden a eliminar',
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: {
            '200': {
              description: 'Orden eliminada',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/DeleteSuccess' },
                  example: { message: 'Order deleted successfully' },
                },
              },
            },
            '401': { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthError' } } } },
            '404': { description: 'Orden no encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },

      '/orders/{id}/status': {
        patch: {
          tags: ['Orders'],
          summary: 'Actualizar estado (PATCH) 🔒',
          description: 'Alternativa PATCH para actualizar únicamente el campo `status` de la orden.',
          operationId: 'patchOrderStatus',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'UUID de la orden',
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateOrderStatusBody' },
                examples: {
                  confirmar: { summary: 'Confirmar', value: { status: 'confirmed' } },
                  cancelar: { summary: 'Cancelar', value: { status: 'cancelled' } },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Estado actualizado',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Order' } } },
            },
            '400': {
              description: 'Estado inválido',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                  example: { error: 'Invalid status value' },
                },
              },
            },
            '401': { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthError' } } } },
            '404': { description: 'Orden no encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
    },
  }
}
