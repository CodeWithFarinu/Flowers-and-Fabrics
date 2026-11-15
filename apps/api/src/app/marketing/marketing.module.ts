import { Module } from '@nestjs/common';
import { MarketingController } from './marketing.controller';
import { MarketingService } from './marketing.service';
import { MarketingAdapter } from './entities/marketing.adapter';

@Module({
  controllers: [MarketingController],
  providers: [MarketingService, MarketingAdapter],
  exports: [MarketingService, MarketingAdapter],
})
export class MarketingModule {}
