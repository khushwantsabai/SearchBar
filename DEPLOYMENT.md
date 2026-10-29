# SearchBar — Production Deployment Guide

This guide covers deploying SearchBar to production with PostgreSQL, HTTPS, and Shopify Partner App distribution.

---

## 1. Hosting Architecture

- **Web Server**: Node.js v22+ running React Router server (`npm start` or Docker container).
- **Database**: Managed PostgreSQL instance (AWS RDS, Supabase, Neon, or Railway PostgreSQL).
- **SSL / HTTPS**: Required for all embedded Shopify apps.
- **Object Storage / Uploads**: Persistent storage for user-uploaded brand images.

---

## 2. Environment Variables

Configure the following environment variables in your hosting provider's dashboard:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `NODE_ENV` | Runtime environment | `production` |
| `SHOPIFY_API_KEY` | Shopify Partner App Client ID | `adf4c6b0b85e225...` |
| `SHOPIFY_API_SECRET` | Shopify Partner App Client Secret | `shpss_...` |
| `SCOPES` | App access scopes | `write_products,write_metaobjects,write_metaobject_definitions` |
| `SHOPIFY_APP_URL` | Production HTTPS application URL | `https://searchbar-app.fly.dev` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/searchbar?schema=public` |
| `PORT` | Listening server port | `3000` |
| `SUPPORT_CONTACT_EMAIL`| Support inbox | `support@yourdomain.com` |

---

## 3. Database Migration (PostgreSQL)

Before launching the app, apply the production PostgreSQL schema:

```bash
# Push production schema to PostgreSQL
npx prisma db push --schema prisma/schema.postgresql.prisma

# Or generate and run migrations
npx prisma migrate deploy --schema prisma/schema.postgresql.prisma
```

---

## 4. Production Build & Start

In your deployment Dockerfile or build step:

```bash
# Install dependencies
npm ci

# Build client and server bundles
npm run build

# Start the application server
npm start
```

---

## 5. Shopify Partner Dashboard Configuration

1. In [Shopify Partners Dashboard](https://partners.shopify.com):
   - Navigate to **Apps** -> **SearchBar** -> **App Setup**.
2. **App URL**: Set to your production URL, e.g., `https://searchbar-app.fly.dev`.
3. **Allowed redirection URL(s)**:
   - `https://searchbar-app.fly.dev/auth/callback`
   - `https://searchbar-app.fly.dev/auth/shopify/callback`
   - `https://searchbar-app.fly.dev/api/auth`
4. **GDPR Webhooks**:
   - Customers data request: `https://searchbar-app.fly.dev/webhooks/customers/data_request`
   - Customers redact: `https://searchbar-app.fly.dev/webhooks/customers/redact`
   - Shop redact: `https://searchbar-app.fly.dev/webhooks/shop/redact`
5. **App uninstalled webhook**:
   - `https://searchbar-app.fly.dev/webhooks/app/uninstalled`
6. **App Subscriptions update webhook**:
   - `https://searchbar-app.fly.dev/webhooks/app_subscriptions/update`

