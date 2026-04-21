import { CommonModule } from '@angular/common';
import { Component, DestroyRef, HostListener, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { AuthService } from './service/auth.service';
import { AuthSessionService } from './service/auth-session.service';
import { isEditableShortcutTarget } from './shared/keyboard-shortcuts';

type ThemeMode = 'light' | 'dark';

type NavShortcutLink = {
  label: string;
  route: string;
  shortcut: string;
  exact?: boolean;
};

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
  readonly navLinks: NavShortcutLink[] = [
    { label: 'Panel', route: '/', shortcut: 'Alt+1', exact: true },
    { label: 'Tickets', route: '/tickets', shortcut: 'Alt+2' },
    { label: 'Inventario', route: '/inventario', shortcut: 'Alt+3' },
    { label: 'Clientes', route: '/clientes', shortcut: 'Alt+4' }
  ];

  readonly environmentName = environment.name.toUpperCase();
  readonly mockMode = environment.useMockApi;
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
    this.authService.logout().subscribe({
      next: () => {
        void this.router.navigate(['/login']);
      }
    });
  }

  @HostListener('window:keydown', ['$event'])
  onKeyboardShortcut(event: KeyboardEvent): void {
    if (!this.showNavigation() || isEditableShortcutTarget(event.target)) {
      return;
    }

    if (event.defaultPrevented || !event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
      return;
    }

    const normalizedKey = event.key.toLowerCase();
    if (normalizedKey === 't') {
      event.preventDefault();
      void this.router.navigate(['/tickets/nuevo']);
      return;
    }

    const navIndex = Number.parseInt(normalizedKey, 10) - 1;
    if (Number.isNaN(navIndex) || navIndex < 0 || navIndex >= this.navLinks.length) {
      return;
    }

    event.preventDefault();
    void this.router.navigate([this.navLinks[navIndex].route]);
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
