import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  ProductStore,
  ATELIER_COLLECTIONS,
  CollectionMeta,
} from '@shared/data-access';
import { ProductCardComponent } from '@shared/ui';
import { Product } from '@shared/models';

@Component({
  selector: 'atelier-collection-page',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent],
  templateUrl: './collection.component.html',
  styleUrl: './collection.component.scss',
})
export class CollectionPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productStore = inject(ProductStore);

  readonly slug = signal<string>('');
  readonly selectedTag = signal<string>('all');
  readonly sortBy = signal<'featured' | 'price_asc' | 'price_desc' | 'rating'>(
    'featured',
  );

  readonly currentCollection = computed<CollectionMeta | undefined>(() => {
    const s = this.slug();
    return ATELIER_COLLECTIONS.find((c) => c.slug === s);
  });

  readonly collectionProducts = computed<Product[]>(() => {
    const col = this.currentCollection();
    if (!col) return [];
    const all = this.productStore.products();
    return all.filter((p) => {
      if (col.category !== 'all' && p.category !== col.category) {
        return false;
      }
      if (col.tag && !p.tags.includes(col.tag)) {
        return false;
      }
      return true;
    });
  });

  readonly availableTags = computed<string[]>(() => {
    const prods = this.collectionProducts();
    const tagsSet = new Set<string>();
    prods.forEach((p) => p.tags.forEach((t) => tagsSet.add(t)));
    return Array.from(tagsSet);
  });

  readonly filteredProducts = computed<Product[]>(() => {
    let prods = [...this.collectionProducts()];
    const tag = this.selectedTag();
    if (tag !== 'all') {
      prods = prods.filter((p) => p.tags.includes(tag));
    }

    const sort = this.sortBy();
    if (sort === 'price_asc') {
      prods.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc') {
      prods.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      prods.sort((a, b) => b.rating - a.rating);
    }

    return prods;
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const s = params.get('slug') || '';
      this.slug.set(s);
      this.selectedTag.set('all');
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    });
  }

  onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as any;
    this.sortBy.set(value);
  }
}
