# Fixpoint Frontend

Angular client for workshop operations. It supports real backend environments and a mock-only mode for demos.

## Scope

- Environments: `dev`, `qa`, `prod`, `mock`
- Routing + guards for protected pages
- Auth integration with backend refresh-cookie model

## Quick Start

```bash
npm install
npm run start:dev
```

## Documentation Index

- `docs/DEVELOPMENT_SETUP.md` - setup and run modes
- `docs/ENVIRONMENTS.md` - `environment*.ts` strategy and expected values
- `docs/AUTH_FLOW.md` - login/refresh/logout behavior in frontend
- `docs/PROJECT_MAP.md` - where to find key frontend modules
- `docs/TROUBLESHOOTING.md` - common integration and runtime issues
- `BRANCH_PROTECTION_CHECKLIST.md` - repository governance checklist

## Environment Strategy

- Frontend does not use runtime `.env` files.
- Configuration is compile-time via `src/environments/environment*.ts`.

## VS Code Helpers

- `.vscode/tasks.json` includes shortcuts for common npm scripts.
- `.vscode/launch.json` includes launch profiles that run npm tasks and open the app/tests in browser.

## Useful Scripts

```bash
npm run start:dev
npm run start:qa
npm run start:mock

npm run build
npm run build:qa
npm run build:mock

npm run test
npm run test:ci
```

## CI

- Workflow: `.github/workflows/ci.yml`
- Trigger policy: runs on commits to `main`
