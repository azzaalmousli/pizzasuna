# Pizzasuna

Pizzasuna is a full-stack pizza ordering website for a wood-fired restaurant in Istanbul. Customers can create an account, customize pizzas, save delivery details, place demo orders, and track order progress. Restaurant staff can sign in to a protected dashboard, view incoming orders, and update kitchen status.

## Live links

- Customer website: https://pizzasuna.onrender.com
- Restaurant dashboard: https://pizzasuna.onrender.com/admin
- Health check: https://pizzasuna.onrender.com/api/health
- Source repository: https://github.com/azzaalmousli/pizzasuna

## QR code

The QR code points to the live customer website. Print or share [pizzasuna-qr.svg](./pizzasuna-qr.svg) to let customers open the menu on their phones. It points to the deployed URL, never to localhost.

## Features

- Responsive pizza menu with customization, toppings, notes, and cart persistence
- Account creation and login with optional email and address fields
- Delivery address search, map pinning, and browser location support
- Demo checkout with expiry and CVC validation
- Demo order creation and customer order tracking
- Protected restaurant dashboard with order refresh, sound alert, filtering, and status updates
- Neon Postgres storage for accounts, sessions, orders, and order items

## Local development

Requires Node.js 24 or newer.

```powershell
npm ci
npm run db:migrate
npm run dev
```

Open `http://localhost:3015` for the customer site and `http://localhost:3015/admin` for the dashboard. Set `DATABASE_URL` and `PIZZASUNA_ADMIN_PASSWORD` in a private `.env.local` file. These files are ignored by Git.

## Deployment

The app is deployed as a Docker Web Service on Render and uses Neon Postgres. Render reads `render.yaml` and deploys from the `main` branch. Configure these as private Render environment variables:

- `DATABASE_URL`: Neon Postgres connection string
- `PIZZASUNA_ADMIN_PASSWORD`: unique dashboard password with at least 16 characters

The `/api/health` endpoint confirms that the application and database are connected.

## Security and payment scope

The dashboard exposes application-level order controls, not raw SQL or database credentials. Database access remains in Neon and through the private `DATABASE_URL` secret. Passwords use salted scrypt hashes, sessions are hashed and expire, and the server calculates order totals from its menu.

Checkout is intentionally demo-only. It accepts test card details, creates an order, and clearly shows that no real charging occurs. No card number, expiry, or CVC is stored or sent to the database. Connect a real payment provider before accepting live payments.

## Project commands

```powershell
npm run build       # syntax and static-file checks
npm run db:migrate  # apply the Neon schema
npm run dev         # start the local server
```
