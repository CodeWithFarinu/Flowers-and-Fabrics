import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CartAdapter {
  constructor(private readonly prisma: PrismaService) {}

  async findCartWithItems(userId: string) {
    return this.prisma.cart.findUnique({
      where: { userId },
      include: {
        coupon: true,
        items: {
          include: {
            product: {
              include: {
                images: { take: 1, orderBy: { sortOrder: 'asc' } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async createCart(userId: string) {
    return this.prisma.cart.create({
      data: { userId },
      include: {
        coupon: true,
        items: {
          include: {
            product: {
              include: { images: { take: 1, orderBy: { sortOrder: 'asc' } } },
            },
          },
        },
      },
    });
  }

  async findActiveProduct(productId: string) {
    return this.prisma.product.findUnique({
      where: { id: productId, deletedAt: null, status: 'ACTIVE' },
    });
  }

  async upsertCart(userId: string, data?: { couponId?: string | null }) {
    return this.prisma.cart.upsert({
      where: { userId },
      create: { userId, ...(data || {}) },
      update: { ...(data || {}) },
    });
  }

  async findCartItem(
    cartId: string,
    productId: string,
    color: string | null,
    size: string | null,
  ) {
    return this.prisma.cartItem.findFirst({
      where: { cartId, productId, color, size },
    });
  }

  async updateCartItemQuantity(id: string, quantity: number) {
    return this.prisma.cartItem.update({
      where: { id },
      data: { quantity },
    });
  }

  async createCartItem(data: {
    cartId: string;
    productId: string;
    quantity: number;
    color: string | null;
    size: string | null;
    unitPrice: any;
  }) {
    return this.prisma.cartItem.create({
      data,
    });
  }

  async findCartItemWithCart(itemId: string) {
    return this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });
  }

  async deleteCartItem(id: string) {
    return this.prisma.cartItem.delete({ where: { id } });
  }

  async findActiveCoupon(code: string) {
    return this.prisma.coupon.findUnique({
      where: { code, isActive: true },
    });
  }

  async removeCouponFromCart(userId: string) {
    return this.prisma.cart.update({
      where: { userId },
      data: { couponId: null },
    });
  }

  async findDefaultAddress(userId: string) {
    return this.prisma.address.findFirst({
      where: { userId, isDefault: true },
    });
  }

  async findAffiliateLinkByCode(code: string) {
    return this.prisma.affiliateLink.findUnique({
      where: { code },
    });
  }

  async createCheckoutOrder(orderData: {
    cartId: string;
    orderNumber: string;
    userId: string;
    addressId?: string;
    subtotal: number;
    discountAmount: number;
    deliveryFee: number;
    total: number;
    couponId?: string;
    notes?: string;
    affiliateLinkId?: string;
    paymentRef: string;
    items: Array<{
      productId: string;
      quantity: number;
      color: string | null;
      size: string | null;
      unitPrice: any;
      totalPrice: number;
    }>;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          orderNumber: orderData.orderNumber,
          userId: orderData.userId,
          addressId: orderData.addressId,
          status: 'PENDING',
          subtotal: orderData.subtotal,
          discountAmount: orderData.discountAmount,
          deliveryFee: orderData.deliveryFee,
          total: orderData.total,
          couponId: orderData.couponId,
          notes: orderData.notes,
          affiliateLinkId: orderData.affiliateLinkId,
          items: {
            create: orderData.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              color: item.color,
              size: item.size,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
            })),
          },
          payments: {
            create: {
              reference: orderData.paymentRef,
              amount: orderData.total,
              currency: 'NGN',
              status: 'PENDING',
              gateway: 'paystack',
            },
          },
          statusHistory: {
            create: {
              status: 'PENDING',
              note: 'Order initiated at checkout',
            },
          },
        },
        include: {
          items: true,
          payments: true,
        },
      });

      // Clear cart items
      await tx.cartItem.deleteMany({ where: { cartId: orderData.cartId } });
      await tx.cart.update({
        where: { id: orderData.cartId },
        data: { couponId: null },
      });

      return createdOrder;
    });
  }
}
