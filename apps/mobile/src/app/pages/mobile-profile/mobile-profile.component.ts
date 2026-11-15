import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular';
import { AuthStore } from '@shared/data-access';
import { ThemeToggleComponent } from '@shared/ui';

@Component({
  selector: 'atelier-mobile-profile',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    ThemeToggleComponent,
  ],
  templateUrl: './mobile-profile.component.html',
  styleUrl: './mobile-profile.component.scss',
})
export class MobileProfileComponent {
  readonly authStore = inject(AuthStore);

  addTestToken(): void {
    this.authStore.addTokens(1);
  }

  copyAff(): void {
    navigator.clipboard.writeText('https://teepha.com?aff=AFF-BOLU');
    alert('Affiliate link copied to clipboard!');
  }
}
