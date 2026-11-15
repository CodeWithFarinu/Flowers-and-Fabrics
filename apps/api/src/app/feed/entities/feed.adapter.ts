import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FeedAdapter {
  constructor(private readonly prisma: PrismaService) {}

  async getUserPreferredCategories(userId: string): Promise<string[]> {
    const [views, likes] = await Promise.all([
      this.prisma.productView.findMany({
        where: { userId },
        select: { product: { select: { categoryId: true } } },
        take: 10,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.productLike.findMany({
        where: { userId },
        select: { product: { select: { categoryId: true } } },
        take: 10,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return [
      ...new Set([
        ...views.map((v) => v.product.categoryId),
        ...likes.map((l) => l.product.categoryId),
      ]),
    ].filter(Boolean) as string[];
  }

  async findFeedCandidates(cursor?: string, take = 20) {
    const where: any = {
      deletedAt: null,
      status: 'ACTIVE',
    };

    let cursorObj = undefined;
    if (cursor) {
      cursorObj = { id: cursor };
    }

    return this.prisma.product.findMany({
      where,
      take: take + 1,
      skip: cursor ? 1 : 0,
      cursor: cursorObj,
      orderBy: [
        { isFeatured: 'desc' },
        { trendingScore: 'desc' },
        { viewCount: 'desc' },
        { createdAt: 'desc' },
      ],
      include: {
        images: { orderBy: { sortOrder: 'asc' }, take: 2 },
        category: true,
        brand: true,
        _count: { select: { reviews: true, productLikes: true } },
      },
    });
  }

  async findTrending(limit = 12) {
    return this.prisma.product.findMany({
      where: { deletedAt: null, status: 'ACTIVE' },
      take: limit,
      orderBy: [{ trendingScore: 'desc' }, { viewCount: 'desc' }],
      include: {
        images: { orderBy: { sortOrder: 'asc' }, take: 2 },
        category: true,
      },
    });
  }

  async findNewArrivals(limit = 12) {
    return this.prisma.product.findMany({
      where: { deletedAt: null, status: 'ACTIVE' },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        images: { orderBy: { sortOrder: 'asc' }, take: 2 },
        category: true,
      },
    });
  }
}
