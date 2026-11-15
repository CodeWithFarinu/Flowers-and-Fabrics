import { Injectable, NotFoundException } from '@nestjs/common';
import { OrdersAdapter } from './entities/orders.adapter';
import { UpdateOrderStatusDto, OrderQueryDto } from './dto/interface.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly ordersAdapter: OrdersAdapter) {}

  async getUserOrders(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const { orders, total } = await this.ordersAdapter.findUserOrdersPaginated(
      userId,
      skip,
      limit,
    );

    return { orders, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getOrderById(orderId: string, userId?: string) {
    const order = await this.ordersAdapter.findOrderByIdWithDetails(
      orderId,
      userId,
    );
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async adminListOrders(query: OrderQueryDto) {
    const page = parseInt(query.page || '1');
    const limit = Math.min(parseInt(query.limit || '20'), 50);
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };
    if (query.status) where.status = query.status;
    if (query.search) {
      where.OR = [
        { orderNumber: { contains: query.search } },
        { user: { phone: { contains: query.search } } },
        {
          user: { firstName: { contains: query.search, mode: 'insensitive' } },
        },
        { user: { lastName: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const { orders, total } = await this.ordersAdapter.findAdminOrdersPaginated(
      where,
      skip,
      limit,
    );

    return { orders, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async updateStatus(orderId: string, dto: UpdateOrderStatusDto) {
    const order = await this.ordersAdapter.findOrderWithUser(orderId);
    if (!order) throw new NotFoundException('Order not found');

    return this.ordersAdapter.updateOrderStatusAndRelated(orderId, order, dto);
  }
}
