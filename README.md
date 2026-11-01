# Pizzasuna

Restaurant ordering website with a customer ordering flow, order tracking, and a password-protected restaurant dashboard.

## Run locally

Requires Node.js 24 or newer.

```powershell
npm ci
npm run db:migrate
npm run dev
```

Open `http://localhost:3015` for the shop and `http://localhost:3015/admin` for the restaurant dashboard. Set `DATABASE_URL` and `PIZZASUNA_ADMIN_PASSWORD` in a local `.env.local` file. Keep that file private; it is ignored by Git.

## Database

The app uses Neon Postgres. Apply the schema with `npm run db:migrate`. Configure `DATABASE_URL` as a secret environment variable on the hosting provider. Never commit `.env`, `.env.local`, Neon credentials, or database dumps.

## Deploy with Render

The repository includes a Dockerfile and `render.yaml` blueprint. Create a Render Web Service from this repository, configure `DATABASE_URL` as a secret, and ensure `PIZZASUNA_ADMIN_PASSWORD` is a unique secret of at least 16 characters. Apply the Neon schema before serving traffic with `npm run db:migrate`. The app listens on Render's `PORT` and exposes `/api/health` for its health check.

Payments are demo-only: checkout creates demo orders and does not charge a card or transfer money. The restaurant receives orders in `/admin`; no email or SMS notifications are configured.

## Build check

```powershell
npm run build
```
