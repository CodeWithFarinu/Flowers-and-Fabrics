import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { AffiliateAdapter } from './entities/affiliate.adapter';
import {
  ApplyAffiliateDto,
  CreateAffiliateLinkDto,
  RequestPayoutDto,
} from './dto/interface.dto';
import * as crypto from 'crypto';

@Injectable()
export class AffiliateService {
  constructor(private readonly affiliateAdapter: AffiliateAdapter) {}

  async apply(userId: string, dto: ApplyAffiliateDto) {
    const existing = await this.affiliateAdapter.findProfileByUserId(userId);

    if (existing) {
      return existing;
    }

    return this.affiliateAdapter.createProfile(userId, dto);
  }

  async getDashboard(userId: string) {
    const profile = await this.affiliateAdapter.findProfileDashboard(userId);

    if (!profile) {
      return { isAffiliate: false };
    }

    const totalClicks = profile.links.reduce((acc, l) => acc + l.clickCount, 0);
    const totalConversions = profile.links.reduce(
      (acc, l) => acc + l.conversionCount,
      0,
    );

    return {
      isAffiliate: true,
      profile,
      stats: {
        totalEarnings: profile.totalEarnings,
        pendingBalance: profile.pendingBalance,
        paidBalance: profile.paidBalance,
        totalClicks,
        totalConversions,
        conversionRate:
          totalClicks > 0
            ? ((totalConversions / totalClicks) * 100).toFixed(2)
            : 0,
      },
    };
  }

  async createLink(userId: string, dto: CreateAffiliateLinkDto) {
    const profile = await this.affiliateAdapter.findProfileByUserId(userId);
    if (!profile || profile.status !== 'APPROVED') {
      throw new BadRequestException(
        'Active affiliate profile required to generate links',
      );
    }

    const code = `aff_${crypto.randomBytes(4).toString('hex')}`;
    return this.affiliateAdapter.createLink(profile.id, dto, code);
  }

  async requestPayout(userId: string, dto: RequestPayoutDto) {
    const profile = await this.affiliateAdapter.findProfileByUserId(userId);
    if (!profile) throw new NotFoundException('Affiliate profile not found');

    if (Number(profile.pendingBalance) < dto.amount) {
      throw new BadRequestException('Insufficient pending balance for payout');
    }

    return this.affiliateAdapter.updatePayoutBalance(profile.id, dto.amount);
  }

  // Admin
  async adminListAffiliates() {
    return this.affiliateAdapter.findAllAffiliates();
  }

  async adminUpdateStatus(
    id: string,
    status: 'APPROVED' | 'REJECTED' | 'SUSPENDED',
  ) {
    return this.affiliateAdapter.updateProfileStatus(id, status);
  }
}
