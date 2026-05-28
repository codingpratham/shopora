const serverUrl = '/api/v1';

export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Shopora API',
    version: '1.0.0',
    description: 'OpenAPI documentation for the Shopora backend.',
  },
  servers: [
    { url: serverUrl, description: 'API base path' },
  ],
  tags: [
    { name: 'System' },
    { name: 'Auth' },
    { name: 'User' },
    { name: 'Products' },
    { name: 'Cart' },
    { name: 'Orders' },
    { name: 'Payments' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
      AuthTokens: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          accessToken: { type: 'string' },
          refreshToken: { type: 'string' },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['name', 'email', 'password', 'role'],
        properties: {
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
          role: { type: 'string', enum: ['USER', 'ADMIN'] },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
        },
      },
      UpdateProfileRequest: {
        type: 'object',
        required: ['address', 'phoneNumber'],
        properties: {
          address: { type: 'string' },
          phoneNumber: { type: 'string' },
        },
      },
      UserProfile: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string' },
          role: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Onboarding: {
        type: 'object',
        properties: {
          address: { type: 'string' },
          phoneNumber: { type: 'string' },
        },
      },
      Product: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          price: { type: 'string' },
          category: { type: 'string' },
          imageUrl: {
            type: 'array',
            items: { type: 'string' },
          },
          stock: { type: 'integer' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      ProductCreateRequest: {
        type: 'object',
        required: ['title', 'description', 'price', 'category'],
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          price: { type: 'string' },
          category: { type: 'string' },
        },
      },
      CartItem: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          productId: { type: 'string' },
          quantity: { type: 'integer' },
        },
      },
      Cart: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          userId: { type: 'string' },
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/CartItem' },
          },
        },
      },
      CartMutationRequest: {
        type: 'object',
        required: ['productId', 'quantity'],
        properties: {
          productId: { type: 'string' },
          quantity: { type: 'integer', minimum: 1 },
        },
      },
      OrderItem: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          productId: { type: 'string' },
          quantity: { type: 'integer' },
          priceAtPurchase: { type: 'number' },
          orderStatus: { type: 'string', enum: ['PENDING', 'COMPLETED', 'CANCELLED'] },
        },
      },
      Order: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          userId: { type: 'string' },
          status: { type: 'string', enum: ['PENDING', 'COMPLETED', 'CANCELLED'] },
          orderItems: {
            type: 'array',
            items: { $ref: '#/components/schemas/OrderItem' },
          },
        },
      },
      CreateOrderRequest: {
        type: 'object',
        required: ['items'],
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'object',
              required: ['productId', 'quantity'],
              properties: {
                productId: { type: 'string' },
                quantity: { type: 'integer', minimum: 1 },
              },
            },
          },
        },
      },
      PaymentInitRequest: {
        type: 'object',
        required: ['orderId'],
        properties: {
          orderId: { type: 'string' },
        },
      },
      Payment: {
        type: 'object',
        properties: {
          paymentId: { type: 'string' },
          paymentUrl: { type: 'string' },
          amount: { type: 'number' },
          status: { type: 'string' },
        },
      },
      PaymentWebhookRequest: {
        type: 'object',
        required: ['paymentId'],
        properties: {
          paymentId: { type: 'string' },
        },
      },
      Categories: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            category: { type: 'string' },
          },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['System'],
        summary: 'Health check',
        responses: {
          200: {
            description: 'Server is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { message: { type: 'string' } },
                },
              },
            },
          },
        },
      },
    },
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' },
            },
          },
        },
        responses: { 201: { description: 'Registered' } },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login a user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: { 200: { description: 'Logged in' } },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh access token',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Refreshed' } },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout and clear cookies',
        responses: { 200: { description: 'Logged out' } },
      },
    },
    '/user/profile': {
      get: {
        tags: ['User'],
        summary: 'Get the authenticated profile',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Profile',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UserProfile' },
              },
            },
          },
        },
      },
      put: {
        tags: ['User'],
        summary: 'Create or update onboarding profile',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateProfileRequest' },
            },
          },
        },
        responses: { 200: { description: 'Profile updated' } },
      },
    },
    '/products/products': {
      get: {
        tags: ['Products'],
        summary: 'List products for the authenticated user',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'List of products' } },
      },
      post: {
        tags: ['Products'],
        summary: 'Create a product',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/ProductCreateRequest' },
                  {
                    type: 'object',
                    properties: {
                      images: {
                        type: 'array',
                        items: { type: 'string', format: 'binary' },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        responses: { 201: { description: 'Created' } },
      },
    },
    '/products/products/{id}': {
      get: {
        tags: ['Products'],
        summary: 'Get a product by id',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'Product' } },
      },
      put: {
        tags: ['Products'],
        summary: 'Update a product',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'Updated' } },
      },
      delete: {
        tags: ['Products'],
        summary: 'Delete a product',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'Deleted' } },
      },
    },
    '/products/categories': {
      get: {
        tags: ['Products'],
        summary: 'List unique categories',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Categories' } },
      },
    },
    '/products/categories/{category}': {
      get: {
        tags: ['Products'],
        summary: 'List products in a category',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'category', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'Category catalog' } },
      },
    },
    '/products/search': {
      get: {
        tags: ['Products'],
        summary: 'Search products by q',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'q', in: 'query', required: true, schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'Search results' } },
      },
    },
    '/cart/cart': {
      get: {
        tags: ['Cart'],
        summary: 'Get or create the authenticated user cart',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Cart' } },
      },
      post: {
        tags: ['Cart'],
        summary: 'Add item to cart',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CartMutationRequest' },
            },
          },
        },
        responses: { 200: { description: 'Cart item created or updated' } },
      },
    },
    '/cart/cart/{id}': {
      put: {
        tags: ['Cart'],
        summary: 'Update cart item quantity',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['quantity'],
                properties: { quantity: { type: 'integer', minimum: 1 } },
              },
            },
          },
        },
        responses: { 200: { description: 'Updated cart item' } },
      },
      delete: {
        tags: ['Cart'],
        summary: 'Delete cart item',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'Deleted cart item' } },
      },
    },
    '/orders': {
      post: {
        tags: ['Orders'],
        summary: 'Create an order from cart items',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateOrderRequest' },
            },
          },
        },
        responses: { 201: { description: 'Order created' } },
      },
      get: {
        tags: ['Orders'],
        summary: 'List authenticated user orders',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Orders' } },
      },
    },
    '/orders/{id}': {
      get: {
        tags: ['Orders'],
        summary: 'Get a single authenticated user order',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'Order' } },
      },
    },
    '/orders/admin/order': {
      get: {
        tags: ['Orders'],
        summary: 'Admin: list all orders',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'status', in: 'query', required: false, schema: { type: 'string' } },
          { name: 'page', in: 'query', required: false, schema: { type: 'integer' } },
          { name: 'limit', in: 'query', required: false, schema: { type: 'integer' } },
        ],
        responses: { 200: { description: 'Paged orders' } },
      },
    },
    '/orders/admin/order/{id}': {
      get: {
        tags: ['Orders'],
        summary: 'Admin: get order by id',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'Order' } },
      },
      put: {
        tags: ['Orders'],
        summary: 'Admin: update order status',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string', enum: ['PENDING', 'COMPLETED', 'CANCELLED'] },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Order status updated' } },
      },
      delete: {
        tags: ['Orders'],
        summary: 'Admin: cancel order and restore stock',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'Order cancelled' } },
      },
    },
    '/payments/init': {
      post: {
        tags: ['Payments'],
        summary: 'Create a mock payment session',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PaymentInitRequest' },
            },
          },
        },
        responses: { 201: { description: 'Payment session created' } },
      },
    },
    '/payments/webhook': {
      post: {
        tags: ['Payments'],
        summary: 'Mock payment webhook',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PaymentWebhookRequest' },
            },
          },
        },
        responses: { 200: { description: 'Payment updated' } },
      },
    },
  },
} as const;

export const swaggerHtml = () => `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Shopora API Docs</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css" />
    <style>
      body { margin: 0; background: #f7f7f8; }
      #swagger-ui { max-width: 100%; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: '/openapi.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [SwaggerUIBundle.presets.apis],
        layout: 'BaseLayout'
      });
    </script>
  </body>
</html>`;
