import { api } from "$lib/api/client";
import type { OrderStatus } from "$lib/types/order.type";

export type GetOrdersParams = {
  status?: OrderStatus;
  page?: number;
  limit?: number;
};

export const getAdminOrders = async (params: GetOrdersParams = {}) => {
  const { data } = await api.get("/admin/orders", { params });
  return data;
};

export const updateOrderStatus = async (id: string, status: OrderStatus) => {
  const { data } = await api.patch(`/admin/orders/${id}/status`, { status });
  return data;
};
