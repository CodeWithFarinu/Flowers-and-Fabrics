import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/feed/feed.component').then((m) => m.FeedComponent),
    title: 'TEEPHA FLOWERS & FABRICS | High-Signal Luxury Fabrics & Curations',
  },
  {
    path: 'product/:slug',
    loadComponent: () =>
      import('./pages/product-detail/product-detail.component').then(
        (m) => m.ProductDetailComponent,
      ),
    title: 'TEEPHA FLOWERS & FABRICS | Product Details & Precision Tailoring',
  },
  {
    path: 'collections/:slug',
    loadComponent: () =>
      import('./pages/collection/collection.component').then(
        (m) => m.CollectionPageComponent,
      ),
    title: 'TEEPHA FLOWERS & FABRICS | Curated Department Collections',
  },
  {
    path: 'stores',
    loadComponent: () =>
      import('./pages/stores/stores.component').then((m) => m.StoresComponent),
    title: 'TEEPHA FLOWERS & FABRICS | Discover Feed & Lookbook',
  },
  {
    path: 'discover',
    redirectTo: 'stores',
    pathMatch: 'full',
  },
  {
    path: 'wholesale',
    redirectTo: 'stores',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/auth/login/login.component').then(
        (m) => m.LoginComponent,
      ),
    title: 'TEEPHA FLOWERS & FABRICS | Customer Sign In',
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./pages/auth/signup/signup.component').then(
        (m) => m.SignupComponent,
      ),
    title: 'TEEPHA FLOWERS & FABRICS | Customer Registration (3 AI Tokens)',
  },
  {
    path: 'account',
    loadComponent: () =>
      import('./pages/account/account.component').then(
        (m) => m.AccountComponent,
      ),
    title: 'TEEPHA FLOWERS & FABRICS | Customer Profile, Deliveries & History',
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./pages/checkout/checkout.component').then(
        (m) => m.CheckoutComponent,
      ),
    title: 'TEEPHA FLOWERS & FABRICS | 3-Step Instant Checkout',
  },
  {
    path: 'studio',
    loadComponent: () =>
      import('./pages/studio/studio.component').then((m) => m.StudioComponent),
    title: 'TEEPHA FLOWERS & FABRICS | AI Style Studio & Virtual Silhouette',
  },
  {
    path: 'rewards',
    loadComponent: () =>
      import('./pages/rewards/rewards.component').then(
        (m) => m.RewardsComponent,
      ),
    title: 'TEEPHA FLOWERS & FABRICS | Guild Loyalty Tiers & Privileges',
  },
  {
    path: 'affiliate',
    loadComponent: () =>
      import('./pages/affiliate/affiliate.component').then(
        (m) => m.AffiliateComponent,
      ),
    title: 'TEEPHA FLOWERS & FABRICS | Affiliate Marketing & Growth Hub',
  },
  {
    path: 'help',
    loadComponent: () =>
      import('./pages/support/support.component').then(
        (m) => m.SupportComponent,
      ),
    title: 'TEEPHA FLOWERS & FABRICS | Style Concierge & Support Desk',
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./pages/settings/settings.component').then(
        (m) => m.SettingsComponent,
      ),
    title: 'TEEPHA FLOWERS & FABRICS | Appearance & System Preferences',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
