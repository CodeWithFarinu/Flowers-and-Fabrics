import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { FeedService } from './feed.service';
import { OptionalJwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FeedQueryDto, FeedLimitQueryDto } from './dto/interface.dto';

@ApiTags('Discovery & Personalized Feed')
@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: 'Infinite personalized product feed with cursor-based pagination',
  })
  getFeed(@Request() req: any, @Query() query: FeedQueryDto) {
    return this.feedService.getPersonalizedFeed(
      req.user?.id,
      query.cursor,
      query.limit ? +query.limit : 20,
    );
  }

  @Get('trending')
  @ApiOperation({
    summary: 'Top trending fabrics, sneakers and luxury accessories',
  })
  getTrending(@Query() query: FeedLimitQueryDto) {
    return this.feedService.getTrending(query.limit ? +query.limit : 12);
  }

  @Get('new-arrivals')
  @ApiOperation({ summary: 'Latest arrivals freshly stocked' })
  getNewArrivals(@Query() query: FeedLimitQueryDto) {
    return this.feedService.getNewArrivals(query.limit ? +query.limit : 12);
  }
}
