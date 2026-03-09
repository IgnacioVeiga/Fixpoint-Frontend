# Frontend API Contract

Operational contract between `Fixpoint-Frontend` and backend APIs.

## API base URL

- API URL is derived from `environment.apiBaseUrl`.
- Expected backend prefix is `/api/v1`.

## Credentials and auth transport

- Backend calls must use `withCredentials: true`.
- Access token is injected in `Authorization: Bearer <token>` for protected requests.
- Refresh token is handled via HttpOnly cookie.

## Auth endpoints

- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `POST /auth/register` (dev-only backend behavior)

## Auth payload assumptions

Auth responses are expected to include:

- `tokenType`
- `accessToken`
- `expiresAt`
- `username`
- `role`

## Error payload assumptions

Global backend errors should expose:

- `timestamp`
- `status`
- `error`
- `message`

## Technical references

- `src/app/service/generic-api.service.ts`
- `src/app/service/api.service.ts`
- `src/app/service/auth.service.ts`
- `src/app/service/auth.interceptor.ts`
- `src/app/service/auth-session.service.ts`
