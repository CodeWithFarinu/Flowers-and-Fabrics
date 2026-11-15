import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export class InitializePaymentDto {
  @ApiProperty({
    example: 'ord-1718000000',
    description: 'Order ID to be paid for',
  })
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @ApiPropertyOptional({
    example: 'patron@domain.com',
    description: 'Customer email address for Paystack receipt',
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    example: 'http://localhost:4200/checkout?success=true',
    description: 'Callback redirect URL on payment completion',
  })
  @IsOptional()
  @IsString()
  callbackUrl?: string;

  @ApiPropertyOptional({
    example: ['card', 'bank_transfer', 'ussd'],
    description: 'Permitted payment channels for this checkout',
  })
  @IsOptional()
  @IsArray()
  channels?: string[];
}

export class VerifyPaymentDto {
  @ApiProperty({
    example: 'AT-PAY-1718000-abcd',
    description: 'Unique Paystack payment reference',
  })
  @IsString()
  @IsNotEmpty()
  reference: string;
}

export enum BillingCycle {
  MONTHLY = 'MONTHLY',
  ANNUAL = 'ANNUAL',
}

export class CreatePlanDto {
  @ApiProperty({ example: 'Teepha Sovereign VIP Plan' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: BillingCycle, example: BillingCycle.MONTHLY })
  @IsEnum(BillingCycle)
  billingCycle: BillingCycle;

  @ApiProperty({ example: 5000000, description: 'Amount in kobo (NGN x 100)' })
  @Type(() => Number)
  @IsNumber()
  amountKobo: number;

  @ApiPropertyOptional({ example: 'Access to monthly private fabric drops' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CancelSubscriptionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  subscriptionCode: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  emailToken: string;
}
