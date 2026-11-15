import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent,
      ),
    title: 'TEEPHA FLOWERS & FABRICS | Executive Real-Time Intelligence',
  },
  {
    path: 'catalog',
    loadComponent: () =>
      import('./pages/catalog/catalog.component').then(
        (m) => m.CatalogComponent,
      ),
    title: 'TEEPHA FLOWERS & FABRICS | Catalog Mutation & Fabric Vault',
  },
  {
    path: 'orders',
    loadComponent: () =>
      import('./pages/orders/orders.component').then((m) => m.OrdersComponent),
    title: 'TEEPHA FLOWERS & FABRICS | Orders Fulfilment Kanban',
  },
  {
    path: 'deliveries',
    loadComponent: () =>
      import('./pages/deliveries/deliveries.component').then(
        (m) => m.DeliveriesComponent,
      ),
    title: 'TEEPHA FLOWERS & FABRICS | Fleet Logistics & Courier Dispatch',
  },
  {
    path: 'payments',
    loadComponent: () =>
      import('./pages/payments/payments.component').then(
        (m) => m.PaymentsComponent,
      ),
    title: 'TEEPHA FLOWERS & FABRICS | Treasury & Gateway Settlement Ledger',
  },
  {
    path: 'customers',
    loadComponent: () =>
      import('./pages/customers/customers.component').then(
        (m) => m.CustomersComponent,
      ),
    title: 'TEEPHA FLOWERS & FABRICS | Patrons, VIP Tiers & Lead Engine',
  },
  {
    path: 'marketing',
    loadComponent: () =>
      import('./pages/marketing/marketing.component').then(
        (m) => m.MarketingComponent,
      ),
    title: 'TEEPHA FLOWERS & FABRICS | Attribution & Story Rails Curation',
  },
  {
    path: 'support',
    loadComponent: () =>
      import('./pages/support-desk/support-desk.component').then(
        (m) => m.SupportDeskComponent,
      ),
    title: 'TEEPHA FLOWERS & FABRICS | Unified Concierge & AI Copilot',
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./pages/settings/settings.component').then(
        (m) => m.AdminSettingsComponent,
      ),
    title: 'TEEPHA FLOWERS & FABRICS | Platform & Theme Configuration',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
