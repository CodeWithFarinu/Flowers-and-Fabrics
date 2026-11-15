import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ApplyAffiliateDto,
  CreateAffiliateLinkDto,
} from '../dto/interface.dto';

@Injectable()
export class AffiliateAdapter {
  constructor(private readonly prisma: PrismaService) {}

  async findProfileByUserId(userId: string) {
    return this.prisma.affiliateProfile.findUnique({
      where: { userId },
    });
  }

  async createProfile(userId: string, dto: ApplyAffiliateDto) {
    return this.prisma.affiliateProfile.create({
      data: {
        userId,
        status: 'APPROVED',
        commissionRate: 10,
        ...dto,
      },
    });
  }

  async findProfileDashboard(userId: string) {
    return this.prisma.affiliateProfile.findUnique({
      where: { userId },
      include: {
        links: {
          include: {
            product: { select: { name: true, slug: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        conversions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async createLink(
    profileId: string,
    dto: CreateAffiliateLinkDto,
    code: string,
  ) {
    return this.prisma.affiliateLink.create({
      data: {
        affiliateId: profileId,
        productId: dto.productId,
        targetUrl: dto.targetUrl,
        label: dto.label || 'Affiliate Referral Link',
        code,
      },
    });
  }

  async updatePayoutBalance(profileId: string, amount: number) {
    return this.prisma.affiliateProfile.update({
      where: { id: profileId },
      data: {
        pendingBalance: { decrement: amount },
        paidBalance: { increment: amount },
      },
    });
  }

  async findAllAffiliates() {
    return this.prisma.affiliateProfile.findMany({
      include: {
        user: {
          select: { firstName: true, lastName: true, phone: true, email: true },
        },
        _count: { select: { links: true, conversions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateProfileStatus(
    id: string,
    status: 'APPROVED' | 'REJECTED' | 'SUSPENDED',
  ) {
    return this.prisma.affiliateProfile.update({
      where: { id },
      data: { status: status as any },
    });
  }
}
