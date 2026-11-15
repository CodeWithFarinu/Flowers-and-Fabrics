import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersAdapter } from './entities/users.adapter';
import { UpdateProfileDto, CreateAddressDto } from './dto/interface.dto';

@Injectable()
export class UsersService {
  constructor(private readonly usersAdapter: UsersAdapter) {}

  async getProfile(userId: string) {
    const user = await this.usersAdapter.findProfileById(userId);
    if (!user) throw new NotFoundException('User profile not found');
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.usersAdapter.updateProfile(userId, dto);
  }

  async getAddresses(userId: string) {
    return this.usersAdapter.findAddressesByUserId(userId);
  }

  async addAddress(userId: string, dto: CreateAddressDto) {
    const count = await this.usersAdapter.countAddressesByUserId(userId);
    if (dto.isDefault || count === 0) {
      await this.usersAdapter.clearDefaultAddresses(userId);
    }

    return this.usersAdapter.createAddress(
      userId,
      dto,
      dto.isDefault ?? count === 0,
    );
  }

  async updateAddress(
    userId: string,
    addressId: string,
    dto: Partial<CreateAddressDto>,
  ) {
    const addr = await this.usersAdapter.findAddressByIdAndUser(
      addressId,
      userId,
    );
    if (!addr) throw new NotFoundException('Address not found');

    if (dto.isDefault) {
      await this.usersAdapter.clearDefaultAddresses(userId);
    }

    return this.usersAdapter.updateAddress(addressId, dto);
  }

  async deleteAddress(userId: string, addressId: string) {
    const addr = await this.usersAdapter.findAddressByIdAndUser(
      addressId,
      userId,
    );
    if (!addr) throw new NotFoundException('Address not found');

    await this.usersAdapter.deleteAddress(addressId);
    return { success: true };
  }

  async getWishlist(userId: string) {
    return this.usersAdapter.findWishlistByUserId(userId);
  }

  async addToWishlist(userId: string, productId: string) {
    return this.usersAdapter.upsertWishlistItem(userId, productId);
  }

  async removeFromWishlist(userId: string, productId: string) {
    await this.usersAdapter.deleteWishlistItem(userId, productId);
    return { success: true };
  }

  async getOrders(userId: string) {
    return this.usersAdapter.findOrdersByUserId(userId);
  }

  async findAll(page = 1, limit = 20, search?: string) {
    return this.usersAdapter.findUsersPaginated(page, limit, search);
  }
}
