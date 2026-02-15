import { Injectable, signal } from '@angular/core';
import { AuthSession } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  readonly session = signal<AuthSession | null>(null);

  isAuthenticated(): boolean {
    return this.getAccessToken() !== null;
  }

  getAccessToken(): string | null {
    const currentSession = this.session();
    if (!currentSession) {
      return null;
    }

    if (this.isExpired(currentSession.expiresAt)) {
      this.clearSession();
      return null;
    }

    return currentSession.accessToken;
  }

  setSession(session: AuthSession): void {
    if (this.isExpired(session.expiresAt)) {
      this.clearSession();
      return;
    }

    this.session.set(session);
  }

  clearSession(): void {
    this.session.set(null);
  }

  private isExpired(expiresAt: string): boolean {
    const expiresAtMs = Date.parse(expiresAt);
    if (Number.isNaN(expiresAtMs)) {
      return true;
    }
    return expiresAtMs <= Date.now();
  }
}
