import { z } from 'zod'
import {
  CreateStoreBodySchema,
  UpdateStoreBodySchema,
  StoreSchema,
  ErrorResponseSchema,
  AuthErrorSchema,
  DeleteSuccessSchema,
} from './schemas.js'

/** Convierte un schema Zod al formato JSON Schema (sin la propiedad $schema raíz). */
function toSchema(schema: z.ZodType): Record<string, unknown> {
  const result = z.toJSONSchema(schema) as Record<string, unknown>
  delete result['$schema']
  return result
}

/** Construye y retorna el documento OpenAPI 3.1.0 completo para el store-service. */
export function buildStoreOpenAPISpec(): Record<string, unknown> {
  return {
    openapi: '3.1.0',
    info: {
      title: 'Store Service API',
      version: '1.0.0',
      description:
        'API REST para gestión de tiendas en la plataforma **Vendora**.\n\n' +
        'Las rutas marcadas con 🔒 requieren un Bearer JWT emitido por Supabase Auth.',
      contact: { name: 'Vendora Dev Team' },
    },
    servers: [{ url: 'http://localhost:3003', description: 'Servidor local de desarrollo' }],
    tags: [
      { name: 'Health', description: 'Estado del servicio' },
      { name: 'Stores', description: 'Operaciones CRUD sobre tiendas' },
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
        Store: toSchema(StoreSchema),
        CreateStoreBody: toSchema(CreateStoreBodySchema),
        UpdateStoreBody: toSchema(UpdateStoreBodySchema),
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
                      service: { type: 'string', examples: ['store-service'] },
                    },
                    required: ['status', 'service'],
                  },
                },
              },
            },
          },
        },
      },

      '/stores': {
        post: {
          tags: ['Stores'],
          summary: 'Crear tienda 🔒',
          description:
            'Crea una nueva tienda. Si no se envía `merchantId` en el body, se usa el `sub` del JWT.',
          operationId: 'createStore',
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateStoreBody' },
                examples: {
                  conDescripcion: {
                    summary: 'Con descripción',
                    value: { name: 'Mi Tienda Online', description: 'Ropa y accesorios' },
                  },
                  sinDescripcion: {
                    summary: 'Solo nombre',
                    value: { name: 'Tienda Express' },
                  },
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Tienda creada exitosamente',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Store' },
                  example: {
                    id: '550e8400-e29b-41d4-a716-446655440000',
                    merchantId: '123e4567-e89b-12d3-a456-426614174000',
                    name: 'Mi Tienda Online',
                    slug: 'mi-tienda-online',
                    description: 'Ropa y accesorios',
                    status: 'TRIAL',
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
                    nameVacio: { summary: 'Nombre vacío', value: { error: 'name is required' } },
                    nameCorto: { summary: 'Nombre < 3 chars', value: { error: 'name must be at least 3 characters long' } },
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
          tags: ['Stores'],
          summary: 'Listar tiendas',
          description: 'Retorna todas las tiendas. Con `?merchantId` filtra por comerciante.',
          operationId: 'getStores',
          parameters: [
            {
              name: 'merchantId',
              in: 'query',
              required: false,
              description: 'UUID del comerciante para filtrar sus tiendas',
              schema: { type: 'string', format: 'uuid' },
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
          ],
          responses: {
            '200': {
              description: 'Lista de tiendas (vacía si no hay resultados)',
              content: {
                'application/json': {
                  schema: { type: 'array', items: { $ref: '#/components/schemas/Store' } },
                },
              },
            },
          },
        },
      },

      '/stores/{id}': {
        get: {
          tags: ['Stores'],
          summary: 'Obtener tienda por ID o slug',
          description: 'Busca primero por UUID; si no encuentra, intenta por slug.',
          operationId: 'getStoreById',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'UUID de la tienda o slug URL-friendly',
              schema: { type: 'string' },
              examples: {
                porId: { summary: 'Por UUID', value: '550e8400-e29b-41d4-a716-446655440000' },
                porSlug: { summary: 'Por slug', value: 'mi-tienda-online' },
              },
            },
          ],
          responses: {
            '200': {
              description: 'Tienda encontrada',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Store' } } },
            },
            '404': {
              description: 'Tienda no encontrada',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                  example: { error: 'Store not found' },
                },
              },
            },
          },
        },
        put: {
          tags: ['Stores'],
          summary: 'Actualizar tienda 🔒',
          description: 'Actualiza uno o más campos de la tienda. Al menos un campo es requerido.',
          operationId: 'updateStore',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'UUID de la tienda',
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateStoreBody' },
                examples: {
                  renombrar: { summary: 'Cambiar nombre', value: { name: 'Nuevo Nombre' } },
                  activar: { summary: 'Activar tienda', value: { status: 'ACTIVE' } },
                  completo: { summary: 'Actualización completa', value: { name: 'Nombre', description: 'Desc', status: 'ACTIVE' } },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Tienda actualizada exitosamente',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Store' } } },
            },
            '400': {
              description: 'Sin campos o datos inválidos',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                  example: { error: 'at least one field must be provided to update' },
                },
              },
            },
            '401': { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthError' } } } },
            '404': { description: 'Tienda no encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { error: 'Store not found' } } } },
          },
        },
        patch: {
          tags: ['Stores'],
          summary: 'Actualizar tienda parcialmente 🔒',
          description: 'Idéntico a PUT — actualiza únicamente los campos enviados.',
          operationId: 'patchStore',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'UUID de la tienda',
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateStoreBody' },
                example: { status: 'ACTIVE' },
              },
            },
          },
          responses: {
            '200': { description: 'Tienda actualizada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Store' } } } },
            '400': { description: 'Datos inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            '401': { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthError' } } } },
            '404': { description: 'Tienda no encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
        delete: {
          tags: ['Stores'],
          summary: 'Eliminar tienda 🔒',
          operationId: 'deleteStore',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'UUID de la tienda a eliminar',
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: {
            '200': {
              description: 'Tienda eliminada exitosamente',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/DeleteSuccess' },
                  example: { message: 'Store deleted successfully' },
                },
              },
            },
            '400': { description: 'Error al eliminar', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            '401': { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthError' } } } },
          },
        },
      },
    },
  }
}
