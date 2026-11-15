import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminDashboardQueryDto } from './dto/interface.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('Admin Operations & Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard/overview')
  @ApiOperation({
    summary: 'Real-time GMV, AOV, Orders, Funnel and Conversion metrics',
  })
  getOverview(@Query() query: AdminDashboardQueryDto) {
    return this.adminService.getDashboardOverview(query.timeframe);
  }
}
