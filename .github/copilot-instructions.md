# LLM Coding Instructions - Fixpoint Frontend

This file is machine-oriented guidance for code generation and edits in `Fixpoint-Frontend`.
Human onboarding and product documentation are in `docs/`.

## 1. Repository Identity

- Stack: Angular 20, standalone components, zoneless change detection.
- App type: SPA for workshop operations (clients, tickets, inventory, attachments, dashboard).
- Environments: `dev`, `qa`, `prod`, `mock` (compile-time via `src/environments/environment*.ts`).
- CI trigger: runs on commits to `main` (`.github/workflows/ci.yml`).

## 2. Non-Negotiable Constraints

- Keep auth tokens out of `localStorage` and `sessionStorage`.
  - Exception already in code: UI theme preference storage only.
- Keep `withCredentials: true` for backend API communication.
- Do not introduce runtime `.env` usage in frontend.
- Do not reintroduce Angular module-based architecture (`@NgModule`).
- Do not break backend contract for auth endpoints and payload shape.

## 3. Architecture and Conventions

- Routing source of truth: `src/app/app.routes.ts`.
  - `/login` uses `guestGuard`.
  - business routes use `authGuard`.
- Auth bootstrap: `APP_INITIALIZER` in `src/app/app.config.ts` calls `AuthService.initializeSession()`.
- HTTP abstraction: `src/app/service/api.service.ts`.
- Auth flow implementation:
  - `src/app/service/auth.service.ts`
  - `src/app/service/auth.interceptor.ts`
  - `src/app/service/auth-session.service.ts`
- Feature layout is domain-based under `src/app/`.

## 4. UI and Language Rules

- Keep source code identifiers and comments in English.
- Keep user-facing text consistent with existing UI language (currently mostly Spanish).
- Preserve existing UX behavior unless change request explicitly includes UX redesign.

## 5. Environment Rules

- `dev`, `qa`, `prod` must target real backend integration (`useMockApi: false`).
- `mock` is frontend-only fallback mode (`useMockApi: true`).
- `prod` commonly uses relative API base URL (`/api/v1`) for reverse-proxy deployment.

## 6. Change Policy for LLMs

- Prefer minimal, localized changes over large rewrites.
- Reuse existing services and models before creating new abstractions.
- Preserve strict typing; avoid `any` unless unavoidable.
- Add/update unit tests when behavior changes.
- If changing API request/response shape, also update:
  - frontend models
  - affected service/interceptor tests
  - relevant docs in `docs/`

## 7. Test and Verification

- Default checks:
  - `npm run test:ci`
  - `npm run build`
- In CI, Chrome is launched through a wrapper with sandbox-related flags.
  - Keep `.github/workflows/ci.yml` aligned with runner constraints.

## 8. Files LLMs Should Read First

- `README.md`
- `docs/PROJECT_MAP.md`
- `docs/ENVIRONMENTS.md`
- `docs/AUTH_FLOW.md`
- `src/app/app.config.ts`
- `src/app/app.routes.ts`
