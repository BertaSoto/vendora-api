import { z } from 'zod'
import {
  CreateProductBodySchema,
  UpdateProductBodySchema,
  UpdateStockBodySchema,
  ProductSchema,
  AuthUserSchema,
  ErrorResponseSchema,
  AuthErrorSchema,
  DeleteSuccessSchema,
} from './schemas.js'

function toSchema(schema: z.ZodType): Record<string, unknown> {
  const result = z.toJSONSchema(schema) as Record<string, unknown>
  delete result['$schema']
  return result
}

export function buildProductOpenAPISpec(): Record<string, unknown> {
  return {
    openapi: '3.1.0',
    info: {
      title: 'Product Service API',
      version: '1.0.0',
      description:
        'API REST para gestión de productos en la plataforma **Vendora**.\n\n' +
        'Las rutas marcadas con 🔒 requieren un Bearer JWT emitido por Supabase Auth.',
      contact: { name: 'Vendora Dev Team' },
    },
    servers: [{ url: 'http://localhost:3001', description: 'Servidor local de desarrollo' }],
    tags: [
      { name: 'Health', description: 'Estado del servicio' },
      { name: 'Auth', description: 'Verificación de autenticación' },
      { name: 'Products', description: 'Operaciones CRUD sobre productos' },
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
        Product: toSchema(ProductSchema),
        CreateProductBody: toSchema(CreateProductBodySchema),
        UpdateProductBody: toSchema(UpdateProductBodySchema),
        UpdateStockBody: toSchema(UpdateStockBodySchema),
        AuthUser: toSchema(AuthUserSchema),
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
                      service: { type: 'string', examples: ['product-service'] },
                    },
                    required: ['status', 'service'],
                  },
                },
              },
            },
          },
        },
      },

      '/products/me': {
        get: {
          tags: ['Auth'],
          summary: 'Verificar autenticación 🔒',
          description: 'Retorna los datos del usuario autenticado extraídos del JWT.',
          operationId: 'getMe',
          security: [{ BearerAuth: [] }],
          responses: {
            '200': {
              description: 'Usuario autenticado',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', examples: [true] },
                      message: { type: 'string', examples: ['Usuario autenticado'] },
                      data: {
                        type: 'object',
                        properties: { user: { $ref: '#/components/schemas/AuthUser' } },
                      },
                    },
                  },
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

      '/products': {
        post: {
          tags: ['Products'],
          summary: 'Crear producto 🔒',
          description: 'Crea un nuevo producto en la tienda especificada.',
          operationId: 'createProduct',
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateProductBody' },
                examples: {
                  conStock: {
                    summary: 'Producto con precio y stock',
                    value: {
                      storeId: '550e8400-e29b-41d4-a716-446655440000',
                      name: 'Camiseta Premium',
                      description: 'Camiseta de algodón 100%',
                      price: 29.99,
                      stock: 100,
                    },
                  },
                  gratuito: {
                    summary: 'Producto gratuito',
                    value: {
                      storeId: '550e8400-e29b-41d4-a716-446655440000',
                      name: 'Muestra Gratis',
                      description: 'Muestra sin costo',
                      price: 0,
                      stock: 50,
                    },
                  },
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Producto creado exitosamente',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Product' },
                  example: {
                    id: 'aabbccdd-1234-5678-abcd-ef1234567890',
                    storeId: '550e8400-e29b-41d4-a716-446655440000',
                    name: 'Camiseta Premium',
                    description: 'Camiseta de algodón 100%',
                    price: 29.99,
                    stock: 100,
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
                    storeId: { summary: 'storeId vacío', value: { error: 'storeId is required' } },
                    name: { summary: 'Nombre vacío', value: { error: 'name is required' } },
                    price: { summary: 'Precio negativo', value: { error: 'price must be a non-negative number' } },
                    stock: { summary: 'Stock negativo', value: { error: 'stock must be a non-negative integer' } },
                  },
                },
              },
            },
            '401': {
              description: 'JWT faltante o inválido',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthError' }, example: { success: false, error: 'Token faltante' } } },
            },
          },
        },
        get: {
          tags: ['Products'],
          summary: 'Listar productos por tienda',
          description: 'Retorna todos los productos de una tienda. El parámetro `storeId` es **requerido**.',
          operationId: 'getProducts',
          parameters: [
            {
              name: 'storeId',
              in: 'query',
              required: true,
              description: 'UUID de la tienda cuyos productos se listan',
              schema: { type: 'string', format: 'uuid' },
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
          ],
          responses: {
            '200': {
              description: 'Lista de productos (vacía si la tienda no tiene productos)',
              content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Product' } } } },
            },
            '400': {
              description: 'Falta el parámetro storeId',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                  example: { error: 'storeId query parameter is required' },
                },
              },
            },
          },
        },
      },

      '/products/{id}': {
        get: {
          tags: ['Products'],
          summary: 'Obtener producto por ID',
          operationId: 'getProductById',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'UUID del producto',
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: {
            '200': {
              description: 'Producto encontrado',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } },
            },
            '404': {
              description: 'Producto no encontrado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                  example: { error: 'Product not found' },
                },
              },
            },
          },
        },
        put: {
          tags: ['Products'],
          summary: 'Actualizar producto 🔒',
          description: 'Actualiza uno o más campos del producto. Al menos un campo es requerido.',
          operationId: 'updateProduct',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'UUID del producto',
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateProductBody' },
                examples: {
                  precio: { summary: 'Actualizar precio', value: { price: 19.99 } },
                  stock: { summary: 'Actualizar stock', value: { stock: 200 } },
                  completo: { summary: 'Actualización completa', value: { name: 'Nuevo Nombre', description: 'Nueva desc', price: 15, stock: 50 } },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Producto actualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } } },
            '400': {
              description: 'Datos inválidos',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                  examples: {
                    sinCampos: { summary: 'Sin campos', value: { error: 'at least one field must be provided to update' } },
                    precioNegativo: { summary: 'Precio negativo', value: { error: 'price must be a non-negative number' } },
                  },
                },
              },
            },
            '401': { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthError' } } } },
            '404': { description: 'Producto no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { error: 'Product not found' } } } },
          },
        },
        delete: {
          tags: ['Products'],
          summary: 'Eliminar producto 🔒',
          operationId: 'deleteProduct',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'UUID del producto a eliminar',
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: {
            '200': {
              description: 'Producto eliminado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/DeleteSuccess' },
                  example: { message: 'Product deleted successfully' },
                },
              },
            },
            '401': { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthError' } } } },
            '404': { description: 'Producto no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },

      '/products/{id}/stock': {
        patch: {
          tags: ['Products'],
          summary: 'Actualizar stock del producto 🔒',
          description: 'Actualiza únicamente la cantidad disponible del producto.',
          operationId: 'updateProductStock',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'UUID del producto',
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateStockBody' },
                examples: {
                  agregar: { summary: 'Agregar unidades', value: { stock: 150 } },
                  agotar: { summary: 'Sin stock', value: { stock: 0 } },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Stock actualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } } },
            '400': {
              description: 'Stock inválido',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                  example: { error: 'stock must be a non-negative integer' },
                },
              },
            },
            '401': { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthError' } } } },
            '404': { description: 'Producto no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
    },
  }
}
