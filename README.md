# Advance Security Management System — Angular Frontend

Angular 21 SPA scaffolded from the `@babakmirghafari/asms-api-client` OpenAPI contract.

## Prerequisites

- Node.js 22 (use `nvm use` with the included `.nvmrc`)
- GitHub Packages access to `@babakmirghafari` scope (see Authentication below)

## Authentication (GitHub Packages)

The API client package is hosted on GitHub Packages. Create a GitHub personal access token with `read:packages` permission and set it:

```bash
export NODE_AUTH_TOKEN=<your-github-pat>
```

Or add to your shell profile. The `.npmrc` file reads this environment variable automatically.

## Local Development Setup

```bash
# 1. Install dependencies
npm install

# 2. Generate TypeScript API client from contract package
npm run generate:api

# 3. Start local dev server (proxies /api to localhost:8080)
npm start
```

The Angular CLI dev server runs at `http://localhost:4200`. API calls to `/api/**` are proxied to `http://localhost:8080` via `proxy.conf.json`.

## Build

```bash
# Development build
npm run build

# Production build
npm run build:prod
```

## Testing

```bash
# Unit tests (Jest)
npm test

# Unit tests without coverage (faster)
npm test -- --no-coverage

# E2E tests (Playwright)
npm run e2e
```

## Lint & Typecheck

```bash
npm run lint
npm run typecheck
```

## Docker

The Docker image runs `generate:api` at build time — the generated `src/app/api/` is never committed.

```bash
docker build --build-arg NODE_AUTH_TOKEN=$NODE_AUTH_TOKEN -t asms-frontend .
docker run -p 4200:80 -e API_BASE_URL=http://localhost:8080 asms-frontend
```

## Architecture

- Standalone Angular components (no NgModule)
- NgRx SignalStore for all state management
- Lazy-loaded feature routes with `authGuard`
- Generated API client via `ng-openapi-gen` from `@babakmirghafari/asms-api-client`
- Functional HTTP interceptors (auth, error handling)
- Jest for unit tests, Playwright for E2E

## Feature Areas (scaffolded stubs)

Each of these routes corresponds to a resource tag in the OpenAPI contract:

- `/dashboard` — KPI dashboard
- `/users` — User management
- `/organizations` — Organization management
- `/memberships` — Membership management
- `/permission-groups` — Permission groups
- `/permissions` — Permissions catalog
- `/access-control` — Access control / authorization center
- `/applications` — Client application registry
- `/auth-policies` — Authentication policies
- `/station-policies` — Station policies
- `/sessions` — Session monitoring
- `/activity-logs` — Activity logs
- `/audit-logs` — Audit & compliance
- `/alerts` — Security alerts
