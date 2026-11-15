import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { UpdateOrderStatusDto, OrderQueryDto } from './dto/interface.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user orders' })
  getUserOrders(
    @Request() req: any,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.ordersService.getUserOrders(req.user.id, +page, +limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order details by order ID' })
  getOrderById(@Request() req: any, @Param('id') id: string) {
    return this.ordersService.getOrderById(id, req.user.id);
  }
}

@ApiTags('Admin Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/orders')
export class AdminOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Admin: list all customer orders with filters' })
  adminList(@Query() query: OrderQueryDto) {
    return this.ordersService.adminListOrders(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Admin: get complete order details with customer and history',
  })
  adminGetOne(@Param('id') id: string) {
    return this.ordersService.getOrderById(id);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary:
      'Admin: update order status (CONFIRMED, PACKED, SHIPPED, DELIVERED)',
  })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, dto);
  }
}
