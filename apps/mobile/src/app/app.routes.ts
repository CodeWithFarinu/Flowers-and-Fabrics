import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'tabs/feed',
    pathMatch: 'full',
  },
  {
    path: 'tabs/feed',
    loadComponent: () =>
      import('./pages/mobile-feed/mobile-feed.component').then(
        (m) => m.MobileFeedComponent,
      ),
  },
  {
    path: 'tabs/explore',
    loadComponent: () =>
      import('./pages/mobile-explore/mobile-explore.component').then(
        (m) => m.MobileExploreComponent,
      ),
  },
  {
    path: 'tabs/studio',
    loadComponent: () =>
      import('./pages/mobile-studio/mobile-studio.component').then(
        (m) => m.MobileStudioComponent,
      ),
  },
  {
    path: 'tabs/cart',
    loadComponent: () =>
      import('./pages/mobile-cart/mobile-cart.component').then(
        (m) => m.MobileCartComponent,
      ),
  },
  {
    path: 'tabs/profile',
    loadComponent: () =>
      import('./pages/mobile-profile/mobile-profile.component').then(
        (m) => m.MobileProfileComponent,
      ),
  },
  {
    path: '**',
    redirectTo: 'tabs/feed',
  },
];
