import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '@shared/tokens';
import { ThemeToggleComponent } from './theme-toggle.component';

@Component({
  selector: 'atelier-live-theme-preview',
  standalone: true,
  imports: [CommonModule, ThemeToggleComponent],
  template: `
    <div class="theme-preview-container atelier-card">
      <div class="preview-header">
        <div>
          <span class="preview-tag">LIVE DESIGN SYSTEM PREVIEW</span>
          <h3 class="preview-title">Monochrome Luxe Palette</h3>
          <p class="preview-subtitle">
            Current Mode:
            <strong>{{ themeService.theme() | uppercase }}</strong> (Effective:
            <strong>{{ themeService.effectiveTheme() | uppercase }}</strong
            >)
          </p>
        </div>
        <atelier-theme-toggle />
      </div>

      <div class="preview-canvas">
        <div class="sample-product-card atelier-card">
          <div class="sample-media">
            <img
              src="https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=500&q=80"
              alt="Midnight Italian Cashmere"
            />
            <span class="sample-badge">LAGOS EDIT</span>
          </div>

          <div class="sample-details">
            <span class="sample-brand">LANIFICIO BIELLA</span>
            <h4 class="sample-title">
              Midnight Obsidian Italian Cashmere 160s
            </h4>
            <div class="sample-price price-display">
              <span class="main-price">₦42,000 <small>/ yard</small></span>
              <span class="compare-price">₦55,000</span>
            </div>

            <div class="sample-swatches">
              <span
                class="swatch"
                style="background-color: #0A0A0A"
                title="Obsidian"
              ></span>
              <span
                class="swatch"
                style="background-color: #374151"
                title="Charcoal"
              ></span>
              <span
                class="swatch"
                style="background-color: #1E3A8A"
                title="Navy"
              ></span>
            </div>

            <div class="sample-actions">
              <button type="button" class="btn-primary full-w">
                Quick Buy Now
              </button>
              <button type="button" class="btn-secondary full-w">
                Add to Cart
              </button>
            </div>
          </div>
        </div>

        <div class="sample-form-elements">
          <label class="form-label">Customer Nigerian Phone Number</label>
          <div class="input-group">
            <span class="input-prefix">+234</span>
            <input
              type="tel"
              class="form-input"
              value="0803 987 6543"
              readonly
            />
          </div>

          <div class="token-chip-sample">
            <span class="token-sparkle">✦</span>
            <span
              >Style Studio Token Balance: <strong>3 Free Tokens</strong></span
            >
          </div>

          <div class="status-indicators">
            <span class="status-pill status-success"
              >● Lagos Same-Day Active</span
            >
            <span class="status-pill status-gold"
              >★ Tailor Tier (12% Earn Rate)</span
            >
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .theme-preview-container {
        padding: 24px;
        margin: 16px 0;
      }

      .preview-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--border);
        flex-wrap: wrap;
        gap: 12px;
      }

      .preview-tag {
        font-size: 0.7rem;
        letter-spacing: 0.12em;
        font-weight: 700;
        color: var(--text-muted);
      }

      .preview-title {
        margin: 4px 0 2px;
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--text);
      }

      .preview-subtitle {
        margin: 0;
        font-size: 0.825rem;
        color: var(--text-muted);
      }

      .preview-canvas {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 24px;
        align-items: start;
      }

      .sample-product-card {
        overflow: hidden;
        border-radius: var(--radius-md);
      }

      .sample-media {
        position: relative;
        height: 200px;
        background: var(--surface);
      }

      .sample-media img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .sample-badge {
        position: absolute;
        top: 10px;
        left: 10px;
        background: var(--inverse-bg);
        color: var(--inverse-text);
        font-size: 0.65rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        padding: 3px 8px;
        border-radius: var(--radius-xs);
      }

      .sample-details {
        padding: 16px;
      }

      .sample-brand {
        font-size: 0.7rem;
        color: var(--text-muted);
        font-weight: 600;
        letter-spacing: 0.08em;
      }

      .sample-title {
        margin: 4px 0 8px;
        font-size: 0.95rem;
        font-weight: 600;
        line-height: 1.3;
        color: var(--text);
      }

      .sample-price {
        margin-bottom: 12px;
        display: flex;
        align-items: baseline;
        gap: 8px;
      }

      .main-price {
        font-size: 1.15rem;
        font-weight: 700;
        color: var(--text);
      }

      .main-price small {
        font-size: 0.75rem;
        font-weight: 400;
        color: var(--text-muted);
      }

      .compare-price {
        font-size: 0.85rem;
        text-decoration: line-through;
        color: var(--text-subtle);
      }

      .sample-swatches {
        display: flex;
        gap: 6px;
        margin-bottom: 16px;
      }

      .swatch {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 1px solid var(--border);
      }

      .sample-actions {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .full-w {
        width: 100%;
      }

      .sample-form-elements {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .form-label {
        font-size: 0.825rem;
        font-weight: 600;
        color: var(--text);
      }

      .input-group {
        display: flex;
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        overflow: hidden;
        background: var(--bg);
      }

      .input-prefix {
        padding: 10px 14px;
        background: var(--surface);
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--text-muted);
        border-right: 1px solid var(--border);
      }

      .form-input {
        flex: 1;
        padding: 10px 14px;
        background: transparent;
        border: none;
        color: var(--text);
        font-family: inherit;
        font-size: 0.9rem;
        outline: none;
      }

      .token-chip-sample {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 16px;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-full);
        font-size: 0.85rem;
        color: var(--text);
      }

      .token-sparkle {
        color: var(--accent-gold);
      }

      .status-indicators {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .status-pill {
        font-size: 0.75rem;
        padding: 4px 10px;
        border-radius: var(--radius-full);
        font-weight: 500;
      }

      .status-success {
        background: rgba(5, 150, 105, 0.1);
        color: var(--status-success);
      }

      .status-gold {
        background: rgba(217, 119, 6, 0.1);
        color: var(--accent-gold);
      }
    `,
  ],
})
export class LiveThemePreviewComponent {
  readonly themeService = inject(ThemeService);
}
