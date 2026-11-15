import { Injectable } from '@nestjs/common';
import { MarketingAdapter } from './entities/marketing.adapter';
import { CreateAdLinkDto, CreateCampaignDto } from './dto/interface.dto';
import * as crypto from 'crypto';

@Injectable()
export class MarketingService {
  constructor(private readonly marketingAdapter: MarketingAdapter) {}

  async createAdLink(dto: CreateAdLinkDto) {
    const code = `ad_${crypto.randomBytes(4).toString('hex')}`;
    return this.marketingAdapter.createAdLink(dto, code);
  }

  async resolveLinkClick(
    code: string,
    ip?: string,
    userAgent?: string,
    referrer?: string,
  ) {
    const link = await this.marketingAdapter.findAdLinkByCode(code);

    if (!link) {
      // Fallback to home
      return { targetUrl: '/' };
    }

    // Increment click counter & record UTM event async
    this.marketingAdapter
      .recordClickAndUtm(
        link.id,
        link.utmSource,
        link.utmMedium,
        link.utmCampaign,
      )
      .catch(() => {});

    // Attach tracking param
    const separator = link.targetUrl.includes('?') ? '&' : '?';
    const redirectUrl = `${link.targetUrl}${separator}utm_source=${link.utmSource || 'direct'}&utm_medium=${link.utmMedium || 'ad'}&utm_campaign=${link.utmCampaign || 'promo'}&tl=${link.code}`;

    return { targetUrl: redirectUrl };
  }

  async recordTouch(dto: {
    adLinkId?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    eventType: string;
    userId?: string;
    sessionId?: string;
  }) {
    return this.marketingAdapter.createUtmEvent(dto);
  }

  async getCampaigns() {
    return this.marketingAdapter.findActiveCampaigns();
  }

  async createCampaign(dto: CreateCampaignDto) {
    return this.marketingAdapter.createCampaign(dto);
  }

  async getAttributionSummary() {
    return this.marketingAdapter.getAttributionSummary();
  }
}
