import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PaymentsAdapter {
  constructor(private readonly prisma: PrismaService) {}

  async findPaymentWithOrder(reference: string) {
    return this.prisma.payment.findUnique({
      where: { reference },
      include: {
        order: {
          include: {
            user: { select: { id: true, email: true, phone: true } },
          },
        },
      },
    });
  }

  async findOrderForPayment(orderId: string) {
    return this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: { id: true, email: true, phone: true, firstName: true },
        },
        payments: true,
      },
    });
  }

  async createPaymentRecord(data: {
    orderId: string;
    reference: string;
    amount: number;
    gateway: string;
    currency?: string;
  }) {
    return this.prisma.payment.create({
      data: {
        orderId: data.orderId,
        reference: data.reference,
        amount: data.amount,
        gateway: data.gateway,
        currency: data.currency || 'NGN',
        status: 'PENDING',
      },
    });
  }

  async recordPaymentAttempt(data: {
    paymentId: string;
    gateway: string;
    reference: string;
    status: string;
    response?: any;
  }) {
    return this.prisma.paymentAttempt.create({
      data,
    });
  }

  async confirmPaymentAndOrder(
    paymentId: string,
    orderId: string,
    reference: string,
    gatewayResponse?: any,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const p = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: 'SUCCESS',
          paidAt: new Date(),
          gatewayResponse: gatewayResponse || {
            verified: true,
            method: 'paystack_standard',
            time: new Date(),
          },
        },
      });

      await tx.order.update({
        where: { id: orderId },
        data: { status: 'CONFIRMED' },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: 'CONFIRMED',
          note: `Payment confirmed via Paystack (ref: ${reference})`,
        },
      });

      // Reduce product stock and increment order counts
      const orderItems = await tx.orderItem.findMany({
        where: { orderId },
      });

      for (const item of orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: { decrement: item.quantity },
            orderCount: { increment: 1 },
          },
        });
      }

      return p;
    });
  }
}
