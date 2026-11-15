import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSearchbar,
} from '@ionic/angular';
import { ProductStore } from '@shared/data-access';
import { ProductCardComponent } from '@shared/ui';

@Component({
  selector: 'atelier-mobile-explore',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSearchbar,
    ProductCardComponent,
  ],
  templateUrl: './mobile-explore.component.html',
  styleUrl: './mobile-explore.component.scss',
})
export class MobileExploreComponent {
  readonly productStore = inject(ProductStore);

  onSearch(event: any): void {
    const val = event.target.value || '';
    this.productStore.setSearchQuery(val);
  }

  searchTag(tag: string): void {
    this.productStore.setSearchQuery(tag);
  }
}
