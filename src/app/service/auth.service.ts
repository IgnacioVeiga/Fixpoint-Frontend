import { inject, Injectable } from '@angular/core';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, finalize, map, shareReplay, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthSession, AuthTokenResponse, LoginRequest } from '../models/auth.model';
import { ApiService } from './api.service';
import { AuthSessionService } from './auth-session.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly sessionStore = inject(AuthSessionService);
  private readonly httpBackend = inject(HttpBackend);
  private readonly rawHttp = new HttpClient(this.httpBackend);
  private refreshInFlight$: Observable<AuthSession> | null = null;
  private initialized = false;

  login(request: LoginRequest): Observable<AuthSession> {
    const normalizedRequest: LoginRequest = {
      username: request.username.trim().toLowerCase(),
      password: request.password,
      rememberMe: Boolean(request.rememberMe)
    };

    if (environment.useMockApi) {
      return of(this.buildMockSession(normalizedRequest.username, normalizedRequest.rememberMe ?? false)).pipe(
        tap((session) => this.sessionStore.setSession(session))
      );
    }

    return this.api.post<AuthTokenResponse>('auth/login', normalizedRequest).pipe(
      map((response) => this.toSession(response)),
      tap((session) => this.sessionStore.setSession(session))
    );
  }

  initializeSession(): Observable<void> {
    if (this.initialized || environment.useMockApi) {
      this.initialized = true;
      return of(void 0);
    }

    if (this.sessionStore.isAuthenticated()) {
      this.initialized = true;
      return of(void 0);
    }

    return this.refreshSession().pipe(
      map(() => void 0),
      catchError(() => {
        this.sessionStore.clearSession();
        return of(void 0);
      }),
      finalize(() => {
        this.initialized = true;
      })
    );
  }

  refreshSession(): Observable<AuthSession> {
    if (environment.useMockApi) {
      return of(this.buildMockSession('mock-tech', false)).pipe(
        tap((session) => this.sessionStore.setSession(session))
      );
    }

    if (this.refreshInFlight$) {
      return this.refreshInFlight$;
    }

    const request$ = this.rawHttp
      .post<AuthTokenResponse>(this.api.resolveUrl('auth/refresh'), {}, { withCredentials: true })
      .pipe(
        map((response) => this.toSession(response)),
        tap((session) => this.sessionStore.setSession(session)),
        finalize(() => {
          this.refreshInFlight$ = null;
        }),
        shareReplay(1)
      );

    this.refreshInFlight$ = request$;
    return request$;
  }

  logout(): Observable<void> {
    if (environment.useMockApi) {
      this.sessionStore.clearSession();
      return of(void 0);
    }

    return this.rawHttp
      .post<void>(this.api.resolveUrl('auth/logout'), {}, { withCredentials: true })
      .pipe(
        catchError(() => of(void 0)),
        map(() => void 0),
        finalize(() => this.sessionStore.clearSession())
      );
  }

  private toSession(response: AuthTokenResponse): AuthSession {
    return {
      tokenType: response.tokenType,
      accessToken: response.accessToken,
      expiresAt: response.expiresAt,
      username: response.username,
      role: response.role
    };
  }

  private buildMockSession(username: string, rememberMe: boolean): AuthSession {
    const fallbackUsername = username || 'mock-tech';
    const ttlHours = rememberMe ? 30 * 24 : 12;
    return {
      tokenType: 'Bearer',
      accessToken: `mock-token-${fallbackUsername}`,
      expiresAt: new Date(Date.now() + ttlHours * 60 * 60 * 1000).toISOString(),
      username: fallbackUsername,
      role: 'TECH'
    };
  }
}
