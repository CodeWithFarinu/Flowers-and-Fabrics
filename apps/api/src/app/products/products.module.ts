import { Module } from '@nestjs/common';
import {
  ProductsController,
  AdminProductsController,
} from './products.controller';
import { ProductsService } from './products.service';
import { ProductsAdapter } from './entities/products.adapter';

@Module({
  controllers: [ProductsController, AdminProductsController],
  providers: [ProductsService, ProductsAdapter],
  exports: [ProductsService, ProductsAdapter],
})
export class ProductsModule {}
