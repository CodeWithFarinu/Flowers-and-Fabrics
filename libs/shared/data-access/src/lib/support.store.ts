import { Injectable, signal, inject } from '@angular/core';
import { AdminStore } from './admin.store';
import { SupportTicket } from '@shared/models';
import { getApiBaseUrl } from './api-config';

export interface SupportChatMessage {
  id: string;
  sender: 'customer' | 'admin' | 'ai';
  content: string;
  timestamp: string;
  isWhatsAppHandoff?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class SupportStore {
  private adminStore = inject(AdminStore);

  readonly isChatOpen = signal<boolean>(false);
  readonly isTyping = signal<boolean>(false);
  readonly unreadCount = signal<number>(1);
  readonly customerName = signal<string>('Bespoke Customer');
  readonly customerPhone = signal<string>('+234 812 000 8821');
  readonly activeTicketId = signal<string>('tkt-live');

  readonly messages = signal<SupportChatMessage[]>([
    {
      id: 'msg-init-1',
      sender: 'ai',
      content:
        'Greetings from Teepha Flowers & Fabrics Concierge. How may our styling team assist your luxury floral arrangements, bespoke fabric selection, same-day Lagos dispatch, or custom fitting today?',
      timestamp: 'Just now',
    },
  ]);

  /**
   * Generates a direct WhatsApp link pre-filled with context
   */
  getWhatsAppUrl(customText?: string): string {
    const defaultText =
      customText ||
      `Hello Teepha Flowers & Fabrics Concierge, I would like to inquire about fabric availability, luxury flowers, custom tailor referrals, and priority dispatch.`;
    const encoded = encodeURIComponent(
      `[TEEPHA VIP INQUIRY]\n${defaultText}\n\nClient: ${this.customerName()} (${this.customerPhone()})\nSlogan: "Get a worth for ur class"`,
    );
    return `https://wa.me/2348120008821?text=${encoded}`;
  }

  toggleChat(open?: boolean): void {
    const nextState = open !== undefined ? open : !this.isChatOpen();
    this.isChatOpen.set(nextState);
    if (nextState) {
      this.unreadCount.set(0);
    }
  }

  openWithPrompt(prompt: string): void {
    this.toggleChat(true);
    this.sendMessage(prompt);
  }

  sendMessage(
    content: string,
    sender: 'customer' | 'admin' = 'customer',
  ): void {
    if (!content.trim()) return;

    const timeString = new Date().toLocaleTimeString('en-NG', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newMsg: SupportChatMessage = {
      id: `msg-${Date.now()}`,
      sender,
      content,
      timestamp: timeString,
    };

    this.messages.update((list) => [...list, newMsg]);

    // Synchronize into Admin Store's tickets in real time
    this.syncToAdminTickets(newMsg);

    // Asynchronous backend ticket sync if user has session
    if (typeof window !== 'undefined') {
      const apiUrl = getApiBaseUrl();
      const token = localStorage.getItem('atelier_token');
      if (token) {
        fetch(`${apiUrl}/support/tickets`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            subject: 'Concierge Live Consultation',
            message: content,
          }),
        }).catch(() => {});
      }
    }

    // If sent by customer, simulate intelligent concierge response & WhatsApp transfer prompt
    if (sender === 'customer') {
      this.isTyping.set(true);

      setTimeout(() => {
        const responseData = this.computeIntelligentReply(content);
        this.isTyping.set(false);

        const aiMsg: SupportChatMessage = {
          id: `msg-ai-${Date.now()}`,
          sender: 'ai',
          content: responseData.text,
          timestamp: new Date().toLocaleTimeString('en-NG', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          isWhatsAppHandoff: responseData.offerWhatsApp,
        };

        this.messages.update((list) => [...list, aiMsg]);

        if (!this.isChatOpen()) {
          this.unreadCount.update((c) => c + 1);
        }

        // Also push AI suggested reply to Admin Store so admin can take over seamlessly
        this.adminStore.tickets.update((tickets) =>
          tickets.map((t) =>
            t.id === this.activeTicketId()
              ? {
                  ...t,
                  status: 'open',
                  aiSuggestedReply: {
                    suggestedText: responseData.text,
                    confidence: 0.96,
                    intent: responseData.intent,
                  },
                  updatedAt: 'Just now',
                }
              : t,
          ),
        );
      }, 1100);
    }
  }

  /**
   * Called by Admin Support Desk when human admin sends a reply in real time
   */
  adminReply(ticketId: string, replyText: string): void {
    const timeString = new Date().toLocaleTimeString('en-NG', {
      hour: '2-digit',
      minute: '2-digit',
    });

    // Update Admin Store ticket
    this.adminStore.sendTicketReply(ticketId, replyText);

    // Broadcast to customer's live chat
    const adminMsg: SupportChatMessage = {
      id: `msg-admin-${Date.now()}`,
      sender: 'admin',
      content: replyText,
      timestamp: timeString,
    };

    this.messages.update((list) => [...list, adminMsg]);

    if (!this.isChatOpen()) {
      this.unreadCount.update((c) => c + 1);
    }
  }

  private syncToAdminTickets(msg: SupportChatMessage): void {
    const currentTickets = this.adminStore.tickets();
    const existing = currentTickets.find((t) => t.id === this.activeTicketId());

    if (existing) {
      this.adminStore.tickets.update((list) =>
        list.map((t) =>
          t.id === this.activeTicketId()
            ? {
                ...t,
                status: 'pending_admin',
                updatedAt: 'Just now',
                messages: [
                  ...t.messages,
                  {
                    id: msg.id,
                    sender: msg.sender,
                    content: msg.content,
                    timestamp: msg.timestamp,
                  },
                ],
              }
            : t,
        ),
      );
    } else {
      const newTicket: SupportTicket = {
        id: this.activeTicketId(),
        customerName: this.customerName(),
        customerPhone: this.customerPhone(),
        channel: 'web_chat',
        status: 'pending_admin',
        subject: `Live Web Inquiry: ${msg.content.slice(0, 40)}...`,
        updatedAt: 'Just now',
        messages: [
          {
            id: msg.id,
            sender: msg.sender,
            content: msg.content,
            timestamp: msg.timestamp,
          },
        ],
      };
      this.adminStore.tickets.update((list) => [newTicket, ...list]);
    }
  }

  private computeIntelligentReply(query: string): {
    text: string;
    intent: string;
    offerWhatsApp: boolean;
  } {
    const q = query.toLowerCase();

    if (
      q.includes('yard') ||
      q.includes('measurement') ||
      q.includes('agbada') ||
      q.includes('senator')
    ) {
      return {
        text: 'For a Grand 4-Piece Agbada, our Master Tailors recommend exactly 7.0 yards. For a standard slim-fit Senator suit, 4.0 yards is optimal (or 4.5 yards for tall patrons). Would you like our WhatsApp concierge to connect you directly with an accredited Master Tailor in Ikoyi or Maitama?',
        intent: 'fabric_yardage_inquiry',
        offerWhatsApp: true,
      };
    }

    if (
      q.includes('deliver') ||
      q.includes('today') ||
      q.includes('lekki') ||
      q.includes('vi') ||
      q.includes('lagos') ||
      q.includes('abuja')
    ) {
      return {
        text: 'Lagos priority same-day dispatch cut-off is 1:00 PM daily. Orders placed before 1:00 PM arrive between 3:30 PM – 5:30 PM via direct courier. Abuja dispatches take 24 hours. Tap below if you would like live rider tracking on WhatsApp!',
        intent: 'delivery_inquiry',
        offerWhatsApp: true,
      };
    }

    if (
      q.includes('swiss') ||
      q.includes('lace') ||
      q.includes('authentic') ||
      q.includes('voile')
    ) {
      return {
        text: 'All our Swiss Voile and Organza laces are sourced directly from certified master looms in St. Gallen, Switzerland with 24K metallic threading. Each bolt comes with our embossed Teepha Flowers & Fabrics Authenticity Passport #TP-NG-88921-2026. Would you like a 4-inch sample swatch dispatched to you?',
        intent: 'authenticity_inquiry',
        offerWhatsApp: true,
      };
    }

    if (
      q.includes('aso ebi') ||
      q.includes('asoebi') ||
      q.includes('wedding') ||
      q.includes('bulk') ||
      q.includes('discount')
    ) {
      return {
        text: 'For wedding parties and bridal groups (10+ cuts), our Bridal Concierge offers an exclusive 12% tier privilege plus complimentary bespoke hardwood gift presentation boxes for your guests. Would you like to chat with our Head of Bridal on WhatsApp?',
        intent: 'bridal_asoebi_inquiry',
        offerWhatsApp: true,
      };
    }

    return {
      text: 'Thank you for contacting the Teepha Flowers & Fabrics Concierge. A Senior Specialist has been notified and can also assist you directly on WhatsApp for real-time floral arrangements, fabric swatches, high-resolution videos, and instant reservation.',
      intent: 'general_concierge_inquiry',
      offerWhatsApp: true,
    };
  }
}
