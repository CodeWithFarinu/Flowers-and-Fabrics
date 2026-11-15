import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AffiliateService } from './affiliate.service';
import {
  ApplyAffiliateDto,
  CreateAffiliateLinkDto,
  RequestPayoutDto,
} from './dto/interface.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('Affiliate Network')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('affiliate')
export class AffiliateController {
  constructor(private readonly affiliateService: AffiliateService) {}

  @Post('apply')
  @ApiOperation({ summary: 'Apply to become a verified brand affiliate' })
  apply(@Request() req: any, @Body() dto: ApplyAffiliateDto) {
    return this.affiliateService.apply(req.user.id, dto);
  }

  @Get('dashboard')
  @ApiOperation({
    summary:
      'Get affiliate dashboard with earnings, clicks and conversion stats',
  })
  getDashboard(@Request() req: any) {
    return this.affiliateService.getDashboard(req.user.id);
  }

  @Post('links')
  @ApiOperation({
    summary: 'Generate tracked commission link for products or collections',
  })
  createLink(@Request() req: any, @Body() dto: CreateAffiliateLinkDto) {
    return this.affiliateService.createLink(req.user.id, dto);
  }

  @Post('payout/request')
  @ApiOperation({ summary: 'Request affiliate commission payout to bank' })
  requestPayout(@Request() req: any, @Body() dto: RequestPayoutDto) {
    return this.affiliateService.requestPayout(req.user.id, dto);
  }

  @Get('admin/list')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Admin: list all affiliates and their metrics' })
  adminList() {
    return this.affiliateService.adminListAffiliates();
  }

  @Patch('admin/:id/status')
  @UseGuards(AdminGuard)
  @ApiOperation({
    summary: 'Admin: approve, reject, or suspend affiliate account',
  })
  adminUpdateStatus(
    @Param('id') id: string,
    @Body('status') status: 'APPROVED' | 'REJECTED' | 'SUSPENDED',
  ) {
    return this.affiliateService.adminUpdateStatus(id, status);
  }
}
