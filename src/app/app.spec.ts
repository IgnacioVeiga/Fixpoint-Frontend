import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { AuthSessionService } from './service/auth-session.service';

describe('App', () => {
  beforeEach(async () => {
    localStorage.removeItem('fixpoint-theme');

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideZonelessChangeDetection(), provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should hide main navigation when user is not authenticated', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.main-nav')).toBeNull();
  });

  it('should render main navigation when session is active', () => {
    const fixture = TestBed.createComponent(App);
    const sessionStore = TestBed.inject(AuthSessionService);
    sessionStore.setSession({
      tokenType: 'Bearer',
      accessToken: 'token-123',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      username: 'tech-user',
      role: 'TECH'
    });
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.main-nav')).toBeTruthy();
  });

  it('should toggle and apply theme to document root', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const app = fixture.componentInstance;
    const initialTheme = app.theme;
    const button = fixture.nativeElement.querySelector('.theme-toggle') as HTMLButtonElement;

    button.click();
    fixture.detectChanges();

    expect(app.theme).not.toBe(initialTheme);
    expect(document.documentElement.getAttribute('data-theme')).toBe(app.theme);
    expect(localStorage.getItem('fixpoint-theme')).toBe(app.theme);
  });

  it('should initialize using saved theme from localStorage', () => {
    localStorage.setItem('fixpoint-theme', 'dark');

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(fixture.componentInstance.theme).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
