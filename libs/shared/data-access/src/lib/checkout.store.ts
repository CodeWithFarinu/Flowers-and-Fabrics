import { Injectable, signal, computed, inject } from '@angular/core';
import {
  CartItem,
  DeliverySpeed,
  PaymentMethodType,
  DynamicVirtualAccount,
  Order,
  OrderStatus,
} from '@shared/models';
import { AnalyticsService } from '@shared/analytics';
import { CartStore } from './cart.store';

export interface CheckoutCustomerForm {
  phone: string;
  name: string;
  email: string;
  state: string;
  lga: string;
  address: string;
  landmark: string;
  isPickup: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class CheckoutStore {
  private analytics = inject(AnalyticsService);
  private cartStore = inject(CartStore);

  readonly currentStep = signal<1 | 2 | 3>(1);
  readonly isSubmitting = signal<boolean>(false);
  readonly placedOrder = signal<Order | null>(null);

  // Form State (Step 1)
  readonly customerForm = signal<CheckoutCustomerForm>({
    phone: '',
    name: '',
    email: '',
    state: 'Lagos',
    lga: 'Ikeja',
    address: '',
    landmark: '',
    isPickup: false,
  });

  // Step 2 selections
  readonly deliverySpeed = signal<DeliverySpeed>('lagos_same_day');
  readonly paymentMethod = signal<PaymentMethodType>('bank_transfer');
  readonly promoCode = signal<string>('');
  readonly discountAmount = signal<number>(0);

  // Dynamic Virtual Bank Account for Instant Transfer
  readonly virtualAccount = signal<DynamicVirtualAccount>({
    bankName: 'Wema Bank (Teepha Checkout)',
    accountNumber: '992' + Math.floor(1000000 + Math.random() * 9000000),
    accountName: 'TEEPHA FLOWERS AND FABRICS / VA',
    expiresInMinutes: 30,
    reference: 'TP-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
  });

  // Financial Computations
  readonly deliveryFee = computed(() => {
    if (this.customerForm().isPickup) return 0;
    if (this.cartStore.hasFreeDelivery()) return 0;

    switch (this.deliverySpeed()) {
      case 'lagos_same_day':
        return 3500;
      case 'standard_nigeria':
        return 5000;
      default:
        return 0;
    }
  });

  readonly total = computed(() => {
    const sub = this.cartStore.subtotal();
    const fee = this.deliveryFee();
    const disc = this.discountAmount();
    return Math.max(0, sub + fee - disc);
  });

  updateForm(patch: Partial<CheckoutCustomerForm>): void {
    this.customerForm.update((cur) => ({ ...cur, ...patch }));
  }

  // Mandatory lead capture on blur of phone or continue
  captureLeadOnBlur(): void {
    const form = this.customerForm();
    if (form.phone && form.phone.trim().length >= 10) {
      this.analytics.trackLeadCaptured(
        form.phone.trim(),
        form.email,
        form.name,
      );
    }
  }

  goToStep(step: 1 | 2 | 3): void {
    this.currentStep.set(step);
    this.analytics.trackCheckoutStepViewed(step);
  }

  applyPromo(code: string): boolean {
    const clean = code.trim().toUpperCase();
    if (
      clean === 'TEEPHA10' ||
      clean === 'TEEPHAVIP' ||
      clean === 'ATELIER10' ||
      clean === 'LAGOSVIP'
    ) {
      const discount = Math.round(
        this.cartStore.subtotal() * (clean.includes('VIP') ? 0.15 : 0.1),
      );
      this.discountAmount.set(discount);
      this.promoCode.set(clean);
      return true;
    }
    return false;
  }

  submitOrder(customReference?: string): Promise<Order> {
    this.analytics.track('payment_initiated', {
      method: this.paymentMethod(),
      amount_ngn: this.total(),
    });

    return new Promise((resolve) => {
      setTimeout(() => {
        const form = this.customerForm();
        const orderNumber = 'TP-' + Math.floor(100000 + Math.random() * 900000);
        const orderId = 'ord-' + Date.now();
        const ref = customReference || 'PAY-' + Date.now();

        const newOrder: Order = {
          id: orderId,
          orderNumber,
          createdAt: new Date().toISOString(),
          status: 'confirmed',
          items: [...this.cartStore.items()],
          subtotal: this.cartStore.subtotal(),
          deliveryFee: this.deliveryFee(),
          discount: this.discountAmount(),
          total: this.total(),
          customerDetails: {
            phone: form.phone,
            name: form.name || 'Valued Customer',
            email: form.email,
          },
          deliveryDetails: {
            address: form.isPickup
              ? 'Pickup at Teepha Store: Shagari Estate, 16 B C St, Ipaja, Lagos'
              : form.address,
            state: form.state,
            lga: form.lga,
            landmark: form.landmark,
            speed: this.deliverySpeed(),
          },
          paymentMethod: this.paymentMethod(),
          paymentStatus: 'paid',
          trackingTimeline: [
            {
              status: 'confirmed',
              title: 'Order Confirmed & Payment Verified',
              description: `Payment was successfully verified via Paystack (ref: ${ref}). Order materials assigned to bespoke cutting desk.`,
              timestamp: new Date().toLocaleTimeString('en-NG', {
                hour: '2-digit',
                minute: '2-digit',
              }),
              location: 'Ipaja Showroom & Fulfilment Centre',
            },
          ],
          whatsappTrackingUrl: `https://wa.me/2348120008821?text=${encodeURIComponent(
            `Hi Teepha Flowers & Fabrics Concierge, I would like to track my order #${orderNumber} (Paystack Ref: ${ref})`,
          )}`,
        };

        this.placedOrder.set(newOrder);
        this.cartStore.clearCart();
        this.isSubmitting.set(false);

        this.analytics.trackOrderCompleted(
          newOrder.id,
          newOrder.total,
          newOrder.paymentMethod,
        );
        resolve(newOrder);
      }, 700);
    });
  }
}
