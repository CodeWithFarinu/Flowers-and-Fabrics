import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class ApplyAffiliateDto {
  @ApiProperty({ example: 'Access Bank' })
  @IsString()
  bankName: string;

  @ApiProperty({ example: '0123456789' })
  @IsString()
  bankAccount: string;

  @ApiPropertyOptional({ example: '044' })
  @IsOptional()
  @IsString()
  bankCode?: string;
}

export class CreateAffiliateLinkDto {
  @ApiPropertyOptional({ example: 'prod_12345' })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiProperty({ example: '/product/royal-gold-damask' })
  @IsString()
  targetUrl: string;

  @ApiPropertyOptional({ example: 'My Instagram Bio Link' })
  @IsOptional()
  @IsString()
  label?: string;
}

export class RequestPayoutDto {
  @ApiProperty({ example: 50000 })
  @Type(() => Number)
  @IsNumber()
  amount: number;
}
