import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonButtons,
} from '@ionic/angular';
import { ProductStore, CartStore } from '@shared/data-access';
import { ThemeToggleComponent, ProductCardComponent } from '@shared/ui';

@Component({
  selector: 'atelier-mobile-feed',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonRefresher,
    IonRefresherContent,
    IonButtons,
    ThemeToggleComponent,
    ProductCardComponent,
  ],
  templateUrl: './mobile-feed.component.html',
  styleUrl: './mobile-feed.component.scss',
})
export class MobileFeedComponent {
  readonly productStore = inject(ProductStore);

  handleRefresh(event: any): void {
    setTimeout(() => {
      this.productStore.refreshFeed();
      event.target.complete();
    }, 600);
  }
}
