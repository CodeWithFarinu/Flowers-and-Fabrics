import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto, CreateAddressDto } from '../dto/interface.dto';

@Injectable()
export class UsersAdapter {
  constructor(private readonly prisma: PrismaService) {}

  async findProfileById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phone: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        role: true,
        isGuest: true,
        loyaltyTier: true,
        loyaltyPoints: true,
        imageGenTokens: true,
        referralCode: true,
        preferredTheme: true,
        createdAt: true,
      },
    });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: dto as any,
    });
  }

  async findAddressesByUserId(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' },
    });
  }

  async countAddressesByUserId(userId: string) {
    return this.prisma.address.count({ where: { userId } });
  }

  async clearDefaultAddresses(userId: string) {
    return this.prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
  }

  async createAddress(
    userId: string,
    dto: CreateAddressDto,
    isDefault: boolean,
  ) {
    return this.prisma.address.create({
      data: {
        ...dto,
        userId,
        isDefault,
      },
    });
  }

  async findAddressByIdAndUser(addressId: string, userId: string) {
    return this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });
  }

  async updateAddress(addressId: string, dto: Partial<CreateAddressDto>) {
    return this.prisma.address.update({
      where: { id: addressId },
      data: dto,
    });
  }

  async deleteAddress(addressId: string) {
    return this.prisma.address.delete({ where: { id: addressId } });
  }

  async findWishlistByUserId(userId: string) {
    return this.prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: { take: 2, orderBy: { sortOrder: 'asc' } },
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async upsertWishlistItem(userId: string, productId: string) {
    return this.prisma.wishlistItem.upsert({
      where: { userId_productId: { userId, productId } },
      create: { userId, productId },
      update: {},
    });
  }

  async deleteWishlistItem(userId: string, productId: string) {
    return this.prisma.wishlistItem.deleteMany({
      where: { userId, productId },
    });
  }

  async findOrdersByUserId(userId: string) {
    return this.prisma.order.findMany({
      where: { userId, deletedAt: null },
      include: {
        items: {
          include: {
            product: {
              include: { images: { take: 1, orderBy: { sortOrder: 'asc' } } },
            },
          },
        },
        payments: true,
        address: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findUsersPaginated(page: number, limit: number, search?: string) {
    const where: any = { deletedAt: null };
    if (search) {
      where.OR = [
        { phone: { contains: search } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
