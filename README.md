# Apna Cafe Backend

Express + Sequelize REST API for a cafe billing system. It handles staff login, menu items, inventory recipes, table orders, kitchen status updates, payments, reports, and app configuration.

## Tech Stack

- Node.js + Express
- Sequelize ORM
- PostgreSQL/Neon through `DATABASE_URL`
- MySQL fallback through `DB_HOST`, `DB_USER`, etc.
- JWT authentication
- bcrypt password hashing

## Project Structure

```text
Backend/
  src/
    app.js                 Express app, middleware, route mounting
    server.js              Database connection and API startup
    config/database.js     Sequelize connection setup
    models/                Sequelize models and associations
    routes/                Route definitions and role guards
    controllers/           Request handlers
    services/              Business logic for orders, inventory, reports
    middleware/            Auth and error handling
    utils/                 Small shared helpers
```

## Starter Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` in `Backend/`.

For Neon/PostgreSQL:

```env
DATABASE_URL='postgresql://USER:PASSWORD@HOST/neondb?sslmode=require&channel_binding=require'
PORT=5000
JWT_SECRET=change_this_secret
JWT_EXPIRES_IN=1d
```

For local MySQL instead, comment `DATABASE_URL` and use:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=apna_cafe
DB_USER=root
DB_PASSWORD=your_password
DB_DIALECT=mysql
PORT=5000
JWT_SECRET=change_this_secret
JWT_EXPIRES_IN=1d
```

3. Sync tables:

```bash
npm run db:sync
```

4. Start the API:

```bash
npm start
```

For development with auto-restart:

```bash
npm run dev
```

5. Health check:

```bash
GET http://localhost:5000/health
```

Response:

```json
{ "status": "ok" }
```

## Useful Scripts

| Command | Purpose |
| --- | --- |
| `npm start` | Start `src/server.js` |
| `npm run dev` | Start with nodemon |
| `npm run check` | Check JavaScript syntax |
| `npm run db:create` | Create the configured database, mainly for MySQL |
| `npm run db:sync` | Sync Sequelize models to the database |

## Authentication

Most routes require a JWT token.

Send it as:

```http
Authorization: Bearer <token>
```

Login with phone number or email:

```http
POST /auth/login
Content-Type: application/json
```

```json
{
  "phone": "9876543210",
  "password": "secret"
}
```

Successful auth returns:

```json
{
  "token": "jwt-token",
  "user": {
    "id": 1,
    "name": "Admin",
    "phone": "9876543210",
    "email": "admin@example.com",
    "role": "admin",
    "is_active": true
  }
}
```

## Roles

| Role | Main Access |
| --- | --- |
| `admin` | Staff, menu, recipes, ingredients, tables, reports, config, internal tools |
| `waiter` | View items/tables, create and manage table orders |
| `cashier` | View orders/tables, create manual counter orders, collect payments |
| `kitchen` | View kitchen queue, update item preparation status, view recipes/inventory |

## API Routes

### Auth

| Method | Route | Auth | Purpose |
| --- | --- | --- | --- |
| `POST` | `/auth/login` | Public | Login using phone/email and password |
| `POST` | `/auth/signup` | Public | Create a user and return a token |
| `POST` | `/auth/logout` | Any logged-in user | Client-side logout helper |
| `GET` | `/auth/me` | Any logged-in user | Return current authenticated user |

Signup body:

```json
{
  "name": "Waiter One",
  "phone": "9876543210",
  "email": "waiter@example.com",
  "password": "secret",
  "role": "waiter"
}
```

### Users

All `/users` routes require `admin`.

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/users` | Create staff user |
| `GET` | `/users` | List staff users |
| `GET` | `/users/:id` | Get one staff user |
| `PUT` | `/users/:id` | Update staff user |
| `DELETE` | `/users/:id` | Delete staff user |

Create user body:

```json
{
  "name": "Cashier One",
  "phone": "9000000001",
  "email": "cashier@example.com",
  "role": "cashier",
  "password": "secret",
  "is_active": true
}
```

Allowed roles are `admin`, `waiter`, `cashier`, and `kitchen`.

### Items and Recipes

All `/items` routes require login.

| Method | Route | Roles | Purpose |
| --- | --- | --- | --- |
| `POST` | `/items` | `admin` | Create menu item |
| `GET` | `/items` | `admin`, `waiter`, `cashier`, `kitchen` | List menu items |
| `GET` | `/items/:id` | `admin`, `waiter`, `cashier`, `kitchen` | Get menu item |
| `PUT` | `/items/:id` | `admin` | Update menu item |
| `DELETE` | `/items/:id` | `admin` | Delete menu item |
| `PATCH` | `/items/:id/availability` | `admin` | Set manual availability override |
| `POST` | `/items/:id/ingredients` | `admin` | Add one recipe ingredient |
| `GET` | `/items/:id/ingredients` | `admin`, `kitchen` | View recipe |
| `PUT` | `/items/:id/ingredients` | `admin` | Replace full recipe |
| `DELETE` | `/items/:id/ingredients/:ingredientId` | `admin` | Remove recipe ingredient |

Create item body:

```json
{
  "name": "Masala Dosa",
  "category": "South Indian",
  "price": 80,
  "is_available": true,
  "manual_override": false
}
```

Update availability body:

```json
{
  "manual_override": true,
  "is_available": false
}
```

Replace recipe body:

```json
{
  "ingredients": [
    { "ingredient_id": 1, "quantity_required": 0.2 },
    { "ingredient_id": 2, "quantity_required": 0.05 }
  ]
}
```

### Ingredients

All `/ingredients` routes require `admin` or `kitchen`. Creating ingredients requires `admin`.

| Method | Route | Roles | Purpose |
| --- | --- | --- | --- |
| `POST` | `/ingredients` | `admin` | Create ingredient |
| `GET` | `/ingredients` | `admin`, `kitchen` | List ingredients |
| `PUT` | `/ingredients/:id` | `admin`, `kitchen` | Update ingredient stock/details |

Ingredient body:

```json
{
  "name": "Rice Batter",
  "unit": "kg",
  "stock_quantity": 10,
  "min_stock_level": 2
}
```

When ingredients change, item availability is recalculated.

### Tables

All `/tables` routes require login.

| Method | Route | Roles | Purpose |
| --- | --- | --- | --- |
| `GET` | `/tables` | `admin`, `waiter`, `cashier` | List tables |
| `POST` | `/tables` | `admin` | Create table |
| `PUT` | `/tables/:id` | `admin`, `waiter`, `cashier` | Update table |

Table body:

```json
{
  "table_number": "T1",
  "capacity": 4,
  "status": "free"
}
```

Allowed statuses are `free`, `occupied`, and `billing`.

### Orders

All `/orders` routes require login.

| Method | Route | Roles | Purpose |
| --- | --- | --- | --- |
| `POST` | `/orders` | `waiter`, `cashier` | Create order |
| `GET` | `/orders` | `cashier` | List all orders |
| `GET` | `/orders/table/:id` | `waiter`, `cashier` | Get active order for a table |
| `GET` | `/orders/:id` | `waiter`, `cashier`, `kitchen` | Get order details |
| `POST` | `/orders/:id/items` | `waiter` | Add item to order |
| `PUT` | `/orders/:id/items/:itemId` | `waiter` | Change item quantity |
| `DELETE` | `/orders/:id/items/:itemId` | `waiter` | Remove item from order |
| `PATCH` | `/orders/:id/status` | `waiter`, `cashier`, `kitchen` | Update order status |

Create table order body:

```json
{
  "table_id": 1,
  "items": [
    { "item_id": 1, "quantity": 2 },
    { "item_id": 3, "quantity": 1 }
  ]
}
```

Cashier manual/counter order body:

```json
{
  "manual": true,
  "items": [
    { "item_id": 2, "quantity": 1 }
  ]
}
```

Add item body:

```json
{
  "item_id": 4,
  "quantity": 2
}
```

Update item quantity body:

```json
{
  "quantity": 3
}
```

Update order status body:

```json
{
  "status": "ready"
}
```

Allowed order statuses are `new`, `preparing`, `ready`, `served`, and `paid`.

### Kitchen

Kitchen routes require the `kitchen` role.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/kitchen/orders` | List active kitchen orders |
| `PATCH` | `/order-items/:id/status` | Update one order item status |

Update order item status body:

```json
{
  "status": "preparing"
}
```

Kitchen can set item status to `preparing` or `ready`.

### Payments

All `/payments` routes require `admin` or `cashier`.

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/payments` | Collect payment for an order |
| `GET` | `/payments/stats` | Get billing collection stats |
| `GET` | `/payments/:order_id` | Get payment by order id |

Payment body:

```json
{
  "order_id": 1,
  "amount": 240,
  "payment_method": "UPI"
}
```

Allowed payment methods are `cash`, `UPI`, and `card`.

Creating a payment marks the order as `paid` and frees the table.

### Reports

All `/reports` routes require `admin`.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/reports/daily` | Paid order count and sales for today |
| `GET` | `/reports/monthly` | Paid order count and sales for current month |
| `GET` | `/reports/top-items` | Top 10 sold items |
| `GET` | `/reports/billing-analytics` | Detailed billing analytics |

### Config

| Method | Route | Roles | Purpose |
| --- | --- | --- | --- |
| `GET` | `/config` | Any logged-in user | Read app config as a key-value object |
| `POST` | `/config` | `admin` | Create or update a config value |

Config update body:

```json
{
  "key": "restaurant_name",
  "value": "Apna Cafe"
}
```

### Internal Admin Tools

All `/internal` routes require `admin`.

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/internal/update-item-availability/:itemId` | Recalculate one item availability |
| `POST` | `/internal/recalculate-availability` | Recalculate all items |
| `POST` | `/internal/deduct-inventory` | Deduct inventory for one item manually |

Manual inventory deduction body:

```json
{
  "item_id": 1,
  "quantity": 2
}
```

## Main App Flow

1. Admin creates staff users, tables, ingredients, menu items, and item recipes.
2. Inventory stock decides whether menu items are available.
3. Waiter creates a table order with selected items and quantities.
4. The API checks stock for each recipe ingredient.
5. If stock is enough, the order is created, inventory is deducted, order total is calculated, and the table becomes `occupied`.
6. Kitchen sees active orders in `/kitchen/orders`.
7. Kitchen updates each order item to `preparing` or `ready`.
8. Waiter or cashier updates the order status through `new`, `preparing`, `ready`, and `served`.
9. Cashier creates a payment.
10. Payment marks the order as `paid` and changes the table back to `free`.
11. Admin views sales reports and billing analytics.

## Inventory and Availability Flow

Each menu item can have recipe rows in `ItemIngredients`.

Example:

```text
Masala Dosa
  Rice Batter: 0.2 kg
  Potato Masala: 0.1 kg
```

If a customer orders 2 Masala Dosa, the API needs:

```text
Rice Batter: 0.4 kg
Potato Masala: 0.2 kg
```

Availability rules:

- If `manual_override` is `true`, the saved `is_available` value is respected.
- If `manual_override` is `false`, the API checks whether every linked ingredient has enough stock.
- Ingredient updates recalculate availability.
- Order creation and order item changes deduct or restore inventory and refresh availability.

## Error Shape

Errors are returned by the centralized error middleware. Typical responses look like:

```json
{
  "message": "Invalid credentials."
}
```

Common status codes:

| Code | Meaning |
| --- | --- |
| `400` | Missing or invalid input |
| `401` | Not logged in or invalid credentials |
| `403` | Logged in but role is not allowed |
| `404` | Resource not found |
| `409` | Duplicate phone/email or unique value |
| `500` | Unexpected server error |

## Quick Test Flow

1. Sign up or create an admin user.
2. Login and copy the token.
3. Create ingredients.
4. Create menu items.
5. Attach recipes to items.
6. Create tables.
7. Login as waiter and create an order.
8. Login as kitchen and update item status.
9. Login as cashier and collect payment.
10. Login as admin and check reports.
