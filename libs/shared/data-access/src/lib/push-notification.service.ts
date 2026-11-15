import {
  Injectable,
  signal,
  computed,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { getApiBaseUrl } from './api-config';

export interface PushSubscriptionPayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userId?: string;
  device?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PushNotificationService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  // Default fallback VAPID public key
  private readonly defaultVapidKey =
    'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkRXZJjSgSnfckj0Ks2uhiRQQ9ae0Mb_OyWB3TAKyo';

  readonly isSupported = signal<boolean>(false);
  readonly permission = signal<NotificationPermission>('default');
  readonly isSubscribed = signal<boolean>(false);
  readonly subscription = signal<PushSubscription | null>(null);
  readonly deferredInstallPrompt = signal<any>(null);
  readonly isInstalling = signal<boolean>(false);

  readonly canInstall = computed(() => !!this.deferredInstallPrompt());
  readonly isPermissionGranted = computed(
    () => this.permission() === 'granted',
  );

  constructor() {
    if (this.isBrowser) {
      this.init();
    }
  }

  async init(): Promise<void> {
    if (!this.isBrowser) return;

    const supported =
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window;
    this.isSupported.set(supported);

    if (!supported) return;

    this.permission.set(Notification.permission);

    // Capture PWA beforeinstallprompt event for custom install button
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredInstallPrompt.set(e);
    });

    window.addEventListener('appinstalled', () => {
      this.deferredInstallPrompt.set(null);
    });

    try {
      const reg = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        this.subscription.set(sub);
        this.isSubscribed.set(true);
      }
    } catch (err) {
      console.warn(
        'Service worker registration or subscription check error:',
        err,
      );
    }
  }

  async requestPermissionAndSubscribe(
    customVapidKey?: string,
  ): Promise<boolean> {
    if (!this.isBrowser || !this.isSupported()) return false;

    try {
      const perm = await Notification.requestPermission();
      this.permission.set(perm);

      if (perm !== 'granted') {
        return false;
      }

      // Fetch VAPID public key from backend if not provided
      let vapidKey = customVapidKey;
      if (!vapidKey) {
        try {
          const res = await fetch(`${getApiBaseUrl()}/notifications/vapid-key`);
          if (res.ok) {
            const data = await res.json();
            vapidKey = data.publicKey || data.vapidPublicKey;
          }
        } catch {
          // Fallback to default
        }
      }
      vapidKey = vapidKey || this.defaultVapidKey;

      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();

      if (!sub) {
        const convertedKey = this.urlBase64ToUint8Array(vapidKey);
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedKey as any,
        });
      }

      this.subscription.set(sub);
      this.isSubscribed.set(true);

      // Synchronize subscription to backend
      await this.syncSubscriptionToBackend(sub);

      // Show welcome notification
      await this.showNotification(
        '⚜ Teepha Flowers & Fabrics Alerts Activated',
        'You will receive real-time notifications for order dispatch, VIP drops, and style consultations.',
        '/',
      );

      return true;
    } catch (err) {
      console.error('Failed to subscribe to push notifications:', err);
      return false;
    }
  }

  async unsubscribe(): Promise<boolean> {
    if (!this.isBrowser) return false;

    try {
      const sub = this.subscription();
      if (sub) {
        await sub.unsubscribe();
        this.subscription.set(null);
        this.isSubscribed.set(false);
      }
      return true;
    } catch (err) {
      console.error('Failed to unsubscribe:', err);
      return false;
    }
  }

  async promptInstall(): Promise<boolean> {
    const promptEvent = this.deferredInstallPrompt();
    if (!promptEvent) return false;

    this.isInstalling.set(true);
    promptEvent.prompt();
    const result = await promptEvent.userChoice;
    this.deferredInstallPrompt.set(null);
    this.isInstalling.set(false);
    return result.outcome === 'accepted';
  }

  async showNotification(
    title: string,
    body: string,
    url: string = '/',
  ): Promise<void> {
    if (!this.isBrowser) return;

    if (Notification.permission === 'granted') {
      try {
        const reg = await navigator.serviceWorker.ready;
        const options: any = {
          body,
          icon: '/icons/icon.svg',
          badge: '/icons/icon.svg',
          data: { url },
          vibrate: [150, 60, 150, 60, 250],
          tag: 'teepha-instant-alert',
        };
        await reg.showNotification(title, options);
      } catch {
        // Fallback to desktop notification constructor
        new Notification(title, {
          body,
          icon: '/icons/icon.svg',
        });
      }
    }
  }

  private async syncSubscriptionToBackend(
    sub: PushSubscription,
  ): Promise<void> {
    try {
      const subJson = sub.toJSON();
      const token = localStorage.getItem('atelier_token');
      const payload: PushSubscriptionPayload = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: subJson.keys?.['p256dh'] || '',
          auth: subJson.keys?.['auth'] || '',
        },
        device:
          typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      };

      await fetch(`${getApiBaseUrl()}/notifications/push-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.warn(
        'Backend push subscription sync skipped (offline or dev):',
        err,
      );
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}
