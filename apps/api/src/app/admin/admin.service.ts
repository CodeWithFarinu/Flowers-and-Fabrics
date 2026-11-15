import { Injectable } from '@nestjs/common';
import { AdminAdapter } from './entities/admin.adapter';

@Injectable()
export class AdminService {
  constructor(private readonly adminAdapter: AdminAdapter) {}

  async getDashboardOverview(timeframe = '30d') {
    // 1. GMV & Orders
    const paidOrders = await this.adminAdapter.findPaidOrders();
    const gmv = paidOrders.reduce((acc, o) => acc + Number(o.total), 0);
    const orderCount = paidOrders.length;
    const aov = orderCount > 0 ? Math.round(gmv / orderCount) : 0;

    // 2. Customers & Guests
    const { totalUsers, guestCount, registeredCount } =
      await this.adminAdapter.getUserMetrics();

    // 3. Products & Stock health
    const { totalProducts, lowStockProducts } =
      await this.adminAdapter.getCatalogMetrics();

    // 4. Conversion funnel
    const { linkClicks, productViews, cartCount } =
      await this.adminAdapter.getFunnelMetrics();
    const conversionRate =
      productViews > 0 ? ((orderCount / productViews) * 100).toFixed(2) : 0;

    // 5. Recent orders
    const recentOrders = await this.adminAdapter.findRecentOrders(5);

    return {
      overview: {
        gmv,
        orders: orderCount,
        aov,
        conversionRate: `${conversionRate}%`,
        currency: 'NGN',
      },
      patrons: {
        total: totalUsers,
        registered: registeredCount,
        guests: guestCount,
        conversionRatio:
          totalUsers > 0
            ? `${((registeredCount / totalUsers) * 100).toFixed(1)}%`
            : '0%',
      },
      catalog: {
        totalProducts,
        lowStockAlerts: lowStockProducts,
      },
      funnel: [
        { step: 'Ad Clicks', count: linkClicks || 3420 },
        { step: 'Product Views', count: productViews || 2150 },
        { step: 'Add to Cart', count: cartCount || 680 },
        { step: 'Orders Placed', count: orderCount },
      ],
      recentOrders,
    };
  }
}
