# The Scoville Inferno — API

A REST API for an educational ecommerce application, built with Node.js, Express 5 and TypeScript. Data is stored in Supabase PostgreSQL.

## Features

- Registration and sign-in with bcrypt, JWT and role-based access control.
- Profile retrieval and updates.
- Product catalogue and admin product management.
- Checkout with server-side price and stock validation.
- Atomic order creation and stock updates, with duplicate-request protection using `requestId`.
- Order history for the current user and admin statistics.

## Local development

Developed with Node.js 22 and npm.

1. Create a Supabase project and run `supabase/schema.sql` in the SQL Editor.
2. Optionally run `supabase/seed.sql` to add demonstration products.
3. Copy `.env.example` to `.env` and configure the following variables:

| Variable | Purpose |
| --- | --- |
| `PORT` | Server port; defaults to `5000` |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase server-side key |
| `JWT_SECRET` | Random JWT signing secret, at least 16 characters |
| `JWT_EXPIRES_IN` | Token lifetime, for example `1d` |

Do not commit `.env` or expose server-side keys in the frontend.

```bash
npm ci
npm run dev
```

Health check: `GET http://localhost:5000/api/health`.

```bash
npm run build
npm start
```

## Main routes

| Prefix | Purpose |
| --- | --- |
| `/api/auth` | Registration, sign-in and profile |
| `/api/products` | Product catalogue and management |
| `/api/orders` | Order creation and the current user's order history |
| `/api/admin/dashboard` | Admin statistics |

Protected requests require an `Authorization: Bearer <token>` header. Registration creates a regular user; the admin role is assigned separately in the database.

## Current status

Online payments are not connected: new orders have status `new` and payment status `unpaid`. Product images are configured using URLs. Before deployment, add the [frontend](https://github.com/MidNight522/ecommerce-web) domain to the allowed CORS origins in `src/server.ts` and configure secrets through the hosting provider's environment settings.
