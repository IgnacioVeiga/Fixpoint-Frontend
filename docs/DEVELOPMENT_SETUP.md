# Frontend Development Setup

## 1. Prerequisites

- Node.js (LTS recommended)
- npm
- Optional: VS Code

## 2. Install Dependencies

```bash
npm install
```

## 3. Run by Environment

- Local backend integration:
  - `npm run start:dev`
- QA API integration:
  - `npm run start:qa`
- Mock demo without backend:
  - `npm run start:mock`
- Production runtime parity check:
  - `npm run start:prod`

Helper wrappers:

- `./scripts/run.sh dev local`
- `./scripts/run.sh qa local`
- `./scripts/run.sh mock local`
- `./scripts/run.sh prod local`

## 4. Build Commands

- Default build:
  - `npm run build`
- Dev build:
  - `npm run build:dev`
- QA build:
  - `npm run build:qa`
- Mock build:
  - `npm run build:mock`
- Prod build:
  - `npm run build:prod`

## 5. Test Commands

- Local watch mode:
  - `npm run test`
- CI mode:
  - `npm run test:ci`

`test:ci` requires Chrome/Chromium (`CHROME_BIN`).

## 6. LAN Access (Optional)

To expose frontend in local network:

```bash
npm run start:dev -- --host 0.0.0.0 --port 4200
```

If backend is on another host, ensure `apiBaseUrl` in the selected environment file points to that backend host.

## 7. Related Docs

- `docs/ENVIRONMENTS.md` for `environment*.ts` behavior
- `docs/AUTH_FLOW.md` for login/refresh/logout flow
- `docs/PROJECT_MAP.md` for code navigation
- `docs/TROUBLESHOOTING.md` for CORS/cookie/auth integration errors

## 8. VS Code Shortcuts (Optional)

- Use `Terminal > Run Task` to execute predefined scripts from `.vscode/tasks.json`.
- Use `Run and Debug` to start launch profiles from `.vscode/launch.json`.
