import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LoyaltyAdapter {
  constructor(private readonly prisma: PrismaService) {}

  async findUserLoyaltyDetails(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        loyaltyPoints: true,
        loyaltyTier: true,
        totalSpent: true,
        imageGenTokens: true,
      },
    });
  }

  async findUserLoyaltyTransactions(userId: string, take = 50) {
    return this.prisma.loyaltyTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take,
    });
  }
}
