import { Module } from '@nestjs/common';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';
import { FeedAdapter } from './entities/feed.adapter';

@Module({
  controllers: [FeedController],
  providers: [FeedService, FeedAdapter],
  exports: [FeedService, FeedAdapter],
})
export class FeedModule {}
