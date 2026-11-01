# Cloudflare migration

The local app is already complete and tested with SQLite. Cloudflare Workers cannot use that local SQLite file, so the production backend must use the D1 schema in `schema.sql` and asynchronous D1 statements.

The public deployment must keep the customer routes and the protected `/admin` route in one Worker. Do not upload `site/` as a static-only app: that would omit the API and database.

Required production secrets:

- `PIZZASUNA_ADMIN_PASSWORD` — unique owner password, at least 16 characters
- `SESSION_SECRET` — generated secret used to hash session cookies

Payments remain demo-only until a provider and webhook flow are configured.
