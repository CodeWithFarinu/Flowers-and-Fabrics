import {
  Injectable,
  signal,
  computed,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CartItem, Product } from '@shared/models';
import { AnalyticsService } from '@shared/analytics';
import { getApiBaseUrl } from './api-config';

@Injectable({
  providedIn: 'root',
})
export class CartStore {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private analytics = inject(AnalyticsService);

  readonly items = signal<CartItem[]>(this.loadInitialCart());
  readonly isOpen = signal<boolean>(false);
  readonly appliedCoupon = signal<{
    code: string;
    discountPercent: number;
  } | null>(null);

  readonly itemCount = computed(() =>
    this.items().reduce(
      (acc, item) => acc + (item.unit === 'yard' ? 1 : item.quantity),
      0,
    ),
  );

  readonly subtotal = computed(() =>
    this.items().reduce((acc, item) => acc + item.lineTotal, 0),
  );

  readonly discountAmount = computed(() => {
    const coupon = this.appliedCoupon();
    if (!coupon) return 0;
    return Math.round((this.subtotal() * coupon.discountPercent) / 100);
  });

  readonly totalAfterDiscount = computed(() => {
    return Math.max(0, this.subtotal() - this.discountAmount());
  });

  readonly freeDeliveryThreshold = 75000;
  readonly distanceToFreeDelivery = computed(() => {
    const diff = this.freeDeliveryThreshold - this.totalAfterDiscount();
    return diff > 0 ? diff : 0;
  });

  readonly hasFreeDelivery = computed(
    () => this.totalAfterDiscount() >= this.freeDeliveryThreshold,
  );

  constructor() {
    this.syncCartWithBackend();
  }

  private getApiUrl(): string {
    return getApiBaseUrl();
  }

  private getAuthHeader(): Record<string, string> {
    if (!this.isBrowser) return { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('atelier_token');
    return token
      ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      : { 'Content-Type': 'application/json' };
  }

  async syncCartWithBackend(): Promise<void> {
    if (!this.isBrowser) return;
    const token = localStorage.getItem('atelier_token');
    if (!token) return;

    try {
      const res = await fetch(`${this.getApiUrl()}/cart`, {
        headers: this.getAuthHeader(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.items) && data.items.length > 0) {
          const mapped: CartItem[] = data.items.map((it: any) => ({
            id: it.id,
            productId: it.productId,
            productTitle: it.product?.name || 'Exclusive Teepha Item',
            productSlug: it.product?.slug || '',
            price: Number(it.unitPrice || it.product?.price || 0),
            quantity: it.quantity,
            unit:
              it.product?.productType === 'ACCESSORY'
                ? 'piece'
                : it.product?.productType === 'SNEAKER'
                  ? 'pair'
                  : 'yard',
            selectedColor: it.color || 'Default',
            selectedSize: it.size,
            image:
              it.product?.images?.[0]?.url ||
              'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=400&q=80',
            lineTotal: Math.round(
              it.quantity * Number(it.unitPrice || it.product?.price || 0),
            ),
          }));
          this.items.set(mapped);
          this.saveCart(mapped);
        }
      }
    } catch {
      // Graceful offline fallback
    }
  }

  private loadInitialCart(): CartItem[] {
    if (!this.isBrowser) return [];
    try {
      const stored = localStorage.getItem('atelier_cart');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return [];
  }

  private saveCart(items: CartItem[]): void {
    if (this.isBrowser) {
      try {
        localStorage.setItem('atelier_cart', JSON.stringify(items));
      } catch {
        // ignore
      }
    }
  }

  toggle(open?: boolean): void {
    this.isOpen.update((cur) => (open !== undefined ? open : !cur));
  }

  addItem(
    product: Product,
    quantity: number = product.unit === 'yard' ? product.minOrderQty || 4 : 1,
    selectedColor?: string,
    selectedSize?: string,
  ): void {
    const existingIndex = this.items().findIndex(
      (item) =>
        item.productId === product.id &&
        item.selectedColor === selectedColor &&
        item.selectedSize === selectedSize,
    );

    let updated: CartItem[];

    if (existingIndex > -1) {
      updated = [...this.items()];
      const item = updated[existingIndex];
      const newQty = item.quantity + quantity;
      updated[existingIndex] = {
        ...item,
        quantity: newQty,
        lineTotal: Math.round(newQty * product.price),
      };
    } else {
      const lineTotal = Math.round(quantity * product.price);
      const newItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        productId: product.id,
        productTitle: product.title,
        productSlug: product.slug,
        price: product.price,
        quantity,
        unit: product.unit,
        selectedColor: selectedColor || (product.colors[0]?.name ?? 'Default'),
        selectedSize:
          selectedSize || (product.sizes ? product.sizes[0] : undefined),
        image: product.featuredImage,
        lineTotal,
      };
      updated = [newItem, ...this.items()];
    }

    this.items.set(updated);
    this.saveCart(updated);
    this.isOpen.set(true);

    this.analytics.trackAddToCart(
      product.id,
      product.title,
      quantity,
      Math.round(quantity * product.price),
    );

    // Backend synchronization
    if (this.isBrowser && localStorage.getItem('atelier_token')) {
      fetch(`${this.getApiUrl()}/cart/items`, {
        method: 'POST',
        headers: this.getAuthHeader(),
        body: JSON.stringify({
          productId: product.id,
          quantity,
          color: selectedColor,
          size: selectedSize,
        }),
      }).catch(() => {});
    }
  }

  updateQuantity(itemId: string, newQuantity: number): void {
    if (newQuantity <= 0) {
      this.removeItem(itemId);
      return;
    }

    const updated = this.items().map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          quantity: newQuantity,
          lineTotal: Math.round(newQuantity * item.price),
        };
      }
      return item;
    });

    this.items.set(updated);
    this.saveCart(updated);

    // Backend synchronization
    if (this.isBrowser && localStorage.getItem('atelier_token')) {
      fetch(`${this.getApiUrl()}/cart/items/${itemId}`, {
        method: 'PATCH',
        headers: this.getAuthHeader(),
        body: JSON.stringify({ quantity: newQuantity }),
      }).catch(() => {});
    }
  }

  removeItem(itemId: string): void {
    const updated = this.items().filter((i) => i.id !== itemId);
    this.items.set(updated);
    this.saveCart(updated);

    // Backend synchronization
    if (this.isBrowser && localStorage.getItem('atelier_token')) {
      fetch(`${this.getApiUrl()}/cart/items/${itemId}`, {
        method: 'DELETE',
        headers: this.getAuthHeader(),
      }).catch(() => {});
    }
  }

  clearCart(): void {
    this.items.set([]);
    this.saveCart([]);
    this.appliedCoupon.set(null);
  }

  async applyCoupon(
    code: string,
  ): Promise<{ success: boolean; message: string }> {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode)
      return { success: false, message: 'Please enter a coupon code' };

    try {
      const res = await fetch(`${this.getApiUrl()}/cart/coupon`, {
        method: 'POST',
        headers: this.getAuthHeader(),
        body: JSON.stringify({ code: cleanCode }),
      });
      if (res.ok) {
        const data = await res.json();
        const discountPercent =
          data.discountPercent ||
          (cleanCode === 'TEEPHA10' || cleanCode === 'ATELIER10'
            ? 10
            : cleanCode === 'TEEPHAVIP' || cleanCode === 'LAGOSVIP'
              ? 15
              : 10);
        this.appliedCoupon.set({ code: cleanCode, discountPercent });
        return {
          success: true,
          message: `Coupon ${cleanCode} applied (-${discountPercent}%)`,
        };
      }
    } catch {
      // Fallback local verification for standard promo codes
    }

    if (cleanCode === 'TEEPHA10' || cleanCode === 'ATELIER10') {
      this.appliedCoupon.set({ code: cleanCode, discountPercent: 10 });
      return {
        success: true,
        message: 'Teepha Welcome voucher applied (-10%)',
      };
    } else if (cleanCode === 'TEEPHAVIP' || cleanCode === 'LAGOSVIP') {
      this.appliedCoupon.set({ code: cleanCode, discountPercent: 15 });
      return {
        success: true,
        message: 'Teepha VIP Haute Couture voucher applied (-15%)',
      };
    }

    return { success: false, message: 'Invalid or expired coupon code' };
  }

  async removeCoupon(): Promise<void> {
    this.appliedCoupon.set(null);
    if (this.isBrowser && localStorage.getItem('atelier_token')) {
      fetch(`${this.getApiUrl()}/cart/coupon`, {
        method: 'DELETE',
        headers: this.getAuthHeader(),
      }).catch(() => {});
    }
  }
}
