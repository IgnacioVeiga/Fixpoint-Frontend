import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';
import { AuthSessionService } from './auth-session.service';
import { authGuard, guestGuard } from './auth.guard';

describe('authGuard', () => {
  let router: Router;
  let sessionStore: AuthSessionService;

  beforeEach(() => {
    localStorage.removeItem('fixpoint-auth-session');

    TestBed.configureTestingModule({
      providers: [provideRouter([]), AuthSessionService]
    });

    router = TestBed.inject(Router);
    sessionStore = TestBed.inject(AuthSessionService);
  });

  it('should redirect to login when user is not authenticated', () => {
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as never, { url: '/tickets' } as never)
    );

    expect(result instanceof UrlTree).toBeTrue();
    expect(router.serializeUrl(result as UrlTree)).toBe('/login?redirect=%2Ftickets');
  });

  it('should allow access when user is authenticated', () => {
    sessionStore.setSession({
      tokenType: 'Bearer',
      accessToken: 'token-123',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      username: 'tech-user',
      role: 'TECH'
    });

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as never, { url: '/tickets' } as never)
    );

    expect(result).toBeTrue();
  });

  it('guestGuard should redirect authenticated user away from login route', () => {
    sessionStore.setSession({
      tokenType: 'Bearer',
      accessToken: 'token-123',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      username: 'tech-user',
      role: 'TECH'
    });

    const result = TestBed.runInInjectionContext(() => guestGuard({} as never, {} as never));

    expect(result instanceof UrlTree).toBeTrue();
    expect(router.serializeUrl(result as UrlTree)).toBe('/');
  });
});
