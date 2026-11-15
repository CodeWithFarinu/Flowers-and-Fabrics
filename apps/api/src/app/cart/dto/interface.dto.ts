import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AddToCartDto {
  @ApiProperty({ example: 'prod_cm1234' })
  @IsString()
  productId: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  quantity?: number;

  @ApiPropertyOptional({ example: 'Imperial Gold' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ example: '5 Yards' })
  @IsOptional()
  @IsString()
  size?: string;
}

export class UpdateCartItemDto {
  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class ApplyCouponDto {
  @ApiProperty({ example: 'AETHER10' })
  @IsString()
  code: string;
}

export class CheckoutInitiateDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  addressId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deliveryMethod?: 'STANDARD' | 'EXPRESS_LAGOS' | 'NATIONWIDE';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  trackingCode?: string;
}
