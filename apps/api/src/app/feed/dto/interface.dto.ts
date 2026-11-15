import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class FeedQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({ default: '20' })
  @IsOptional()
  @IsString()
  limit?: string;
}

export class FeedLimitQueryDto {
  @ApiPropertyOptional({ default: '12' })
  @IsOptional()
  @IsString()
  limit?: string;
}
