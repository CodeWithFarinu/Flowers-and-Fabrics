import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class GenerateOutfitDto {
  @ApiProperty({
    example: 'Tailored Senator style in imperial gold with embroidered placket',
  })
  @IsString()
  prompt: string;

  @ApiPropertyOptional({ example: 'prod_cm1234' })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiPropertyOptional({ example: 'traditional_senator' })
  @IsOptional()
  @IsString()
  style?: string;
}

export class AdminGenerateModelDto {
  @ApiProperty({ example: 'prod_cm1234' })
  @IsString()
  productId: string;

  @ApiPropertyOptional({ example: 'deep-melanin' })
  @IsOptional()
  @IsString()
  skinTone?: string;

  @ApiPropertyOptional({ example: 'editorial-studio-lighting' })
  @IsOptional()
  @IsString()
  lighting?: string;

  @ApiPropertyOptional({ example: 'agbada' })
  @IsOptional()
  @IsString()
  garmentType?: string;
}
