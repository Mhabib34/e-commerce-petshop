import { dashboardRepository } from "./dashboard.repository.ts";
import { orderRepository } from "../order/order.repository.ts";
import { ValidationError } from "../../errors/ValidationError.ts";
import type { OrderQuery } from "../order/order.types.ts";

export const dashboardService = {
  async getDashboard(period: string) {
    const days = period === "30d" ? 30 : 7;

    const [stats, revenueChart, recentOrders] = await Promise.all([
      dashboardRepository.getStats(),
      dashboardRepository.getRevenueChart(days),
      dashboardRepository.getRecentOrders(),
    ]);

    return { stats, revenueChart, recentOrders };
  },

  async getAllOrders(query: OrderQuery) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const { items, total } = await orderRepository.findAll({
      ...query,
      page,
      limit,
    });

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async updateOrderStatus(
    orderId: string,
    status: "PENDING" | "DIPROSES" | "SELESAI"
  ) {
    // Reuse logic dari orderService
    const { orderService } = await import("../order/order.service.ts");
    return orderService.updateStatus(orderId, { status });
  },
};