import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PreloaderService } from '@shared/data-access';

@Component({
  selector: 'atelier-preloader',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (preloader.isActive()) {
      <aside class="preloader-overlay" aria-live="assertive" role="alert">
        <div class="preloader-card">
          <!-- Monogram Heraldic Crest with Shears & Diamond Lattice -->
          <div class="crest-wrap">
            <svg
              class="crest-svg"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <!-- Outer Rotating Diamond Halo -->
              <rect
                x="50"
                y="6"
                width="62"
                height="62"
                transform="rotate(45 50 6)"
                stroke="url(#goldGrad)"
                stroke-width="1.2"
                stroke-dasharray="4 2"
                class="halo-rotate"
              />
              <!-- Inner Octagon Shield -->
              <polygon
                points="50,14 86,50 50,86 14,50"
                stroke="currentColor"
                stroke-width="1.5"
                class="shield-poly"
              />
              <!-- Overlapping Interlocking Monogram 'TF' with Gold Accents -->
              <!-- Stately Roman Serif 'T' -->
              <path
                d="M28 32 H58 V36 H54 V34.5 H46 V68 H50 V70.5 H36 V68 H40 V34.5 H32 V36 H28 Z"
                fill="currentColor"
              />
              <!-- Overlapping Flowing Haute Couture Italic 'F' in Radiant Gold -->
              <path
                d="M48 37 C53 34 64 33 70 36 C69 40 67 41 65 39.5 C61 38 55 38.5 52.5 42 L51 46 H65 V50 H49.5 L44.5 72 H39.5 L47 42 C47.5 40 47.5 38.5 48 37 Z"
                fill="url(#goldGrad)"
              />
              <path
                d="M46.5 53 C52 51.5 60 51.5 63 54.5 C60 57 52 56 45.5 55.5 Z"
                fill="url(#goldGrad)"
              />
              <!-- Astral Gold Brilliance Finial -->
              <circle cx="70" cy="32" r="3.2" fill="url(#goldGrad)" />
              <!-- Gradients -->
              <defs>
                <linearGradient
                  id="goldGrad"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stop-color="#F59E0B" />
                  <stop offset="50%" stop-color="#D97706" />
                  <stop offset="100%" stop-color="#FEF3C7" />
                </linearGradient>
              </defs>
            </svg>
            <div class="crest-pulse-glow"></div>
          </div>

          <!-- Guild Brand & Slogan -->
          <div class="preloader-text-group">
            <span class="guild-badge">
              <span class="glyph">⚜</span>
              TEEPHA FLOWERS & FABRICS
              <span class="glyph">⚜</span>
            </span>

            <h1 class="slogan-title">"Get a worth for ur class"</h1>

            <p class="preloader-subtext">
              {{ preloader.subtext() }}
            </p>
          </div>

          <!-- Hairline Progress Indicator -->
          <div class="progress-track">
            <div
              class="progress-fill"
              [style.width]="preloader.progress() + '%'"
            ></div>
          </div>

          <span class="secure-accreditation">
            ✦ ACCREDITED LUXURY FLOWERS & HERITAGE WEAVES
          </span>
        </div>
      </aside>
    }
  `,
  styles: [
    `
      .preloader-overlay {
        position: fixed;
        inset: 0;
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(10, 10, 10, 0.94);
        backdrop-filter: blur(28px);
        -webkit-backdrop-filter: blur(28px);
        animation: preloaderFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }

      [data-theme='light'] .preloader-overlay {
        background: rgba(255, 255, 255, 0.96);
      }

      .preloader-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        max-width: 480px;
        padding: 40px 28px;
        color: #fff;
      }

      [data-theme='light'] .preloader-card {
        color: #000;
      }

      .crest-wrap {
        position: relative;
        width: 100px;
        height: 100px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 24px;
      }

      .crest-svg {
        width: 100%;
        height: 100%;
        color: #fff;
      }

      [data-theme='light'] .crest-svg {
        color: #000;
      }

      .halo-rotate {
        transform-origin: 50px 50px;
        animation: rotateHalo 12s linear infinite;
      }

      .crest-pulse-glow {
        position: absolute;
        inset: 10px;
        border-radius: 50%;
        background: radial-gradient(
          circle,
          rgba(245, 158, 11, 0.25) 0%,
          transparent 70%
        );
        animation: pulseGlow 2s ease-in-out infinite alternate;
        z-index: -1;
      }

      .preloader-text-group {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        margin-bottom: 24px;
      }

      .guild-badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 0.65rem;
        font-weight: 800;
        letter-spacing: 0.24em;
        text-transform: uppercase;
        color: #d97706;
        border: 1px solid rgba(217, 119, 6, 0.35);
        padding: 5px 14px;
        border-radius: 9999px;
        background: rgba(217, 119, 6, 0.08);
      }

      .guild-badge .glyph {
        font-size: 0.75rem;
      }

      .slogan-title {
        font-family: var(--font-display, 'Playfair Display', Georgia, serif);
        font-size: 1.75rem;
        font-weight: 800;
        letter-spacing: -0.01em;
        line-height: 1.25;
        margin: 4px 0 0;
        background: linear-gradient(135deg, #ffffff 0%, #d4d4d4 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      [data-theme='light'] .slogan-title {
        background: linear-gradient(135deg, #000000 0%, #333333 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .preloader-subtext {
        font-size: 0.8rem;
        color: rgba(255, 255, 255, 0.65);
        letter-spacing: 0.02em;
        margin: 0;
        max-width: 360px;
        line-height: 1.45;
        animation: textBreathe 1.8s ease-in-out infinite alternate;
      }

      [data-theme='light'] .preloader-subtext {
        color: rgba(0, 0, 0, 0.6);
      }

      .progress-track {
        width: 220px;
        height: 2px;
        background: rgba(255, 255, 255, 0.12);
        border-radius: 2px;
        overflow: hidden;
        margin-bottom: 20px;
      }

      [data-theme='light'] .progress-track {
        background: rgba(0, 0, 0, 0.1);
      }

      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #d97706, #fbbf24, #ffffff);
        transition: width 0.08s ease-out;
      }

      .secure-accreditation {
        font-size: 0.6rem;
        font-weight: 700;
        letter-spacing: 0.16em;
        color: rgba(255, 255, 255, 0.4);
        text-transform: uppercase;
      }

      [data-theme='light'] .secure-accreditation {
        color: rgba(0, 0, 0, 0.4);
      }

      @keyframes preloaderFadeIn {
        from {
          opacity: 0;
          transform: scale(0.98);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      @keyframes rotateHalo {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      @keyframes pulseGlow {
        from {
          opacity: 0.4;
          transform: scale(0.9);
        }
        to {
          opacity: 1;
          transform: scale(1.15);
        }
      }

      @keyframes textBreathe {
        from {
          opacity: 0.6;
        }
        to {
          opacity: 1;
        }
      }
    `,
  ],
})
export class AtelierPreloaderComponent {
  readonly preloader = inject(PreloaderService);
}
