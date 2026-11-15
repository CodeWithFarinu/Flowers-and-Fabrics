import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ProductTypeDto {
  FABRIC = 'FABRIC',
  ACCESSORY = 'ACCESSORY',
  SNEAKER = 'SNEAKER',
  OTHER = 'OTHER',
}

export class CreateProductDto {
  @ApiProperty({ example: 'Imperial Gold Damask Fabric' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'imperial-gold-damask-fabric' })
  @IsString()
  slug: string;

  @ApiPropertyOptional({
    example:
      'Heavyweight gold woven jacquard damask for royal ceremonial attire.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiProperty({ example: 45000 })
  @Type(() => Number)
  @IsNumber()
  price: number;

  @ApiPropertyOptional({ example: 55000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  compareAtPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  costPrice?: number;

  @ApiProperty({ enum: ProductTypeDto, default: ProductTypeDto.FABRIC })
  @IsEnum(ProductTypeDto)
  productType: ProductTypeDto;

  @ApiProperty({ example: 'cat_fabrics_01' })
  @IsString()
  categoryId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  brandId?: string;

  @ApiPropertyOptional({ example: '100% Jacquard Silk Cotton' })
  @IsOptional()
  @IsString()
  material?: string;

  @ApiPropertyOptional({ example: [{ name: 'Imperial Gold', hex: '#D4AF37' }] })
  @IsOptional()
  @IsArray()
  colorVariants?: any[];

  @ApiPropertyOptional({
    example: [{ size: '5 Yards (Head-Tie / Wrapper)', inStock: true }],
  })
  @IsOptional()
  @IsArray()
  sizeVariants?: any[];

  @ApiPropertyOptional()
  @IsOptional()
  attributes?: any;

  @ApiPropertyOptional({ example: ['jacquard', 'damask', 'ceremony', 'gold'] })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiPropertyOptional({ default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  stockQuantity?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}

export class UpdateProductDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  price?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  compareAtPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(ProductTypeDto)
  productType?: ProductTypeDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  brandId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  colorVariants?: any[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  sizeVariants?: any[];

  @ApiPropertyOptional()
  @IsOptional()
  attributes?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  stockQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: 'DRAFT' | 'ACTIVE' | 'ARCHIVED' | 'OUT_OF_STOCK';
}

export class ProductQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ enum: ProductTypeDto })
  @IsOptional()
  @IsString()
  productType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  minPrice?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  maxPrice?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  inStock?: string;

  @ApiPropertyOptional({
    enum: ['newest', 'price_asc', 'price_desc', 'trending', 'popular'],
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ default: '1' })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiPropertyOptional({ default: '20' })
  @IsOptional()
  @IsString()
  limit?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}
