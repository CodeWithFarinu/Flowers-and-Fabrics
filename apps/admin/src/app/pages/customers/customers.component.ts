import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminStore } from '@shared/data-access';
import { User, LoyaltyTier } from '@shared/models';

@Component({
  selector: 'atelier-admin-customers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.scss',
})
export class CustomersComponent {
  readonly adminStore = inject(AdminStore);

  searchQuery = '';
  selectedTierFilter = signal<string>('ALL');

  selectedCustomerForAdjust = signal<User | null>(null);
  selectedCustomerForConvert = signal<User | null>(null);
  showAddModal = signal<boolean>(false);

  // Adjust state
  tokenDelta = 2;
  pointsDelta = 500;
  selectedNewTier: LoyaltyTier = 'Atelier';

  // Add state
  newPatronName = '';
  newPatronPhone = '';
  newPatronEmail = '';
  newPatronTier: 'Sovereign' | 'Executive' | 'Connoisseur' = 'Sovereign';
  newPatronState = 'Lagos';
  newPatronTokens = 5;

  // Convert state
  convertName = '';
  convertEmail = '';

  sovereignVipsCount = computed(() => {
    return this.adminStore
      .customers()
      .filter((c) => c.vipStatus === 'Sovereign' || c.vipStatus === 'Executive')
      .length;
  });

  totalLifetimeSpend = computed(() => {
    return this.adminStore
      .customers()
      .reduce((sum, c) => sum + (c.totalSpend || 0), 0);
  });

  filteredCustomers = computed(() => {
    const q = this.searchQuery.toLowerCase().trim();
    const filter = this.selectedTierFilter();
    let list = this.adminStore.customers();

    if (filter === 'SOVEREIGN') {
      list = list.filter((c) => c.vipStatus === 'Sovereign');
    } else if (filter === 'EXECUTIVE') {
      list = list.filter((c) => c.vipStatus === 'Executive');
    } else if (filter === 'CONNOISSEUR') {
      list = list.filter((c) => c.vipStatus === 'Connoisseur');
    } else if (filter === 'SHADOW') {
      list = list.filter(
        (c) => c.accountState === 'SHADOW' || c.accountState === 'LEAD',
      );
    }

    if (q) {
      list = list.filter(
        (c) =>
          (c.name && c.name.toLowerCase().includes(q)) ||
          c.phone.includes(q) ||
          (c.email && c.email.toLowerCase().includes(q)),
      );
    }

    return list;
  });

  getInitials(name: string): string {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  getWhatsAppLink(phone: string, name?: string): string {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const greeting = encodeURIComponent(
      `Good day ${name || 'Patron'}, Teepha Flowers & Fabrics Sovereign Concierge is at your service.`,
    );
    return `https://wa.me/${cleanPhone}?text=${greeting}`;
  }

  openAdjustModal(customer: User): void {
    this.selectedCustomerForAdjust.set(customer);
    this.tokenDelta = 2;
    this.pointsDelta = 500;
    this.selectedNewTier = customer.loyaltyTier;
  }

  adjustTokensDelta(amount: number): void {
    this.tokenDelta += amount;
  }

  adjustPointsDelta(amount: number): void {
    this.pointsDelta += amount;
  }

  saveAdjustments(): void {
    const cust = this.selectedCustomerForAdjust();
    if (!cust) return;

    this.adminStore.updateCustomerLoyalty(
      cust.id,
      this.pointsDelta,
      this.tokenDelta,
    );
    let vipStatus = cust.vipStatus;
    if (this.selectedNewTier === 'Atelier') vipStatus = 'Sovereign';
    else if (this.selectedNewTier === 'Tailor') vipStatus = 'Executive';
    else if (this.selectedNewTier === 'Stitch') vipStatus = 'Connoisseur';

    this.adminStore.updateCustomerTier(
      cust.id,
      this.selectedNewTier,
      vipStatus,
    );
    this.selectedCustomerForAdjust.set(null);
  }

  openConvertModal(customer: User): void {
    this.selectedCustomerForConvert.set(customer);
    this.convertName =
      customer.name &&
      !customer.name.startsWith('Guest') &&
      !customer.name.startsWith('Phone')
        ? customer.name
        : '';
    this.convertEmail = customer.email || '';
  }

  confirmConvert(): void {
    const cust = this.selectedCustomerForConvert();
    if (!cust) return;

    this.adminStore.convertShadowAccount(
      cust.id,
      this.convertName || 'Verified Member',
      this.convertEmail,
    );
    this.selectedCustomerForConvert.set(null);
  }

  saveNewPatron(): void {
    if (!this.newPatronName || !this.newPatronPhone) return;

    const newCust: User = {
      id: `usr-${Date.now()}`,
      name: this.newPatronName,
      phone: this.newPatronPhone,
      email: this.newPatronEmail || undefined,
      accountState: 'MEMBER',
      loyaltyTier:
        this.newPatronTier === 'Sovereign'
          ? 'Atelier'
          : this.newPatronTier === 'Executive'
            ? 'Tailor'
            : 'Stitch',
      loyaltyPoints: 2000,
      aiTokenBalance: this.newPatronTokens || 5,
      totalSpend: 0,
      ordersCount: 0,
      vipStatus: this.newPatronTier,
      role: 'customer',
      createdAt: new Date().toISOString().split('T')[0],
      lastActive: 'Just registered',
      addresses: [
        {
          id: `addr-${Date.now()}`,
          fullName: this.newPatronName,
          phone: this.newPatronPhone,
          state: this.newPatronState,
          lga: 'Metropolitan',
          streetAddress: 'VIP Residence',
          isDefault: true,
        },
      ],
    };

    this.adminStore.addCustomer(newCust);
    this.showAddModal.set(false);
    this.newPatronName = '';
    this.newPatronPhone = '';
    this.newPatronEmail = '';
  }
}
