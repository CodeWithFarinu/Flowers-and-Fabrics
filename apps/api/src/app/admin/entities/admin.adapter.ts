import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminAdapter {
  constructor(private readonly prisma: PrismaService) {}

  async findPaidOrders() {
    return this.prisma.order.findMany({
      where: {
        status: { in: ['CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED'] },
        deletedAt: null,
      },
      select: { total: true, subtotal: true, createdAt: true },
    });
  }

  async getUserMetrics() {
    const [totalUsers, guestCount, registeredCount] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.user.count({ where: { isGuest: true, deletedAt: null } }),
      this.prisma.user.count({ where: { isGuest: false, deletedAt: null } }),
    ]);
    return { totalUsers, guestCount, registeredCount };
  }

  async getCatalogMetrics() {
    const [totalProducts, lowStockProducts] = await Promise.all([
      this.prisma.product.count({ where: { deletedAt: null } }),
      this.prisma.product.count({
        where: { deletedAt: null, stockQuantity: { lte: 5 } },
      }),
    ]);
    return { totalProducts, lowStockProducts };
  }

  async getFunnelMetrics() {
    const [linkClicks, productViews, cartCount] = await Promise.all([
      this.prisma.utmEvent.count({ where: { eventType: 'LINK_CLICK' } }),
      this.prisma.productView.count(),
      this.prisma.cartItem.count(),
    ]);
    return { linkClicks, productViews, cartCount };
  }

  async findRecentOrders(take = 5) {
    return this.prisma.order.findMany({
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { firstName: true, lastName: true, phone: true } },
      },
    });
  }
}
