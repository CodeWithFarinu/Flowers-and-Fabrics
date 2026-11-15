import { ApiProperty } from '@nestjs/swagger';

export class LoyaltyTierInfo {
  @ApiProperty()
  name: string;

  @ApiProperty()
  threshold: number;

  @ApiProperty()
  badge: string;

  @ApiProperty()
  multiplier: number;
}
