import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductsAdapter } from './entities/products.adapter';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductQueryDto,
} from './dto/interface.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly productsAdapter: ProductsAdapter) {}

  async findAll(query: ProductQueryDto) {
    const page = parseInt(query.page || '1');
    const limit = Math.min(parseInt(query.limit || '20'), 50);
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null, status: 'ACTIVE' };

    if (query.category) where.category = { slug: query.category };
    if (query.brand) where.brand = { slug: query.brand };
    if (query.productType) where.productType = query.productType;

    if (query.minPrice || query.maxPrice) {
      where.price = {};
      if (query.minPrice) where.price.gte = parseFloat(query.minPrice);
      if (query.maxPrice) where.price.lte = parseFloat(query.maxPrice);
    }

    if (query.inStock === 'true') {
      where.stockQuantity = { gt: 0 };
    }

    if (query.tags) {
      where.tags = { hasSome: query.tags.split(',') };
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { material: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = {};
    switch (query.sortBy) {
      case 'price_asc':
        orderBy.price = 'asc';
        break;
      case 'price_desc':
        orderBy.price = 'desc';
        break;
      case 'trending':
        orderBy.trendingScore = 'desc';
        break;
      case 'popular':
        orderBy.viewCount = 'desc';
        break;
      case 'newest':
      default:
        orderBy.createdAt = 'desc';
        break;
    }

    const { products, total } =
      await this.productsAdapter.findProductsPaginated(
        where,
        skip,
        limit,
        orderBy,
      );

    return {
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findBySlug(slug: string, userId?: string) {
    const product = await this.productsAdapter.findBySlug(slug);

    if (!product) throw new NotFoundException('Product not found');

    // Async record view
    this.productsAdapter.incrementViewCount(product.id).catch(() => {});

    if (userId) {
      this.productsAdapter
        .recordProductView(product.id, userId)
        .catch(() => {});
    }

    let isLiked = false;
    if (userId) {
      const like = await this.productsAdapter.findProductLike(
        userId,
        product.id,
      );
      isLiked = !!like;
    }

    return {
      ...product,
      isLiked,
    };
  }

  async getSimilar(slug: string) {
    const current = await this.productsAdapter.findProductBySlugBasic(slug);
    if (!current) throw new NotFoundException('Product not found');

    return this.productsAdapter.findSimilarProducts(
      current.id,
      current.categoryId,
      current.productType,
    );
  }

  async likeProduct(productId: string, userId: string) {
    await this.productsAdapter.likeProduct(productId, userId);
    return { success: true, isLiked: true };
  }

  async unlikeProduct(productId: string, userId: string) {
    await this.productsAdapter.unlikeProduct(productId, userId);
    return { success: true, isLiked: false };
  }

  // Admin Operations
  async create(dto: CreateProductDto) {
    return this.productsAdapter.createProduct(dto);
  }

  async update(id: string, dto: UpdateProductDto) {
    return this.productsAdapter.updateProduct(id, dto);
  }

  async softDelete(id: string) {
    return this.productsAdapter.softDeleteProduct(id);
  }

  async publish(id: string) {
    return this.productsAdapter.publishProduct(id);
  }

  async adminFindAll(page = 1, limit = 20, status?: string, search?: string) {
    const where: any = { deletedAt: null };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;
    const { products, total } =
      await this.productsAdapter.findAdminProductsPaginated(where, skip, limit);

    return {
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getCategories() {
    return this.productsAdapter.findCategories();
  }

  async getBrands() {
    return this.productsAdapter.findBrands();
  }
}
