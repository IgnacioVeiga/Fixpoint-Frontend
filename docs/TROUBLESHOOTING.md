# Frontend Troubleshooting

Common issues when integrating frontend with backend environments.

## 1. Login Works but Protected Requests Return `401`

### Checks

- `authInterceptor` is registered (`app.config.ts`).
- Access token exists in `AuthSessionService`.
- Request URL belongs to configured API base URL (`environment.apiBaseUrl`).

## 2. Refresh Does Not Work After Page Reload

### Checks

- Backend refresh cookie must be present and valid.
- Browser must accept cookie attributes for your setup.
- Backend CORS must include frontend origin and allow credentials.

## 3. Cookie Not Sent in Cross-Site Setup

### Likely Cause

- Cookie attributes incompatible with deployment.

### Backend Requirements

- `AUTH_REFRESH_COOKIE_SAME_SITE=None`
- `AUTH_REFRESH_COOKIE_SECURE=true`
- HTTPS enabled for both frontend and backend domains

## 4. CORS Errors in Browser Console

### Checks

- Backend `CORS_ALLOWED_ORIGINS` includes exact frontend origin.
- No trailing spaces or wrong protocol (`http` vs `https`).
- Frontend uses the correct environment file for current target.

## 5. Mock Mode Confusion

### Expected Behavior

- In `mock` environment:
  - `useMockFallback=true`
  - frontend can work without backend
- In `dev/qa/prod`:
  - `useMockFallback=false`
  - backend integration is expected

## 6. Local Network (LAN) Access Fails

### Checks

- Start frontend with host binding:
  - `npm run start:dev -- --host 0.0.0.0 --port 4200`
- Update selected environment `apiBaseUrl` to backend LAN IP.
- Add LAN frontend origin to backend `CORS_ALLOWED_ORIGINS`.

## 7. CI Fails with "No usable sandbox" in ChromeHeadless

### Symptom

- GitHub Actions fails during `npm run test:ci` with:
  - `No usable sandbox`

### Cause

- Some Linux runners restrict Chrome sandbox/user namespaces.

### Fix

- Use a wrapper launcher in CI that runs Chrome with:
  - `--no-sandbox`
  - `--disable-setuid-sandbox`
  - `--disable-dev-shm-usage`
- This is already configured in `.github/workflows/ci.yml`.
