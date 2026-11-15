import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateOrderStatusDto } from '../dto/interface.dto';

@Injectable()
export class OrdersAdapter {
  constructor(private readonly prisma: PrismaService) {}

  async findUserOrdersPaginated(userId: string, skip: number, take: number) {
    const [orders, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where: { userId, deletedAt: null },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: {
                include: { images: { take: 1, orderBy: { sortOrder: 'asc' } } },
              },
            },
          },
          payments: true,
          address: true,
          statusHistory: { orderBy: { createdAt: 'desc' } },
        },
      }),
      this.prisma.order.count({ where: { userId, deletedAt: null } }),
    ]);

    return { orders, total };
  }

  async findOrderByIdWithDetails(orderId: string, userId?: string) {
    const where: any = { id: orderId, deletedAt: null };
    if (userId) where.userId = userId;

    return this.prisma.order.findFirst({
      where,
      include: {
        items: {
          include: {
            product: {
              include: { images: { take: 2, orderBy: { sortOrder: 'asc' } } },
            },
          },
        },
        payments: true,
        address: true,
        coupon: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
        user: {
          select: { firstName: true, lastName: true, phone: true, email: true },
        },
      },
    });
  }

  async findAdminOrdersPaginated(where: any, skip: number, take: number) {
    const [orders, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, phone: true },
          },
          items: { take: 3 },
          payments: { take: 1 },
          address: true,
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return { orders, total };
  }

  async findOrderWithUser(orderId: string) {
    return this.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });
  }

  async updateOrderStatusAndRelated(
    orderId: string,
    order: any,
    dto: UpdateOrderStatusDto,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const ord = await tx.order.update({
        where: { id: orderId },
        data: { status: dto.status as any },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: dto.status as any,
          note: dto.note || `Status changed to ${dto.status}`,
        },
      });

      // If order is DELIVERED, credit loyalty points (1 point per ₦100 spent)
      if (dto.status === 'DELIVERED') {
        const pointsToAward = Math.floor(Number(order.total) / 100);
        if (pointsToAward > 0) {
          await tx.user.update({
            where: { id: order.userId },
            data: {
              loyaltyPoints: { increment: pointsToAward },
              totalSpent: { increment: order.total },
            },
          });

          await tx.loyaltyTransaction.create({
            data: {
              userId: order.userId,
              points: pointsToAward,
              type: 'PURCHASE_EARNED',
              description: `Earned on order ${order.orderNumber}`,
              orderId: order.id,
            },
          });
        }

        // If affiliate link was used, register affiliate conversion
        if (order.affiliateLinkId) {
          const affLink = await tx.affiliateLink.findUnique({
            where: { id: order.affiliateLinkId },
            include: { affiliate: true },
          });

          if (affLink) {
            const commissionRate =
              Number(affLink.affiliate.commissionRate) || 10;
            const commission = (Number(order.subtotal) * commissionRate) / 100;

            await tx.affiliateConversion.create({
              data: {
                linkId: affLink.id,
                affiliateId: affLink.affiliateId,
                orderId: order.id,
                userId: order.userId,
                amount: order.subtotal,
                commission,
                isPaid: false,
              },
            });

            await tx.affiliateProfile.update({
              where: { id: affLink.affiliateId },
              data: {
                totalEarnings: { increment: commission },
                pendingBalance: { increment: commission },
              },
            });

            await tx.affiliateLink.update({
              where: { id: affLink.id },
              data: { conversionCount: { increment: 1 } },
            });
          }
        }
      }

      return ord;
    });
  }
}
