import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAdLinkDto {
  @ApiProperty({ example: 'Instagram Lace Campaign 2026' })
  @IsString()
  label: string;

  @ApiProperty({ example: '/collection/imperial-lace' })
  @IsString()
  targetUrl: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  campaignId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiPropertyOptional({ example: 'instagram' })
  @IsOptional()
  @IsString()
  utmSource?: string;

  @ApiPropertyOptional({ example: 'paid_ad' })
  @IsOptional()
  @IsString()
  utmMedium?: string;

  @ApiPropertyOptional({ example: 'owambe_special' })
  @IsOptional()
  @IsString()
  utmCampaign?: string;
}

export class CreateCampaignDto {
  @ApiProperty({ example: 'Detty December Owambe Mega Drop' })
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 500000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  budget?: number;
}
