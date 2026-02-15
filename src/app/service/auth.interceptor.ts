import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { AuthSessionService } from './auth-session.service';

const AUTH_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'];
const RETRY_MARKER_HEADER = 'x-auth-refresh-retry';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const sessionStore = inject(AuthSessionService);
  const router = inject(Router);

  const token = sessionStore.getAccessToken();
  const apiBaseUrl = environment.apiBaseUrl.replace(/\/+$/, '');
  const isApiRequest = request.url.startsWith(apiBaseUrl);
  const isAuthRequest = AUTH_ENDPOINTS.some((endpoint) => request.url.endsWith(endpoint));

  const requestWithAuth =
    token && isApiRequest && !isAuthRequest
      ? request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        })
      : request;

  return next(requestWithAuth).pipe(
    catchError((error: HttpErrorResponse) => {
      const alreadyRetried = request.headers.has(RETRY_MARKER_HEADER);

      if (error.status === 401 && !isAuthRequest && !alreadyRetried && !environment.useMockFallback) {
        return authService.refreshSession().pipe(
          switchMap(() => {
            const refreshedToken = sessionStore.getAccessToken();
            if (!refreshedToken) {
              sessionStore.clearSession();
              void router.navigate(['/login']);
              return throwError(() => error);
            }

            const retriedRequest = request.clone({
              setHeaders: {
                Authorization: `Bearer ${refreshedToken}`,
                [RETRY_MARKER_HEADER]: '1'
              }
            });

            return next(retriedRequest);
          }),
          catchError(() => {
            sessionStore.clearSession();
            void router.navigate(['/login']);
            return throwError(() => error);
          })
        );
      }

      if (error.status === 401 && !isAuthRequest) {
        sessionStore.clearSession();
        void router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
