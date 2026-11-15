import { Injectable, NotFoundException } from '@nestjs/common';
import { SupportAdapter } from './entities/support.adapter';
import { CreateTicketDto, AddMessageDto } from './dto/interface.dto';

@Injectable()
export class SupportService {
  constructor(private readonly supportAdapter: SupportAdapter) {}

  async createTicket(userId: string, dto: CreateTicketDto) {
    return this.supportAdapter.createTicket(userId, dto);
  }

  async getUserTickets(userId: string) {
    return this.supportAdapter.findUserTickets(userId);
  }

  async getTicketById(ticketId: string, userId?: string) {
    const ticket = await this.supportAdapter.findTicketById(ticketId, userId);
    if (!ticket) throw new NotFoundException('Support ticket not found');
    return ticket;
  }

  async addMessage(
    ticketId: string,
    senderId: string,
    dto: AddMessageDto,
    isAdmin = false,
  ) {
    const ticket = await this.supportAdapter.findTicket(ticketId);
    if (!ticket) throw new NotFoundException('Support ticket not found');

    return this.supportAdapter.createMessage(ticketId, senderId, dto, isAdmin);
  }

  // Admin
  async adminListTickets(status?: string) {
    return this.supportAdapter.adminListTickets(status);
  }

  async adminCloseTicket(ticketId: string) {
    return this.supportAdapter.adminCloseTicket(ticketId);
  }
}
