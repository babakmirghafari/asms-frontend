# Advance Security Management System — Frontend

Angular 21 SPA for the ASMS admin console and access management portal.

## Prerequisites

- Node.js 22 LTS (`nvm use` will select the correct version)
- npm 10+
- A GitHub token with `read:packages` scope (to install `@babakmirghafari/asms-api-client` from GitHub Packages)

## Local Setup

```bash
# 1. Authenticate with GitHub Packages
export GITHUB_TOKEN=<your-token>
echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}" >> .npmrc

# 2. Install dependencies
npm install

# 3. Start development server (proxies /asms/v1 to localhost:8080)
npm start
# App available at http://localhost:4200
```

## Scripts

| Command | Description |
|---|---|
| `npm start` | Start dev server with proxy |
| `npm run build` | Production build |
| `npm run build:prod` | Explicit production build |
| `npm run lint` | ESLint + Angular template checks |
| `npm test` | Jest unit tests |
| `npm test -- --no-coverage` | Tests without coverage collection |
| `npm run e2e` | Playwright E2E tests (requires running app) |

## Architecture

- **Signals state**: NgRx SignalStore — all state in Angular signals, no BehaviorSubject
- **API client**: Pre-generated TypeScript services from `@babakmirghafari/asms-api-client@2.0.2`
- **i18n**: `@ngx-translate/core` — runtime language switching (English/Farsi), RTL/LTR via `LanguageStore`
- **Routing**: Lazy-loaded feature routes; `authGuard` on all protected paths
- **HTTP**: Functional interceptors — JWT auth + 401→login error handling

## Feature Routes

| Path | Feature |
|---|---|
| `/auth/login` | Login |
| `/dashboard` | Dashboard |
| `/users` | User Management |
| `/organizations` | Organizations |
| `/memberships` | Memberships |
| `/permission-groups` | Permission Groups |
| `/permissions` | Permissions |
| `/access-control` | Access Control |
| `/applications` | Applications |
| `/auth-policies` | Authentication Policies |
| `/station-policies` | Station Policies |
| `/sessions` | Sessions |
| `/activity-logs` | Activity Logs |
| `/audit-logs` | Audit Logs |
| `/alerts` | Alerts |

## Environment Variables (Docker/K8s)

| Variable | Description |
|---|---|
| `API_BASE_URL` | Backend base URL for nginx proxy (e.g. `http://asms-backend:8080`) |
| `GITHUB_TOKEN` | Build-time: GitHub Packages auth for npm install |
