import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface AnalyticsEvent {
  name: string;
  properties: Record<string, any>;
  timestamp: string;
}

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  readonly visitorId = signal<string>(this.initVisitorId());
  readonly sessionId = signal<string>(this.initSessionId());
  readonly recentEvents = signal<AnalyticsEvent[]>([]);

  private attribution = signal<{
    utmSource?: string;
    utmCampaign?: string;
    utmMedium?: string;
    clickId?: string;
    affiliateCode?: string;
  }>({});

  constructor() {
    if (this.isBrowser) {
      this.parseUrlAttribution();
    }
  }

  private initVisitorId(): string {
    if (!this.isBrowser) return 'ssr-visitor';
    let id = localStorage.getItem('atelier_visitor_id');
    if (!id) {
      id =
        'vis_' +
        Math.random().toString(36).substring(2, 12) +
        Date.now().toString(36);
      localStorage.setItem('atelier_visitor_id', id);
    }
    return id;
  }

  private initSessionId(): string {
    if (!this.isBrowser) return 'ssr-session';
    let id = sessionStorage.getItem('atelier_session_id');
    if (!id) {
      id = 'ses_' + Math.random().toString(36).substring(2, 10);
      sessionStorage.setItem('atelier_session_id', id);
    }
    return id;
  }

  private parseUrlAttribution(): void {
    try {
      const params = new URLSearchParams(window.location.search);
      const utmSource = params.get('utm_source') || undefined;
      const utmCampaign = params.get('utm_campaign') || undefined;
      const utmMedium = params.get('utm_medium') || undefined;
      const clickId =
        params.get('fbclid') ||
        params.get('gclid') ||
        params.get('ttclid') ||
        undefined;
      const affiliateCode = params.get('aff') || params.get('ref') || undefined;

      if (utmSource || utmCampaign || clickId || affiliateCode) {
        this.attribution.set({
          utmSource,
          utmCampaign,
          utmMedium,
          clickId,
          affiliateCode,
        });

        this.track('tracked_link_landed', {
          utm_source: utmSource,
          utm_campaign: utmCampaign,
          click_id: clickId,
          affiliate_code: affiliateCode,
        });
      }
    } catch {
      // ignore
    }
  }

  track(eventName: string, customProps: Record<string, any> = {}): void {
    const payload: AnalyticsEvent = {
      name: eventName,
      properties: {
        visitor_id: this.visitorId(),
        session_id: this.sessionId(),
        platform: 'web',
        locale: 'en-NG',
        currency: 'NGN',
        ...this.attribution(),
        ...customProps,
      },
      timestamp: new Date().toISOString(),
    };

    this.recentEvents.update((events) => [payload, ...events.slice(0, 49)]);

    if (this.isBrowser) {
      // In production, amplitude.track(eventName, payload.properties)
      // For developer transparency & testing verification:
      // console.debug(`[Amplitude Event]: ${eventName}`, payload.properties);
    }
  }

  // Domain convenience trackers
  trackFeedViewed(): void {
    this.track('feed_viewed');
  }

  trackFeedImpression(itemId: string, reason: string): void {
    this.track('feed_impression', { item_id: itemId, reason_code: reason });
  }

  trackProductViewed(
    productId: string,
    title: string,
    price: number,
    category: string,
  ): void {
    this.track('product_viewed', {
      product_id: productId,
      title,
      price_ngn: price,
      category,
    });
  }

  trackAddToCart(
    productId: string,
    title: string,
    quantity: number,
    lineTotal: number,
  ): void {
    this.track('add_to_cart', {
      product_id: productId,
      title,
      quantity,
      line_total_ngn: lineTotal,
    });
  }

  trackLeadCaptured(phone: string, email?: string, name?: string): void {
    this.track('lead_captured', {
      phone_normalized: phone,
      has_email: Boolean(email),
      has_name: Boolean(name),
    });
  }

  trackCheckoutStepViewed(step: number): void {
    this.track('checkout_step_viewed', { step_number: step });
  }

  trackCheckoutStepCompleted(step: number): void {
    this.track('checkout_step_completed', { step_number: step });
  }

  trackOrderCompleted(
    orderId: string,
    total: number,
    paymentMethod: string,
  ): void {
    this.track('order_completed', {
      order_id: orderId,
      total_ngn: total,
      payment_method: paymentMethod,
    });
  }

  trackAiStudioGenerated(
    garment: string,
    skinTone: string,
    tokenCost: number,
  ): void {
    this.track('studio_generation_completed', {
      garment_type: garment,
      skin_tone: skinTone,
      token_cost: tokenCost,
    });
  }

  trackThemeChanged(theme: string): void {
    this.track('theme_changed', { to_theme: theme });
  }
}
