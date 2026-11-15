import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Headers,
  HttpCode,
  Request,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { InitializePaymentDto, VerifyPaymentDto } from './dto/interface.dto';
import { OptionalJwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Payments & Gateways')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('config')
  @ApiOperation({
    summary: 'Get Paystack public key configuration for frontend checkout',
  })
  getConfig() {
    return this.paymentsService.getConfig();
  }

  @Post('initialize')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Initialize Paystack checkout transaction for an order',
  })
  initialize(@Request() req: any, @Body() dto: InitializePaymentDto) {
    const userEmail = req?.user?.email;
    return this.paymentsService.initializePayment(userEmail, dto);
  }

  @Get('verify/:reference')
  @ApiOperation({ summary: 'Verify payment status with gateway reference' })
  verify(@Param('reference') reference: string) {
    return this.paymentsService.verifyPayment(reference);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify payment status with reference in body' })
  verifyPost(@Body() dto: VerifyPaymentDto) {
    return this.paymentsService.verifyPayment(dto.reference);
  }

  @Post('paystack/webhook')
  @HttpCode(200)
  @ApiOperation({ summary: 'Paystack payment gateway webhook listener' })
  paystackWebhook(
    @Req() req: any,
    @Body() body: any,
    @Headers('x-paystack-signature') signature: string,
  ) {
    const rawBody = req.rawBody || body;
    return this.paymentsService.handlePaystackWebhook(rawBody, signature, body);
  }
}
