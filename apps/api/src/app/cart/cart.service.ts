import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CartAdapter } from './entities/cart.adapter';
import {
  AddToCartDto,
  UpdateCartItemDto,
  ApplyCouponDto,
  CheckoutInitiateDto,
} from './dto/interface.dto';
import * as crypto from 'crypto';

@Injectable()
export class CartService {
  constructor(private readonly cartAdapter: CartAdapter) {}

  async getCart(userId: string) {
    let cart = await this.cartAdapter.findCartWithItems(userId);

    if (!cart) {
      cart = await this.cartAdapter.createCart(userId);
    }

    // Compute totals
    const subtotal = cart.items.reduce(
      (acc, item) => acc + Number(item.unitPrice) * item.quantity,
      0,
    );

    let discountAmount = 0;
    if (cart.coupon && cart.coupon.isActive) {
      if (cart.coupon.discountType === 'PERCENTAGE') {
        discountAmount = (subtotal * Number(cart.coupon.discountValue)) / 100;
        if (
          cart.coupon.maxDiscount &&
          discountAmount > Number(cart.coupon.maxDiscount)
        ) {
          discountAmount = Number(cart.coupon.maxDiscount);
        }
      } else {
        discountAmount = Number(cart.coupon.discountValue);
      }
    }

    const deliveryFee = subtotal > 150000 ? 0 : 3500; // Free delivery over 150k
    const total = Math.max(0, subtotal - discountAmount + deliveryFee);

    return {
      id: cart.id,
      items: cart.items,
      coupon: cart.coupon,
      subtotal,
      discountAmount,
      deliveryFee,
      total,
      currency: 'NGN',
    };
  }

  async addToCart(userId: string, dto: AddToCartDto) {
    const product = await this.cartAdapter.findActiveProduct(dto.productId);
    if (!product)
      throw new NotFoundException('Product not found or unavailable');

    const cart = await this.cartAdapter.upsertCart(userId);

    const quantity = dto.quantity || 1;
    const color = dto.color || null;
    const size = dto.size || null;

    const existingItem = await this.cartAdapter.findCartItem(
      cart.id,
      dto.productId,
      color,
      size,
    );

    if (existingItem) {
      await this.cartAdapter.updateCartItemQuantity(
        existingItem.id,
        existingItem.quantity + quantity,
      );
    } else {
      await this.cartAdapter.createCartItem({
        cartId: cart.id,
        productId: dto.productId,
        quantity,
        color,
        size,
        unitPrice: product.price,
      });
    }

    return this.getCart(userId);
  }

  async updateItem(userId: string, itemId: string, dto: UpdateCartItemDto) {
    const item = await this.cartAdapter.findCartItemWithCart(itemId);
    if (!item || item.cart.userId !== userId) {
      throw new NotFoundException('Cart item not found');
    }

    await this.cartAdapter.updateCartItemQuantity(itemId, dto.quantity);

    return this.getCart(userId);
  }

  async removeItem(userId: string, itemId: string) {
    const item = await this.cartAdapter.findCartItemWithCart(itemId);
    if (!item || item.cart.userId !== userId) {
      throw new NotFoundException('Cart item not found');
    }

    await this.cartAdapter.deleteCartItem(itemId);
    return this.getCart(userId);
  }

  async applyCoupon(userId: string, dto: ApplyCouponDto) {
    const code = dto.code.trim().toUpperCase();
    const coupon = await this.cartAdapter.findActiveCoupon(code);

    if (!coupon)
      throw new BadRequestException('Invalid or expired coupon code');

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      throw new BadRequestException('This coupon has expired');
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      throw new BadRequestException(
        'This coupon has reached its maximum usage limit',
      );
    }

    await this.cartAdapter.upsertCart(userId, { couponId: coupon.id });

    return this.getCart(userId);
  }

  async removeCoupon(userId: string) {
    await this.cartAdapter.removeCouponFromCart(userId);
    return this.getCart(userId);
  }

  async checkout(userId: string, dto: CheckoutInitiateDto) {
    const cartSummary = await this.getCart(userId);
    if (!cartSummary.items || cartSummary.items.length === 0) {
      throw new BadRequestException('Your cart is empty');
    }

    // Check default address if not provided
    let addressId = dto.addressId;
    if (!addressId) {
      const defaultAddr = await this.cartAdapter.findDefaultAddress(userId);
      addressId = defaultAddr?.id;
    }

    // Resolve affiliate link if code was provided
    let affiliateLinkId: string | undefined;
    if (dto.trackingCode) {
      const affLink = await this.cartAdapter.findAffiliateLinkByCode(
        dto.trackingCode,
      );
      if (affLink) affiliateLinkId = affLink.id;
    }

    const orderNumber = `AT-${Date.now().toString().slice(-6)}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
    const paymentRef = `PAY-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

    const order = await this.cartAdapter.createCheckoutOrder({
      cartId: cartSummary.id,
      orderNumber,
      userId,
      addressId,
      subtotal: cartSummary.subtotal,
      discountAmount: cartSummary.discountAmount,
      deliveryFee: cartSummary.deliveryFee,
      total: cartSummary.total,
      couponId: cartSummary.coupon?.id,
      notes: dto.notes,
      affiliateLinkId,
      paymentRef,
      items: cartSummary.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        color: item.color,
        size: item.size,
        unitPrice: item.unitPrice,
        totalPrice: Number(item.unitPrice) * item.quantity,
      })),
    });

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      total: order.total,
      currency: 'NGN',
      paymentReference: paymentRef,
      paymentUrl: `https://checkout.paystack.com/simulate/${paymentRef}`,
      message: 'Order placed successfully. Proceed to payment.',
    };
  }
}
