import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthSession, AuthTokenResponse, LoginRequest } from '../models/auth.model';
import { ApiService } from './api.service';
import { AuthSessionService } from './auth-session.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly sessionStore = inject(AuthSessionService);

  login(request: LoginRequest): Observable<AuthSession> {
    const normalizedRequest: LoginRequest = {
      username: request.username.trim().toLowerCase(),
      password: request.password
    };

    if (environment.useMockFallback) {
      return of(this.buildMockSession(normalizedRequest.username)).pipe(
        tap((session) => this.sessionStore.setSession(session))
      );
    }

    return this.api.post<AuthTokenResponse>('auth/login', normalizedRequest).pipe(
      map((response) => this.toSession(response)),
      tap((session) => this.sessionStore.setSession(session))
    );
  }

  logout(): void {
    this.sessionStore.clearSession();
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

  private buildMockSession(username: string): AuthSession {
    const fallbackUsername = username || 'mock-tech';
    return {
      tokenType: 'Bearer',
      accessToken: `mock-token-${fallbackUsername}`,
      expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      username: fallbackUsername,
      role: 'TECH'
    };
  }
}
