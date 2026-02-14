import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { AuthSessionService } from './auth-session.service';
import { AuthService } from './auth.service';
import { ApiService } from './api.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let sessionStore: AuthSessionService;
  const apiBaseUrl = environment.apiBaseUrl.replace(/\/+$/, '');

  beforeEach(() => {
    localStorage.removeItem('fixpoint-auth-session');

    TestBed.configureTestingModule({
      providers: [AuthService, ApiService, AuthSessionService, provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    sessionStore = TestBed.inject(AuthSessionService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should login and persist session using backend response', () => {
    let completed = false;

    service.login({ username: 'Tech-User', password: 'pass-1234' }).subscribe((session) => {
      completed = true;
      expect(session.username).toBe('tech-user');
      expect(session.role).toBe('TECH');
    });

    const req = httpMock.expectOne(`${apiBaseUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      username: 'tech-user',
      password: 'pass-1234'
    });

    req.flush({
      tokenType: 'Bearer',
      accessToken: 'token-123',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      username: 'tech-user',
      role: 'TECH'
    });

    expect(completed).toBeTrue();
    expect(sessionStore.isAuthenticated()).toBeTrue();
    expect(sessionStore.getAccessToken()).toBe('token-123');
  });

  it('should clear session on logout', () => {
    sessionStore.setSession({
      tokenType: 'Bearer',
      accessToken: 'token-logout',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      username: 'tech-user',
      role: 'TECH'
    });

    service.logout();

    expect(sessionStore.isAuthenticated()).toBeFalse();
    expect(sessionStore.getAccessToken()).toBeNull();
  });
});
