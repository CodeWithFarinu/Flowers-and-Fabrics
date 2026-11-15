import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular';
import { CartStore, CheckoutStore, AuthStore } from '@shared/data-access';

@Component({
  selector: 'atelier-mobile-cart',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
  ],
  templateUrl: './mobile-cart.component.html',
  styleUrl: './mobile-cart.component.scss',
})
export class MobileCartComponent {
  readonly cartStore = inject(CartStore);
  readonly checkoutStore = inject(CheckoutStore);
  readonly authStore = inject(AuthStore);

  step = signal<1 | 2>(1);
  copied = signal<boolean>(false);

  onPhoneChange(val: string): void {
    this.checkoutStore.updateForm({ phone: val });
  }

  isPhoneValid(): boolean {
    return this.checkoutStore.customerForm().phone.trim().length >= 10;
  }

  proceedToStep2(): void {
    this.checkoutStore.captureLeadOnBlur();
    this.step.set(2);
  }

  copyAcc(): void {
    navigator.clipboard.writeText(
      this.checkoutStore.virtualAccount().accountNumber,
    );
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }

  resetOrder(): void {
    this.checkoutStore.placedOrder.set(null);
    this.step.set(1);
  }
}
