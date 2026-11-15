import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { AiStudioStore, ProductStore, AuthStore } from '@shared/data-access';
import { GarmentType, Product, StylePreviewPrompt } from '@shared/models';

@Component({
  selector: 'atelier-studio',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './studio.component.html',
  styleUrl: './studio.component.scss',
})
export class StudioComponent implements OnInit {
  private route = inject(ActivatedRoute);
  readonly aiStudioStore = inject(AiStudioStore);
  readonly productStore = inject(ProductStore);
  readonly authStore = inject(AuthStore);

  fabricProducts = signal<Product[]>([]);
  selectedFabric = signal<Product | null>(null);
  selectedGarmentType = signal<GarmentType>('senator');
  selectedFit: 'slim_fit' | 'classic' | 'relaxed' = 'slim_fit';
  selectedSkinTone: 'deep_melanin' | 'warm_caramel' | 'chestnut' | 'fair' =
    'deep_melanin';
  customNotes = '';

  garments: { type: GarmentType; label: string }[] = [
    { type: 'senator', label: 'Executive Senator' },
    { type: 'agbada', label: 'Grand Agbada' },
    { type: 'kaftan', label: 'Modern Kaftan' },
    { type: 'iro_and_buba', label: 'Royal Iro & Buba' },
    { type: 'bespoke_suit', label: 'Bespoke Suit' },
  ];

  ngOnInit(): void {
    const fabrics = this.productStore
      .products()
      .filter((p) => p.category === 'fabrics');
    this.fabricProducts.set(fabrics);

    this.route.queryParamMap.subscribe((params) => {
      const fid = params.get('fabricId');
      if (fid) {
        const found = fabrics.find((f) => f.id === fid);
        if (found) {
          this.selectedFabric.set(found);
          return;
        }
      }
      this.selectedFabric.set(fabrics[0]);
    });
  }

  onFabricChange(id: string): void {
    const f = this.fabricProducts().find((p) => p.id === id);
    if (f) this.selectedFabric.set(f);
  }

  applyPromptSuggestion(prompt: string): void {
    this.customNotes = prompt;
  }

  triggerGeneration(): void {
    const f = this.selectedFabric();
    if (!f) return;

    const prompt: StylePreviewPrompt = {
      fabricId: f.id,
      fabricTitle: f.title,
      fabricImageUrl: f.featuredImage,
      garmentType: this.selectedGarmentType(),
      fit: this.selectedFit,
      skinTone: this.selectedSkinTone,
      accessoryNotes: this.customNotes,
    };

    this.aiStudioStore.generatePreview(prompt);
  }

  getTailorWhatsAppUrl(res: any): string {
    const text = encodeURIComponent(
      `Hello Master Tailor, here is the Teepha AI Style Preview for my upcoming outfit.\n\nGarment: ${res.prompt.garmentType.toUpperCase()}\nFabric: ${res.prompt.fabricTitle}\nLookbook Reference: ${res.renderedImageUrl}`,
    );
    return `https://wa.me/?text=${text}`;
  }
}
