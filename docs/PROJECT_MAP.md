# Frontend Project Map

Quick navigation guide for contributors returning after a long break.

## Entry Points

- App bootstrap/config:
  - `src/main.ts`
  - `src/app/app.config.ts`
- Main shell and theme behavior:
  - `src/app/app.ts`
  - `src/app/app.html`
  - `src/app/app.scss`

## Authentication

- Login page:
  - `src/app/auth/login/*`
- Auth service and session state:
  - `src/app/service/auth.service.ts`
  - `src/app/service/auth-session.service.ts`
- HTTP auth behavior:
  - `src/app/service/auth.interceptor.ts`
  - `src/app/service/auth.guard.ts`

## Business Modules

- Dashboard:
  - `src/app/dashboard/*`
- Tickets:
  - `src/app/tickets/*`
  - `src/app/service/tickets.service.ts`
  - `src/app/service/ticket-logs.service.ts`
  - `src/app/service/ticket-parts.service.ts`
- Clients:
  - `src/app/clients/*`
  - `src/app/service/clients.service.ts`
- Inventory:
  - `src/app/inventory/*`
  - `src/app/service/inventory.service.ts`
- Attachments:
  - `src/app/shared/attachment-uploader/*`
  - `src/app/service/attachments.service.ts`

## API and Environment Configuration

- API abstraction (envelope + raw payload support):
  - `src/app/service/generic-api.service.ts`
- Backward-compatible facade used by existing feature services:
  - `src/app/service/api.service.ts`
- Compile-time environment files:
  - `src/environments/environment.ts`
  - `src/environments/environment.qa.ts`
  - `src/environments/environment.prod.ts`
  - `src/environments/environment.mock.ts`

## Test Files (Key Examples)

- Auth flow:
  - `src/app/service/auth.service.spec.ts`
  - `src/app/service/auth.interceptor.spec.ts`
  - `src/app/service/auth-session.service.spec.ts`
- Core app behavior:
  - `src/app/app.spec.ts`
