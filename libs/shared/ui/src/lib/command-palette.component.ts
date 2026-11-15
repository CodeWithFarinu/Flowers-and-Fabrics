import {
  Component,
  Output,
  EventEmitter,
  inject,
  signal,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ThemeService } from '@shared/tokens';
import { ProductStore } from '@shared/data-access';

interface CommandItem {
  id: string;
  category: string;
  title: string;
  shortcut?: string;
  action: () => void;
}

@Component({
  selector: 'atelier-command-palette',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cmd-backdrop" (click)="close.emit()">
      <div class="cmd-panel atelier-card" (click)="$event.stopPropagation()">
        <div class="cmd-search-bar">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="search-icon"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            class="cmd-input"
            placeholder="Search fabrics, luxury sneakers, commands... (Type to filter)"
            [value]="query()"
            (input)="onInput($event)"
            autofocus
          />
          <kbd class="esc-kbd">ESC</kbd>
        </div>

        <div class="cmd-results">
          @if (filteredCommands().length === 0) {
            <div class="empty-results">
              No matching commands or products found.
            </div>
          } @else {
            @for (cmd of filteredCommands(); track cmd.id; let idx = $index) {
              <div
                class="cmd-item"
                [class.selected]="idx === selectedIndex()"
                (click)="execute(cmd)"
                (mouseenter)="selectedIndex.set(idx)"
              >
                <div class="cmd-info">
                  <span class="cmd-cat">{{ cmd.category | uppercase }}</span>
                  <span class="cmd-title">{{ cmd.title }}</span>
                </div>
                @if (cmd.shortcut) {
                  <kbd class="cmd-shortcut">{{ cmd.shortcut }}</kbd>
                }
              </div>
            }
          }
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .cmd-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.65);
        backdrop-filter: blur(10px);
        z-index: 2000;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding-top: 14vh;
      }

      .cmd-panel {
        width: 100%;
        max-width: 580px;
        background: var(--bg-elevated);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-lg);
        overflow: hidden;
        animation: popIn 0.18s cubic-bezier(0.16, 1, 0.3, 1);
      }

      @keyframes popIn {
        from {
          opacity: 0;
          transform: scale(0.97) translateY(-8px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }

      .cmd-search-bar {
        display: flex;
        align-items: center;
        padding: 16px 20px;
        border-bottom: 1px solid var(--border);
        gap: 12px;
      }

      .search-icon {
        color: var(--text-muted);
      }

      .cmd-input {
        flex: 1;
        background: transparent;
        border: none;
        font-size: 1.05rem;
        color: var(--text);
        font-family: inherit;
        outline: none;
      }

      .esc-kbd {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-xs);
        font-size: 0.65rem;
        font-weight: 700;
        color: var(--text-muted);
        padding: 2px 6px;
      }

      .cmd-results {
        max-height: 340px;
        overflow-y: auto;
        padding: 8px;
      }

      .empty-results {
        padding: 24px;
        text-align: center;
        font-size: 0.85rem;
        color: var(--text-muted);
      }

      .cmd-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 14px;
        border-radius: var(--radius-sm);
        cursor: pointer;
        transition: background-color 0.1s ease;
      }

      .cmd-item:hover,
      .cmd-item.selected {
        background: var(--surface);
      }

      .cmd-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .cmd-cat {
        font-size: 0.6rem;
        font-weight: 700;
        color: var(--text-muted);
        letter-spacing: 0.08em;
      }

      .cmd-title {
        font-size: 0.9rem;
        font-weight: 500;
        color: var(--text);
      }

      .cmd-shortcut {
        background: var(--bg);
        border: 1px solid var(--border);
        border-radius: var(--radius-xs);
        font-size: 0.7rem;
        color: var(--text-muted);
        padding: 2px 6px;
      }
    `,
  ],
})
export class CommandPaletteComponent {
  @Output() close = new EventEmitter<void>();

  private router = inject(Router);
  private themeService = inject(ThemeService);
  private productStore = inject(ProductStore);

  readonly query = signal<string>('');
  readonly selectedIndex = signal<number>(0);

  private readonly baseCommands: CommandItem[] = [
    {
      id: 'cmd-home',
      category: 'Navigation',
      title: 'Go to Home / Discovery Feed',
      shortcut: 'G H',
      action: () => this.navigate('/'),
    },
    {
      id: 'cmd-studio',
      category: 'AI Tools',
      title: 'Open Style Studio (Visualize Fabric on Silhouette)',
      shortcut: 'G S',
      action: () => this.navigate('/studio'),
    },
    {
      id: 'cmd-rewards',
      category: 'Loyalty',
      title: 'View Loyalty Tier & Rewards Program',
      shortcut: 'G R',
      action: () => this.navigate('/rewards'),
    },
    {
      id: 'cmd-affiliate',
      category: 'Growth',
      title: 'Affiliate Portal & Tracked Link Generator',
      shortcut: 'G A',
      action: () => this.navigate('/affiliate'),
    },
    {
      id: 'cmd-support',
      category: 'Help',
      title: 'Customer Concierge & AI Support Desk',
      shortcut: 'G C',
      action: () => this.navigate('/help'),
    },
    {
      id: 'cmd-theme-toggle',
      category: 'Preferences',
      title: 'Toggle Theme (Light / Dark Mode)',
      shortcut: 'T',
      action: () => this.themeService.toggleTheme(),
    },
  ];

  filteredCommands(): CommandItem[] {
    const q = this.query().toLowerCase().trim();
    if (!q) return this.baseCommands;

    const matchedCmds = this.baseCommands.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q),
    );

    // Also include matching products directly in the command palette!
    const matchedProducts: CommandItem[] = this.productStore
      .products()
      .filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      )
      .map((p) => ({
        id: `prod-${p.id}`,
        category: `Product · ${p.category}`,
        title: `${p.title} (₦${p.price.toLocaleString()})`,
        action: () => this.navigate(`/product/${p.slug}`),
      }));

    return [...matchedCmds, ...matchedProducts];
  }

  onInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.query.set(val);
    this.selectedIndex.set(0);
  }

  execute(cmd: CommandItem): void {
    cmd.action();
    this.close.emit();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      this.close.emit();
      return;
    }

    const items = this.filteredCommands();
    if (items.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.selectedIndex.update((i) => (i + 1) % items.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.selectedIndex.update((i) => (i - 1 + items.length) % items.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = items[this.selectedIndex()];
      if (selected) {
        this.execute(selected);
      }
    }
  }

  private navigate(path: string): void {
    this.router.navigateByUrl(path);
  }
}
