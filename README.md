# Endexly

Multi-tenant SaaS platform for managed websites.

## Tech Stack

- **Framework:** Next.js 16 (App Router, TypeScript)
- **Styling:** Tailwind CSS v4
- **Database:** PostgreSQL + Drizzle ORM
- **Auth:** Clerk
- **Validation:** Zod

## Architecture

```
src/
  app/
    (marketing)/          # Public landing page (root domain)
    (internal)/admin/     # Internal admin panel (platform_admin only)
    (customer)/dashboard/ # Customer dashboard (scaffold)
    site/[domain]/        # Tenant site rendering (subdomain/custom domain)
    sign-in/              # Clerk sign-in
    sign-up/              # Clerk sign-up
  lib/
    db/                   # Drizzle schema, client, migrations, seed
    repositories/         # Data access layer
    services/             # Business logic + audit logging
    validators/           # Zod schemas
    auth/                 # RBAC helpers + audit utility
    tenant/               # Hostname parsing + site resolution
  components/
    admin/                # Admin UI components
    shared/               # Reusable UI components
```

### Hostname Routing

The platform uses subdomain-based routing for tenant sites:

| Hostname | Routes To |
|---|---|
| `endexly.localhost:3000` | Marketing landing page |
| `app.endexly.localhost:3000` | Admin panel / customer dashboard |
| `{slug}.endexly.localhost:3000` | Tenant site (resolved via domains table) |
| `custom-domain.com` | Tenant site (custom domain lookup) |

Middleware intercepts requests, parses the hostname, and rewrites tenant requests to `/site/[domain]` which resolves the site from the database.

## Local Setup

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- A Clerk account ([clerk.com](https://clerk.com))

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

- `DATABASE_URL` — your PostgreSQL connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — from Clerk dashboard
- `CLERK_SECRET_KEY` — from Clerk dashboard
- `SEED_ADMIN_CLERK_USER_ID` — your Clerk user ID (for seed data)

### 3. Create the database

```bash
createdb endexly
```

### 4. Push schema to database

```bash
npm run db:push
```

Or generate and run migrations:

```bash
npm run db:generate
npm run db:migrate
```

### 5. Seed the database

```bash
npm run db:seed
```

This creates a sample organization, site, domain, and platform admin membership.

### 6. Start the dev server

```bash
npm run dev
```

### 7. Configure local DNS for subdomains

For subdomain routing to work locally, add these entries to `/etc/hosts`:

```
127.0.0.1 endexly.localhost
127.0.0.1 app.endexly.localhost
127.0.0.1 acme-corp.endexly.localhost
```

> Note: On most systems, `*.localhost` already resolves to `127.0.0.1`. If subdomains work without editing `/etc/hosts`, you can skip this step.

### 8. Visit the app

- **Marketing page:** http://endexly.localhost:3000
- **Admin panel:** http://app.endexly.localhost:3000/admin
- **Tenant site:** http://acme-corp.endexly.localhost:3000

## Clerk Configuration

### Required Settings

In your Clerk dashboard:

1. Set sign-in/sign-up URLs:
   - Sign-in: `/sign-in`
   - Sign-up: `/sign-up`

2. Enable Organizations (optional for now — the DB schema is ready for it)

### Platform Admin Setup

After signing up, find your Clerk User ID in the Clerk dashboard and either:
- Set it as `SEED_ADMIN_CLERK_USER_ID` before running seed, or
- Manually insert a membership record with `role_code = 'platform_admin'`

## Database Commands

| Command | Description |
|---|---|
| `npm run db:push` | Push schema directly to database (dev) |
| `npm run db:generate` | Generate migration files |
| `npm run db:migrate` | Run pending migrations |
| `npm run db:studio` | Open Drizzle Studio (visual DB browser) |
| `npm run db:seed` | Seed sample data |

## Production Deployment (Vercel)

### Assumptions

- Deploy on Vercel with a PostgreSQL provider (Neon, Supabase, etc.)
- Configure wildcard domain: `*.endexly.com` pointing to Vercel
- Set `NEXT_PUBLIC_ROOT_DOMAIN=endexly.com` in Vercel env vars
- Configure Clerk production keys
- Run `npm run db:migrate` against production database before first deploy

### Vercel Domain Setup

1. Add your root domain `endexly.com`
2. Add wildcard `*.endexly.com`
3. Set the `NEXT_PUBLIC_ROOT_DOMAIN` environment variable

## Data Model

### Core Entities

- **organizations** — tenants / customer accounts
- **memberships** — user-to-org role mappings (uses Clerk user IDs)
- **sites** — websites under an organization
- **site_environments** — production/staging/preview environments per site
- **domains** — hostname records mapped to sites
- **site_settings** — brand, theme, and content settings per site
- **audit_events** — immutable log of admin mutations

### RBAC Roles

| Role | Access |
|---|---|
| `platform_admin` | Full admin access, all organizations/sites |
| `org_owner` | Organization owner (future) |
| `org_admin` | Organization admin (future) |
| `org_member` | Organization member (future) |
