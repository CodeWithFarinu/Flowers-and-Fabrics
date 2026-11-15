import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentsAdapter } from './entities/payments.adapter';
import { PaystackAdapter } from './adapters/paystack.adapter';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentsAdapter, PaystackAdapter],
  exports: [PaymentsService, PaymentsAdapter, PaystackAdapter],
})
export class PaymentsModule {}
