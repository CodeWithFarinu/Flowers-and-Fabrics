import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CartAdapter } from './entities/cart.adapter';

@Module({
  controllers: [CartController],
  providers: [CartService, CartAdapter],
  exports: [CartService, CartAdapter],
})
export class CartModule {}
