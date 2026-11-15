import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { LoyaltyService } from './loyalty.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Loyalty & Rewards')
@Controller('loyalty')
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @Get('balance')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current loyalty points balance, tier, and progression status',
  })
  getBalance(@Request() req: any) {
    return this.loyaltyService.getLoyaltySummary(req.user.id);
  }

  @Get('transactions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get point earnings and reward redemption history' })
  getTransactions(@Request() req: any) {
    return this.loyaltyService.getTransactions(req.user.id);
  }

  @Get('tiers')
  @ApiOperation({ summary: 'Get tier thresholds and privileges breakdown' })
  getTiers() {
    return this.loyaltyService.getTiers();
  }
}
