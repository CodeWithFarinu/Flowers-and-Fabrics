import { Module } from '@nestjs/common';
import { LoyaltyController } from './loyalty.controller';
import { LoyaltyService } from './loyalty.service';
import { LoyaltyAdapter } from './entities/loyalty.adapter';

@Module({
  controllers: [LoyaltyController],
  providers: [LoyaltyService, LoyaltyAdapter],
  exports: [LoyaltyService, LoyaltyAdapter],
})
export class LoyaltyModule {}
