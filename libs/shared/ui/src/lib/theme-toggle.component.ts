import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService, ThemeMode } from '@shared/tokens';

@Component({
  selector: 'atelier-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="theme-switcher-wrapper"
      role="radiogroup"
      aria-label="Theme mode switcher"
    >
      <button
        type="button"
        class="theme-btn"
        [class.active]="themeService.theme() === 'light'"
        (click)="setMode('light')"
        title="Light theme"
        aria-label="Light mode"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      </button>

      <button
        type="button"
        class="theme-btn"
        [class.active]="themeService.theme() === 'dark'"
        (click)="setMode('dark')"
        title="Dark theme"
        aria-label="Dark mode"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      </button>

      <button
        type="button"
        class="theme-btn"
        [class.active]="themeService.theme() === 'system'"
        (click)="setMode('system')"
        title="System preference"
        aria-label="System mode"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="8" y1="21" x2="16" y2="21"></line>
          <line x1="12" y1="17" x2="12" y2="21"></line>
        </svg>
      </button>
    </div>
  `,
  styles: [
    `
      .theme-switcher-wrapper {
        display: inline-flex;
        align-items: center;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-full);
        padding: 3px;
        gap: 2px;
      }

      .theme-btn {
        background: transparent;
        border: none;
        color: var(--text-muted);
        border-radius: var(--radius-full);
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .theme-btn:hover {
        color: var(--text);
      }

      .theme-btn.active {
        background: var(--inverse-bg);
        color: var(--inverse-text);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
      }
    `,
  ],
})
export class ThemeToggleComponent {
  readonly themeService = inject(ThemeService);

  setMode(mode: ThemeMode): void {
    this.themeService.setTheme(mode);
  }
}
