import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductQueryDto,
} from './dto/interface.dto';
import {
  JwtAuthGuard,
  OptionalJwtAuthGuard,
} from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('Catalog & Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({
    summary: 'List published products with filtering, search and sorting',
  })
  findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all active product categories' })
  getCategories() {
    return this.productsService.getCategories();
  }

  @Get('brands')
  @ApiOperation({ summary: 'Get all luxury brands' })
  getBrands() {
    return this.productsService.getBrands();
  }

  @Get('similar/:slug')
  @ApiOperation({
    summary: 'Get related and recommended products based on product slug',
  })
  getSimilar(@Param('slug') slug: string) {
    return this.productsService.getSimilar(slug);
  }

  @Get(':slug')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get full product detail by slug' })
  findOne(@Param('slug') slug: string, @Request() req: any) {
    return this.productsService.findBySlug(slug, req.user?.id);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Like or save a product' })
  like(@Param('id') id: string, @Request() req: any) {
    return this.productsService.likeProduct(id, req.user.id);
  }

  @Delete(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove like or unsave a product' })
  unlike(@Param('id') id: string, @Request() req: any) {
    return this.productsService.unlikeProduct(id, req.user.id);
  }
}

@ApiTags('Admin Catalog')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/products')
export class AdminProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({
    summary: 'Admin: list all products with draft/archived status',
  })
  adminList(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.productsService.adminFindAll(+page, +limit, status, search);
  }

  @Post()
  @ApiOperation({ summary: 'Admin: create a new product' })
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Admin: update product attributes, stock, pricing' })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Patch(':id/publish')
  @ApiOperation({ summary: 'Admin: publish draft product to live store' })
  publish(@Param('id') id: string) {
    return this.productsService.publish(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Admin: soft delete / archive product' })
  softDelete(@Param('id') id: string) {
    return this.productsService.softDelete(id);
  }
}
