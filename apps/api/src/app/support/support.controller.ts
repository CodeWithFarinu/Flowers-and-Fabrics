import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SupportService } from './support.service';
import { CreateTicketDto, AddMessageDto } from './dto/interface.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('Support Desk & Help')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('tickets')
  @ApiOperation({ summary: 'Customer: submit new support desk ticket' })
  createTicket(@Request() req: any, @Body() dto: CreateTicketDto) {
    return this.supportService.createTicket(req.user.id, dto);
  }

  @Get('tickets')
  @ApiOperation({ summary: 'Customer: get all personal support tickets' })
  getUserTickets(@Request() req: any) {
    return this.supportService.getUserTickets(req.user.id);
  }

  @Get('tickets/:id')
  @ApiOperation({ summary: 'Customer: get ticket messages and thread' })
  getTicket(@Request() req: any, @Param('id') id: string) {
    return this.supportService.getTicketById(id, req.user.id);
  }

  @Post('tickets/:id/messages')
  @ApiOperation({ summary: 'Customer: reply to an open support ticket' })
  addMessage(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: AddMessageDto,
  ) {
    return this.supportService.addMessage(id, req.user.id, dto, false);
  }

  @Get('admin/tickets')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Admin: list support tickets by status' })
  adminList(@Query('status') status?: string) {
    return this.supportService.adminListTickets(status);
  }

  @Post('admin/tickets/:id/reply')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Admin: respond to ticket as support agent' })
  adminReply(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: AddMessageDto,
  ) {
    return this.supportService.addMessage(id, req.user.id, dto, true);
  }

  @Patch('admin/tickets/:id/resolve')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Admin: mark ticket as resolved' })
  adminResolve(@Param('id') id: string) {
    return this.supportService.adminCloseTicket(id);
  }
}
