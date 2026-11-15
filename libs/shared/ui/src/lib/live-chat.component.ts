import {
  Component,
  inject,
  ViewChild,
  ElementRef,
  AfterViewChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupportStore } from '@shared/data-access';

@Component({
  selector: 'atelier-live-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Floating Trigger Pill in Bottom-Right -->
    <div
      class="live-chat-floating-root"
      [class.chat-is-open]="supportStore.isChatOpen()"
    >
      @if (!supportStore.isChatOpen()) {
        <button
          type="button"
          class="chat-trigger-pill"
          (click)="supportStore.toggleChat(true)"
          aria-label="Open Teepha Flowers & Fabrics Live Concierge Support"
        >
          <span class="live-pulse-dot"></span>
          <span class="trigger-glyph">⚜</span>
          <span class="trigger-label">Live Concierge</span>
          @if (supportStore.unreadCount() > 0) {
            <span class="unread-badge">{{ supportStore.unreadCount() }}</span>
          }
        </button>
      }

      <!-- Open Luxury Chat Window Window Overlay -->
      @if (supportStore.isChatOpen()) {
        <div class="chat-window-viewport atelier-card">
          <!-- Chat Header -->
          <header class="chat-header">
            <div class="header-agent-group">
              <div class="agent-crest-circle">
                <span class="agent-glyph">⚜</span>
              </div>
              <div class="agent-meta">
                <div class="agent-name-row">
                  <strong class="agent-name"
                    >Teepha Wholesale & Style Concierge</strong
                  >
                  <span class="online-tag">● LIVE AT IPAJA SHOWROOM</span>
                </div>
                <span class="agent-slogan">"Get a worth for ur class"</span>
              </div>
            </div>

            <div class="header-actions">
              <!-- Quick Direct to WhatsApp Support Button -->
              <a
                [href]="supportStore.getWhatsAppUrl()"
                target="_blank"
                class="direct-wa-header-btn"
                title="Direct to WhatsApp Support"
              >
                <svg
                  class="wa-header-svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.82L4.44 19.64L5.27 16.61L5.07 16.29C4.24 14.97 3.8 13.47 3.8 11.91C3.8 7.37 7.5 3.67 12.04 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.05 20.15ZM16.57 14.41C16.32 14.29 15.1 13.69 14.87 13.61C14.65 13.52 14.48 13.48 14.32 13.73C14.15 13.97 13.68 14.53 13.54 14.69C13.39 14.85 13.25 14.87 13 14.75C12.75 14.63 11.96 14.37 11.02 13.53C10.29 12.88 9.79 12.07 9.65 11.82C9.5 11.58 9.63 11.44 9.76 11.32C9.87 11.21 10.01 11.03 10.13 10.89C10.26 10.74 10.3 10.64 10.38 10.48C10.46 10.31 10.42 10.17 10.36 10.05C10.3 9.93 9.8 8.71 9.6 8.21C9.4 7.73 9.2 7.79 9.05 7.78C8.91 7.78 8.75 7.77 8.58 7.77C8.42 7.77 8.15 7.83 7.92 8.08C7.7 8.32 7.07 8.91 7.07 10.12C7.07 11.33 7.95 12.49 8.08 12.65C8.2 12.82 9.81 15.3 12.28 16.36C12.87 16.61 13.32 16.76 13.68 16.88C14.27 17.06 14.81 17.04 15.24 16.97C15.72 16.9 16.71 16.37 16.91 15.79C17.12 15.21 17.12 14.72 17.06 14.61C17 14.5 16.83 14.43 16.57 14.41Z"
                  />
                </svg>
                <span>WhatsApp ↗</span>
              </a>

              <button
                type="button"
                class="chat-close-btn"
                (click)="supportStore.toggleChat(false)"
                aria-label="Close Chat"
              >
                ✕
              </button>
            </div>
          </header>

          <!-- Quick Escalation Banner -->
          <div class="wa-escalation-banner">
            <div class="banner-wa-left">
              <svg
                class="wa-banner-svg"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.82L4.44 19.64L5.27 16.61L5.07 16.29C4.24 14.97 3.8 13.47 3.8 11.91C3.8 7.37 7.5 3.67 12.04 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.05 20.15ZM16.57 14.41C16.32 14.29 15.1 13.69 14.87 13.61C14.65 13.52 14.48 13.48 14.32 13.73C14.15 13.97 13.68 14.53 13.54 14.69C13.39 14.85 13.25 14.87 13 14.75C12.75 14.63 11.96 14.37 11.02 13.53C10.29 12.88 9.79 12.07 9.65 11.82C9.5 11.58 9.63 11.44 9.76 11.32C9.87 11.21 10.01 11.03 10.13 10.89C10.26 10.74 10.3 10.64 10.38 10.48C10.46 10.31 10.42 10.17 10.36 10.05C10.3 9.93 9.8 8.71 9.6 8.21C9.4 7.73 9.2 7.79 9.05 7.78C8.91 7.78 8.75 7.77 8.58 7.77C8.42 7.77 8.15 7.83 7.92 8.08C7.7 8.32 7.07 8.91 7.07 10.12C7.07 11.33 7.95 12.49 8.08 12.65C8.2 12.82 9.81 15.3 12.28 16.36C12.87 16.61 13.32 16.76 13.68 16.88C14.27 17.06 14.81 17.04 15.24 16.97C15.72 16.9 16.71 16.37 16.91 15.79C17.12 15.21 17.12 14.72 17.06 14.61C17 14.5 16.83 14.43 16.57 14.41Z"
                />
              </svg>
              <span>Wholesale cuts & live video concierge:</span>
            </div>
            <a
              [href]="supportStore.getWhatsAppUrl()"
              target="_blank"
              class="wa-banner-link"
            >
              Open WhatsApp Concierge ↗
            </a>
          </div>

          <!-- Messages Stream Viewport -->
          <div class="chat-messages-viewport" #messagesContainer>
            @for (msg of supportStore.messages(); track msg.id) {
              <div
                class="message-row"
                [class.customer-row]="msg.sender === 'customer'"
                [class.admin-row]="msg.sender === 'admin'"
                [class.ai-row]="msg.sender === 'ai'"
              >
                @if (msg.sender !== 'customer') {
                  <div class="msg-sender-tag">
                    <span class="msg-glyph">⚜</span>
                    <span>{{
                      msg.sender === 'admin'
                        ? 'SENIOR CONCIERGE'
                        : 'TEEPHA STYLIST'
                    }}</span>
                  </div>
                }

                <div
                  class="message-bubble"
                  [class.customer-bubble]="msg.sender === 'customer'"
                  [class.concierge-bubble]="msg.sender !== 'customer'"
                >
                  <p class="bubble-content">{{ msg.content }}</p>
                  <span class="bubble-timestamp">{{ msg.timestamp }}</span>

                  <!-- In-message Direct WhatsApp Escalation Button -->
                  @if (msg.isWhatsAppHandoff) {
                    <div class="in-bubble-wa-cta">
                      <a
                        [href]="supportStore.getWhatsAppUrl(msg.content)"
                        target="_blank"
                        class="btn-wa-in-bubble"
                      >
                        <svg
                          class="wa-bubble-icon"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path
                            d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.82L4.44 19.64L5.27 16.61L5.07 16.29C4.24 14.97 3.8 13.47 3.8 11.91C3.8 7.37 7.5 3.67 12.04 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.05 20.15ZM16.57 14.41C16.32 14.29 15.1 13.69 14.87 13.61C14.65 13.52 14.48 13.48 14.32 13.73C14.15 13.97 13.68 14.53 13.54 14.69C13.39 14.85 13.25 14.87 13 14.75C12.75 14.63 11.96 14.37 11.02 13.53C10.29 12.88 9.79 12.07 9.65 11.82C9.5 11.58 9.63 11.44 9.76 11.32C9.87 11.21 10.01 11.03 10.13 10.89C10.26 10.74 10.3 10.64 10.38 10.48C10.46 10.31 10.42 10.17 10.36 10.05C10.3 9.93 9.8 8.71 9.6 8.21C9.4 7.73 9.2 7.79 9.05 7.78C8.91 7.78 8.75 7.77 8.58 7.77C8.42 7.77 8.15 7.83 7.92 8.08C7.7 8.32 7.07 8.91 7.07 10.12C7.07 11.33 7.95 12.49 8.08 12.65C8.2 12.82 9.81 15.3 12.28 16.36C12.87 16.61 13.32 16.76 13.68 16.88C14.27 17.06 14.81 17.04 15.24 16.97C15.72 16.9 16.71 16.37 16.91 15.79C17.12 15.21 17.12 14.72 17.06 14.61C17 14.5 16.83 14.43 16.57 14.41Z"
                          />
                        </svg>
                        <span>Continue with Concierge on WhatsApp ↗</span>
                      </a>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Real-Time Typing Indicator -->
            @if (supportStore.isTyping()) {
              <div class="typing-indicator-row">
                <span class="typing-glyph">⚜</span>
                <div class="typing-bubble">
                  <span class="typing-dot"></span>
                  <span class="typing-dot"></span>
                  <span class="typing-dot"></span>
                </div>
                <span class="typing-text"
                  >Concierge is checking fabric cuts...</span
                >
              </div>
            }
          </div>

          <!-- Suggested Quick Prompts Rail -->
          <div class="chat-quick-prompts">
            <button
              type="button"
              class="quick-chip"
              (click)="
                supportStore.sendMessage(
                  'How many yards of fabric do I need for a 4-piece Agbada?'
                )
              "
            >
              ✂ Agbada Yardage?
            </button>
            <button
              type="button"
              class="quick-chip"
              (click)="
                supportStore.sendMessage(
                  'Can you deliver to Lekki or Ikeja before 5 PM today?'
                )
              "
            >
              ⚡ Same-Day Delivery?
            </button>
            <button
              type="button"
              class="quick-chip"
              (click)="
                supportStore.sendMessage(
                  'How do you authenticate Swiss Voile Lace and St. Gallen threading?'
                )
              "
            >
              ⚜ Swiss Lace Authenticity?
            </button>
            <button
              type="button"
              class="quick-chip"
              (click)="
                supportStore.sendMessage(
                  'Do you offer wholesale bale discounts for 15+ cuts of Aso-Ebi?'
                )
              "
            >
              💍 Wholesale Bales Discount?
            </button>
          </div>

          <!-- Chat Input Footer -->
          <footer class="chat-footer">
            <form (submit)="onSend($event)" class="chat-input-form">
              <input
                type="text"
                [(ngModel)]="inputText"
                name="chatInput"
                placeholder="Message Teepha Concierge in real time..."
                class="chat-input-field"
                autocomplete="off"
              />
              <button
                type="submit"
                class="chat-send-btn"
                [disabled]="!inputText.trim()"
                aria-label="Send message"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </form>

            <!-- Bottom One-Tap WhatsApp Escalate Bar -->
            <a
              [href]="supportStore.getWhatsAppUrl()"
              target="_blank"
              class="bottom-wa-handoff-bar"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="#10b981"
                style="flex-shrink:0;"
              >
                <path
                  d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.82L4.44 19.64L5.27 16.61L5.07 16.29C4.24 14.97 3.8 13.47 3.8 11.91C3.8 7.37 7.5 3.67 12.04 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.05 20.15ZM16.57 14.41C16.32 14.29 15.1 13.69 14.87 13.61C14.65 13.52 14.48 13.48 14.32 13.73C14.15 13.97 13.68 14.53 13.54 14.69C13.39 14.85 13.25 14.87 13 14.75C12.75 14.63 11.96 14.37 11.02 13.53C10.29 12.88 9.79 12.07 9.65 11.82C9.5 11.58 9.63 11.44 9.76 11.32C9.87 11.21 10.01 11.03 10.13 10.89C10.26 10.74 10.3 10.64 10.38 10.48C10.46 10.31 10.42 10.17 10.36 10.05C10.3 9.93 9.8 8.71 9.6 8.21C9.4 7.73 9.2 7.79 9.05 7.78C8.91 7.78 8.75 7.77 8.58 7.77C8.42 7.77 8.15 7.83 7.92 8.08C7.7 8.32 7.07 8.91 7.07 10.12C7.07 11.33 7.95 12.49 8.08 12.65C8.2 12.82 9.81 15.3 12.28 16.36C12.87 16.61 13.32 16.76 13.68 16.88C14.27 17.06 14.81 17.04 15.24 16.97C15.72 16.9 16.71 16.37 16.91 15.79C17.12 15.21 17.12 14.72 17.06 14.61C17 14.5 16.83 14.43 16.57 14.41Z"
                />
              </svg>
              <span
                >Prefer WhatsApp? Chat direct on
                <strong>+234 812 000 8821</strong> ↗</span
              >
            </a>
          </footer>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .live-chat-floating-root {
        position: fixed;
        bottom: 24px;
        right: 76px;
        z-index: 1500;
        font-family: inherit;
        display: flex;
        align-items: center;
        transition:
          right 0.2s ease,
          bottom 0.2s ease;
      }

      .live-chat-floating-root.chat-is-open {
        right: 24px;
        z-index: 1600;
      }

      @media (max-width: 768px) {
        .live-chat-floating-root {
          bottom: 74px;
          right: 66px;
        }

        .live-chat-floating-root.chat-is-open {
          bottom: 74px;
          right: 16px;
        }
      }

      /* Trigger Pill */
      .chat-trigger-pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: rgba(10, 10, 10, 0.9);
        color: #fff;
        border: 1px solid rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        padding: 10px 16px;
        border-radius: 9999px;
        font-size: 0.8rem;
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      }

      [data-theme='light'] .chat-trigger-pill {
        background: rgba(255, 255, 255, 0.95);
        color: #000;
        border-color: rgba(0, 0, 0, 0.15);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
      }

      .chat-trigger-pill:hover {
        transform: translateY(-2px) scale(1.03);
        border-color: #d97706;
      }

      .live-pulse-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #10b981;
        box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.3);
        animation: pulseGreen 1.8s infinite;
      }

      .trigger-glyph {
        color: #d97706;
        font-size: 0.9rem;
      }

      .unread-badge {
        background: #d97706;
        color: #000;
        font-size: 0.65rem;
        font-weight: 900;
        padding: 2px 6px;
        border-radius: 9999px;
      }

      /* Chat Window Overlay */
      .chat-window-viewport {
        width: 390px;
        max-width: calc(100vw - 32px);
        height: 580px;
        max-height: 82vh;
        display: flex;
        flex-direction: column;
        border-radius: var(--radius-lg);
        overflow: hidden;
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
        border: 1px solid var(--border);
        background: var(--surface);
        animation: chatSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }

      @media (max-width: 480px) {
        .chat-window-viewport {
          position: fixed;
          bottom: 12px;
          right: 12px;
          left: 12px;
          width: auto;
          height: 88vh;
        }
      }

      /* Header */
      .chat-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 14px 18px;
        border-bottom: 1px solid var(--border);
        background: var(--bg);
      }

      .header-agent-group {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .agent-crest-circle {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: linear-gradient(135deg, #d97706, #f59e0b);
        color: #000;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 900;
        font-size: 1rem;
        box-shadow: 0 2px 8px rgba(217, 119, 6, 0.4);
      }

      .agent-meta {
        display: flex;
        flex-direction: column;
        text-align: left;
      }

      .agent-name-row {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .agent-name {
        font-size: 0.85rem;
        color: var(--text);
      }

      .online-tag {
        font-size: 0.55rem;
        font-weight: 800;
        color: #10b981;
        letter-spacing: 0.08em;
      }

      .agent-slogan {
        font-size: 0.65rem;
        font-style: italic;
        color: #d97706;
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .direct-wa-header-btn {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 0.7rem;
        font-weight: 700;
        color: #10b981;
        background: rgba(16, 185, 129, 0.1);
        border: 1px solid rgba(16, 185, 129, 0.3);
        padding: 4px 10px;
        border-radius: 9999px;
        text-decoration: none;
        transition: all 0.2s ease;
      }

      .direct-wa-header-btn:hover {
        background: #10b981;
        color: #fff;
      }

      .chat-close-btn {
        background: transparent;
        border: none;
        color: var(--text-muted);
        font-size: 1.1rem;
        cursor: pointer;
        padding: 4px;
      }

      .chat-close-btn:hover {
        color: var(--text);
      }

      /* WhatsApp Escalation Banner */
      .wa-escalation-banner {
        background: linear-gradient(
          135deg,
          rgba(16, 185, 129, 0.12),
          rgba(6, 78, 59, 0.18)
        );
        border-bottom: 1px solid rgba(16, 185, 129, 0.25);
        padding: 8px 16px;
        font-size: 0.725rem;
        color: var(--text);
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
      }

      .banner-wa-left {
        display: flex;
        align-items: center;
        gap: 6px;
        color: var(--text-muted);
      }

      .wa-banner-svg {
        color: #10b981;
        flex-shrink: 0;
      }

      .wa-banner-link {
        color: #10b981;
        font-weight: 700;
        text-decoration: none;
        white-space: nowrap;
        transition: color 0.15s ease;
      }

      .wa-banner-link:hover {
        color: #059669;
        text-decoration: underline;
      }

      /* Messages Viewport */
      .chat-messages-viewport {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 14px;
        background: var(--surface);
      }

      .message-row {
        display: flex;
        flex-direction: column;
        max-width: 88%;
      }

      .customer-row {
        align-self: flex-end;
        align-items: flex-end;
      }

      .admin-row,
      .ai-row {
        align-self: flex-start;
        align-items: flex-start;
      }

      .msg-sender-tag {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 0.6rem;
        font-weight: 800;
        letter-spacing: 0.1em;
        color: #d97706;
        margin-bottom: 4px;
      }

      .message-bubble {
        padding: 12px 14px;
        border-radius: var(--radius-md);
        font-size: 0.85rem;
        line-height: 1.45;
        position: relative;
        text-align: left;
      }

      .customer-bubble {
        background: var(--inverse-bg);
        color: var(--inverse-text);
        border-bottom-right-radius: 2px;
      }

      .concierge-bubble {
        background: var(--bg);
        color: var(--text);
        border: 1px solid var(--border);
        border-bottom-left-radius: 2px;
      }

      .bubble-content {
        margin: 0 0 4px;
      }

      .bubble-timestamp {
        font-size: 0.65rem;
        color: var(--text-muted);
        display: block;
        text-align: right;
      }

      .customer-bubble .bubble-timestamp {
        color: rgba(255, 255, 255, 0.6);
      }

      [data-theme='light'] .customer-bubble .bubble-timestamp {
        color: rgba(255, 255, 255, 0.7);
      }

      .in-bubble-wa-cta {
        margin-top: 10px;
        padding-top: 8px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }

      .btn-wa-in-bubble {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 0.775rem;
        font-weight: 700;
        background: linear-gradient(135deg, #059669, #10b981);
        color: #ffffff;
        padding: 7px 14px;
        border-radius: var(--radius-full);
        text-decoration: none;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35);
        transition:
          transform 0.15s ease,
          box-shadow 0.15s ease;
      }

      .btn-wa-in-bubble:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(16, 185, 129, 0.5);
      }

      .wa-bubble-icon {
        flex-shrink: 0;
      }

      /* Typing Indicator */
      .typing-indicator-row {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.725rem;
        color: var(--text-muted);
      }

      .typing-glyph {
        color: #d97706;
      }

      .typing-bubble {
        display: flex;
        align-items: center;
        gap: 4px;
        background: var(--bg);
        border: 1px solid var(--border);
        padding: 6px 10px;
        border-radius: 9999px;
      }

      .typing-dot {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: var(--text-muted);
        animation: typingDot 1.4s infinite ease-in-out;
      }

      .typing-dot:nth-child(2) {
        animation-delay: 0.2s;
      }
      .typing-dot:nth-child(3) {
        animation-delay: 0.4s;
      }

      /* Quick Prompts Rail */
      .chat-quick-prompts {
        display: flex;
        gap: 6px;
        padding: 8px 14px;
        overflow-x: auto;
        background: var(--bg);
        border-top: 1px solid var(--border);
        -ms-overflow-style: none;
        scrollbar-width: none;
      }

      .chat-quick-prompts::-webkit-scrollbar {
        display: none;
      }

      .quick-chip {
        white-space: nowrap;
        background: var(--surface);
        border: 1px solid var(--border);
        color: var(--text);
        padding: 5px 12px;
        border-radius: 9999px;
        font-size: 0.7rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .quick-chip:hover {
        border-color: #d97706;
        color: #d97706;
      }

      /* Footer */
      .chat-footer {
        padding: 12px 14px;
        background: var(--bg);
        border-top: 1px solid var(--border);
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .chat-input-form {
        display: flex;
        gap: 8px;
      }

      .chat-input-field {
        flex: 1;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        padding: 10px 14px;
        font-size: 0.825rem;
        color: var(--text);
        outline: none;
      }

      .chat-input-field:focus {
        border-color: #d97706;
      }

      .chat-send-btn {
        background: linear-gradient(135deg, #d97706, #b45309);
        color: #ffffff;
        border: none;
        border-radius: var(--radius-md);
        width: 38px;
        height: 38px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(217, 119, 6, 0.35);
        transition:
          transform 0.15s ease,
          background 0.15s ease,
          opacity 0.15s ease;
      }

      .chat-send-btn:not(:disabled):hover {
        transform: scale(1.06);
        background: linear-gradient(135deg, #f59e0b, #d97706);
      }

      .chat-send-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      .bottom-wa-handoff-bar {
        font-size: 0.7rem;
        color: var(--text-muted);
        text-decoration: none;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }

      .bottom-wa-handoff-bar:hover {
        color: #10b981;
      }

      .wa-dot {
        color: #10b981;
      }

      @keyframes pulseGreen {
        0% {
          transform: scale(0.95);
          box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
        }
        70% {
          transform: scale(1);
          box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
        }
        100% {
          transform: scale(0.95);
          box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
        }
      }

      @keyframes chatSlideUp {
        from {
          opacity: 0;
          transform: translateY(16px) scale(0.97);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      @keyframes typingDot {
        0%,
        80%,
        100% {
          transform: scale(0.6);
          opacity: 0.4;
        }
        40% {
          transform: scale(1.1);
          opacity: 1;
        }
      }
    `,
  ],
})
export class AtelierLiveChatComponent implements AfterViewChecked {
  readonly supportStore = inject(SupportStore);
  inputText = '';

  @ViewChild('messagesContainer') private messagesContainer?: ElementRef;

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  onSend(event: Event): void {
    event.preventDefault();
    if (!this.inputText.trim()) return;
    this.supportStore.sendMessage(this.inputText);
    this.inputText = '';
  }

  private scrollToBottom(): void {
    if (this.messagesContainer) {
      this.messagesContainer.nativeElement.scrollTop =
        this.messagesContainer.nativeElement.scrollHeight;
    }
  }
}
