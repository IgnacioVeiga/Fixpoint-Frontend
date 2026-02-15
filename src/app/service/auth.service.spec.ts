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
      password: 'pass-1234',
      rememberMe: false
    });
    expect(req.request.withCredentials).toBeTrue();

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

  it('should call backend logout and clear session', () => {
    sessionStore.setSession({
      tokenType: 'Bearer',
      accessToken: 'token-logout',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      username: 'tech-user',
      role: 'TECH'
    });

    let completed = false;
    service.logout().subscribe(() => {
      completed = true;
    });

    const req = httpMock.expectOne(`${apiBaseUrl}/auth/logout`);
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBeTrue();
    req.flush({});

    expect(completed).toBeTrue();
    expect(sessionStore.isAuthenticated()).toBeFalse();
    expect(sessionStore.getAccessToken()).toBeNull();
  });

  it('should refresh session using cookie-based backend endpoint', () => {
    let refreshedUsername = '';

    service.refreshSession().subscribe((session) => {
      refreshedUsername = session.username;
    });

    const req = httpMock.expectOne(`${apiBaseUrl}/auth/refresh`);
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBeTrue();
    req.flush({
      tokenType: 'Bearer',
      accessToken: 'token-refresh',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      username: 'refreshed-tech',
      role: 'TECH'
    });

    expect(refreshedUsername).toBe('refreshed-tech');
    expect(sessionStore.getAccessToken()).toBe('token-refresh');
  });
});
