import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductStore, CartStore } from '@shared/data-access';
import { ProductCardComponent } from '@shared/ui';
import { HeroSliderComponent } from '../../components/hero-slider/hero-slider.component';
import { CollectionsRailComponent } from '../../components/collections-rail/collections-rail.component';
import { StoriesRailComponent } from '../../components/stories-rail/stories-rail.component';

@Component({
  selector: 'atelier-feed',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ProductCardComponent,
    HeroSliderComponent,
    CollectionsRailComponent,
    StoriesRailComponent,
  ],
  templateUrl: './feed.component.html',
  styleUrl: './feed.component.scss',
})
export class FeedComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly productStore = inject(ProductStore);

  @ViewChild('infiniteSentinel') infiniteSentinel!: ElementRef<HTMLDivElement>;

  private observer?: IntersectionObserver;

  ngOnInit(): void {
    // Restore scroll position if returning from product detail
    const savedY = this.productStore.getSavedScrollPosition();
    if (savedY > 0 && typeof window !== 'undefined') {
      setTimeout(() => {
        window.scrollTo({ top: savedY, behavior: 'instant' });
      }, 50);
    }
  }

  ngAfterViewInit(): void {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            this.productStore.loadNextBatch();
          }
        },
        { rootMargin: '400px' },
      );

      if (this.infiniteSentinel) {
        this.observer.observe(this.infiniteSentinel.nativeElement);
      }
    }
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined') {
      this.productStore.saveScrollPosition(window.scrollY);
    }
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  onSelectCategory(cat: 'all' | 'fabrics' | 'accessories' | 'sneakers'): void {
    this.productStore.setCategoryFilter(cat);
  }

  onRefresh(): void {
    this.productStore.refreshFeed();
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
