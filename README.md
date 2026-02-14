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
