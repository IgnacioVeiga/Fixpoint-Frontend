import { TestBed } from '@angular/core/testing';
import { AuthSessionService } from './auth-session.service';

describe('AuthSessionService', () => {
  let service: AuthSessionService;

  beforeEach(() => {
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
  });

  it('should reject expired session values', () => {
    service = TestBed.inject(AuthSessionService);

    service.setSession({
      tokenType: 'Bearer',
      accessToken: 'expired-token',
      expiresAt: new Date(Date.now() - 60 * 1000).toISOString(),
      username: 'tech-user',
      role: 'TECH'
    });

    expect(service.session()).toBeNull();
    expect(service.isAuthenticated()).toBeFalse();
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
  });
});
