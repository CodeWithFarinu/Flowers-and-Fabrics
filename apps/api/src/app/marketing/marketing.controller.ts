import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MarketingService } from './marketing.service';
import { CreateAdLinkDto, CreateCampaignDto } from './dto/interface.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import type { Response, Request } from 'express';

@ApiTags('Marketing & Attribution')
@Controller('marketing')
export class MarketingController {
  constructor(private readonly marketingService: MarketingService) {}

  @Get('r/:code')
  @ApiOperation({
    summary:
      'Tracked ad link redirector: records click event and redirects to destination',
  })
  async handleRedirect(
    @Param('code') code: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const result = await this.marketingService.resolveLinkClick(
      code,
      req.ip,
      req.headers['user-agent'],
      req.headers['referer'],
    );
    return res.redirect(result.targetUrl);
  }

  @Post('touch')
  @ApiOperation({ summary: 'Client-side UTM touch event ingestion' })
  recordTouch(@Body() body: any) {
    return this.marketingService.recordTouch(body);
  }

  @Get('admin/campaigns')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: list marketing campaigns' })
  getCampaigns() {
    return this.marketingService.getCampaigns();
  }

  @Post('admin/campaigns')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: create marketing campaign' })
  createCampaign(@Body() dto: CreateCampaignDto) {
    return this.marketingService.createCampaign(dto);
  }

  @Post('admin/links')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: create short tracked ad link' })
  createAdLink(@Body() dto: CreateAdLinkDto) {
    return this.marketingService.createAdLink(dto);
  }

  @Get('admin/attribution')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: attribution & ROAS summary metrics' })
  getAttributionSummary() {
    return this.marketingService.getAttributionSummary();
  }
}
