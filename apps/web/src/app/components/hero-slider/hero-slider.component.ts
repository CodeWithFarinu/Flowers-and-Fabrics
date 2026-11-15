import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface HeroSlide {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  imageUrl: string;
  eyebrow: string;
  accentStat: { label: string; value: string };
}

@Component({
  selector: 'atelier-hero-slider',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './hero-slider.component.html',
  styleUrl: './hero-slider.component.scss',
})
export class HeroSliderComponent implements OnInit, OnDestroy {
  readonly currentSlideIndex = signal<number>(0);
  readonly progressPercent = signal<number>(0);

  private slideInterval: any;
  private progressInterval: any;
  private readonly SLIDE_DURATION_MS = 6500;
  private readonly TICK_MS = 50;

  readonly slides: HeroSlide[] = [
    {
      id: 'slide-1',
      badge: 'Lagos Bespoke Drop · No. 04',
      eyebrow: 'Bespoke Senator Edit',
      title: 'Crafted for Royalty.<br />Tailored for You.',
      subtitle:
        'Super 160s Italian Cashmere wools with non-creasing tropical weave. Precision cut in 0.5-yard steps.',
      ctaText: 'Explore Senator Curations',
      ctaLink: '/collections/senator-wools',
      secondaryCtaText: 'Launch AI Silhouette',
      secondaryCtaLink: '/studio',
      imageUrl:
        'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1600&q=85',
      accentStat: { value: '₦42,000 / yd', label: '160s Pure Cashmere' },
    },
    {
      id: 'slide-2',
      badge: 'Imperial St. Gallen Voile',
      eyebrow: 'Swiss Voile & Organza Lace',
      title: 'Scalloped Elegance.<br />Woven With 24K Gold.',
      subtitle:
        'Pure St. Gallen grade Swiss lace with metallic filigree for Nigerian high-society weddings and coronations.',
      ctaText: 'Discover Imperial Lace',
      ctaLink: '/collections/swiss-lace',
      secondaryCtaText: 'Request Swatch Box',
      secondaryCtaLink: '/stores',
      imageUrl:
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1600&q=85',
      accentStat: { value: '24K Gold', label: 'Embroidered Filigree' },
    },
    {
      id: 'slide-3',
      badge: 'Sovereign Horology & Objets',
      eyebrow: 'Lagos Automatique Series',
      title: 'Micro-Engineered.<br />Architectural Weight.',
      subtitle:
        'Onyx, titanium, and 18K yellow gold precision cufflinks engineered specifically to anchor heavy Senator cuffs.',
      ctaText: 'View Fine Accessories',
      ctaLink: '/collections/cufflinks-horology',
      secondaryCtaText: 'Book VIP Fitting',
      secondaryCtaLink: '/stores',
      imageUrl:
        'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1600&q=85',
      accentStat: { value: 'Grade 5', label: 'Titanium Hardware' },
    },
    {
      id: 'slide-flowers',
      badge: 'Ceremonial & Bridal Flora',
      eyebrow: 'Haute Floral Styling',
      title: 'Royal Bridal Blooms.<br />Bespoke Ceremonial Florals.',
      subtitle:
        'Cascading orchids, velvet rose curation, and bridal party florals designed to complement haute couture Nigerian textiles.',
      ctaText: 'Explore Floral Curations',
      ctaLink: '/collections/luxury-flowers',
      secondaryCtaText: 'WhatsApp Floral Concierge',
      secondaryCtaLink: '/help',
      imageUrl:
        'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1600&q=85',
      accentStat: {
        value: 'Fresh & Preserved',
        label: 'Artisan Floral Suites',
      },
    },
    {
      id: 'slide-4',
      badge: 'Limited Run: 250 Pairs',
      eyebrow: 'Verified Luxury Streetwear',
      title: 'Teepha Signature High.<br />Obsidian & Chalk White.',
      subtitle:
        'Italian calfskin upper, waxed cotton laces, and sculpted rubber cupsole. 100% verified authenticity.',
      ctaText: 'Shop Footwear Drop',
      ctaLink: '/collections/verified-sneakers',
      imageUrl:
        'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1600&q=85',
      accentStat: { value: '250 Pairs', label: 'Hand-Numbered Edition' },
    },
  ];

  ngOnInit(): void {
    this.startAutoPlay();
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  private startAutoPlay(): void {
    this.stopAutoPlay();
    const step = (this.TICK_MS / this.SLIDE_DURATION_MS) * 100;

    this.progressInterval = setInterval(() => {
      this.progressPercent.update((p) => {
        if (p >= 100) {
          this.nextSlide();
          return 0;
        }
        return p + step;
      });
    }, this.TICK_MS);
  }

  private stopAutoPlay(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
  }

  goToSlide(index: number): void {
    this.currentSlideIndex.set(index);
    this.progressPercent.set(0);
  }

  nextSlide(): void {
    const next = (this.currentSlideIndex() + 1) % this.slides.length;
    this.goToSlide(next);
  }

  prevSlide(): void {
    const prev =
      (this.currentSlideIndex() - 1 + this.slides.length) % this.slides.length;
    this.goToSlide(prev);
  }
}
