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

## Dashboard endpoints

- `GET /dashboard/summary`
- `GET /dashboard/storage`
- Frontend behavior:
  - `mock` env uses in-memory demo data only.
  - Real environments try `/dashboard/summary` first.
  - If it fails, the frontend recalculates a local fallback from live endpoints and still asks `/dashboard/storage` for server-side storage metrics.

## Attachment endpoints

- `GET /attachments/recent?limit=<n>`
- `GET /attachments/ticket/{ticketId}`
- `POST /attachments/upload/ticket/{ticketId}`
- `GET /attachments/download/{id}`
- `GET /attachments/thumbnail/{id}`
- `DELETE /attachments/{id}`

Upload assumptions:

- Frontend sends multipart field `file`.
- Optional multipart field `tag` stores a human-readable content label.
- Backend infers `fileType` and `fileFormat` from the uploaded filename/extension.

Attachment payload assumptions:

- `id`
- `ticketId`
- `filename`
- `filepath`
- `fileType` (`image`, `document`, `spreadsheet`, `archive`, `other`)
- `fileFormat` (for example `pdf`, `png`, `xlsx`)
- `fileSizeBytes`
- `tag` (optional)
- `uploadedAt`
- `thumbnailUrl` is mock-only frontend data. Real environments resolve thumbnails through `GET /attachments/thumbnail/{id}` and cache-bust with the attachment `filepath`.

Thumbnail assumptions:

- Backend returns `image/png` for generated thumbnails.
- Image files should try to use a reduced preview generated from the original file when possible.
- Non-image files can still return a generated placeholder thumbnail from the server.
- If thumbnail generation fails or the file is unavailable, frontend must hide the preview and let text use the full width.

Dashboard summary assumptions:

- `storage.usedBytes`
- `storage.fileCount`
- `storage.totalBytes` (nullable)
- `storage.availableBytes` (nullable)
- `storage.usagePercent` (nullable)
- `storage.source` (`configured`, `filesystem`, `logical`)

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
- `src/app/service/dashboard.service.ts`
- `src/app/service/attachments.service.ts`
