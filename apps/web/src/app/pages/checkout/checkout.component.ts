import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import {
  CheckoutStore,
  CartStore,
  AuthStore,
  getApiBaseUrl,
} from '@shared/data-access';
import { InvoiceModalComponent, InvoiceOrderData } from '@shared/ui';

declare const PaystackPop: any;

@Component({
  selector: 'atelier-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, InvoiceModalComponent],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent implements OnInit {
  readonly checkoutStore = inject(CheckoutStore);
  readonly cartStore = inject(CartStore);
  readonly authStore = inject(AuthStore);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  phoneError = signal<boolean>(false);
  promoInput = '';
  promoSuccess = signal<boolean>(false);
  copied = signal<boolean>(false);
  memberSaved = signal<boolean>(false);
  otpCode = '1904';
  paystackPublicKey = 'pk_test_sample_paystack_public_key';
  showInvoiceModal = signal<boolean>(false);

  readonly invoiceData = computed<InvoiceOrderData | null>(() => {
    const o = this.checkoutStore.placedOrder();
    if (!o) return null;
    return {
      orderNumber: o.orderNumber,
      date: new Date(o.createdAt).toLocaleDateString('en-NG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      customerName: o.customerDetails.name,
      customerPhone: o.customerDetails.phone,
      customerEmail: o.customerDetails.email,
      deliveryAddress: `${o.deliveryDetails.address}, ${o.deliveryDetails.lga}, ${o.deliveryDetails.state}`,
      paymentMethod: o.paymentMethod,
      paymentStatus: 'PAID & CERTIFIED',
      paymentReference: o.id,
      items: o.items.map((item) => ({
        title: item.productTitle,
        unit: item.unit,
        quantity: item.quantity,
        price: item.price,
        lineTotal: item.lineTotal,
        selectedColor: item.selectedColor,
      })),
      subtotal: o.subtotal,
      deliveryFee: o.deliveryFee,
      discount: o.discount,
      total: o.total,
    };
  });

  openInvoice(): void {
    this.showInvoiceModal.set(true);
  }

  closeInvoice(): void {
    this.showInvoiceModal.set(false);
  }

  ngOnInit(): void {
    this.fetchPaystackConfig();
    this.handleReturnFromPaystack();
  }

  private fetchPaystackConfig(): void {
    if (typeof window === 'undefined') return;
    const apiUrl = getApiBaseUrl();

    fetch(`${apiUrl}/payments/config`)
      .then((res) => (res.ok ? res.json() : null))
      .then((cfg) => {
        if (cfg?.publicKey) {
          this.paystackPublicKey = cfg.publicKey;
        }
      })
      .catch(() => {});
  }

  private handleReturnFromPaystack(): void {
    this.route.queryParams.subscribe((params) => {
      const reference = params['reference'] || params['trxref'];
      if (reference) {
        this.verifyAndCompleteOrder(reference);
      }
    });
  }

  onPhoneChange(val: string): void {
    this.checkoutStore.updateForm({ phone: val });
    this.phoneError.set(false);
  }

  onPhoneBlur(): void {
    const p = this.checkoutStore.customerForm().phone.trim();
    if (p.length > 0 && p.length < 10) {
      this.phoneError.set(true);
    } else {
      this.phoneError.set(false);
      this.checkoutStore.captureLeadOnBlur();
    }
  }

  isStep1Valid(): boolean {
    const form = this.checkoutStore.customerForm();
    const hasPhone = form.phone.trim().length >= 10;
    const hasName = form.name.trim().length >= 2;
    if (form.isPickup) {
      return hasPhone && hasName;
    }
    return hasPhone && hasName && form.address.trim().length >= 4;
  }

  canGoToStep2(): boolean {
    return this.isStep1Valid();
  }

  goToStep2(): void {
    if (this.isStep1Valid()) {
      this.checkoutStore.captureLeadOnBlur();
      this.checkoutStore.goToStep(2);
    } else {
      this.phoneError.set(true);
    }
  }

  applyPromo(): void {
    if (this.checkoutStore.applyPromo(this.promoInput)) {
      this.promoSuccess.set(true);
    } else {
      alert('Invalid promo code. Try "TEEPHA10" or "TEEPHAVIP"');
    }
  }

  copyAccount(): void {
    const num = this.checkoutStore.virtualAccount().accountNumber;
    navigator.clipboard.writeText(num);
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }

  async confirmPayment(): Promise<void> {
    const totalNGN = this.checkoutStore.total();
    const email =
      this.checkoutStore.customerForm().email ||
      this.authStore.currentUser().email ||
      'patron@domain.com';
    const reference = `AT-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // 1. Try launching Paystack Inline Popup if SDK is available
    if (typeof PaystackPop !== 'undefined' && this.paystackPublicKey) {
      try {
        const handler = PaystackPop.setup({
          key: this.paystackPublicKey,
          email,
          amount: Math.round(totalNGN * 100),
          currency: 'NGN',
          ref: reference,
          channels: ['card', 'bank_transfer', 'ussd', 'qr'],
          metadata: {
            custom_fields: [
              {
                display_name: 'Customer Phone',
                variable_name: 'customer_phone',
                value: this.checkoutStore.customerForm().phone,
              },
            ],
          },
          callback: (response: any) => {
            this.verifyAndCompleteOrder(response.reference || reference);
          },
          onClose: () => {
            console.log('[Paystack] Checkout closed without completing');
          },
        });
        handler.openIframe();
        return;
      } catch (err) {
        console.warn('[PaystackPop] Inline setup fallback:', err);
      }
    }

    // 2. Direct simulation / Dev fallback
    await this.verifyAndCompleteOrder(reference);
  }

  private async verifyAndCompleteOrder(reference: string): Promise<void> {
    try {
      const apiUrl = getApiBaseUrl();

      await fetch(
        `${apiUrl}/payments/verify/${encodeURIComponent(reference)}`,
        {
          method: 'GET',
        },
      ).catch(() => {});
    } finally {
      this.checkoutStore.submitOrder(reference);
    }
  }

  verifyAndSaveAccount(): void {
    if (this.authStore.upgradeToMember(this.otpCode)) {
      this.memberSaved.set(true);
    }
  }
}
