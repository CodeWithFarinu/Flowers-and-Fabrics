import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'atelier-yardage-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="yardage-selector-container">
      <div class="selector-header">
        <label class="label-title">Select Yardage</label>
        <span class="step-hint">0.5 yard precision increments</span>
      </div>

      <div class="stepper-row">
        <button
          type="button"
          class="step-btn"
          [disabled]="quantity <= minQuantity"
          (click)="decrement()"
          aria-label="Decrease yards"
        >
          −
        </button>

        <div class="quantity-readout price-display">
          <span class="qty-num">{{ quantity }}</span>
          <span class="qty-unit">YARDS</span>
        </div>

        <button
          type="button"
          class="step-btn"
          (click)="increment()"
          aria-label="Increase yards"
        >
          +
        </button>
      </div>

      <div class="presets-row">
        <button
          type="button"
          class="preset-chip"
          [class.active]="quantity === 4"
          (click)="setPreset(4)"
        >
          4 yds (Senator / Kaftan)
        </button>
        <button
          type="button"
          class="preset-chip"
          [class.active]="quantity === 5"
          (click)="setPreset(5)"
        >
          5 yds (Lace / Wrapper)
        </button>
        <button
          type="button"
          class="preset-chip"
          [class.active]="quantity === 6"
          (click)="setPreset(6)"
        >
          6 yds (Grand Agbada)
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .yardage-selector-container {
        margin: 16px 0;
      }

      .selector-header {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-bottom: 8px;
      }

      .label-title {
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--text);
      }

      .step-hint {
        font-size: 0.725rem;
        color: var(--text-muted);
      }

      .stepper-row {
        display: flex;
        align-items: center;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        overflow: hidden;
        max-width: 260px;
      }

      .step-btn {
        width: 48px;
        height: 44px;
        background: transparent;
        border: none;
        font-size: 1.25rem;
        font-weight: 500;
        color: var(--text);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.15s ease;
      }

      .step-btn:hover:not(:disabled) {
        background: var(--surface-hover);
      }

      .step-btn:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }

      .quantity-readout {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border-left: 1px solid var(--border);
        border-right: 1px solid var(--border);
        padding: 4px 12px;
      }

      .qty-num {
        font-size: 1.15rem;
        font-weight: 700;
        color: var(--text);
        line-height: 1.1;
      }

      .qty-unit {
        font-size: 0.65rem;
        letter-spacing: 0.1em;
        color: var(--text-muted);
        font-weight: 600;
      }

      .presets-row {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 10px;
      }

      .preset-chip {
        background: var(--surface);
        color: var(--text-muted);
        border: 1px solid var(--border);
        border-radius: var(--radius-full);
        font-size: 0.725rem;
        padding: 5px 12px;
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .preset-chip:hover {
        border-color: var(--text);
        color: var(--text);
      }

      .preset-chip.active {
        background: var(--inverse-bg);
        color: var(--inverse-text);
        border-color: var(--inverse-bg);
      }
    `,
  ],
})
export class YardageSelectorComponent {
  @Input() quantity: number = 4;
  @Input() minQuantity: number = 2;
  @Input() step: number = 0.5;

  @Output() quantityChange = new EventEmitter<number>();

  increment(): void {
    this.quantity = parseFloat((this.quantity + this.step).toFixed(1));
    this.quantityChange.emit(this.quantity);
  }

  decrement(): void {
    if (this.quantity - this.step >= this.minQuantity) {
      this.quantity = parseFloat((this.quantity - this.step).toFixed(1));
      this.quantityChange.emit(this.quantity);
    }
  }

  setPreset(qty: number): void {
    this.quantity = qty;
    this.quantityChange.emit(this.quantity);
  }
}
