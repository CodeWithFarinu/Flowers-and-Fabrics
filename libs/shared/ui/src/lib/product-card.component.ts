import { Component, Input, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Product } from '@shared/models';
import { CartStore, AuthStore } from '@shared/data-access';

@Component({
  selector: 'atelier-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div
      class="product-card atelier-card cursor-pointer"
      [class.compact-mode]="variant === 'compact'"
      [class.horizontal-mode]="variant === 'horizontal'"
      [routerLink]="['/product', product.slug]"
    >
      <div
        class="card-media-wrapper"
        [style.aspect-ratio]="computedAspectRatio"
      >
        <a
          [routerLink]="['/product', product.slug]"
          class="media-link"
          (click)="$event.stopPropagation()"
        >
          <img
            [src]="product.featuredImage"
            [alt]="product.title"
            loading="lazy"
            class="product-image"
          />
        </a>

        @if (product.isExclusiveDrop) {
          <span class="card-badge drop-badge">⚜ EXCLUSIVE DROP</span>
        } @else if (product.stockStatus === 'low_stock') {
          <span class="card-badge low-stock-badge"
            >❖ ONLY {{ product.stockQty }} LEFT</span
          >
        }

        <div class="card-top-actions" (click)="$event.stopPropagation()">
          <!-- Unique User Share Button -->
          <button
            type="button"
            class="top-action-btn share-btn"
            [class.copied]="isShareCopied"
            (click)="shareProduct($event)"
            [title]="
              isShareCopied
                ? 'Referral Link Copied!'
                : 'Share with unique referral code'
            "
            aria-label="Share product"
          >
            @if (isShareCopied) {
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#10b981"
                stroke-width="2.5"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            } @else {
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
            }
          </button>

          <!-- Favourite / Wishlist Button -->
          <button
            type="button"
            class="top-action-btn wishlist-btn"
            [class.active]="isWishlisted"
            (click)="toggleWishlist($event)"
            aria-label="Save to Wishlist"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              [attr.fill]="isWishlisted ? 'currentColor' : 'none'"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
              ></path>
            </svg>
          </button>
        </div>

        <div class="card-hover-actions" (click)="$event.stopPropagation()">
          <button
            type="button"
            class="quick-add-btn"
            (click)="quickAddToCart($event)"
          >
            + Quick Add
          </button>
        </div>
      </div>

      <div class="card-content">
        <div class="brand-rating-row">
          <span class="brand-name">{{ product.brand | uppercase }}</span>
          <span class="rating-pill">
            ★ {{ product.rating }}
            <span class="review-count">({{ product.reviewCount }})</span>
          </span>
        </div>

        <h3 class="product-title">
          <a
            [routerLink]="['/product', product.slug]"
            class="title-link"
            (click)="$event.stopPropagation()"
          >
            {{ product.title }}
          </a>
        </h3>

        <div class="price-row price-display">
          <span class="current-price">
            ₦{{ product.price.toLocaleString() }}
            <span class="price-unit">/ {{ product.unit }}</span>
          </span>
          @if (product.compareAtPrice) {
            <span class="compare-price"
              >₦{{ product.compareAtPrice.toLocaleString() }}</span
            >
          }
        </div>

        @if (product.colors && product.colors.length > 0) {
          <div class="swatches-row">
            @for (c of product.colors.slice(0, 4); track c.name) {
              <span
                class="swatch-dot"
                [style.background-color]="c.hex"
                [title]="c.name"
              ></span>
            }
            @if (product.colors.length > 4) {
              <span class="more-colors">+{{ product.colors.length - 4 }}</span>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .product-card {
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        border-radius: var(--radius-md);
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        cursor: pointer;
      }

      .product-card:hover {
        box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
        transform: translateY(-2px);
      }

      .card-media-wrapper {
        position: relative;
        width: 100%;
        overflow: hidden;
        background: var(--surface);
      }

      .media-link {
        display: block;
        width: 100%;
        height: 100%;
      }

      .product-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .product-card:hover .product-image {
        transform: scale(1.04);
      }

      .card-badge {
        position: absolute;
        top: 10px;
        left: 10px;
        font-size: 0.65rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        padding: 3px 8px;
        border-radius: var(--radius-xs);
        z-index: 2;
      }

      .drop-badge {
        background: var(--inverse-bg);
        color: var(--inverse-text);
      }

      .low-stock-badge {
        background: rgba(220, 38, 38, 0.9);
        color: #fff;
      }

      .card-top-actions {
        position: absolute;
        top: 10px;
        right: 10px;
        display: flex;
        align-items: center;
        gap: 6px;
        z-index: 3;
      }

      .top-action-btn {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: rgba(var(--bg), 0.88);
        backdrop-filter: blur(8px);
        border: 1px solid var(--border);
        color: var(--text);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.15s ease;
        padding: 0;
      }

      .top-action-btn:hover {
        background: var(--surface);
        transform: scale(1.08);
      }

      .share-btn.copied {
        border-color: #10b981;
        background: rgba(16, 185, 129, 0.15);
      }

      .wishlist-btn.active {
        color: var(--status-danger);
        border-color: var(--status-danger);
      }

      .card-hover-actions {
        position: absolute;
        bottom: 12px;
        left: 12px;
        right: 12px;
        opacity: 0;
        transform: translateY(8px);
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        z-index: 2;
      }

      .product-card:hover .card-hover-actions {
        opacity: 1;
        transform: translateY(0);
      }

      @media (hover: none) {
        .card-hover-actions {
          opacity: 1;
          transform: translateY(0);
          position: static;
          padding: 8px 12px;
        }
      }

      .quick-add-btn {
        width: 100%;
        background: var(--inverse-bg);
        color: var(--inverse-text);
        border: none;
        border-radius: var(--radius-full);
        padding: 8px 14px;
        font-weight: 600;
        font-size: 0.8rem;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        transition: transform 0.15s ease;
      }

      .quick-add-btn:hover {
        transform: scale(1.02);
      }

      .card-content {
        padding: 14px;
        display: flex;
        flex-direction: column;
        flex: 1;
      }

      .brand-rating-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;
      }

      .brand-name {
        font-size: 0.65rem;
        letter-spacing: 0.08em;
        font-weight: 700;
        color: var(--text-muted);
      }

      .rating-pill {
        font-size: 0.7rem;
        font-weight: 600;
        color: var(--text);
      }

      .review-count {
        color: var(--text-muted);
        font-weight: 400;
      }

      .product-title {
        margin: 2px 0 8px;
        font-size: 0.9rem;
        font-weight: 600;
        line-height: 1.35;
      }

      .title-link {
        color: var(--text);
        text-decoration: none;
        transition: color 0.15s ease;
      }

      .title-link:hover {
        opacity: 0.8;
      }

      .price-row {
        display: flex;
        align-items: baseline;
        gap: 8px;
        margin-top: auto;
      }

      .current-price {
        font-size: 1.05rem;
        font-weight: 700;
        color: var(--text);
      }

      .price-unit {
        font-size: 0.725rem;
        font-weight: 400;
        color: var(--text-muted);
      }

      .compare-price {
        font-size: 0.8rem;
        text-decoration: line-through;
        color: var(--text-subtle);
      }

      .swatches-row {
        display: flex;
        align-items: center;
        gap: 5px;
        margin-top: 10px;
      }

      .swatch-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 1px solid var(--border);
      }

      .more-colors {
        font-size: 0.65rem;
        color: var(--text-muted);
      }
    `,
  ],
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Input() variant: 'masonry' | 'compact' | 'horizontal' = 'masonry';
  @Input() aspectRatio?: string;

  @Output() quickBuy = new EventEmitter<Product>();

  private router = inject(Router);
  private cartStore = inject(CartStore);
  private authStore = inject(AuthStore);
  isWishlisted = false;
  isShareCopied = false;

  get computedAspectRatio(): string {
    if (this.aspectRatio) {
      return this.aspectRatio;
    }
    if (this.product.aspectRatio) {
      switch (this.product.aspectRatio) {
        case '16:9':
          return '16 / 9';
        case '4:3':
          return '4 / 3';
        case '1:1':
          return '1 / 1';
        case '3:4':
          return '3 / 4';
        case '2:3':
          return '2 / 3';
        case '4:5':
          return '4 / 5';
        default:
          return '4 / 5';
      }
    }
    return '4 / 5';
  }

  shareProduct(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();

    const user = this.authStore.currentUser();
    const refCode = user?.id ? user.id.replace('usr-', '') : 'VIP';
    const origin =
      typeof window !== 'undefined'
        ? window.location.origin
        : 'https://teepha.com';
    const shareUrl = `${origin}/product/${this.product.slug}?ref=${refCode}`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator
        .share({
          title: `${this.product.title} | Teepha Flowers & Fabrics`,
          text: `Check out ${this.product.title} at Teepha Flowers & Fabrics, Lagos:`,
          url: shareUrl,
        })
        .catch(() => {});
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        this.isShareCopied = true;
        setTimeout(() => {
          this.isShareCopied = false;
        }, 2200);
      });
    }
  }

  toggleWishlist(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();
    this.isWishlisted = !this.isWishlisted;
  }

  quickAddToCart(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();
    this.cartStore.addItem(this.product);
  }
}
