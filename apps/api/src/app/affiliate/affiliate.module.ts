import { Module } from '@nestjs/common';
import { AffiliateController } from './affiliate.controller';
import { AffiliateService } from './affiliate.service';
import { AffiliateAdapter } from './entities/affiliate.adapter';

@Module({
  controllers: [AffiliateController],
  providers: [AffiliateService, AffiliateAdapter],
  exports: [AffiliateService, AffiliateAdapter],
})
export class AffiliateModule {}
