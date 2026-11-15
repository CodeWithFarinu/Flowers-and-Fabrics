import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PaymentsAdapter } from './entities/payments.adapter';
import { PaystackAdapter } from './adapters/paystack.adapter';
import { InitializePaymentDto } from './dto/interface.dto';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly paymentsAdapter: PaymentsAdapter,
    private readonly paystackAdapter: PaystackAdapter,
  ) {}

  async initializePayment(userEmail: string, dto: InitializePaymentDto) {
    const order = await this.paymentsAdapter.findOrderForPayment(dto.orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const email =
      dto.email || userEmail || order.user?.email || 'patron@domain.com';
    const amountKobo = Math.round(Number(order.total) * 100);
    const reference = `AT-${Date.now().toString().slice(-6)}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    // 1. Initialize Paystack transaction
    const paystackResult = await this.paystackAdapter.initializeTransaction({
      email,
      amountKobo,
      reference,
      callbackUrl: dto.callbackUrl,
      channels: dto.channels || ['card', 'bank_transfer', 'ussd', 'qr'],
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        userId: order.userId,
      },
    });

    // 2. Persist payment record in DB
    const payment = await this.paymentsAdapter.createPaymentRecord({
      orderId: order.id,
      reference,
      amount: Number(order.total),
      gateway: 'paystack',
    });

    // 3. Log initial attempt
    await this.paymentsAdapter.recordPaymentAttempt({
      paymentId: payment.id,
      gateway: 'paystack',
      reference,
      status: 'INITIALIZED',
      response: {
        accessCode: paystackResult.accessCode,
        authorizationUrl: paystackResult.authorizationUrl,
      },
    });

    this.logger.log(
      `Paystack payment initialized for order ${order.orderNumber} (ref: ${reference})`,
    );

    return {
      authorizationUrl: paystackResult.authorizationUrl,
      accessCode: paystackResult.accessCode,
      reference,
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: Number(order.total),
      currency: 'NGN',
    };
  }

  async verifyPayment(reference: string) {
    // 1. Verify with Paystack API / Adapter
    const result = await this.paystackAdapter.verifyTransaction(reference);

    // 2. Find payment record in our DB
    const payment = await this.paymentsAdapter.findPaymentWithOrder(reference);

    if (!payment) {
      throw new NotFoundException(
        `Payment with reference "${reference}" not found`,
      );
    }

    if (payment.status === 'SUCCESS') {
      return {
        success: true,
        payment,
        message: 'Payment already verified and credited',
      };
    }

    if (!result.success) {
      throw new BadRequestException('Payment verification failed on Paystack');
    }

    // 3. Confirm payment, update order status, deduct inventory
    const updated = await this.paymentsAdapter.confirmPaymentAndOrder(
      payment.id,
      payment.orderId,
      reference,
      result,
    );

    this.logger.log(`Payment confirmed & verified for reference: ${reference}`);

    return {
      success: true,
      payment: updated,
      message: 'Payment verified successfully and order confirmed',
    };
  }

  async handlePaystackWebhook(rawBody: any, signature: string, body: any) {
    // In production with live keys, validate webhook signature
    if (signature && process.env.PAYSTACK_SECRET_KEY) {
      const isValid = this.paystackAdapter.validateWebhookSignature(
        rawBody || JSON.stringify(body),
        signature,
      );
      if (!isValid) {
        this.logger.warn('Invalid Paystack webhook signature rejected');
        return { status: 'invalid_signature' };
      }
    }

    const event = body?.event;
    const data = body?.data;

    if (event === 'charge.success' && data && data.reference) {
      this.logger.log(
        `Webhook charge.success received for reference ${data.reference}`,
      );
      try {
        await this.verifyPayment(data.reference);
        return { status: 'processed' };
      } catch (err: any) {
        this.logger.error(`Webhook processing error: ${err?.message}`);
      }
    }

    return { status: 'ignored' };
  }

  getConfig() {
    return {
      publicKey:
        process.env.PAYSTACK_PUBLIC_KEY || 'pk_test_sample_paystack_public_key',
      isLive: process.env.NODE_ENV === 'production',
    };
  }
}
