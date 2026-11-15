import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PreloaderService {
  readonly isActive = signal<boolean>(false);
  readonly headline = signal<string>('Get a worth for ur class');
  readonly subtext = signal<string>(
    'Calibrating certified mill provenance & drape dynamics...',
  );
  readonly progress = signal<number>(0);

  private timerRef: any;

  /**
   * Triggers an animated preloader screen with the brand slogan
   * @param headline Main headline slogan (defaults to "Get a worth for ur class")
   * @param subtext Descriptive secondary microtext
   * @param durationMs Duration in ms before auto-resolving
   */
  trigger(
    headline = 'Get a worth for ur class',
    subtext = 'Calibrating certified mill provenance & drape dynamics...',
    durationMs = 750,
  ): Promise<void> {
    this.headline.set(headline);
    this.subtext.set(subtext);
    this.progress.set(15);
    this.isActive.set(true);

    if (this.timerRef) {
      clearInterval(this.timerRef);
    }

    return new Promise((resolve) => {
      const stepInterval = 40;
      const step = 85 / (durationMs / stepInterval);

      this.timerRef = setInterval(() => {
        this.progress.update((p) => {
          if (p >= 96) {
            clearInterval(this.timerRef);
            return 98;
          }
          return Math.min(96, p + step);
        });
      }, stepInterval);

      setTimeout(() => {
        clearInterval(this.timerRef);
        this.progress.set(100);

        setTimeout(() => {
          this.isActive.set(false);
          this.progress.set(0);
          resolve();
        }, 180);
      }, durationMs);
    });
  }

  show(
    headline = 'Get a worth for ur class',
    subtext = 'Calibrating certified mill provenance & drape dynamics...',
  ): void {
    this.headline.set(headline);
    this.subtext.set(subtext);
    this.progress.set(40);
    this.isActive.set(true);
  }

  hide(): void {
    this.progress.set(100);
    setTimeout(() => {
      this.isActive.set(false);
      this.progress.set(0);
    }, 150);
  }
}
