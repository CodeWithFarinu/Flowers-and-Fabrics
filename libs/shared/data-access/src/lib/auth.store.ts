import { Injectable, signal, computed, inject } from '@angular/core';
import { User, AccountState, LoyaltyTier } from '@shared/models';
import { AnalyticsService } from '@shared/analytics';
import { getApiBaseUrl } from './api-config';

@Injectable({
  providedIn: 'root',
})
export class AuthStore {
  private analytics = inject(AnalyticsService);

  readonly currentUser = signal<User>({
    id: 'usr-guest-001',
    phone: '+2348039876543',
    name: 'Boluwatife Farinu',
    email: 'boluwatife@example.com',
    accountState: 'MEMBER',
    loyaltyTier: 'Tailor',
    loyaltyPoints: 3450,
    aiTokenBalance: 3, // 3 style preview tokens
    addresses: [
      {
        id: 'addr-1',
        fullName: 'Boluwatife Farinu',
        phone: '+2348039876543',
        state: 'Lagos',
        lga: 'Eti-Osa',
        streetAddress: '14 Admiralty Way, Lekki Phase 1',
        landmark: 'Opposite Brasas Place',
        isDefault: true,
      },
    ],
    role: 'customer',
    createdAt: '2026-09-01T10:00:00Z',
  });

  readonly accountState = computed<AccountState>(
    () => this.currentUser().accountState,
  );
  readonly tokenBalance = computed<number>(
    () => this.currentUser().aiTokenBalance,
  );
  readonly loyaltyTier = computed<LoyaltyTier>(
    () => this.currentUser().loyaltyTier,
  );
  readonly loyaltyPoints = computed<number>(
    () => this.currentUser().loyaltyPoints,
  );

  readonly tierNextThreshold = computed<number>(() => {
    const tier = (this.loyaltyTier() || '').toString().toUpperCase();
    switch (tier) {
      case 'THREAD':
      case 'BRONZE':
        return 50000;
      case 'STITCH':
      case 'SILVER':
        return 150000;
      case 'TAILOR':
      case 'GOLD':
        return 350000;
      case 'ATELIER':
      case 'PLATINUM':
      case 'BLACK':
        return 1000000;
      default:
        return 50000;
    }
  });

  upgradeToMember(otp: string): boolean {
    if (otp && otp.length >= 4) {
      this.currentUser.update((u) => ({
        ...u,
        accountState: 'MEMBER',
        aiTokenBalance: u.aiTokenBalance + 1, // Bonus token on member signup!
      }));
      this.analytics.track('account_saved', { tier: this.loyaltyTier() });
      return true;
    }
    return false;
  }

  useAiToken(): boolean {
    const balance = this.tokenBalance();
    if (balance > 0) {
      this.currentUser.update((u) => ({
        ...u,
        aiTokenBalance: u.aiTokenBalance - 1,
      }));
      return true;
    }
    return false;
  }

  readonly isAffiliate = computed<boolean>(
    () =>
      this.currentUser().role === 'affiliate' || this.isAffiliateRegistered(),
  );
  readonly isAffiliateRegistered = signal<boolean>(false);

  registerAsAffiliate(details: {
    brandName: string;
    handle: string;
    bankAccount: string;
  }): void {
    this.currentUser.update((u) => ({
      ...u,
      role: 'affiliate',
    }));
    this.isAffiliateRegistered.set(true);
    this.analytics.track('affiliate_registered', { brand: details.brandName });
  }

  addTokens(count: number): void {
    this.currentUser.update((u) => ({
      ...u,
      aiTokenBalance: u.aiTokenBalance + count,
    }));
  }

  login(identifier: string, name?: string): void {
    this.currentUser.update((u) => ({
      ...u,
      phone: identifier.includes('@') ? u.phone : identifier,
      email: identifier.includes('@') ? identifier : u.email,
      name: name || u.name || 'Bespoke Patron',
      accountState: 'MEMBER',
    }));
  }

  signup(name: string, phone: string, email: string): void {
    this.currentUser.set({
      id: `usr-${Date.now()}`,
      phone,
      email,
      name,
      accountState: 'MEMBER',
      loyaltyTier: 'Thread',
      loyaltyPoints: 100,
      aiTokenBalance: 3,
      addresses: [
        {
          id: 'addr-new',
          fullName: name,
          phone,
          state: 'Lagos',
          lga: 'Eti-Osa',
          streetAddress: 'Victoria Island',
          isDefault: true,
        },
      ],
      role: 'customer',
      createdAt: new Date().toISOString(),
    });
  }

  async loginWithGoogle(payload: {
    credential?: string;
    email?: string;
    name?: string;
    picture?: string;
    googleId?: string;
  }): Promise<boolean> {
    try {
      const apiUrl = getApiBaseUrl();

      const res = await fetch(`${apiUrl}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential: payload.credential,
          email: payload.email,
          firstName: payload.name?.split(' ')[0] || 'Google',
          lastName: payload.name?.split(' ').slice(1).join(' ') || 'Patron',
          avatarUrl: payload.picture,
          googleId: payload.googleId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (typeof window !== 'undefined' && data.accessToken) {
          localStorage.setItem('atelier_token', data.accessToken);
          localStorage.setItem('atelier_refresh_token', data.refreshToken);
        }
        if (data.user) {
          this.currentUser.set({
            id: data.user.id,
            phone: data.user.phone,
            name:
              `${data.user.firstName || ''} ${data.user.lastName || ''}`.trim() ||
              'Google Patron',
            email: data.user.email,
            avatarUrl: data.user.avatarUrl || payload.picture,
            accountState: 'MEMBER',
            loyaltyTier: data.user.loyaltyTier || 'Thread',
            loyaltyPoints: data.user.loyaltyPoints || 100,
            aiTokenBalance: data.user.imageGenTokens || 3,
            addresses: [],
            role: data.user.role?.toLowerCase() || 'customer',
            createdAt: data.user.createdAt || new Date().toISOString(),
          });
          this.analytics.track('login_google_success', {
            email: data.user.email,
          });
          return true;
        }
      }
    } catch (err) {
      console.warn(
        '[AuthStore] Backend Google auth offline, fallback to client session:',
        err,
      );
    }

    // Graceful Dev Fallback: update state directly
    const fallbackEmail = payload.email || 'google.patron@atelierlagos.com';
    const fallbackName = payload.name || 'Google Patron';
    this.currentUser.update((u) => ({
      ...u,
      id: `usr-google-${Date.now()}`,
      email: fallbackEmail,
      name: fallbackName,
      avatarUrl: payload.picture || u.avatarUrl,
      accountState: 'MEMBER',
      aiTokenBalance: Math.max(u.aiTokenBalance, 3),
    }));
    this.analytics.track('login_google_success', { email: fallbackEmail });
    return true;
  }

  logout(): void {
    // Return to guest shadow account
    this.currentUser.update((u) => ({
      ...u,
      accountState: 'SHADOW',
      name: 'Guest Patron',
    }));
  }
}
