import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { UsersService } from './users.service';
import { UpdateProfileDto, CreateAddressDto } from './dto/interface.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@Request() req: any) {
    return this.usersService.getProfile(req.user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update profile information' })
  updateProfile(@Request() req: any, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.id, dto);
  }

  @Get('me/addresses')
  @ApiOperation({ summary: 'Get user address book' })
  getAddresses(@Request() req: any) {
    return this.usersService.getAddresses(req.user.id);
  }

  @Post('me/addresses')
  @ApiOperation({ summary: 'Add a new shipping address' })
  addAddress(@Request() req: any, @Body() dto: CreateAddressDto) {
    return this.usersService.addAddress(req.user.id, dto);
  }

  @Patch('me/addresses/:id')
  @ApiOperation({ summary: 'Update an existing shipping address' })
  updateAddress(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: Partial<CreateAddressDto>,
  ) {
    return this.usersService.updateAddress(req.user.id, id, dto);
  }

  @Delete('me/addresses/:id')
  @ApiOperation({ summary: 'Delete a shipping address' })
  deleteAddress(@Request() req: any, @Param('id') id: string) {
    return this.usersService.deleteAddress(req.user.id, id);
  }

  @Get('me/wishlist')
  @ApiOperation({ summary: 'Get user wishlist items' })
  getWishlist(@Request() req: any) {
    return this.usersService.getWishlist(req.user.id);
  }

  @Post('me/wishlist')
  @ApiOperation({ summary: 'Save product to wishlist' })
  addToWishlist(@Request() req: any, @Body('productId') productId: string) {
    return this.usersService.addToWishlist(req.user.id, productId);
  }

  @Delete('me/wishlist/:productId')
  @ApiOperation({ summary: 'Remove product from wishlist' })
  removeFromWishlist(
    @Request() req: any,
    @Param('productId') productId: string,
  ) {
    return this.usersService.removeFromWishlist(req.user.id, productId);
  }

  @Get('me/orders')
  @ApiOperation({ summary: 'Get user order history' })
  getOrders(@Request() req: any) {
    return this.usersService.getOrders(req.user.id);
  }

  @Get('admin/list')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Admin: list all patrons with search & pagination' })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search?: string,
  ) {
    return this.usersService.findAll(+page, +limit, search);
  }
}
