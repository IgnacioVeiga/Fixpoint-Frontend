import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { environment } from '../environments/environment';

type ThemeMode = 'light' | 'dark';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private static readonly THEME_STORAGE_KEY = 'fixpoint-theme';

  readonly environmentName = environment.name.toUpperCase();
  readonly mockMode = environment.useMockFallback;
  theme: ThemeMode;

  constructor() {
    this.theme = this.getInitialTheme();
    this.applyTheme(this.theme);
  }

  get isDarkTheme(): boolean {
    return this.theme === 'dark';
  }

  toggleTheme(): void {
    this.theme = this.isDarkTheme ? 'light' : 'dark';
    this.applyTheme(this.theme);
    this.saveTheme(this.theme);
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
