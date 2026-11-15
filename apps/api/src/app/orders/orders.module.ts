import { Module } from '@nestjs/common';
import { OrdersController, AdminOrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrdersAdapter } from './entities/orders.adapter';

@Module({
  controllers: [OrdersController, AdminOrdersController],
  providers: [OrdersService, OrdersAdapter],
  exports: [OrdersService, OrdersAdapter],
})
export class OrdersModule {}
