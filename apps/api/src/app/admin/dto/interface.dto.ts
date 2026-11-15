import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class AdminDashboardQueryDto {
  @ApiPropertyOptional({ default: '30d' })
  @IsOptional()
  @IsString()
  timeframe?: string;
}
