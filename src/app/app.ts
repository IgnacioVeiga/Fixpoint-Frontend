import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { AuthService } from './service/auth.service';
import { AuthSessionService } from './service/auth-session.service';

type ThemeMode = 'light' | 'dark';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private static readonly THEME_STORAGE_KEY = 'fixpoint-theme';
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly authService = inject(AuthService);
  private readonly sessionStore = inject(AuthSessionService);

  readonly environmentName = environment.name.toUpperCase();
  readonly mockMode = environment.useMockFallback;
  readonly session = this.sessionStore.session;
  readonly isAuthenticated = computed(() => this.sessionStore.isAuthenticated());
  readonly currentUrl = signal(this.router.url);
  readonly isLoginRoute = computed(() => this.currentUrl().startsWith('/login'));
  readonly showNavigation = computed(() => this.isAuthenticated() && !this.isLoginRoute());
  theme: ThemeMode;

  constructor() {
    this.theme = this.getInitialTheme();
    this.applyTheme(this.theme);

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event) => this.currentUrl.set(event.urlAfterRedirects));
  }

  get isDarkTheme(): boolean {
    return this.theme === 'dark';
  }

  toggleTheme(): void {
    this.theme = this.isDarkTheme ? 'light' : 'dark';
    this.applyTheme(this.theme);
    this.saveTheme(this.theme);
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/login']);
  }

  private getInitialTheme(): ThemeMode {
    const savedTheme = this.readSavedTheme();
    if (savedTheme) {
      return savedTheme;
    }

    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  }

  private readSavedTheme(): ThemeMode | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const value = window.localStorage.getItem(App.THEME_STORAGE_KEY);
    if (value === 'light' || value === 'dark') {
      return value;
    }

    return null;
  }

  private saveTheme(theme: ThemeMode): void {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(App.THEME_STORAGE_KEY, theme);
  }

  private applyTheme(theme: ThemeMode): void {
    if (typeof document === 'undefined') {
      return;
    }
    document.documentElement.setAttribute('data-theme', theme);
  }
}
