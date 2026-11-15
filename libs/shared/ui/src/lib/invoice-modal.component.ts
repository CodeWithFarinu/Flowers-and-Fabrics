import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface InvoiceItem {
  title: string;
  unit: string;
  quantity: number;
  price: number;
  lineTotal: number;
  selectedColor?: string;
}

export interface InvoiceOrderData {
  orderNumber: string;
  date: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  paymentMethod: string;
  paymentStatus?: string;
  paymentReference?: string;
  items: InvoiceItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
}

@Component({
  selector: 'atelier-invoice-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="invoice-modal-backdrop" (click)="close.emit()">
      <div class="invoice-modal-dialog" (click)="$event.stopPropagation()">
        <!-- Top Toolbar (Hidden on print) -->
        <div class="invoice-toolbar no-print">
          <div class="toolbar-left">
            <span class="toolbar-title"
              >Official Wholesale Tax Invoice / Receipt</span
            >
            <span class="toolbar-ref">#INV-TF-{{ order.orderNumber }}</span>
          </div>
          <div class="toolbar-actions">
            <button type="button" class="btn-print" (click)="printInvoice()">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path
                  d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"
                ></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
              Print / Save PDF
            </button>
            <button
              type="button"
              class="btn-close"
              (click)="close.emit()"
              aria-label="Close invoice"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- Printable Standard Classy Invoice Document -->
        <div class="invoice-sheet" id="printable-invoice">
          <!-- Document Header -->
          <div class="inv-header">
            <div class="inv-brand-block">
              <div class="inv-logo-row">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 48 48"
                  fill="none"
                  class="inv-logo-svg"
                >
                  <circle
                    cx="24"
                    cy="24"
                    r="22"
                    stroke="#d97706"
                    stroke-width="1.5"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="19.5"
                    stroke="#111"
                    stroke-width="0.5"
                    stroke-dasharray="1.5 2"
                  />
                  <path
                    d="M10 13 H28 V15.5 H25.5 V14.5 H20.5 V35 H23 V36.5 H15 V35 H17.5 V14.5 H12.5 V15.5 H10 Z"
                    fill="#111"
                  />
                  <path
                    d="M22 17.5 C25 15.5 32 15 36 17 C35.5 19.5 34 20 33 19 C30.5 18 26.5 18.5 25 20.5 L24 23 H33.5 V25.5 H23 L20 37 H17 L21.5 20 C21.8 19 21.8 18.2 22 17.5 Z"
                    fill="#d97706"
                  />
                  <path
                    d="M21 27 C24 26 30 26 32 28 C30 29.5 25 29 20.5 28.5 Z"
                    fill="#d97706"
                  />
                  <circle cx="36" cy="13" r="1.8" fill="#d97706" />
                </svg>
                <div class="inv-brand-names">
                  <h1 class="brand-title">TEEPHA FLOWERS & FABRICS</h1>
                  <span class="brand-subtitle"
                    >WHOLESALE TEXTILES & LUXURY FLORALS</span
                  >
                </div>
              </div>
              <p class="company-address">
                Teepha Flowers & Fabrics Fashion Store Lagos<br />
                Shagari Estate, 16 B C St, Ipaja, Lagos 102213, Lagos,
                Nigeria<br />
                Phone: +234 812 000 8821 · Email: wholesale&#64;teepha.com<br />
                RC: 1849204 · TIN: 94028471-0001
              </p>
            </div>

            <div class="inv-meta-block">
              <div class="inv-type-badge">WHOLESALE INVOICE</div>
              <table class="meta-table">
                <tr>
                  <td class="lbl">Invoice No:</td>
                  <td class="val">
                    <strong>INV-TF-{{ order.orderNumber }}</strong>
                  </td>
                </tr>
                <tr>
                  <td class="lbl">Date Issued:</td>
                  <td class="val">{{ order.date }}</td>
                </tr>
                <tr>
                  <td class="lbl">Payment Status:</td>
                  <td class="val">
                    <span class="status-paid">PAID & CERTIFIED</span>
                  </td>
                </tr>
                <tr>
                  <td class="lbl">Payment Method:</td>
                  <td class="val">{{ order.paymentMethod | uppercase }}</td>
                </tr>
                @if (order.paymentReference) {
                  <tr>
                    <td class="lbl">Paystack Ref:</td>
                    <td class="val mono">{{ order.paymentReference }}</td>
                  </tr>
                }
              </table>
            </div>
          </div>

          <div class="inv-divider gold-divider"></div>

          <!-- Billing & Shipping Information -->
          <div class="inv-parties-grid">
            <div class="party-col">
              <span class="party-label">BILLED & DELIVERED TO:</span>
              <strong class="party-name">{{ order.customerName }}</strong>
              <p class="party-line">{{ order.customerPhone }}</p>
              @if (order.customerEmail) {
                <p class="party-line">{{ order.customerEmail }}</p>
              }
              <p class="party-line address-line">{{ order.deliveryAddress }}</p>
            </div>

            <div class="party-col party-fulfillment">
              <span class="party-label">DISPATCH HUB / FULFILLMENT:</span>
              <strong class="party-name"
                >Ipaja Central Distribution Depot</strong
              >
              <p class="party-line">Lagos State Express Courier Dispatch</p>
              <p class="party-line">
                Verified Authentic Drape & Quality Guarantee
              </p>
            </div>
          </div>

          <!-- Itemized Items Table -->
          <table class="inv-table">
            <thead>
              <tr>
                <th style="width: 5%">#</th>
                <th style="width: 50%">
                  Curated Product / Material Description
                </th>
                <th style="width: 15%" class="text-center">Cut / Yardage</th>
                <th style="width: 15%" class="text-right">Unit Rate (₦)</th>
                <th style="width: 15%" class="text-right">Line Total (₦)</th>
              </tr>
            </thead>
            <tbody>
              @for (item of order.items; track item.title; let idx = $index) {
                <tr>
                  <td class="text-muted">{{ idx + 1 }}</td>
                  <td>
                    <strong class="item-desc-title">{{ item.title }}</strong>
                    @if (item.selectedColor) {
                      <span class="item-desc-sub"
                        >Variant / Color: {{ item.selectedColor }}</span
                      >
                    }
                  </td>
                  <td class="text-center">
                    {{ item.quantity }}
                    {{ item.unit === 'yard' ? 'Yards' : 'Pieces' }}
                  </td>
                  <td class="text-right">₦{{ item.price.toLocaleString() }}</td>
                  <td class="text-right">
                    <strong>₦{{ item.lineTotal.toLocaleString() }}</strong>
                  </td>
                </tr>
              }
            </tbody>
          </table>

          <!-- Financial Calculation Breakdown -->
          <div class="inv-bottom-section">
            <div class="inv-notes-block">
              <span class="notes-heading"
                >WHOLESALE TERMS & AUTHENTICITY CERTIFICATION:</span
              >
              <p class="notes-text">
                All textiles are certified high-grade mill runs (St. Gallen
                Swiss Voile, Italian Super 160s, & Authentic Oyo Aso-Oke). Fresh
                bridal blooms are harvested same-day for maximum longevity.
                Returns are accommodated within 48 hours for uncut bales in
                original security seal.
              </p>
              <div class="signature-stamp-row">
                <div class="auth-stamp">
                  <span class="stamp-icon">⚜</span>
                  <span class="stamp-text"
                    >CERTIFIED GENUINE TEEPHA ARCHIVE</span
                  >
                </div>
                <div class="signature-line">
                  <span class="sig-name">B. Farinu</span>
                  <span class="sig-title">Authorized Showroom Registrar</span>
                </div>
              </div>
            </div>

            <div class="inv-totals-block">
              <div class="total-row">
                <span>Subtotal</span>
                <span>₦{{ order.subtotal.toLocaleString() }}</span>
              </div>
              <div class="total-row">
                <span>Lagos / Priority Dispatch</span>
                <span>{{
                  order.deliveryFee === 0
                    ? 'COMPLIMENTARY'
                    : '₦' + order.deliveryFee.toLocaleString()
                }}</span>
              </div>
              @if (order.discount > 0) {
                <div class="total-row discount-row">
                  <span>Loyalty / Member Discount</span>
                  <span>-₦{{ order.discount.toLocaleString() }}</span>
                </div>
              }
              <div class="total-divider"></div>
              <div class="total-row grand-total">
                <span>TOTAL AMOUNT PAID</span>
                <span class="grand-price"
                  >₦{{ order.total.toLocaleString() }}</span
                >
              </div>
            </div>
          </div>

          <!-- Footer Blessing / Class Statement -->
          <div class="inv-footer-statement">
            <p>
              "Get a worth for ur class" · Thank you for choosing Teepha Flowers
              & Fabrics, Lagos.
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .invoice-modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.75);
        backdrop-filter: blur(8px);
        z-index: 2000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        overflow-y: auto;
      }

      .invoice-modal-dialog {
        background: #ffffff;
        color: #111827;
        border-radius: 12px;
        width: 100%;
        max-width: 820px;
        box-shadow: 0 25px 60px rgba(0, 0, 0, 0.45);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        max-height: 94vh;
      }

      .invoice-toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #111827;
        color: #ffffff;
        padding: 12px 24px;
        border-bottom: 1px solid rgba(217, 119, 6, 0.4);
      }

      .toolbar-left {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .toolbar-title {
        font-size: 0.85rem;
        font-weight: 700;
        letter-spacing: 0.04em;
      }

      .toolbar-ref {
        font-size: 0.75rem;
        color: #d97706;
        font-weight: 800;
      }

      .toolbar-actions {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .btn-print {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: linear-gradient(135deg, #d97706, #b45309);
        color: #ffffff;
        border: none;
        padding: 7px 16px;
        border-radius: 9999px;
        font-size: 0.8rem;
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(217, 119, 6, 0.4);
        transition: transform 0.15s ease;
      }

      .btn-print:hover {
        transform: translateY(-1px);
      }

      .btn-close {
        background: transparent;
        border: none;
        color: #9ca3af;
        font-size: 1.1rem;
        cursor: pointer;
        padding: 4px;
        line-height: 1;
      }

      .btn-close:hover {
        color: #ffffff;
      }

      .invoice-sheet {
        padding: 36px 40px;
        background: #ffffff;
        color: #111827;
        overflow-y: auto;
        font-family:
          'Inter',
          -apple-system,
          BlinkMacSystemFont,
          'Segoe UI',
          Roboto,
          sans-serif;
      }

      .inv-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 24px;
      }

      .inv-logo-row {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
      }

      .brand-title {
        font-family: 'Playfair Display', serif;
        font-size: 1.25rem;
        font-weight: 900;
        letter-spacing: 0.08em;
        margin: 0;
        color: #111827;
      }

      .brand-subtitle {
        font-size: 0.65rem;
        font-weight: 700;
        letter-spacing: 0.16em;
        color: #d97706;
        display: block;
        margin-top: 2px;
      }

      .company-address {
        font-size: 0.75rem;
        line-height: 1.5;
        color: #4b5563;
        margin: 0;
      }

      .inv-meta-block {
        text-align: right;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
      }

      .inv-type-badge {
        display: inline-block;
        background: #111827;
        color: #ffffff;
        padding: 5px 12px;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 800;
        letter-spacing: 0.1em;
        margin-bottom: 10px;
      }

      .meta-table {
        font-size: 0.775rem;
        border-collapse: collapse;
      }

      .meta-table td {
        padding: 2px 4px;
      }

      .meta-table .lbl {
        color: #6b7280;
        text-align: right;
      }

      .meta-table .val {
        text-align: right;
        color: #111827;
      }

      .meta-table .mono {
        font-family: monospace;
        font-size: 0.725rem;
      }

      .status-paid {
        display: inline-block;
        background: #ecfdf5;
        color: #065f46;
        font-weight: 800;
        padding: 1px 6px;
        border-radius: 3px;
        font-size: 0.65rem;
        letter-spacing: 0.04em;
      }

      .inv-divider {
        height: 1px;
        background: #e5e7eb;
        margin: 20px 0;
      }

      .gold-divider {
        height: 2px;
        background: linear-gradient(to right, #d97706, #fcd34d, transparent);
      }

      .inv-parties-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
        margin-bottom: 24px;
      }

      .party-col {
        display: flex;
        flex-direction: column;
        gap: 3px;
      }

      .party-label {
        font-size: 0.65rem;
        font-weight: 800;
        letter-spacing: 0.12em;
        color: #9ca3af;
        margin-bottom: 2px;
      }

      .party-name {
        font-size: 0.95rem;
        color: #111827;
      }

      .party-line {
        font-size: 0.8rem;
        color: #4b5563;
        margin: 0;
      }

      .address-line {
        margin-top: 4px;
        font-weight: 500;
      }

      /* Table */
      .inv-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 24px;
        font-size: 0.825rem;
      }

      .inv-table thead tr {
        background: #f9fafb;
        border-top: 1px solid #e5e7eb;
        border-bottom: 2px solid #d97706;
      }

      .inv-table th {
        padding: 10px 8px;
        font-size: 0.7rem;
        font-weight: 800;
        letter-spacing: 0.06em;
        color: #374151;
        text-transform: uppercase;
        text-align: left;
      }

      .inv-table td {
        padding: 12px 8px;
        border-bottom: 1px solid #f3f4f6;
        color: #1f2937;
      }

      .text-center {
        text-align: center;
      }
      .text-right {
        text-align: right;
      }
      .text-muted {
        color: #9ca3af;
      }

      .item-desc-title {
        display: block;
        font-size: 0.85rem;
        color: #111827;
      }

      .item-desc-sub {
        display: block;
        font-size: 0.725rem;
        color: #6b7280;
        margin-top: 2px;
      }

      /* Bottom Section */
      .inv-bottom-section {
        display: grid;
        grid-template-columns: 1.3fr 1fr;
        gap: 32px;
        margin-bottom: 24px;
      }

      .notes-heading {
        font-size: 0.65rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        color: #4b5563;
        display: block;
        margin-bottom: 4px;
      }

      .notes-text {
        font-size: 0.725rem;
        line-height: 1.5;
        color: #6b7280;
        margin: 0 0 16px;
      }

      .signature-stamp-row {
        display: flex;
        align-items: center;
        gap: 20px;
      }

      .auth-stamp {
        border: 1.5px dashed #d97706;
        padding: 6px 12px;
        border-radius: 6px;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: #d97706;
        font-size: 0.65rem;
        font-weight: 800;
        letter-spacing: 0.08em;
      }

      .signature-line {
        display: flex;
        flex-direction: column;
        border-top: 1px solid #9ca3af;
        padding-top: 4px;
        width: 140px;
      }

      .sig-name {
        font-family: 'Playfair Display', serif;
        font-size: 0.85rem;
        font-weight: 700;
        color: #111827;
      }

      .sig-title {
        font-size: 0.6rem;
        color: #6b7280;
      }

      .inv-totals-block {
        background: #f9fafb;
        padding: 16px;
        border-radius: 8px;
        border: 1px solid #e5e7eb;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .total-row {
        display: flex;
        justify-content: space-between;
        font-size: 0.8rem;
        color: #4b5563;
      }

      .discount-row {
        color: #059669;
        font-weight: 600;
      }

      .total-divider {
        height: 1px;
        background: #e5e7eb;
        margin: 4px 0;
      }

      .grand-total {
        font-size: 0.95rem;
        font-weight: 800;
        color: #111827;
      }

      .grand-price {
        color: #d97706;
        font-size: 1.15rem;
        font-weight: 900;
      }

      .inv-footer-statement {
        text-align: center;
        border-top: 1px solid #e5e7eb;
        padding-top: 16px;
        font-size: 0.725rem;
        color: #6b7280;
        font-style: italic;
      }

      /* Print Isolation */
      @media print {
        body * {
          visibility: hidden !important;
        }
        .no-print {
          display: none !important;
        }
        .invoice-modal-backdrop {
          position: static !important;
          background: transparent !important;
          padding: 0 !important;
          overflow: visible !important;
        }
        .invoice-modal-dialog {
          box-shadow: none !important;
          max-width: 100% !important;
          border-radius: 0 !important;
          overflow: visible !important;
        }
        #printable-invoice,
        #printable-invoice * {
          visibility: visible !important;
        }
        #printable-invoice {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          padding: 10mm 15mm !important;
        }
      }
    `,
  ],
})
export class InvoiceModalComponent {
  @Input({ required: true }) order!: InvoiceOrderData;
  @Output() close = new EventEmitter<void>();

  printInvoice(): void {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }
}
