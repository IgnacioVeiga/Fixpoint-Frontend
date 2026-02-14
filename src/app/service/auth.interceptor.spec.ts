import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../environments/environment';
import { AuthSessionService } from './auth-session.service';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let sessionStore: AuthSessionService;
  const apiBaseUrl = environment.apiBaseUrl.replace(/\/+$/, '');

  beforeEach(() => {
    localStorage.removeItem('fixpoint-auth-session');

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        AuthSessionService,
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting()
      ]
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    sessionStore = TestBed.inject(AuthSessionService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should add bearer token to protected API requests', () => {
    sessionStore.setSession({
      tokenType: 'Bearer',
      accessToken: 'token-abc',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      username: 'tech-user',
      role: 'TECH'
    });

    http.get(`${apiBaseUrl}/tickets`).subscribe();

    const req = httpMock.expectOne(`${apiBaseUrl}/tickets`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-abc');
    req.flush([]);
  });

  it('should not add bearer token to login endpoint', () => {
    sessionStore.setSession({
      tokenType: 'Bearer',
      accessToken: 'token-abc',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      username: 'tech-user',
      role: 'TECH'
    });

    http.post(`${apiBaseUrl}/auth/login`, { username: 'tech', password: 'pass' }).subscribe();

    const req = httpMock.expectOne(`${apiBaseUrl}/auth/login`);
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({
      tokenType: 'Bearer',
      accessToken: 'new-token',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      username: 'tech',
      role: 'TECH'
    });
  });

  it('should clear local session after unauthorized response', () => {
    sessionStore.setSession({
      tokenType: 'Bearer',
      accessToken: 'token-expire',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      username: 'tech-user',
      role: 'TECH'
    });

    http.get(`${apiBaseUrl}/tickets`).subscribe({
      next: () => fail('Expected unauthorized error'),
      error: () => {
        expect(sessionStore.isAuthenticated()).toBeFalse();
      }
    });

    const req = httpMock.expectOne(`${apiBaseUrl}/tickets`);
    req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
  });
});
