# Fixpoint Frontend

## Entornos

El frontend soporta:

- `dev`
- `qa`
- `prod`
- `mock`

Archivos:

- `src/environments/environment.ts`
- `src/environments/environment.qa.ts`
- `src/environments/environment.prod.ts`
- `src/environments/environment.mock.ts`

## Scripts útiles

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

## IntelliJ IDEA

Run configurations compartidas en `.run/`:

- `Frontend - Dev`
- `Frontend - QA`
- `Frontend - Mock`
- `Frontend - Build QA`
- `Frontend - Build Mock`

## Notas

- En `mock`, los servicios usan fallback local (`useMockFallback: true`).
- En `dev/qa/prod`, consume backend real vía `apiBaseUrl`.

## Unit tests included

- `api.service.spec.ts`: URL resolution and query params normalization.
- `tickets.service.spec.ts`: service behavior with mocked `ApiService`.
- `tickets.component.spec.ts`: loading/error/retry component behavior.
- `clients.component.spec.ts`: retry flow after list load failure.
- `locale-date.service.spec.ts`: locale-aware date formatting behavior.

For `test:ci`, a Chrome/Chromium binary is required (`CHROME_BIN`).

## CI

GitHub Actions workflow: `.github/workflows/ci.yml` installs Chrome, runs unit tests, and builds the app only on commits to `main`.
