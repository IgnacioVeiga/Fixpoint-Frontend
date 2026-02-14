import { TestBed } from '@angular/core/testing';
import { AuthSessionService } from './auth-session.service';

describe('AuthSessionService', () => {
  let service: AuthSessionService;

  beforeEach(() => {
    localStorage.removeItem('fixpoint-auth-session');

    TestBed.configureTestingModule({
      providers: [AuthSessionService]
    });
  });

  it('should persist and expose a valid session', () => {
    service = TestBed.inject(AuthSessionService);

    const session = {
      tokenType: 'Bearer',
      accessToken: 'token-123',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      username: 'tech-user',
      role: 'TECH'
    };

    service.setSession(session);

    expect(service.session()).toEqual(session);
    expect(service.isAuthenticated()).toBeTrue();
    expect(localStorage.getItem('fixpoint-auth-session')).toContain('token-123');
  });

  it('should clear expired session loaded from storage', () => {
    localStorage.setItem(
      'fixpoint-auth-session',
      JSON.stringify({
        tokenType: 'Bearer',
        accessToken: 'expired-token',
        expiresAt: new Date(Date.now() - 60 * 1000).toISOString(),
        username: 'tech-user',
        role: 'TECH'
      })
    );

    const reloaded = TestBed.inject(AuthSessionService);

    expect(reloaded.session()).toBeNull();
    expect(reloaded.isAuthenticated()).toBeFalse();
    expect(localStorage.getItem('fixpoint-auth-session')).toBeNull();
  });

  it('should clear session data', () => {
    service = TestBed.inject(AuthSessionService);

    service.setSession({
      tokenType: 'Bearer',
      accessToken: 'token-xyz',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      username: 'tech-user',
      role: 'TECH'
    });

    service.clearSession();

    expect(service.session()).toBeNull();
    expect(service.isAuthenticated()).toBeFalse();
    expect(localStorage.getItem('fixpoint-auth-session')).toBeNull();
  });
});
