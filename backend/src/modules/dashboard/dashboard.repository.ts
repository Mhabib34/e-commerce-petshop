import { prisma } from "../../config/prisma.ts";

export const dashboardRepository = {
  async getStats() {
    const [totalOrders, totalProducts, totalCustomers, revenueResult] =
      await Promise.all([
        prisma.order.count(),
        prisma.product.count(),
        prisma.user.count({ where: { role: "CUSTOMER" } }),
        prisma.order.aggregate({
          _sum: { totalPrice: true },
          where: { status: "SELESAI" },
        }),
      ]);

    return {
      totalOrders,
      totalProducts,
      totalCustomers,
      totalRevenue: Number(revenueResult._sum.totalPrice ?? 0),
    };
  },

  async getRevenueChart(days: number) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);

    const orders = await prisma.order.findMany({
      where: {
        status: "SELESAI",
        createdAt: { gte: since },
      },
      select: { totalPrice: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    // Group by date
    const map: Record<string, number> = {};

    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      const key = d.toISOString().slice(0, 10);
      map[key] = 0;
    }

    for (const order of orders) {
      const key = order.createdAt.toISOString().slice(0, 10);
      if (key in map) {
        map[key] = (map[key] ?? 0) + Number(order.totalPrice);
      }
    }

    return Object.entries(map).map(([date, revenue]) => ({ date, revenue }));
  },

  async getRecentOrders() {
    return prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: {
          include: { variant: { include: { product: true } } },
        },
      },
    });
  },
};