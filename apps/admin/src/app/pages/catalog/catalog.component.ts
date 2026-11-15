import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductStore, AdminStore } from '@shared/data-access';
import { Product, ProductCategory } from '@shared/models';

@Component({
  selector: 'atelier-admin-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.scss',
})
export class CatalogComponent {
  readonly productStore = inject(ProductStore);
  readonly adminStore = inject(AdminStore);

  showProductFormModal = signal<boolean>(false);
  isEditingMode = signal<boolean>(false);
  editingProductId = signal<string | null>(null);

  showAiModal = signal<boolean>(false);
  productToDelete = signal<Product | null>(null);

  // Form Fields
  formTitle = '';
  formBrand = 'Teepha Floral & Fabric Mill';
  formCategory: ProductCategory = 'fabrics';
  formDescription = '';
  formPrice = 45000;
  formComparePrice = 55000;
  formUnit: 'yard' | 'piece' | 'pair' = 'yard';
  formStockQty = 20;
  formMinOrderQty = 4;
  formStockStatus: Product['stockStatus'] = 'in_stock';
  formComposition = '100% Superfine Italian Cashmere Wool';
  formWeave = '160s Twill Double Weave';
  formGsm = 280;
  formOccasion = 'Executive Senator, Black-Tie Gala';
  formImageUrl =
    'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80';
  formColorName = 'Obsidian Black';
  formColorHex = '#111827';
  formTagsStr = 'senator, cashmere, lagos, luxury';

  // AI Modal Fields
  modalProductId = 'prod-002';
  modalGarment = 'Executive Senator Suit';
  modalAngle = 'front';
  modalSkinTone = 'deep_melanin';

  totalInventoryValue = computed(() => {
    return this.productStore
      .products()
      .reduce((sum, p) => sum + p.price * p.stockQty, 0);
  });

  lowStockCount = computed(() => {
    return this.productStore
      .products()
      .filter((p) => p.stockStatus === 'low_stock' || p.stockQty <= 5).length;
  });

  updatePrice(id: string, event: Event, currentStock: number): void {
    const val = +(event.target as HTMLInputElement).value;
    if (val > 0) {
      this.productStore.updateProductPriceAndStock(id, val, currentStock);
    }
  }

  updateStock(id: string, currentPrice: number, event: Event): void {
    const val = +(event.target as HTMLInputElement).value;
    if (val >= 0) {
      this.productStore.updateProductPriceAndStock(id, currentPrice, val);
    }
  }

  openAddProductModal(): void {
    this.isEditingMode.set(false);
    this.editingProductId.set(null);
    this.formTitle = '';
    this.formBrand = 'Teepha Vault';
    this.formCategory = 'fabrics';
    this.formDescription = '';
    this.formPrice = 45000;
    this.formComparePrice = 55000;
    this.formUnit = 'yard';
    this.formStockQty = 20;
    this.formMinOrderQty = 4;
    this.formStockStatus = 'in_stock';
    this.formComposition = '100% Superfine Italian Cashmere Wool';
    this.formWeave = '160s Twill Double Weave';
    this.formGsm = 280;
    this.formOccasion = 'Executive Senator';
    this.formImageUrl =
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80';
    this.formColorName = 'Obsidian Black';
    this.formColorHex = '#111827';
    this.formTagsStr = 'senator, cashmere, lagos, luxury';
    this.showProductFormModal.set(true);
  }

  openEditProductModal(p: Product): void {
    this.isEditingMode.set(true);
    this.editingProductId.set(p.id);
    this.formTitle = p.title;
    this.formBrand = p.brand;
    this.formCategory = p.category;
    this.formDescription = p.description || '';
    this.formPrice = p.price;
    this.formComparePrice = p.compareAtPrice || Math.round(p.price * 1.25);
    this.formUnit = p.unit;
    this.formStockQty = p.stockQty;
    this.formMinOrderQty = p.minOrderQty || (p.unit === 'yard' ? 4 : 1);
    this.formStockStatus = p.stockStatus;
    this.formComposition = p.attributes?.materialComposition || '';
    this.formWeave = p.attributes?.weaveType || '';
    this.formGsm = p.attributes?.gsm || 280;
    this.formOccasion = p.attributes?.occasion || '';
    this.formImageUrl = p.featuredImage;
    this.formColorName =
      p.colors && p.colors.length ? p.colors[0].name : 'Primary';
    this.formColorHex =
      p.colors && p.colors.length ? p.colors[0].hex : '#111827';
    this.formTagsStr = p.tags ? p.tags.join(', ') : '';
    this.showProductFormModal.set(true);
  }

  closeProductFormModal(): void {
    this.showProductFormModal.set(false);
  }

  saveProduct(): void {
    if (!this.formTitle || !this.formPrice) return;

    const slug = this.formTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const tags = this.formTagsStr
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const productPayload: Product = {
      id:
        this.isEditingMode() && this.editingProductId()
          ? this.editingProductId()!
          : `prod-${Date.now()}`,
      slug:
        this.isEditingMode() && this.editingProductId()
          ? this.productStore
              .products()
              .find((p) => p.id === this.editingProductId())?.slug || slug
          : slug,
      title: this.formTitle,
      brand: this.formBrand,
      category: this.formCategory,
      description: this.formDescription,
      price: this.formPrice,
      compareAtPrice: this.formComparePrice,
      currency: 'NGN',
      unit: this.formUnit,
      yardStep: this.formUnit === 'yard' ? 0.5 : undefined,
      minOrderQty: this.formMinOrderQty,
      rating: 5.0,
      reviewCount: 1,
      stockStatus: this.formStockStatus,
      stockQty: this.formStockQty,
      featuredImage: this.formImageUrl,
      images: [this.formImageUrl],
      colors: [{ name: this.formColorName, hex: this.formColorHex }],
      attributes: {
        materialComposition: this.formComposition,
        weaveType: this.formWeave,
        gsm: this.formGsm,
        occasion: this.formOccasion,
      },
      tags,
      aspectRatio: '3:4',
      reviews: [],
    };

    if (this.isEditingMode()) {
      this.productStore.updateProduct(productPayload);
    } else {
      this.productStore.addProduct(productPayload);
    }

    this.showProductFormModal.set(false);
  }

  confirmDeleteProduct(p: Product): void {
    this.productToDelete.set(p);
  }

  executeDelete(): void {
    const prod = this.productToDelete();
    if (!prod) return;
    this.productStore.deleteProduct(prod.id);
    this.productToDelete.set(null);
  }

  openAiModelGenerator(): void {
    this.showAiModal.set(true);
  }

  openAiModelForProduct(p: Product): void {
    this.modalProductId = p.id;
    this.showAiModal.set(true);
  }

  triggerAiGeneration(): void {
    this.adminStore
      .generateAiModelShot({
        productId: this.modalProductId,
        skinTone: this.modalSkinTone,
        garment: this.modalGarment,
        angle: this.modalAngle,
      })
      .then(() => {
        this.showAiModal.set(false);
      });
  }
}
