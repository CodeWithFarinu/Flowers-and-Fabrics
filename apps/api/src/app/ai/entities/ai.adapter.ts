import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AiAdapter {
  constructor(private readonly prisma: PrismaService) {}

  async findUserImageTokens(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, imageGenTokens: true },
    });
  }

  async decrementUserImageTokens(userId: string, count = 1) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { imageGenTokens: { decrement: count } },
    });
  }

  async createAiImageGeneration(data: {
    userId: string;
    prompt: string;
    resultUrl: string;
    status: 'COMPLETED';
    tokensUsed: number;
    styleConfig: any;
  }) {
    return this.prisma.aiImageGeneration.create({
      data,
    });
  }

  async findUserGenerations(userId: string, take = 30) {
    return this.prisma.aiImageGeneration.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take,
    });
  }

  async findProductById(productId: string) {
    return this.prisma.product.findUnique({
      where: { id: productId },
    });
  }

  async createProductImage(data: {
    productId: string;
    url: string;
    altText: string;
    sortOrder: number;
    isPrimary: boolean;
  }) {
    return this.prisma.productImage.create({
      data,
    });
  }
}
