import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthSessionService } from './auth-session.service';

const AUTH_ENDPOINTS = ['/auth/login', '/auth/register'];

export const authInterceptor: HttpInterceptorFn = (request, next) => {
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
      if (error.status === 401 && !isAuthRequest) {
        sessionStore.clearSession();
        void router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
