import { Component, signal, OnDestroy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  ProductStore,
  PreloaderService,
  CommunityFitSubmission,
} from '@shared/data-access';

export type StoryRailCategory = 'runway' | 'craftsmen' | 'patrons';

export interface LuxeStory {
  id: string;
  category: StoryRailCategory;
  author: string;
  avatarUrl: string;
  title: string;
  caption: string;
  marketingBadge: string;
  iconType:
    | 'shears'
    | 'coronet'
    | 'tourbillon'
    | 'caduceus'
    | 'fleur'
    | 'needle'
    | 'signet'
    | 'seal';
  slides: {
    imageUrl: string;
    productTitle?: string;
    productSlug?: string;
    price?: number;
    promoCode?: string;
  }[];
  isLive?: boolean;
}

@Component({
  selector: 'atelier-stories-rail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './stories-rail.component.html',
  styleUrl: './stories-rail.component.scss',
})
export class StoriesRailComponent implements OnDestroy {
  readonly productStore = inject(ProductStore);
  private preloaderService = inject(PreloaderService);

  readonly activeRail = signal<StoryRailCategory>('runway');
  readonly activeStory = signal<LuxeStory | null>(null);
  readonly activeSlideIndex = signal<number>(0);
  readonly slideProgress = signal<number>(0);
  readonly viewedStoryIds = signal<Set<string>>(new Set());

  readonly showUploadModal = signal<boolean>(false);
  readonly uploadSuccess = signal<boolean>(false);

  fitForm = {
    patronName: '',
    handle: '',
    fabricTitle: '',
    tailorName: '',
    city: 'Victoria Island, Lagos',
    occasion: '',
    imageUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
  };

  private slideTimer: any;
  private readonly SLIDE_DURATION = 5000;
  private readonly TICK_MS = 60;

  readonly curatedStories: LuxeStory[] = [
    // RAIL 1: RUNWAY & EDITORIAL DROPS
    {
      id: 'story-runway-1',
      category: 'runway',
      title: 'VI Vault Live',
      author: 'Teepha Victoria Island',
      avatarUrl:
        'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=200&q=80',
      caption:
        'Inside our Ahmadu Bello Way vault. Super 160s Italian Cashmere wool bolts ready for this evening’s bespoke fittings.',
      marketingBadge: '10% GUILD CODE',
      iconType: 'caduceus',
      isLive: true,
      slides: [
        {
          imageUrl:
            'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80',
          productTitle: 'Midnight Obsidian Italian Cashmere 160s Wool',
          productSlug: 'midnight-italian-cashmere-senator',
          price: 42000,
        },
      ],
    },
    {
      id: 'story-runway-2',
      category: 'runway',
      title: 'Royal Weddings',
      author: 'Aso-Ebi Concierge',
      avatarUrl:
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=200&q=80',
      caption:
        'St. Gallen Swiss Voile with 24K metallic threading styled for an Ikoyi coronation wedding.',
      marketingBadge: 'VIP CORONATION',
      iconType: 'coronet',
      slides: [
        {
          imageUrl:
            'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
          productTitle: 'Emerald & Gold Swiss Voile Imperial Lace',
          productSlug: 'emerald-gold-swiss-voile-lace',
          price: 85000,
        },
      ],
    },
    {
      id: 'story-runway-3',
      category: 'runway',
      title: 'Horology Vault',
      author: 'Teepha Horology',
      avatarUrl:
        'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=200&q=80',
      caption:
        'Lagos Automatique 41mm Monochrome Chronograph anchoring double-cuff Italian Cashmere.',
      marketingBadge: 'CALIBRE IX',
      iconType: 'tourbillon',
      slides: [
        {
          imageUrl:
            'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
          productTitle: 'Lagos Automatique 41mm Monochrome Chronograph',
          productSlug: 'chronograph-monochrome-timepiece',
          price: 195000,
        },
      ],
    },
    {
      id: 'story-runway-4',
      category: 'runway',
      title: 'Limited Drops',
      author: 'Teepha Footwear',
      avatarUrl:
        'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=200&q=80',
      caption:
        'Teepha Signature High in Obsidian & Chalk White. Hand-numbered edition of 250 pairs.',
      marketingBadge: 'ONLY 250 PAIRS',
      iconType: 'signet',
      slides: [
        {
          imageUrl:
            'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80',
          productTitle:
            'Teepha Signature High "Obsidian & Chalk" Limited Sneaker',
          productSlug: 'retro-og-monochrome-sneakers',
          price: 98000,
        },
      ],
    },
    {
      id: 'story-runway-5',
      category: 'runway',
      title: 'Botanical Adire',
      author: 'Abeokuta Indigo Guild',
      avatarUrl:
        'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=200&q=80',
      caption:
        'Pure silk satin botanical resist-dye motifs from Ogun State indigo artisans.',
      marketingBadge: 'HAND RESIST-DYED',
      iconType: 'fleur',
      slides: [
        {
          imageUrl:
            'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
          productTitle: 'Hand-Crafted Botanical Indigo Adire Silk Satin',
          productSlug: 'botanical-indigo-adire-silk',
          price: 64000,
        },
      ],
    },

    // RAIL 2: MASTER TAILORS & BESPOKE GUILD
    {
      id: 'story-craft-1',
      category: 'craftsmen',
      title: 'Savile Row VI',
      author: 'Bespoke Teepha Guild',
      avatarUrl:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      caption:
        'Hand-basting canvas chest pieces and concealed button plackets on a 4-yard Senator cut.',
      marketingBadge: 'BESPOKE CUT',
      iconType: 'shears',
      slides: [
        {
          imageUrl:
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
          productTitle: '150s Pure White Egyptian Giza Cotton Voile',
          productSlug: 'pure-white-giza-cotton-voile',
          price: 48000,
        },
      ],
    },
    {
      id: 'story-craft-2',
      category: 'craftsmen',
      title: 'Grand Agbada',
      author: 'Iseyin Master Weavers',
      avatarUrl:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      caption:
        'Precision 7-yard cutting technique for a cascading 4-piece Chieftaincy Agbada drape.',
      marketingBadge: '7-YARD BOLT',
      iconType: 'needle',
      slides: [
        {
          imageUrl:
            'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
          productTitle: 'Venetian Imperial Gold-Threaded Damask Brocade',
          productSlug: 'imperial-damask-gold-brocade',
          price: 92000,
        },
      ],
    },
    {
      id: 'story-craft-3',
      category: 'craftsmen',
      title: 'Mandarin Collar',
      author: 'Maitama Tailor Salon',
      avatarUrl:
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
      caption:
        'French lightweight interfacing applied inside Senator collar to withstand Abuja humidity.',
      marketingBadge: 'FRENCH CANVAS',
      iconType: 'seal',
      slides: [
        {
          imageUrl:
            'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80',
          productTitle: 'Midnight Obsidian Italian Cashmere 160s Wool',
          productSlug: 'midnight-italian-cashmere-senator',
          price: 42000,
        },
      ],
    },
    {
      id: 'story-craft-4',
      category: 'craftsmen',
      title: 'Swiss Voile Cut',
      author: 'St. Gallen Liaison',
      avatarUrl:
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=200&q=80',
      caption:
        'Laser-guided scallop edge preservation on imperial Swiss voile lace yardage.',
      marketingBadge: 'SWISS CERTIFIED',
      iconType: 'fleur',
      slides: [
        {
          imageUrl:
            'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
          productTitle: 'Emerald & Gold Swiss Voile Imperial Lace',
          productSlug: 'emerald-gold-swiss-voile-lace',
          price: 85000,
        },
      ],
    },
  ];

  readonly approvedCommunityFits = computed<CommunityFitSubmission[]>(() =>
    this.productStore.approvedFitSubmissions(),
  );

  readonly displayedStories = computed<LuxeStory[]>(() => {
    const rail = this.activeRail();
    if (rail === 'runway') {
      return this.curatedStories.filter((s) => s.category === 'runway');
    }
    if (rail === 'craftsmen') {
      return this.curatedStories.filter((s) => s.category === 'craftsmen');
    }
    // Patron rail: dynamically convert approved community fits to story format
    const communityStories: LuxeStory[] = this.approvedCommunityFits().map(
      (fit) => ({
        id: `patron-story-${fit.id}`,
        category: 'patrons',
        title: fit.patronName.split(' ')[0] + `'s Look`,
        author: fit.handle
          ? `${fit.patronName} (${fit.handle})`
          : fit.patronName,
        avatarUrl:
          fit.imageUrl ||
          fit.photoUrl ||
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
        caption: fit.tailorName
          ? `${fit.fabricTitle || fit.fabricUsed} styled by ${fit.tailorName} for ${fit.occasion}.`
          : `${fit.outfitTitle || fit.fabricUsed || 'Bespoke Teepha attire'} in ${fit.city}.`,
        marketingBadge: 'VERIFIED PATRON',
        iconType: 'signet',
        slides: [
          {
            imageUrl:
              fit.imageUrl ||
              fit.photoUrl ||
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
            productTitle:
              fit.fabricTitle || fit.outfitTitle || 'Bespoke Luxury Piece',
            productSlug: fit.productSlug || 'midnight-italian-cashmere-senator',
            price: 42000,
          },
        ],
      }),
    );

    return communityStories;
  });

  openStory(story: LuxeStory): void {
    this.activeStory.set(story);
    this.activeSlideIndex.set(0);
    this.slideProgress.set(0);
    this.viewedStoryIds.update((set) => new Set(set).add(story.id));
    this.startStoryTimer();
  }

  closeStory(): void {
    this.stopStoryTimer();
    this.activeStory.set(null);
  }

  private startStoryTimer(): void {
    this.stopStoryTimer();
    this.slideProgress.set(0);
    const step = (this.TICK_MS / this.SLIDE_DURATION) * 100;

    this.slideTimer = setInterval(() => {
      this.slideProgress.update((p) => {
        if (p >= 100) {
          this.nextSlide();
          return 0;
        }
        return p + step;
      });
    }, this.TICK_MS);
  }

  private stopStoryTimer(): void {
    if (this.slideTimer) {
      clearInterval(this.slideTimer);
    }
  }

  nextSlide(): void {
    const story = this.activeStory();
    if (!story) return;

    if (this.activeSlideIndex() < story.slides.length - 1) {
      this.activeSlideIndex.update((i) => i + 1);
      this.slideProgress.set(0);
    } else {
      const currentList = this.displayedStories();
      const currentIdx = currentList.findIndex((s) => s.id === story.id);
      if (currentIdx !== -1 && currentIdx < currentList.length - 1) {
        this.openStory(currentList[currentIdx + 1]);
      } else {
        this.closeStory();
      }
    }
  }

  prevSlide(): void {
    if (this.activeSlideIndex() > 0) {
      this.activeSlideIndex.update((i) => i - 1);
      this.slideProgress.set(0);
    } else {
      const currentList = this.displayedStories();
      const currentIdx = currentList.findIndex(
        (s) => s.id === this.activeStory()?.id,
      );
      if (currentIdx > 0) {
        this.openStory(currentList[currentIdx - 1]);
      }
    }
  }

  private router = inject(Router);

  onShopThisLook(slug: string, title?: string): void {
    this.closeStory();
    this.preloaderService
      .trigger(
        'Get a worth for ur class',
        `Curating ${title || 'Bespoke Piece'}...`,
        650,
      )
      .then(() => {
        this.router.navigate(['/product', slug]);
      });
  }

  openUploadModal(): void {
    this.uploadSuccess.set(false);
    this.showUploadModal.set(true);
  }

  closeUploadModal(): void {
    this.showUploadModal.set(false);
  }

  submitFit(event: Event): void {
    event.preventDefault();
    if (!this.fitForm.patronName || !this.fitForm.fabricTitle) return;

    this.productStore.submitCommunityFit({
      patronName: this.fitForm.patronName,
      handle: this.fitForm.handle.startsWith('@')
        ? this.fitForm.handle
        : `@${this.fitForm.handle}`,
      fabricTitle: this.fitForm.fabricTitle,
      tailorName: this.fitForm.tailorName,
      city: this.fitForm.city,
      occasion: this.fitForm.occasion,
      imageUrl: this.fitForm.imageUrl,
      productSlug: 'midnight-italian-cashmere-senator',
    });

    this.uploadSuccess.set(true);
  }

  ngOnDestroy(): void {
    this.stopStoryTimer();
  }
}
