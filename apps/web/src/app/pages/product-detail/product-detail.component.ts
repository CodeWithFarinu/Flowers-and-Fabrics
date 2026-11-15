import {
  Component,
  inject,
  signal,
  OnInit,
  OnDestroy,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  ProductStore,
  CartStore,
  CheckoutStore,
  AuthStore,
  PreloaderService,
} from '@shared/data-access';
import { Product, ProductReview } from '@shared/models';
import {
  YardageSelectorComponent,
  FabricCalculatorModalComponent,
  ProductCardComponent,
} from '@shared/ui';

@Component({
  selector: 'atelier-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    YardageSelectorComponent,
    FabricCalculatorModalComponent,
    ProductCardComponent,
  ],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss',
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  readonly productStore = inject(ProductStore);
  readonly cartStore = inject(CartStore);
  readonly checkoutStore = inject(CheckoutStore);
  readonly authStore = inject(AuthStore);
  private preloaderService = inject(PreloaderService);

  readonly product = computed<Product | null>(() =>
    this.productStore.selectedProduct(),
  );

  readonly activeImageIndex = signal<number>(0);
  readonly autoSlideProgress = signal<number>(0);
  readonly isAutoSlidePaused = signal<boolean>(false);

  readonly selectedColor = signal<string>('');
  readonly selectedSize = signal<string>('');
  readonly selectedQuantity = signal<number>(4);
  readonly showCalculator = signal<boolean>(false);

  readonly swatchAdded = signal<boolean>(false);
  readonly requestTailorConcierge = signal<boolean>(false);
  readonly showMacroInspection = signal<boolean>(false);

  // Auto-Slide Interval
  private slideTimer: any;
  private progressTimer: any;
  private readonly SLIDE_DURATION = 4200; // 4.2 seconds
  private readonly PROGRESS_TICK = 60;

  // In-page AI Silhouette Generator State
  customAiPrompt =
    'Slim-fit Senator with hidden placket, Mandarin collar, and hand-embroidered pocket crest';
  readonly isGeneratingAi = signal<boolean>(false);
  readonly aiGeneratedOutput = signal<{
    imageUrl: string;
    title: string;
    promptUsed: string;
  } | null>(null);
  readonly lookbookSaved = signal<boolean>(false);

  // Reviews State
  readonly showReviewForm = signal<boolean>(false);
  newRating = 5;
  newAuthorName = '';
  newCity = '';
  newComment = '';

  readonly allGalleryImages = computed(() => {
    const prod = this.product();
    if (!prod) return [];
    const images: { url: string; label: string; isAi: boolean }[] = [];

    // Main and variant images
    prod.images.forEach((img, idx) => {
      images.push({ url: img, label: `Angle ${idx + 1}`, isAi: false });
    });

    // AI model views
    if (prod.aiModelViews) {
      prod.aiModelViews.forEach((aim) => {
        images.push({
          url: aim.imageUrl,
          label: `AI ${aim.garment}`,
          isAi: true,
        });
      });
    }

    return images;
  });

  // Generates a rich 16-item full-width Pinterest masonry catalog matching the feed
  readonly relatedProducts = computed<Product[]>(() => {
    const prod = this.product();
    if (!prod) return [];
    const all = this.productStore.products();
    const others = all.filter((p) => p.id !== prod.id);

    const aspectRatios: ('4:5' | '3:4' | '16:9' | '4:3' | '1:1' | '2:3')[] = [
      '4:5',
      '3:4',
      '16:9',
      '4:3',
      '1:1',
      '2:3',
      '4:5',
      '3:4',
    ];

    const wallItems: Product[] = [];
    for (let round = 0; round < 2; round++) {
      others.forEach((p, idx) => {
        const assignedRatio =
          aspectRatios[(round * others.length + idx) % aspectRatios.length];
        wallItems.push({
          ...p,
          id: `${p.id}-wall-${round}`,
          aspectRatio: (p.aspectRatio || assignedRatio) as any,
        });
      });
    }

    return wallItems.slice(0, 16);
  });

  orderSwatchSample(): void {
    const p = this.product();
    if (!p) return;
    this.cartStore.addItem({
      ...p,
      id: `${p.id}-swatch-sample`,
      title: `${p.title} (4-Inch Certified Fabric Swatch Card)`,
      price: 2500,
      compareAtPrice: undefined,
      unit: 'piece',
    });
    this.swatchAdded.set(true);
    setTimeout(() => this.swatchAdded.set(false), 3000);
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      if (slug) {
        const found = this.productStore.selectProductBySlug(slug);
        const prod = found || this.product();
        if (prod) {
          this.initProductState(prod);
        }
      }
    });
  }

  private initProductState(prod: Product): void {
    this.activeImageIndex.set(0);
    this.selectedColor.set(prod.colors[0]?.name || '');
    this.selectedSize.set(prod.sizes ? prod.sizes[0] : '');
    this.selectedQuantity.set(prod.minOrderQty || 4);
    this.aiGeneratedOutput.set(null);
    this.lookbookSaved.set(false);

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    this.startAutoSlide();
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }

  private startAutoSlide(): void {
    this.stopAutoSlide();
    this.autoSlideProgress.set(0);
    const step = (this.PROGRESS_TICK / this.SLIDE_DURATION) * 100;

    this.progressTimer = setInterval(() => {
      if (this.isAutoSlidePaused()) return;
      this.autoSlideProgress.update((p) => {
        if (p >= 100) {
          this.nextGalleryImage();
          return 0;
        }
        return p + step;
      });
    }, this.PROGRESS_TICK);
  }

  private stopAutoSlide(): void {
    if (this.progressTimer) {
      clearInterval(this.progressTimer);
    }
  }

  pauseAutoSlide(): void {
    this.isAutoSlidePaused.set(true);
  }

  resumeAutoSlide(): void {
    this.isAutoSlidePaused.set(false);
  }

  selectGalleryImage(index: number): void {
    const imgs = this.allGalleryImages();
    if (index >= 0 && index < imgs.length) {
      this.activeImageIndex.set(index);
      this.autoSlideProgress.set(0);
    }
  }

  prevGalleryImage(): void {
    const imgs = this.allGalleryImages();
    const prev = (this.activeImageIndex() - 1 + imgs.length) % imgs.length;
    this.selectGalleryImage(prev);
  }

  nextGalleryImage(): void {
    const imgs = this.allGalleryImages();
    const next = (this.activeImageIndex() + 1) % imgs.length;
    this.selectGalleryImage(next);
  }

  onYardageCalculated(yards: number): void {
    this.selectedQuantity.set(yards);
    this.showCalculator.set(false);
  }

  addToCart(): void {
    const p = this.product();
    if (!p) return;
    this.cartStore.addItem(
      p,
      p.unit === 'yard' ? this.selectedQuantity() : 1,
      this.selectedColor(),
      this.selectedSize(),
    );
    this.cartStore.toggle(true);
  }

  buyNow(): void {
    this.addToCart();
    this.router.navigate(['/checkout']);
  }

  getWhatsAppUrl(prod: Product): string {
    const msg = encodeURIComponent(
      `Hello Teepha Flowers & Fabrics Concierge, I am viewing "${prod.title}" (₦${prod.price.toLocaleString()} / ${prod.unit}). I would like to inquire about swatch box delivery, bridal florals, and custom requirements.`,
    );
    return `https://wa.me/2348000000000?text=${msg}`;
  }

  setPrompt(preset: string): void {
    this.customAiPrompt = preset;
  }

  async generateAiDesign(): Promise<void> {
    if (!this.customAiPrompt.trim()) return;
    this.isGeneratingAi.set(true);

    this.authStore.useAiToken();
    await new Promise((resolve) => setTimeout(resolve, 900));

    const sampleImages = [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=80',
    ];
    const pickedImage =
      sampleImages[Math.floor(Math.random() * sampleImages.length)];

    this.aiGeneratedOutput.set({
      imageUrl: pickedImage,
      title: `Bespoke Silhouette: ${this.customAiPrompt
        .split(' ')
        .slice(0, 4)
        .join(' ')}`,
      promptUsed: this.customAiPrompt,
    });
    this.isGeneratingAi.set(false);
  }

  saveLookbookToAccount(): void {
    this.lookbookSaved.set(true);
  }

  scrollToReviews(): void {
    if (typeof document !== 'undefined') {
      const el = document.getElementById('reviewsSection');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  submitReview(event: Event): void {
    event.preventDefault();
    const prod = this.product();
    if (!prod || !this.newAuthorName || !this.newComment) return;

    const review: ProductReview = {
      id: `rev-${Date.now()}`,
      authorName: this.newAuthorName,
      rating: this.newRating,
      date: 'Just now',
      comment: this.newComment,
      verifiedBuyer: true,
      city: this.newCity || 'Lagos, Nigeria',
      fitFeedback: 'Verified Buyer',
    };

    this.productStore.addReviewToProduct(prod.id, review);
    this.newComment = '';
    this.showReviewForm.set(false);
  }
}
