import { Injectable } from '@nestjs/common';
import { FeedAdapter } from './entities/feed.adapter';

@Injectable()
export class FeedService {
  constructor(private readonly feedAdapter: FeedAdapter) {}

  async getPersonalizedFeed(userId?: string, cursor?: string, limit = 20) {
    const take = Math.min(limit, 40);

    // 1. If user is logged in, extract affinity signals (past views, likes, purchases)
    let preferredCategories: string[] = [];
    if (userId) {
      preferredCategories =
        await this.feedAdapter.getUserPreferredCategories(userId);
    }

    // 2. Fetch candidates
    const products = await this.feedAdapter.findFeedCandidates(cursor, take);

    const hasMore = products.length > take;
    const items = hasMore ? products.slice(0, take) : products;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    // Rank items: boost items matching user's preferred categories
    if (preferredCategories.length > 0) {
      items.sort((a, b) => {
        const aScore = preferredCategories.includes(a.categoryId) ? 1 : 0;
        const bScore = preferredCategories.includes(b.categoryId) ? 1 : 0;
        return bScore - aScore;
      });
    }

    return {
      items,
      nextCursor,
      hasMore,
    };
  }

  async getTrending(limit = 12) {
    return this.feedAdapter.findTrending(limit);
  }

  async getNewArrivals(limit = 12) {
    return this.feedAdapter.findNewArrivals(limit);
  }
}
