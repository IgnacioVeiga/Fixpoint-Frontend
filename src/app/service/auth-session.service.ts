import { Injectable, signal } from '@angular/core';
import { AuthSession } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private static readonly STORAGE_KEY = 'fixpoint-auth-session';

  readonly session = signal<AuthSession | null>(this.readStoredSession());

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
    this.persistSession(session);
  }

  clearSession(): void {
    this.session.set(null);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(AuthSessionService.STORAGE_KEY);
    }
  }

  private readStoredSession(): AuthSession | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const raw = window.localStorage.getItem(AuthSessionService.STORAGE_KEY);
    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as AuthSession;
      if (!parsed?.accessToken || !parsed?.expiresAt) {
        window.localStorage.removeItem(AuthSessionService.STORAGE_KEY);
        return null;
      }

      if (this.isExpired(parsed.expiresAt)) {
        window.localStorage.removeItem(AuthSessionService.STORAGE_KEY);
        return null;
      }

      return parsed;
    } catch {
      window.localStorage.removeItem(AuthSessionService.STORAGE_KEY);
      return null;
    }
  }

  private persistSession(session: AuthSession): void {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(AuthSessionService.STORAGE_KEY, JSON.stringify(session));
  }

  private isExpired(expiresAt: string): boolean {
    const expiresAtMs = Date.parse(expiresAt);
    if (Number.isNaN(expiresAtMs)) {
      return true;
    }
    return expiresAtMs <= Date.now();
  }
}
