import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service';
import {
  AddToCartDto,
  UpdateCartItemDto,
  ApplyCouponDto,
  CheckoutInitiateDto,
} from './dto/interface.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Cart & Checkout')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({
    summary: 'Get current user cart with computed totals and active discounts',
  })
  getCart(@Request() req: any) {
    return this.cartService.getCart(req.user.id);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add product variant to cart' })
  addToCart(@Request() req: any, @Body() dto: AddToCartDto) {
    return this.cartService.addToCart(req.user.id, dto);
  }

  @Patch('items/:id')
  @ApiOperation({ summary: 'Update cart item quantity' })
  updateItem(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(req.user.id, id, dto);
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Remove item from cart' })
  removeItem(@Request() req: any, @Param('id') id: string) {
    return this.cartService.removeItem(req.user.id, id);
  }

  @Post('coupon')
  @ApiOperation({ summary: 'Apply promotional coupon code to cart' })
  applyCoupon(@Request() req: any, @Body() dto: ApplyCouponDto) {
    return this.cartService.applyCoupon(req.user.id, dto);
  }

  @Delete('coupon')
  @ApiOperation({ summary: 'Remove applied coupon' })
  removeCoupon(@Request() req: any) {
    return this.cartService.removeCoupon(req.user.id);
  }

  @Post('checkout')
  @ApiOperation({
    summary: '3-Step instant checkout: turn cart into confirmed pending order',
  })
  checkout(@Request() req: any, @Body() dto: CheckoutInitiateDto) {
    return this.cartService.checkout(req.user.id, dto);
  }
}
