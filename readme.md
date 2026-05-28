# Shopora Backend API

Shopora is an Express + Prisma backend for auth, onboarding, products, cart, orders, and payments.

## Run

1. Set `DATABASE_URL`, `JWT_SECRET`, and `PORT` in your environment.
2. Start the server from `backend`:

```bash
npm run dev
```

The API base path is `/api/v1`.

## Docs

- OpenAPI JSON: `GET /openapi.json`
- Swagger UI: `GET /api-docs`
- Health check: `GET /health`

## Auth

Most endpoints use the `token` cookie or a `Bearer <token>` header. Swagger UI supports bearer auth for the protected routes.

## API Reference

### System

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/health` | Server status |

### Auth

| Method | Path | Body |
| --- | --- | --- |
| POST | `/api/v1/auth/register` | `{ name, email, password, role }` |
| POST | `/api/v1/auth/login` | `{ email, password }` |
| POST | `/api/v1/auth/refresh` | Uses refresh cookie |
| POST | `/api/v1/auth/logout` | Clears cookies |

### User

| Method | Path | Body |
| --- | --- | --- |
| GET | `/api/v1/user/profile` | None |
| PUT | `/api/v1/user/profile` | `{ address, phoneNumber }` |

### Products

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/api/v1/products/products` | List user products |
| GET | `/api/v1/products/products/:id` | Get one product |
| GET | `/api/v1/products/categories` | List unique categories |
| GET | `/api/v1/products/search?q=term` | Search by title, description, category |
| POST | `/api/v1/products/products` | Multipart form-data with `images` files |
| PUT | `/api/v1/products/products/:id` | Multipart form-data with optional `images` |
| DELETE | `/api/v1/products/products/:id` | Delete a product |
| GET | `/api/v1/products/categories/:category` | Category catalog |

### Cart

| Method | Path | Body |
| --- | --- | --- |
| GET | `/api/v1/cart/cart` | None |
| POST | `/api/v1/cart/cart` | `{ productId, quantity }` |
| PUT | `/api/v1/cart/cart/:id` | `{ quantity }` |
| DELETE | `/api/v1/cart/cart/:id` | None |

### Orders

| Method | Path | Body |
| --- | --- | --- |
| POST | `/api/v1/orders` | `{ items: [{ productId, quantity }] }` |
| GET | `/api/v1/orders` | None |
| GET | `/api/v1/orders/:id` | None |
| GET | `/api/v1/orders/admin/order` | Admin list, optional `status`, `page`, `limit` query params |
| GET | `/api/v1/orders/admin/order/:id` | Admin order details |
| PUT | `/api/v1/orders/admin/order/:id` | `{ status }` |
| DELETE | `/api/v1/orders/admin/order/:id` | Cancels order and restores stock |

### Payments

| Method | Path | Body |
| --- | --- | --- |
| POST | `/api/v1/payments/init` | `{ orderId }` |
| POST | `/api/v1/payments/webhook` | `{ paymentId }` |

## Notes

- Product upload endpoints expect the file field name `images`.
- Order creation and cart APIs require authentication and, for order creation, onboarding to be completed.
- Admin order endpoints require an admin role.
