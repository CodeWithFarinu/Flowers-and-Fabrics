import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateTicketDto {
  @ApiProperty({ example: 'Delivery inquiry for order AT-1234' })
  @IsString()
  subject: string;

  @ApiProperty({
    example: 'Hello, please what is the ETA for my delivery in Lekki?',
  })
  @IsString()
  message: string;
}

export class AddMessageDto {
  @ApiProperty({ example: 'Thank you for following up.' })
  @IsString()
  body: string;

  @ApiPropertyOptional()
  @IsOptional()
  attachments?: string[];
}
