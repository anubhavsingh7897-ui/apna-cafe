# Apna Cafe Backend

Express + Sequelize API for the cafeteria billing system.

## Setup

1. Copy `.env.example` to `.env`.
2. Update the database credentials and `JWT_SECRET`.
3. Install dependencies with `npm install`.
4. Create/update tables with `npm run db:sync`.
5. Start the API with `npm start`.

## Auth

Send JWTs as `Authorization: Bearer <token>`.

| Role | Access |
| --- | --- |
| admin | Everything |
| waiter | Orders, items, tables |
| kitchen | Kitchen APIs, item recipes, inventory view/update |
| cashier | Orders, payments, tables |

## API Groups

- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`
- `POST /users`
- `GET /users`
- `GET /users/:id`
- `PUT /users/:id`
- `DELETE /users/:id`
- `POST /items`
- `GET /items`
- `GET /items/:id`
- `PUT /items/:id`
- `DELETE /items/:id`
- `PATCH /items/:id/availability`
- `POST /ingredients`
- `GET /ingredients`
- `PUT /ingredients/:id`
- `POST /items/:id/ingredients`
- `GET /items/:id/ingredients`
- `PUT /items/:id/ingredients`
- `DELETE /items/:id/ingredients/:ingredientId`
- `GET /tables`
- `POST /tables`
- `PUT /tables/:id`
- `POST /orders`
- `GET /orders`
- `GET /orders/:id`
- `GET /orders/table/:id`
- `POST /orders/:id/items`
- `PUT /orders/:id/items/:itemId`
- `DELETE /orders/:id/items/:itemId`
- `PATCH /orders/:id/status`
- `GET /kitchen/orders`
- `PATCH /order-items/:id/status`
- `POST /payments`
- `GET /payments/:order_id`
- `GET /reports/daily`
- `GET /reports/monthly`
- `GET /reports/top-items`
- `POST /internal/update-item-availability/:itemId`
- `POST /internal/recalculate-availability`
- `POST /internal/deduct-inventory`

## Availability Rule

An item is available when `manual_override` is `true`, or every linked ingredient has enough `stock_quantity` for its `quantity_required`.

Order creation deducts inventory, recalculates item availability, and marks the table as occupied. Payment completion marks the order as paid and frees the table.
