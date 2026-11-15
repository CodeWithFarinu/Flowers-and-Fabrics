import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductStore, AuthStore } from '@shared/data-access';

@Component({
  selector: 'atelier-affiliate',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './affiliate.component.html',
  styleUrl: './affiliate.component.scss',
})
export class AffiliateComponent {
  readonly productStore = inject(ProductStore);
  readonly authStore = inject(AuthStore);

  affiliateCode = 'TEEPHA-SOVEREIGN-10';
  totalEarnings = 462500;
  pendingEarnings = 142000;
  clicksCount = 1840;
  conversionsCount = 98;

  selectedProductSlug = 'midnight-italian-cashmere-senator';
  generatedUrl = signal<string>('');
  copied = signal<boolean>(false);
  payoutRequested = signal<boolean>(false);

  // Application fields
  appBrandName = '';
  appHandle = '';
  appSpecialization = 'executive_senator';
  appPhone = '';
  appBankName = '';
  appAccountNumber = '';

  submitAffiliateApplication(event: Event): void {
    event.preventDefault();
    if (!this.appBrandName || !this.appHandle) return;

    this.authStore.registerAsAffiliate({
      brandName: this.appBrandName,
      handle: this.appHandle,
      bankAccount: `${this.appBankName} - ${this.appAccountNumber}`,
    });

    const codeSlug = this.appBrandName
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 8);
    this.affiliateCode = `TP-${codeSlug}-10`;
  }

  generateLink(): void {
    const origin =
      typeof window !== 'undefined'
        ? window.location.origin
        : 'https://teepha.com';
    const url = `${origin}/product/${this.selectedProductSlug}?aff=${this.affiliateCode}&utm_source=guild&utm_medium=affiliate`;
    this.generatedUrl.set(url);
    this.copied.set(false);
  }

  copyLink(): void {
    if (this.generatedUrl() && typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(this.generatedUrl());
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2500);
    }
  }

  requestPayout(): void {
    this.payoutRequested.set(true);
    setTimeout(() => {
      this.totalEarnings += this.pendingEarnings;
      this.pendingEarnings = 0;
      this.payoutRequested.set(false);
    }, 1800);
  }
}
