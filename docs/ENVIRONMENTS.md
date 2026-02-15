# Frontend Environments

The frontend uses Angular environment files (compile-time configuration), not runtime `.env` files.

## Environment Files

- `src/environments/environment.ts` -> `dev`
- `src/environments/environment.qa.ts` -> `qa`
- `src/environments/environment.prod.ts` -> `prod`
- `src/environments/environment.mock.ts` -> `mock`

Build/run commands map to these files through Angular build configurations.

## Fields

Each file defines:

- `name`
  - One of: `dev`, `qa`, `prod`, `mock`
- `apiBaseUrl`
  - Base URL for API calls
- `useMockFallback`
  - `true` only for mock mode

## Recommended Values

### `dev`

- `apiBaseUrl`: `http://localhost:8080/api`
- `useMockFallback`: `false`

### `qa`

- `apiBaseUrl`: QA API URL
- `useMockFallback`: `false`

### `prod`

- Usually behind reverse proxy:
  - `apiBaseUrl`: `/api`
- `useMockFallback`: `false`

### `mock`

- `useMockFallback`: `true`
- Backend is optional

## Notes

- If frontend and backend are served from different origins, backend CORS and cookie policy must match that setup.
- For long-term maintainability, keep environment files explicit and avoid hidden defaults.
- Keep `mock` explicitly isolated (`useMockFallback=true`) so real envs always use backend integration.
