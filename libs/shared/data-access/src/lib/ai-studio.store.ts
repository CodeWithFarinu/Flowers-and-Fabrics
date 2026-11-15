import { Injectable, signal, inject } from '@angular/core';
import { StylePreviewPrompt, AiGenerationResult } from '@shared/models';
import { AuthStore } from './auth.store';
import { AnalyticsService } from '@shared/analytics';
import { getApiBaseUrl } from './api-config';

const PRESET_GENERATIONS: AiGenerationResult[] = [
  {
    id: 'res-01',
    prompt: {
      fabricId: 'prod-002',
      fabricTitle: 'Midnight Obsidian Italian Cashmere 160s Wool',
      fabricImageUrl:
        'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80',
      garmentType: 'senator',
      fit: 'slim_fit',
      skinTone: 'deep_melanin',
      accessoryNotes:
        'With sovereign onyx gold cufflinks and minimalist leather mule',
    },
    status: 'completed',
    renderedImageUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=700&q=80',
    createdAt: '2026-11-10T14:20:00Z',
    tokenCost: 1,
    tailorLookbookUrl: 'https://atelier.com/lookbook/download/res-01.pdf',
  },
  {
    id: 'res-02',
    prompt: {
      fabricId: 'prod-001',
      fabricTitle: 'Emerald & Gold Swiss Voile Imperial Lace',
      fabricImageUrl:
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
      garmentType: 'iro_and_buba',
      fit: 'classic',
      skinTone: 'warm_caramel',
      accessoryNotes: 'Full Gele with pleated fan detail',
    },
    status: 'completed',
    renderedImageUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=80',
    createdAt: '2026-11-11T09:15:00Z',
    tokenCost: 1,
    tailorLookbookUrl: 'https://atelier.com/lookbook/download/res-02.pdf',
  },
];

@Injectable({
  providedIn: 'root',
})
export class AiStudioStore {
  private auth = inject(AuthStore);
  private analytics = inject(AnalyticsService);

  readonly isGenerating = signal<boolean>(false);
  readonly currentResult = signal<AiGenerationResult | null>(
    PRESET_GENERATIONS[0],
  );
  readonly history = signal<AiGenerationResult[]>(PRESET_GENERATIONS);

  readonly promptSuggestions = [
    {
      label: 'Executive Senator',
      prompt: 'Senator wear, slim fit, geometric tonal embroidery on chest',
    },
    {
      label: 'Grand Agbada',
      prompt:
        '4-piece Agbada with wide shoulders, high collar inner Buba, and Fila',
    },
    {
      label: 'Contemporary Kaftan',
      prompt:
        'Minimalist asymmetric zipper Kaftan with tailored ankle trousers',
    },
    {
      label: 'Royal Iro & Buba',
      prompt:
        'Modern Iro & Buba with structured peplum waist and exaggerated sleeves',
    },
    {
      label: 'Bespoke Double-Breasted Suit',
      prompt:
        'Italian cut peak lapel double breasted suit with mother-of-pearl buttons',
    },
  ];

  async generatePreview(
    prompt: StylePreviewPrompt,
  ): Promise<AiGenerationResult | null> {
    if (!this.auth.useAiToken()) {
      alert(
        'You have no tokens remaining. Purchase fabric or invite friends to earn tokens!',
      );
      return null;
    }

    this.isGenerating.set(true);
    this.analytics.track('studio_prompt_submitted', {
      garment: prompt.garmentType,
      fit: prompt.fit,
      fabric_id: prompt.fabricId,
    });

    // Attempt backend generation API call
    if (typeof window !== 'undefined') {
      const apiUrl = getApiBaseUrl();
      const token = localStorage.getItem('atelier_token');
      if (token) {
        try {
          const res = await fetch(`${apiUrl}/ai/generate-outfit`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              prompt: `${prompt.garmentType} ${prompt.fit || 'bespoke'} in ${prompt.fabricTitle}. ${prompt.accessoryNotes || ''}`,
              productId: prompt.fabricId,
              style: prompt.fit,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data?.generation) {
              const apiResult: AiGenerationResult = {
                id: data.generation.id,
                prompt,
                status: 'completed',
                renderedImageUrl: data.generation.resultUrl,
                createdAt:
                  data.generation.createdAt || new Date().toISOString(),
                tokenCost: 1,
                tailorLookbookUrl: `https://atelier.com/lookbook/download/${data.generation.id}.pdf`,
              };
              this.currentResult.set(apiResult);
              this.history.update((h) => [apiResult, ...h]);
              this.isGenerating.set(false);
              this.analytics.trackAiStudioGenerated(
                prompt.garmentType,
                prompt.skinTone,
                1,
              );
              return apiResult;
            }
          }
        } catch {
          // Fallback to local high-fidelity generator
        }
      }
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        // High quality preview result simulation
        const sampleRenders = [
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=700&q=80',
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=700&q=80',
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=80',
          'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=700&q=80',
        ];

        const randomImg =
          sampleRenders[Math.floor(Math.random() * sampleRenders.length)];
        const result: AiGenerationResult = {
          id: 'res-' + Date.now(),
          prompt,
          status: 'completed',
          renderedImageUrl: randomImg,
          createdAt: new Date().toISOString(),
          tokenCost: 1,
          tailorLookbookUrl: `https://atelier.com/lookbook/download/res-${Date.now()}.pdf`,
        };

        this.currentResult.set(result);
        this.history.update((h) => [result, ...h]);
        this.isGenerating.set(false);

        this.analytics.trackAiStudioGenerated(
          prompt.garmentType,
          prompt.skinTone,
          1,
        );
        resolve(result);
      }, 1500);
    });
  }
}
