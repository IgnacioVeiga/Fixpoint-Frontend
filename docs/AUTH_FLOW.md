# Frontend Authentication Flow

## Summary

- Access token is stored in memory only
- Refresh token is managed by backend HttpOnly cookie
- No token persistence in localStorage

## App Initialization

- On app startup, frontend attempts to recover session via `POST /api/v1/auth/refresh`.
- If refresh succeeds, in-memory session is populated.
- If refresh fails, user remains unauthenticated and is redirected to `/login` when needed.

## Login

- Route: `/login`
- User submits:
  - `username`
  - `password`
  - optional `rememberMe`
- Frontend calls `POST /api/v1/auth/login`
- Backend returns:
  - access token payload in response body
  - refresh cookie in `Set-Cookie`

`rememberMe` affects refresh-session TTL on backend:

- `false` -> standard session TTL
- `true` -> extended refresh-session TTL

## Protected Requests

- `authInterceptor` adds `Authorization: Bearer <accessToken>` to protected API requests
- Auth endpoints are excluded from bearer injection

## Automatic Refresh

When a protected request returns `401`:

1. Interceptor calls `POST /api/v1/auth/refresh`
2. If refresh succeeds:
  - access token in memory is replaced
  - original request is retried once
3. If refresh fails:
  - local auth state is cleared
  - user is redirected to `/login`

## Logout

- Frontend calls `POST /api/v1/auth/logout`
- Backend revokes refresh session and clears cookie
- Frontend clears in-memory auth state

## Security Implications

- Access token can still be used until expiration if stolen in-memory.
- Refresh revocation on logout prevents continuation after access token expiry.
- Keep access token TTL short in backend config.

## Mock Mode

In `mock` environment:

- No backend auth required
- Local fallback session is generated
- Useful for UI demos only
