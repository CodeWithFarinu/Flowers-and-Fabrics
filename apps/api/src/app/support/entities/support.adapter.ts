import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTicketDto, AddMessageDto } from '../dto/interface.dto';

@Injectable()
export class SupportAdapter {
  constructor(private readonly prisma: PrismaService) {}

  async createTicket(userId: string, dto: CreateTicketDto) {
    return this.prisma.supportTicket.create({
      data: {
        userId,
        subject: dto.subject,
        status: 'OPEN',
        messages: {
          create: {
            senderId: userId,
            isAdmin: false,
            body: dto.message,
          },
        },
      },
      include: { messages: true },
    });
  }

  async findUserTickets(userId: string) {
    return this.prisma.supportTicket.findMany({
      where: { userId },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findTicketById(ticketId: string, userId?: string) {
    const where: any = { id: ticketId };
    if (userId) where.userId = userId;

    return this.prisma.supportTicket.findFirst({
      where,
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
        user: { select: { firstName: true, lastName: true, phone: true } },
      },
    });
  }

  async findTicket(ticketId: string) {
    return this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });
  }

  async createMessage(
    ticketId: string,
    senderId: string,
    dto: AddMessageDto,
    isAdmin: boolean,
  ) {
    const msg = await this.prisma.supportMessage.create({
      data: {
        ticketId,
        senderId,
        isAdmin,
        body: dto.body,
        attachments: dto.attachments || [],
      },
    });

    await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        updatedAt: new Date(),
        status: isAdmin ? 'IN_PROGRESS' : 'OPEN',
      },
    });

    return msg;
  }

  async adminListTickets(status?: string) {
    const where: any = {};
    if (status) where.status = status;

    return this.prisma.supportTicket.findMany({
      where,
      include: {
        user: { select: { firstName: true, lastName: true, phone: true } },
        messages: { take: 1, orderBy: { createdAt: 'desc' } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async adminCloseTicket(ticketId: string) {
    return this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: 'RESOLVED' },
    });
  }
}
