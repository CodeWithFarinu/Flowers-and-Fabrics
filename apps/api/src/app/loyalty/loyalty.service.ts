import { Injectable, NotFoundException } from '@nestjs/common';
import { LoyaltyAdapter } from './entities/loyalty.adapter';

@Injectable()
export class LoyaltyService {
  constructor(private readonly loyaltyAdapter: LoyaltyAdapter) {}

  async getLoyaltySummary(userId: string) {
    const user = await this.loyaltyAdapter.findUserLoyaltyDetails(userId);

    if (!user) throw new NotFoundException('User not found');

    const tiers = [
      { tier: 'BRONZE', minSpend: 0, perks: '1x points, standard dispatch' },
      {
        tier: 'SILVER',
        minSpend: 250000,
        perks: '1.2x points, 3 free AI tokens, birthday discount',
      },
      {
        tier: 'GOLD',
        minSpend: 750000,
        perks: '1.5x points, 10 free AI tokens, free Lagos express dispatch',
      },
      {
        tier: 'PLATINUM',
        minSpend: 2000000,
        perks: '2x points, unlimited AI studio, private stylist concierge',
      },
      {
        tier: 'BLACK',
        minSpend: 5000000,
        perks: 'Teepha Sovereign bespoke privileges, direct tailor concierge',
      },
    ];

    const currentSpent = Number(user.totalSpent);
    const nextTier =
      tiers.find((t) => t.minSpend > currentSpent) || tiers[tiers.length - 1];

    return {
      points: user.loyaltyPoints,
      tier: user.loyaltyTier,
      totalSpent: user.totalSpent,
      imageGenTokens: user.imageGenTokens,
      nextTier: nextTier.tier,
      spendToNextTier: Math.max(0, nextTier.minSpend - currentSpent),
      tiers,
    };
  }

  async getTransactions(userId: string) {
    return this.loyaltyAdapter.findUserLoyaltyTransactions(userId, 50);
  }

  async getTiers() {
    return [
      { name: 'BRONZE', threshold: 0, badge: 'Bronze Patron', multiplier: 1.0 },
      {
        name: 'SILVER',
        threshold: 250000,
        badge: 'Silver Artisan',
        multiplier: 1.2,
      },
      {
        name: 'GOLD',
        threshold: 750000,
        badge: 'Gold Couturier',
        multiplier: 1.5,
      },
      {
        name: 'PLATINUM',
        threshold: 2000000,
        badge: 'Platinum Connoisseur',
        multiplier: 2.0,
      },
      {
        name: 'BLACK',
        threshold: 5000000,
        badge: 'Teepha Sovereign Private Client',
        multiplier: 2.5,
      },
    ];
  }
}
