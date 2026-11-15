import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular';
import { AiStudioStore, ProductStore, AuthStore } from '@shared/data-access';
import { GarmentType, StylePreviewPrompt } from '@shared/models';

@Component({
  selector: 'atelier-mobile-studio',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
  ],
  templateUrl: './mobile-studio.component.html',
  styleUrl: './mobile-studio.component.scss',
})
export class MobileStudioComponent {
  readonly aiStudioStore = inject(AiStudioStore);
  readonly productStore = inject(ProductStore);
  readonly authStore = inject(AuthStore);

  fabricList = signal(
    this.productStore.products().filter((p) => p.category === 'fabrics'),
  );
  selectedFabricId = signal(this.fabricList()[0]?.id || 'prod-002');
  selectedGarment = signal<GarmentType>('senator');
  customNotes = '';

  generate(): void {
    const fab = this.fabricList().find((f) => f.id === this.selectedFabricId());
    if (!fab) return;

    const prompt: StylePreviewPrompt = {
      fabricId: fab.id,
      fabricTitle: fab.title,
      fabricImageUrl: fab.featuredImage,
      garmentType: this.selectedGarment(),
      fit: 'slim_fit',
      skinTone: 'deep_melanin',
      accessoryNotes: this.customNotes,
    };

    this.aiStudioStore.generatePreview(prompt);
  }

  getWhatsAppUrl(res: any): string {
    const text = encodeURIComponent(
      `Hello Master Tailor, here is the Teepha AI Style Preview for my bespoke outfit: ${res.renderedImageUrl}`,
    );
    return `https://wa.me/?text=${text}`;
  }
}
