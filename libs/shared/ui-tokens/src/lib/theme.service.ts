import {
  Injectable,
  PLATFORM_ID,
  inject,
  signal,
  computed,
  effect,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type ThemeMode = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  readonly theme = signal<ThemeMode>(this.getInitialTheme());

  private systemDark = signal<boolean>(false);

  readonly effectiveTheme = computed<'light' | 'dark'>(() => {
    const current = this.theme();
    if (current === 'system') {
      return this.systemDark() ? 'dark' : 'light';
    }
    return current;
  });

  constructor() {
    if (this.isBrowser) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.systemDark.set(mediaQuery.matches);

      mediaQuery.addEventListener('change', (e) => {
        this.systemDark.set(e.matches);
      });

      // Synchronize DOM attribute whenever effectiveTheme changes
      effect(() => {
        const eff = this.effectiveTheme();
        document.documentElement.setAttribute('data-theme', eff);
        document.documentElement.style.colorScheme = eff;
      });
    }
  }

  setTheme(mode: ThemeMode): void {
    this.theme.set(mode);
    if (this.isBrowser) {
      try {
        localStorage.setItem('atelier-theme', mode);
      } catch (e) {
        // storage disabled or quota exceeded
      }
    }
  }

  toggleTheme(): void {
    const next = this.effectiveTheme() === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
  }

  private getInitialTheme(): ThemeMode {
    if (!this.isBrowser) return 'system';
    try {
      const stored = localStorage.getItem('atelier-theme') as ThemeMode | null;
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        return stored;
      }
    } catch {
      // ignore
    }
    return 'system';
  }
}
