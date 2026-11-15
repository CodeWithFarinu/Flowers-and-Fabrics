import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthAdapter {
  constructor(private readonly prisma: PrismaService) {}

  async findUserByPhone(phone: string) {
    return this.prisma.user.findUnique({
      where: { phone },
    });
  }

  async findUserByGoogleId(googleId: string) {
    return this.prisma.user.findUnique({
      where: { googleId },
    });
  }

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async linkGoogleAccount(
    userId: string,
    googleId: string,
    avatarUrl?: string,
    firstName?: string,
    lastName?: string,
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        googleId,
        isEmailVerified: true,
        isGuest: false,
        ...(avatarUrl ? { avatarUrl } : {}),
        ...(firstName ? { firstName } : {}),
        ...(lastName ? { lastName } : {}),
      },
    });
  }

  async findUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async createUser(data: any) {
    return this.prisma.user.create({
      data,
    });
  }

  async updateUser(id: string, data: any) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async getMe(userId: string) {
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
}
