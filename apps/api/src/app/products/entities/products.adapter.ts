import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from '../dto/interface.dto';

@Injectable()
export class ProductsAdapter {
  constructor(private readonly prisma: PrismaService) {}

  async findProductsPaginated(
    where: any,
    skip: number,
    take: number,
    orderBy: any,
  ) {
    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          images: { orderBy: { sortOrder: 'asc' }, take: 2 },
          category: true,
          brand: true,
          _count: { select: { reviews: true, productLikes: true } },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { products, total };
  }

  async findBySlug(slug: string) {
    return this.prisma.product.findUnique({
      where: { slug, deletedAt: null },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        videos: true,
        category: true,
        brand: true,
        reviews: {
          where: { isApproved: true, deletedAt: null },
          include: {
            user: {
              select: { firstName: true, lastName: true, avatarUrl: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: { select: { productLikes: true, reviews: true } },
      },
    });
  }

  async incrementViewCount(productId: string) {
    return this.prisma.product.update({
      where: { id: productId },
      data: { viewCount: { increment: 1 } },
    });
  }

  async recordProductView(productId: string, userId: string) {
    return this.prisma.productView.create({
      data: { productId, userId },
    });
  }

  async findProductLike(userId: string, productId: string) {
    return this.prisma.productLike.findUnique({
      where: { userId_productId: { userId, productId } },
    });
  }

  async findProductById(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      select: { id: true, categoryId: true, productType: true },
    });
  }

  async findProductBySlugBasic(slug: string) {
    return this.prisma.product.findUnique({
      where: { slug },
      select: { id: true, categoryId: true, productType: true },
    });
  }

  async findSimilarProducts(
    excludeId: string,
    categoryId: string,
    productType: any,
  ) {
    return this.prisma.product.findMany({
      where: {
        deletedAt: null,
        status: 'ACTIVE',
        id: { not: excludeId },
        OR: [{ categoryId }, { productType }],
      },
      include: {
        images: { orderBy: { sortOrder: 'asc' }, take: 2 },
        category: true,
      },
      take: 12,
      orderBy: { trendingScore: 'desc' },
    });
  }

  async likeProduct(productId: string, userId: string) {
    await this.prisma.productLike.upsert({
      where: { userId_productId: { userId, productId } },
      create: { userId, productId },
      update: {},
    });
    return this.prisma.product.update({
      where: { id: productId },
      data: { likeCount: { increment: 1 } },
    });
  }

  async unlikeProduct(productId: string, userId: string) {
    await this.prisma.productLike.deleteMany({
      where: { userId, productId },
    });
    return this.prisma.product.update({
      where: { id: productId },
      data: { likeCount: { decrement: 1 } },
    });
  }

  async createProduct(dto: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        ...dto,
        status: 'DRAFT',
      } as any,
    });
  }

  async updateProduct(id: string, dto: UpdateProductDto) {
    return this.prisma.product.update({
      where: { id },
      data: dto as any,
    });
  }

  async softDeleteProduct(id: string) {
    return this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'ARCHIVED' },
    });
  }

  async publishProduct(id: string) {
    return this.prisma.product.update({
      where: { id },
      data: { status: 'ACTIVE', publishedAt: new Date() },
    });
  }

  async findAdminProductsPaginated(where: any, skip: number, take: number) {
    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          brand: true,
          images: { take: 1, orderBy: { sortOrder: 'asc' } },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { products, total };
  }

  async findCategories() {
    return this.prisma.category.findMany({
      where: { deletedAt: null },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findBrands() {
    return this.prisma.brand.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }
}
