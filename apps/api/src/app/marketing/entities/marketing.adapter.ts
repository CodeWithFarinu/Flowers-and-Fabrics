import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAdLinkDto, CreateCampaignDto } from '../dto/interface.dto';

@Injectable()
export class MarketingAdapter {
  constructor(private readonly prisma: PrismaService) {}

  async createAdLink(dto: CreateAdLinkDto, code: string) {
    return this.prisma.adLink.create({
      data: {
        ...dto,
        code,
      },
    });
  }

  async findAdLinkByCode(code: string) {
    return this.prisma.adLink.findUnique({
      where: { code },
    });
  }

  async recordClickAndUtm(
    linkId: string,
    utmSource?: string | null,
    utmMedium?: string | null,
    utmCampaign?: string | null,
  ) {
    return this.prisma.$transaction([
      this.prisma.adLink.update({
        where: { id: linkId },
        data: { clickCount: { increment: 1 } },
      }),
      this.prisma.utmEvent.create({
        data: {
          adLinkId: linkId,
          utmSource,
          utmMedium,
          utmCampaign,
          eventType: 'LINK_CLICK',
        },
      }),
    ]);
  }

  async createUtmEvent(data: {
    adLinkId?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    eventType: string;
    userId?: string;
    sessionId?: string;
  }) {
    return this.prisma.utmEvent.create({
      data,
    });
  }

  async findActiveCampaigns() {
    return this.prisma.marketingCampaign.findMany({
      where: { isActive: true },
      include: {
        adLinks: {
          select: {
            id: true,
            code: true,
            label: true,
            clickCount: true,
            utmSource: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createCampaign(dto: CreateCampaignDto) {
    return this.prisma.marketingCampaign.create({
      data: dto,
    });
  }

  async getAttributionSummary() {
    const totalClicks = await this.prisma.utmEvent.count({
      where: { eventType: 'LINK_CLICK' },
    });
    const topLinks = await this.prisma.adLink.findMany({
      take: 10,
      orderBy: { clickCount: 'desc' },
    });
    return {
      totalClicks,
      topLinks,
    };
  }
}
