import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthStore, ProductStore, CartStore } from '@shared/data-access';
import { InvoiceModalComponent, InvoiceOrderData } from '@shared/ui';

interface MockOrder {
  id: string;
  orderNumber: string;
  date: string;
  status: 'In Transit' | 'Delivered' | 'Fabric Cut';
  items: {
    title: string;
    slug: string;
    image: string;
    price: number;
    qtyText: string;
  }[];
  total: number;
  deliveryAddress: string;
  estimatedDelivery: string;
  riderName?: string;
  riderPhone?: string;
  currentStep: number; // 1 to 4
}

@Component({
  selector: 'atelier-account',
  standalone: true,
  imports: [CommonModule, RouterModule, InvoiceModalComponent],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss',
})
export class AccountComponent {
  readonly authStore = inject(AuthStore);
  readonly productStore = inject(ProductStore);
  readonly cartStore = inject(CartStore);
  private router = inject(Router);

  readonly activeTab = signal<
    'deliveries' | 'orders' | 'history' | 'addresses'
  >('deliveries');

  readonly selectedInvoiceOrder = signal<InvoiceOrderData | null>(null);

  get userInitial(): string {
    const name = this.authStore.currentUser().name;
    return name ? name.charAt(0).toUpperCase() : 'B';
  }

  readonly activeOrders: MockOrder[] = [
    {
      id: 'ord-active-1',
      orderNumber: 'AT-9421',
      date: 'Today, 11:20 AM',
      status: 'In Transit',
      currentStep: 3,
      total: 221000,
      deliveryAddress: '14 Admiralty Way, Lekki Phase 1, Lagos State',
      estimatedDelivery: 'Today by 3:45 PM (Lagos Priority Dispatch)',
      riderName: 'Babatunde Balogun',
      riderPhone: '+234 802 555 1234',
      items: [
        {
          title: 'Midnight Obsidian Italian Cashmere 160s Wool',
          slug: 'midnight-italian-cashmere-senator',
          image:
            'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=400&q=80',
          price: 189000,
          qtyText: '4.5 Yards (Cut to order)',
        },
        {
          title: 'Sovereign Onyx & 18K Gold Precision Cufflinks',
          slug: 'sovereign-onyx-gold-cufflinks',
          image:
            'https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=400&q=80',
          price: 32000,
          qtyText: '1 Pair (In Luxury Wooden Case)',
        },
      ],
    },
  ];

  readonly pastOrders: MockOrder[] = [
    {
      id: 'ord-past-1',
      orderNumber: 'AT-8120',
      date: '28 Oct 2026',
      status: 'Delivered',
      currentStep: 4,
      total: 340000,
      deliveryAddress: '14 Admiralty Way, Lekki Phase 1, Lagos State',
      estimatedDelivery: 'Delivered on 28 Oct 2026',
      items: [
        {
          title: 'Emerald & Gold Swiss Voile Imperial Lace',
          slug: 'emerald-gold-swiss-voile-lace',
          image:
            'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80',
          price: 340000,
          qtyText: '4.0 Yards (Scalloped Edges Intact)',
        },
      ],
    },
    {
      id: 'ord-past-2',
      orderNumber: 'AT-7904',
      date: '14 Oct 2026',
      status: 'Delivered',
      currentStep: 4,
      total: 98000,
      deliveryAddress: '22 Gana Street, Maitama, Abuja FCT',
      estimatedDelivery: 'Delivered on 15 Oct 2026',
      items: [
        {
          title: 'Teepha Signature High "Obsidian & Chalk" Limited Sneaker',
          slug: 'retro-og-monochrome-sneakers',
          image:
            'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=400&q=80',
          price: 98000,
          qtyText: 'Size: EU 43 (Hand-Numbered 048/250)',
        },
      ],
    },
  ];

  reorderItem(item: any): void {
    const product = this.productStore.selectProductBySlug(item.slug);
    if (product) {
      this.cartStore.addItem(product);
      this.cartStore.toggle(true);
    }
  }

  openInvoice(order: MockOrder): void {
    const user = this.authStore.currentUser();
    const invoice: InvoiceOrderData = {
      orderNumber: order.orderNumber.replace('AT-', ''),
      date: order.date,
      customerName: user.name || 'Valued Customer',
      customerPhone: user.phone || '+234 803 987 6543',
      customerEmail: user.email || 'customer@domain.com',
      deliveryAddress: order.deliveryAddress,
      paymentMethod: 'Paystack Certified Payment',
      paymentStatus: 'PAID & CERTIFIED',
      paymentReference: `PSTK-${order.orderNumber}`,
      items: order.items.map((i) => ({
        title: i.title,
        unit: i.qtyText.toLowerCase().includes('yard') ? 'yard' : 'piece',
        quantity: 1,
        price: i.price,
        lineTotal: i.price,
      })),
      subtotal: order.total,
      deliveryFee: 0,
      discount: 0,
      total: order.total,
    };
    this.selectedInvoiceOrder.set(invoice);
  }

  closeInvoice(): void {
    this.selectedInvoiceOrder.set(null);
  }

  searchAndNavigate(query: string): void {
    this.productStore.setSearchQuery(query);
    this.router.navigate(['/']);
  }

  onLogout(): void {
    this.authStore.logout();
    this.router.navigate(['/login']);
  }
}
