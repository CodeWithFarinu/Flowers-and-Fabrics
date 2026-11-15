import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminStore, SupportStore } from '@shared/data-access';
import { SupportTicket } from '@shared/models';

@Component({
  selector: 'atelier-admin-support-desk',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './support-desk.component.html',
  styleUrl: './support-desk.component.scss',
})
export class SupportDeskComponent {
  readonly adminStore = inject(AdminStore);
  readonly supportStore = inject(SupportStore);
  selectedTicket = signal<SupportTicket | null>(this.adminStore.tickets()[0]);
  manualReplyText = '';

  getWhatsAppUrl(ticket: SupportTicket): string {
    const phone = ticket.customerPhone.replace(/[^0-9]/g, '');
    const greeting = encodeURIComponent(
      `Hello ${ticket.customerName}, this is the Teepha Flowers & Fabrics Senior Concierge following up on your inquiry "${ticket.subject}". How may we assist your bespoke order today?`,
    );
    return `https://wa.me/${phone}?text=${greeting}`;
  }

  sendAiReply(ticketId: string, text: string): void {
    this.supportStore.adminReply(ticketId, text);
  }

  editReply(text: string): void {
    this.manualReplyText = text;
  }

  sendManualReply(ticketId: string): void {
    if (!this.manualReplyText.trim()) return;
    this.supportStore.adminReply(ticketId, this.manualReplyText);
    this.manualReplyText = '';
  }
}
