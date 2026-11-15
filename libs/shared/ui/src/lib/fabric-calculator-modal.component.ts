import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'atelier-fabric-calculator-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-backdrop" (click)="close.emit()">
      <div class="modal-card atelier-card" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div>
            <span class="modal-eyebrow">TAILOR'S PRECISION GUIDE</span>
            <h3 class="modal-title">Garment Yardage Calculator</h3>
          </div>
          <button
            type="button"
            class="close-btn"
            (click)="close.emit()"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div class="calculator-body">
          <label class="section-label"
            >1. Choose Traditional or Contemporary Silhouette</label
          >
          <div class="silhouette-grid">
            @for (g of garments; track g.id) {
              <button
                type="button"
                class="silhouette-btn"
                [class.active]="selectedGarment().id === g.id"
                (click)="selectedGarment.set(g)"
              >
                <span class="garment-name">{{ g.name }}</span>
                <span class="base-yards">{{ g.baseYards }} yds base</span>
              </button>
            }
          </div>

          <label class="section-label">2. Select Wearer's Height & Build</label>
          <div class="build-row">
            @for (b of builds; track b.id) {
              <button
                type="button"
                class="build-btn"
                [class.active]="selectedBuild().id === b.id"
                (click)="selectedBuild.set(b)"
              >
                {{ b.label }}
              </button>
            }
          </div>

          <div class="recommendation-card">
            <div class="rec-left">
              <span class="rec-label">RECOMMENDED YARDAGE</span>
              <div class="rec-yards price-display">
                <span class="rec-number">{{ calculatedYards() }}</span>
                <span class="rec-unit">YARDS</span>
              </div>
            </div>
            <div class="rec-right">
              <p class="rec-text">
                Allows sufficient margin for matching patterns, cuff details,
                and bespoke seam allowances.
              </p>
            </div>
          </div>

          <button
            type="button"
            class="btn-primary full-w-btn"
            (click)="applyAndClose()"
          >
            Apply {{ calculatedYards() }} Yards to Order
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(8px);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
      }

      .modal-card {
        width: 100%;
        max-width: 520px;
        padding: 24px;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        max-height: 90vh;
        overflow-y: auto;
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 20px;
        border-bottom: 1px solid var(--border);
        padding-bottom: 14px;
      }

      .modal-eyebrow {
        font-size: 0.65rem;
        font-weight: 700;
        letter-spacing: 0.12em;
        color: var(--text-muted);
      }

      .modal-title {
        margin: 4px 0 0;
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--text);
      }

      .close-btn {
        background: transparent;
        border: none;
        color: var(--text-muted);
        font-size: 1.25rem;
        cursor: pointer;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .close-btn:hover {
        background: var(--surface);
        color: var(--text);
      }

      .section-label {
        display: block;
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--text);
        margin: 16px 0 8px;
      }

      .silhouette-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
        gap: 8px;
      }

      .silhouette-btn {
        padding: 10px;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        text-align: left;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        gap: 4px;
        transition: all 0.15s ease;
      }

      .silhouette-btn:hover {
        border-color: var(--text);
      }

      .silhouette-btn.active {
        background: var(--inverse-bg);
        border-color: var(--inverse-bg);
      }

      .silhouette-btn.active .garment-name {
        color: var(--inverse-text);
      }

      .silhouette-btn.active .base-yards {
        color: var(--inverse-text);
        opacity: 0.8;
      }

      .garment-name {
        font-size: 0.825rem;
        font-weight: 600;
        color: var(--text);
      }

      .base-yards {
        font-size: 0.7rem;
        color: var(--text-muted);
      }

      .build-row {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }

      .build-btn {
        flex: 1;
        min-width: 90px;
        padding: 8px 10px;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        font-size: 0.75rem;
        font-weight: 500;
        color: var(--text);
        cursor: pointer;
        text-align: center;
        transition: all 0.15s ease;
      }

      .build-btn.active {
        background: var(--inverse-bg);
        color: var(--inverse-text);
        border-color: var(--inverse-bg);
      }

      .recommendation-card {
        margin: 20px 0;
        padding: 16px;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .rec-label {
        font-size: 0.65rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        color: var(--text-muted);
      }

      .rec-yards {
        display: flex;
        align-items: baseline;
        gap: 4px;
      }

      .rec-number {
        font-size: 2rem;
        font-weight: 800;
        color: var(--text);
        line-height: 1;
      }

      .rec-unit {
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--text-muted);
      }

      .rec-text {
        margin: 0;
        font-size: 0.78rem;
        color: var(--text-muted);
        line-height: 1.4;
      }

      .full-w-btn {
        width: 100%;
        padding: 12px;
        font-size: 0.95rem;
      }
    `,
  ],
})
export class FabricCalculatorModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() applyYardage = new EventEmitter<number>();

  garments = [
    { id: 'senator', name: 'Senator Suit', baseYards: 4 },
    { id: 'agbada', name: '4-Piece Agbada', baseYards: 6 },
    { id: 'kaftan', name: 'Kaftan & Sokoto', baseYards: 3.5 },
    { id: 'iro_buba', name: 'Iro & Buba (Lace)', baseYards: 5 },
    { id: 'suit', name: 'Bespoke 2-Piece Suit', baseYards: 3.5 },
  ];

  builds = [
    { id: 'slim', label: 'Slim (Below 5\'9")', delta: 0 },
    { id: 'regular', label: 'Regular (5\'9" - 6\'0")', delta: 0 },
    { id: 'tall_athletic', label: 'Tall / Broad (> 6\'0")', delta: 0.5 },
    { id: 'grand', label: 'Grand / Regal', delta: 1.0 },
  ];

  selectedGarment = signal(this.garments[0]);
  selectedBuild = signal(this.builds[1]);

  calculatedYards(): number {
    return parseFloat(
      (this.selectedGarment().baseYards + this.selectedBuild().delta).toFixed(
        1,
      ),
    );
  }

  applyAndClose(): void {
    this.applyYardage.emit(this.calculatedYards());
    this.close.emit();
  }
}
