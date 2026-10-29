# SearchBar — Shopify Embedded Application

**SearchBar** is a production-grade Shopify embedded application built to help Shopify merchants design, customize, and publish beautiful, responsive, and high-converting storefront search bars with zero coding required.

SearchBar integrates directly with Shopify's native search routing (`/search?q=...`) and Shopify's native Predictive Search API (`/search/suggest.json`), preserving inventory accuracy, catalog synchronization, and real-time pricing without duplicating product catalogs.

---

## 🚀 Key Features

- **Shopify Admin Dashboard**: Clean Polaris-inspired UI featuring plan status pills, storefront publication badges, installation progress, and quick template shortcuts.
- **8 Unique Search Bar Templates**:
  - **Free (1 Template)**: Classic Search (`classic-search`).
  - **Pro (3 Templates)**: Modern Rounded (`modern-rounded`), Minimal Outline (`minimal-outline`), Bold Search Button (`bold-search-button`).
  - **Advanced (4 Templates)**: Image Accent Search (`image-accent-search`), Banner Search (`banner-search`), Premium Split Search (`premium-split-search`), Featured Search (`featured-search`).
- **Live Visual Search Bar Editor**: Real-time preview with Desktop & Mobile viewport toggles, interactive typing, live predictive search simulation, color pickers (swatch + hex), border radius, width sliders, and button controls.
- **Strict Server-Side Plan Enforcement**: Server validation guards prevent plan bypassing, enforcing template permissions, configuration counts, and feature access.
- **Real Shopify Storefront Search & Autocomplete**:
  - Debounced predictive product queries (`/search/suggest.json`).
  - Product thumbnails, titles, and live prices.
  - Keyboard navigation (Arrow Up/Down, Enter to select, Escape to close).
  - ARIA combobox accessibility attributes.
  - "View all results" link routing to native `/search?q=...`.
- **Shopify Theme App Extension**:
  - **App Block** (`search-bar-block.liquid`): Drag-and-drop into any theme section or header.
  - **App Embed** (`search-bar-embed.liquid`): Floating search bar accessible from anywhere on the storefront.
  - Scoped CSS with zero theme style leakage.
- **Shopify Subscription Billing**:
  - Free ($0/mo), Pro ($4.99/mo), Advanced ($9.99/mo) using Shopify's official Recurring App Subscription GraphQL API.
- **Secure Image Upload**:
  - Advanced plan exclusive route (`/api/upload`) validating MIME type, 2MB size cap, and store isolation.
- **Compliance & Webhooks**:
  - Mandatory GDPR webhooks (`customers/data_request`, `customers/redact`, `shop/redact`).
  - `app/uninstalled` and `app_subscriptions/update` handlers.

---

## 🛠️ Technology Stack

- **Framework**: React Router v7 (`@react-router/*` 7.18.2) + `@shopify/shopify-app-react-router` 4.0.0
- **Frontend**: React 18, Shopify Polaris, App Bridge React 4.2.4
- **Backend**: Node.js (v22+ / v24+), TypeScript
- **Database & ORM**: Prisma ORM with SQLite (local development) and PostgreSQL (production)
- **Theme Extension**: Liquid, Scoped CSS, Vanilla JS (Theme App Extension)
- **Test Suite**: Built-in test runner with `tsx` (`npm test`)

---

## 📋 Getting Started

### 1. Prerequisites

- **Node.js**: v22.12 or higher (`node -v`)
- **Shopify CLI**: `@shopify/cli` (`shopify version`)
- A Shopify Partner account and a Development Store

### 2. Environment Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Ensure your `.env` contains:

```env
SHOPIFY_API_KEY="your-client-id"
SHOPIFY_API_SECRET="your-client-secret"
SCOPES="write_products,write_metaobjects,write_metaobject_definitions"
SHOPIFY_APP_URL="https://your-tunnel.trycloudflare.com"
DATABASE_URL="file:dev.sqlite"
PORT=3000
```

### 3. Database Migration

For local development (SQLite):
```bash
npx prisma db push
npx prisma generate
```

For production (PostgreSQL):
```bash
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public" npx prisma db push --schema prisma/schema.postgresql.prisma
```

### 4. Running the Development Server

Start the local server connected to your Shopify store:

```bash
npm run dev
```

The Shopify CLI will launch Cloudflare tunnel, register redirect URLs, and provide a direct link to install SearchBar in your development store.

---

## 🧪 Testing & Verification

Run the automated test suite covering plan restrictions, template registry, and storefront search:

```bash
npm test
```

Run TypeScript type verification:

```bash
npm run typecheck
```

Build the production bundle:

```bash
npm run build
```

---

## 🏪 Development Store Testing Checklist

1. **Install App**: Run `npm run dev` and click the generated installation link to install SearchBar into your development store.
2. **Dashboard Overview**: Check that the store domain is recognized, default plan shows **Free**, and the default Classic Search is published.
3. **Template Gallery**: Visit `/app/templates`. Confirm that **Free Plan** has 1 template unlocked, and Pro/Advanced templates display lock badges.
4. **Customize Search Bar**: Visit `/app/customize/classic-search`. Test placeholder changes, desktop/mobile preview toggles, and click "Save Changes".
5. **Theme App Extension Installation**:
   - Open Shopify Admin -> Online Store -> Themes -> Customize.
   - Click **Add block** or **Add section** and select **SearchBar Storefront**.
   - Save the theme.
6. **Storefront Search Verification**:
   - Open your storefront in a browser tab.
   - Type in the SearchBar input (e.g., "shoes" or "jacket").
   - Confirm predictive search displays matching product titles, thumbnails, and prices.
   - Press **Enter** or click the search button to confirm standard `/search?q=...` navigation.
7. **Billing Flow**:
   - Visit `/app/pricing` and click **Upgrade to Pro** or **Upgrade to Advanced**.
   - Approve test charge on Shopify's confirmation screen.
   - Verify plan updates immediately in the sidebar and dashboard.
   - Verify previously locked templates are now available for editing and publishing.
