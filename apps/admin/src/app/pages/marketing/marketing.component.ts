import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminStore, ProductStore } from '@shared/data-access';
import { TrackedLink, CommunityFitSubmission } from '@shared/models';

@Component({
  selector: 'atelier-admin-marketing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './marketing.component.html',
  styleUrl: './marketing.component.scss',
})
export class MarketingComponent {
  readonly adminStore = inject(AdminStore);
  readonly productStore = inject(ProductStore);

  activeTab = signal<'links' | 'rails'>('links');
  showCreateModal = signal<boolean>(false);

  selectedProductSlug = 'midnight-italian-cashmere-senator';
  newUtmSource = 'facebook_ads';
  newUtmCampaign = 'lagos_executive_senator_drop';
  newAffiliateCode = '';

  pendingFitsCount = computed(() => {
    return this.adminStore.communityFits().filter((f) => f.status === 'pending')
      .length;
  });

  approvedFitsCount = computed(() => {
    return this.adminStore
      .communityFits()
      .filter((f) => f.status === 'approved').length;
  });

  getRailName(rail?: string): string {
    switch (rail) {
      case 'executive_senator':
        return 'Executive Senator & Agbada';
      case 'asoebi_bellanaija':
        return 'Aso-Ebi & Bridal Glamour';
      case 'streetwear_grail':
        return 'Lagos Streetwear Grails';
      case 'sovereign_black_tie':
        return 'Sovereign Black-Tie';
      default:
        return 'Curated Luxury Rail';
    }
  }

  approveFit(id: string): void {
    this.adminStore.approveFit(id);
    this.productStore.approveFitSubmission(id);
  }

  rejectFit(id: string): void {
    this.adminStore.rejectFit(id);
    this.productStore.rejectFitSubmission(id);
  }

  generateLink(): void {
    const product = this.productStore
      .products()
      .find((p) => p.slug === this.selectedProductSlug);

    this.adminStore.createTrackedLink({
      targetProductSlug: this.selectedProductSlug,
      productTitle: product ? product.title : 'Luxury Fabric',
      utmSource: this.newUtmSource,
      utmCampaign: this.newUtmCampaign,
      affiliateCode: this.newAffiliateCode || undefined,
    });

    this.showCreateModal.set(false);
  }

  copyToClipboard(text: string): void {
    navigator.clipboard?.writeText(text);
  }
}
