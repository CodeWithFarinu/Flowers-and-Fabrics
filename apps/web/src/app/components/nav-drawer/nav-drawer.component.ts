import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  ATELIER_COLLECTIONS,
  AuthStore,
  CartStore,
  ProductStore,
  PushNotificationService,
} from '@shared/data-access';
import { ThemeToggleComponent } from '@shared/ui';

@Component({
  selector: 'atelier-nav-drawer',
  standalone: true,
  imports: [CommonModule, RouterModule, ThemeToggleComponent],
  templateUrl: './nav-drawer.component.html',
  styleUrl: './nav-drawer.component.scss',
})
export class NavDrawerComponent {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() installRequested = new EventEmitter<void>();

  readonly authStore = inject(AuthStore);
  readonly cartStore = inject(CartStore);
  readonly productStore = inject(ProductStore);
  readonly pushService = inject(PushNotificationService);
  readonly collections = ATELIER_COLLECTIONS;

  openBag(): void {
    this.close.emit();
    this.cartStore.toggle(true);
  }

  triggerInstall(): void {
    this.close.emit();
    this.installRequested.emit();
  }

  async togglePush(): Promise<void> {
    if (this.pushService.isSubscribed()) {
      await this.pushService.unsubscribe();
    } else {
      await this.pushService.requestPermissionAndSubscribe();
    }
  }
}
